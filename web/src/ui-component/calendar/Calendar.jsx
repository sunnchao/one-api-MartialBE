import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Paper, Grid, Typography, Box, useTheme, Chip, Stack } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { CheckCircle, Circle, CloseOutlined } from '@mui/icons-material';
import { showError } from 'utils/common';
import CheckInModal from 'ui-component/CheckInModal';
import dayjs from 'dayjs';

const Calendar = ({ checkinDates = [], refreshCoupons, refreshCheckins }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const [calendar, setCalendar] = useState([]);
  const [checkInModalOpen, setCheckInModalOpen] = useState(false);

  // Generate calendar data using dayjs
  useEffect(() => {
    const today = dayjs();
    const firstDayOfMonth = today.startOf('month');
    const startDay = firstDayOfMonth.day(); // Get day of week (0-6)
    const daysInMonth = today.daysInMonth();

    const calendarDays = [];

    // Fill in empty days at start
    for (let i = 0; i < startDay; i++) {
      calendarDays.push(null);
    }

    // Fill in actual days
    for (let day = 1; day <= daysInMonth; day++) {
      calendarDays.push(day);
    }

    setCalendar(calendarDays);
  }, []);

  const isCheckedIn = (day) => {
    if (!day) return false;
    const currentDate = dayjs().set('date', day);
    return checkinDates?.some?.((date) => dayjs(date.created_time).isSame(currentDate, 'date'));
  };

  const isToday = (day) => {
    if (!day) return false;
    return dayjs().date() === day;
  };

  const isPendingCheck = (day) => {
    if (!day) return false;
    const today = dayjs();
    const checkDate = today.set('date', day);
    return checkDate.isAfter(today, 'day');
  };

  const onCheckIn = (day) => {
    const today = dayjs();
    if (day < today.date()) {
      showError('不能签到过去的时间');
      return;
    }
    if (day > today.date()) {
      showError('未到签到时间');
      return;
    }
    setCheckInModalOpen(true);
  };

  return (
    <Paper
      sx={{
        height: '100%',
        minHeight: '500px',
        display: 'flex',
        flexDirection: 'column',
        p: 2.5,
        transition: 'transform 0.3s, box-shadow 0.3s'
      }}
    >
      <Typography
        variant="h4"
        sx={{
          mb: 2.5,
          fontSize: '20px',
          fontWeight: 600,
          position: 'relative',
          '&:after': {
            content: '""',
            position: 'absolute',
            bottom: '-8px',
            left: 0,
            width: '40px',
            height: '3px',
            backgroundColor: theme.palette.primary.main
          }
        }}
      >
        {t('calendar.title')}
      </Typography>
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', mt: 1 }}>
        <Grid
          container
          sx={{
            height: 48,
            mb: 1,
            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
            py: 1
          }}
        >
          {/* 星期标题 */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <Grid container item xs={12 / 7} key={day} alignItems={'center'} justifyContent={'center'}>
              <Typography
                align="center"
                sx={{
                  color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
                  fontWeight: 500,
                  fontSize: '0.875rem'
                }}
              >
                {t(`calendar.${day.toLowerCase()}`)}
              </Typography>
            </Grid>
          ))}
        </Grid>
        <Grid container spacing={1.5} sx={{ height: '100%' }}>
          {/* 日历格子 */}
          {calendar.map((day, index) => (
            <Grid
              container
              item
              xs={12 / 7}
              key={index}
              alignItems={'center'}
              justifyContent={'center'}
              onClick={() => {
                if (day) onCheckIn(day);
              }}
              sx={{
                cursor: day ? 'pointer' : 'default',
                '&:hover': {
                  '& .calendar-day': {
                    transform: day ? 'translateY(-2px)' : 'none',
                    boxShadow: day
                      ? theme.palette.mode === 'dark'
                        ? '0 4px 8px rgba(255, 255, 255, 0.1)'
                        : '0 4px 8px rgba(0, 0, 0, 0.1)'
                      : 'none'
                  }
                }
              }}
            >
              {day && (
                <Box
                  className="calendar-day"
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    height: '100%',
                    width: '100%',
                    borderRadius: '8px',
                    backgroundColor: isToday(day)
                      ? theme.palette.mode === 'dark'
                        ? 'rgba(25, 118, 210, 0.15)'
                        : 'rgba(25, 118, 210, 0.08)'
                      : 'transparent',
                    border: `1px solid ${isToday(day) ? theme.palette.primary.main : theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`,
                    color: isPendingCheck(day) ? theme.palette.text.primary : theme.palette.text.secondary,
                    fontSize: 16,
                    fontWeight: isToday(day) ? 600 : 400,
                    py: 1,
                    transition: 'all 0.3s ease'
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      fontSize: '16px',
                      fontWeight: isToday(day) ? 600 : 400,
                      mb: 0.5
                    }}
                  >
                    {day}
                  </Typography>
                  {/* 签到状态 */}
                  {isPendingCheck(day) ? <PendingCheck /> : isCheckedIn(day) ? <Checked /> : <UnChecked />}
                </Box>
              )}
            </Grid>
          ))}
        </Grid>
      </Box>
      <CheckInModal
        visible={checkInModalOpen}
        onClose={() => setCheckInModalOpen(false)}
        refreshCoupons={refreshCoupons}
        refreshCheckins={refreshCheckins}
      />
    </Paper>
  );
};

