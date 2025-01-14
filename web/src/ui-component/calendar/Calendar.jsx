import { useState, useEffect } from 'react';
import { Paper, Grid, Typography, Box, useTheme, Chip, Stack } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { CheckCircle, Circle, CloseOutlined } from '@mui/icons-material';
import { showError } from 'utils/common';
import CheckInModal from 'ui-component/CheckInModal';

const Calendar = ({ checkinDates = [] }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const [calendar, setCalendar] = useState([]);
  const [checkInModalOpen, setCheckInModalOpen] = useState(false);
  // 生成日历数据
  useEffect(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();

    // 获取当月第一天
    const firstDay = new Date(year, month, 1);
    // 获取当月最后一天
    const lastDay = new Date(year, month + 1, 0);

    // 获取当月天数
    const daysInMonth = lastDay.getDate();
    // 获取第一天是星期几 (0-6)
    const startDay = firstDay.getDay();

    const calendarDays = [];

    // 填充前面的空白日期
    for (let i = 0; i < startDay; i++) {
      calendarDays.push(null);
    }

    // 填充实际日期
    for (let day = 1; day <= daysInMonth; day++) {
      calendarDays.push(day);
    }

    setCalendar(calendarDays);
  }, []);

  const isCheckedIn = (day) => {
    if (!day) return false;
    const today = new Date();
    const checkDate = new Date(today.getFullYear(), today.getMonth(), day);
    return checkinDates.some((date) => new Date(date).toDateString() === checkDate.toDateString());
  };

  const isToday = (day) => {
    if (!day) return false;
    const today = new Date();
    const checkDate = new Date(today.getFullYear(), today.getMonth(), day);
    return checkDate.toDateString() === today.toDateString();
  };

  const onCheckIn = (day) => {
    const today = new Date();
    const checkDate = new Date(today.getFullYear(), today.getMonth(), day);
    // 小于今天
    if (day < today.getDate()) {
      showError('不能签到过去的时间');
      return;
    }
    // 大于今天
    if (day > today.getDate()) {
      showError('未到签到时间');
      return;
    }
    // 弹框 显示 Cloudflare Turnstile
    setCheckInModalOpen(true);
  };

  const showTurnstile = () => {
    // 弹框 显示 Cloudflare Turnstile
    console.log('showTurnstile');
  };

  const isPendingCheck = (day) => {
    if (!day) return false;
    const today = new Date();
    const checkDate = new Date(today.getFullYear(), today.getMonth(), day + 1);
    // 待签到
    return checkDate.getTime() >= today.getTime();
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
              <Typography align="center" color="ButtonText">
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
                    backgroundColor: isToday(day) ? theme.palette.primary.light : 'transparent',
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
          <CloseOutlined sx={{ color: theme.palette.error.light, fontSize: 14 }} />
          <Typography sx={{ color: theme.palette.error.light, fontSize: 12 }}>未签到</Typography>
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
