import { useState, useEffect } from 'react';
import { Paper, Grid, Typography, Box, useTheme, Stack } from '@mui/material';
import { useTranslation } from 'react-i18next';

const Calendar = ({ checkinDates = [] }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const [calendar, setCalendar] = useState([]);

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
            <Grid container item xs={12 / 7} key={index} alignItems={'center'} justifyContent={'center'}>
              {day && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: 48,
                    width: 48,
                    border: `1px solid ${isCheckedIn(day) ? theme.palette.primary.dark : 'transparent'}`,
                    color: isCheckedIn(day) ? theme.palette.primary.dark : theme.palette.text.disabled
                  }}
                >
                  {day}
                </div>
              )}
            </Grid>
          ))}
        </Grid>
      </Box>
    </Paper>
  );
};

export default Calendar;