Calendar.propTypes = {
  checkinDates: PropTypes.arrayOf(PropTypes.object),
  refreshCoupons: PropTypes.func,
  refreshCheckins: PropTypes.func
};

// 已签到
const Checked = () => {
  const theme = useTheme();

  return (
    <Chip
      label={
        <Stack direction="row" alignItems="center" justifyContent={'center'} gap={0.5}>
          <CheckCircle sx={{ color: theme.palette.success.main, fontSize: 14 }} />
          <Typography sx={{ color: theme.palette.success.main, fontSize: 12, fontWeight: 500, display: { xs: 'none', sm: 'block' } }}>
            已签到
          </Typography>
        </Stack>
      }
      sx={{
        border: 'none',
        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(76, 175, 80, 0.15)' : 'rgba(76, 175, 80, 0.1)',
        borderRadius: '16px',
        py: { xs: 0.5, sm: 0.2 }
      }}
      size="small"
      variant="outlined"
    />
  );
};
// 未签到
const UnChecked = () => {
  const theme = useTheme();
  return (
    <Chip
      label={
        <Stack direction="row" alignItems="center" justifyContent={'center'} gap={0.5}>
          <CloseOutlined sx={{ color: theme.palette.error.main, fontSize: 14 }} />
          <Typography sx={{ color: theme.palette.error.main, fontSize: 12, fontWeight: 500, display: { xs: 'none', sm: 'block' } }}>
            未签到
          </Typography>
        </Stack>
      }
      sx={{
        border: 'none',
        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(244, 67, 54, 0.15)' : 'rgba(244, 67, 54, 0.1)',
        borderRadius: '16px',
        py: { xs: 0.5, sm: 0.2 }
      }}
      size="small"
      variant="outlined"
    />
  );
};

// 待签到
const PendingCheck = () => {
  const theme = useTheme();
  return (
    <Chip
      label={
        <Stack direction="row" alignItems="center" justifyContent={'center'} gap={0.5}>
          <Circle sx={{ color: theme.palette.warning.main, fontSize: 14 }} />
          <Typography sx={{ color: theme.palette.warning.main, fontSize: 12, fontWeight: 500, display: { xs: 'none', sm: 'block' } }}>
            待签到
          </Typography>
        </Stack>
      }
      sx={{
        border: 'none',
        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 152, 0, 0.15)' : 'rgba(255, 152, 0, 0.1)',
        borderRadius: '16px',
        py: { xs: 0.5, sm: 0.2 }
      }}
      size="small"
      variant="outlined"
    />
  );
};
export default Calendar;
