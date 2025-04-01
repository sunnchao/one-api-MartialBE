import {useState, useEffect, useMemo} from 'react';
import { Paper, Grid, Typography, Box, useTheme, Chip, Stack } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { CheckCircle, Circle, CloseOutlined } from '@mui/icons-material';
import { showError } from 'utils/common';
import CheckInModal from 'ui-component/CheckInModal';
import dayjs from 'dayjs';

const Calendar = ({ checkinDates = [] }) => {
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
    return checkinDates.some((date) => 
      dayjs(date.created_time).isSame(currentDate, 'date')
    );
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

  const showTurnstile = () => {
    // 弹框 显示 Cloudflare Turnstile
    console.log('showTurnstile');
  };

  return (
    <Paper style={{ height: '100%', minHeight: '500px', display: 'flex', flexDirection: 'column' }} sx={{ p: 2 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        {t('calendar.title')}
      </Typography>
      <Box style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Grid style={{ height: 48 }} container>
          {/* 星期标题 */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <Grid container item xs={12 / 7} key={day} alignItems={'center'} justifyContent={'center'}>
              <Typography align="center" color={theme.palette.text.dark}>
                {t(`calendar.${day.toLowerCase()}`)}
              </Typography>
            </Grid>
          ))}
        </Grid>
        <Grid container spacing={1} style={{ height: '100%' }}>
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
                // 签到
                onCheckIn(day);
              }}
            >
              {day && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    height: '100%',
                    width: '100%',
                    border: `1px solid ${isToday(day) ? theme.palette.primary.dark : 'transparent'}`,
                    color: isPendingCheck(day) ? theme.palette.text.dark : theme.palette.text.disabled,
                    fontSize: 16
                  }}
                >
                  {day}
                  {/* 签到状态 */}
                  {isPendingCheck(day) ? <PendingCheck /> : isCheckedIn(day) ? <Checked /> : <UnChecked />}
                </div>
              )}
            </Grid>
          ))}
        </Grid>
      </Box>
      <CheckInModal visible={checkInModalOpen} onClose={() => setCheckInModalOpen(false)} />
    </Paper>
  );
};

// 已签到
const Checked = () => {
  const theme = useTheme();

  return (
    <Chip
      label={
        <Stack direction="row" alignItems="center" justifyContent={'center'} gap={0.5}>
          <CheckCircle sx={{ color: theme.palette.primary.dark, fontSize: 14 }} />
          <Typography sx={{ color: theme.palette.primary.dark, fontSize: 12 }}>已签到</Typography>
        </Stack>
      }
      sx={{
        border: 'none',
        mt: 1
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
          <CloseOutlined sx={{ color: theme.palette.error.dark, fontSize: 14 }} />
          <Typography sx={{ color: theme.palette.error.dark, fontSize: 12 }}>未签到</Typography>
        </Stack>
      }
      sx={{
        border: 'none',
        mt: 1
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
          <Circle sx={{ color: theme.palette.warning.dark, fontSize: 14 }} />
          <Typography sx={{ color: theme.palette.warning.dark, fontSize: 12 }}>待签到</Typography>
        </Stack>
      }
      sx={{
        border: 'none',
        mt: 1
      }}
      size="small"
      variant="outlined"
    />
  );
};
export default Calendar;
