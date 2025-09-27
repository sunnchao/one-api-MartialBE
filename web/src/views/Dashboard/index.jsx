import { useEffect, useState, useCallback } from 'react';
import { Grid, Box, Stack, Typography, Button, Container } from '@mui/material';
import { gridSpacing } from 'store/constant';
import StatisticalLineChartCard from './component/StatisticalLineChartCard';
import Calendar from 'ui-component/calendar/Calendar';
import ApexCharts from 'ui-component/chart/ApexCharts';
import SupportModels from './component/SupportModels';
import { getLastSevenDays, generateBarChartOptions, renderChartNumber } from 'utils/chart';
import { API } from 'utils/api';
import { showError, calculateQuota } from 'utils/common';
import ModelUsagePieChart from './component/ModelUsagePieChart';
import { useTranslation } from 'react-i18next';
import InviteCard from './component/InviteCard';
import QuotaLogWeek from './component/QuotaLogWeek';
import QuickStartCard from './component/QuickStartCard';
import RPM from './component/RPM';
import dayjs from 'dayjs';
import StatusPanel from './component/StatusPanel';
import CheckinService from 'services/checkinService';
import { useSelector } from 'react-redux';
import { keyframes } from '@mui/system';

// TabPanel component for tab content
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div role="tabpanel" hidden={value !== index} id={`dashboard-tabpanel-${index}`} aria-labelledby={`dashboard-tab-${index}`} {...other}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const Dashboard = () => {
  const [isLoading, setLoading] = useState(true);
  const [statisticalData, setStatisticalData] = useState([]);
  const [requestChart, setRequestChart] = useState(null);
  const [quotaChart, setQuotaChart] = useState(null);
  const [tokenChart, setTokenChart] = useState(null);
  const [users, setUsers] = useState([]);
  const [checkInList, setCheckInList] = useState([]);
  const { t } = useTranslation();
  const [modelUsageData, setModelUsageData] = useState([]);
  const [currentTab, setCurrentTab] = useState(0);
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    milliseconds: 0
  });
  const [showNationalDayPromo, setShowNationalDayPromo] = useState(false);

  const [dashboardData, setDashboardData] = useState(null);
  const siteInfo = useSelector((state) => state.siteInfo);

  // 检查是否在国庆活动期间
  const checkNationalDayPromo = () => {
    if (!siteInfo.NationalDayPromoEnabled) return false;

    const now = new Date();

    try {
      const startDate = new Date(siteInfo.NationalDayPromoStartDate);
      const endDate = new Date(siteInfo.NationalDayPromoEndDate + 'T23:59:59');

      return now >= startDate && now <= endDate;
    } catch (e) {
      return false;
    }
  };

  // 计算倒计时
  const calculateCountdown = useCallback(() => {
    if (!siteInfo.NationalDayPromoEndDate) return null;

    try {
      const now = new Date();
      const endDate = new Date(siteInfo.NationalDayPromoEndDate + 'T23:59:59');
      const timeDiff = endDate.getTime() - now.getTime();

      if (timeDiff <= 0) {
        setShowNationalDayPromo(false);
        return { days: 0, hours: 0, minutes: 0, seconds: 0, milliseconds: 0 };
      }

      const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
      const milliseconds = Math.floor((timeDiff % 1000) / 10);

      return { days, hours, minutes, seconds, milliseconds };
    } catch (e) {
      return null;
    }
  }, [siteInfo.NationalDayPromoEndDate]);

  const handleTabChange = (newValue) => {
    setCurrentTab(newValue);
  };

  const userDashboard = async () => {
    try {
      const res = await API.get('/api/user/dashboard');
      const { success, message, data } = res.data;
      if (success) {
        if (data) {
          setDashboardData(data);
          let lineData = getLineDataGroup(data);
          setRequestChart(getLineCardOption(lineData, 'RequestCount'));
          setQuotaChart(getLineCardOption(lineData, 'Quota'));
          setTokenChart(getLineCardOption(lineData, 'PromptTokens'));
          setStatisticalData(getBarDataGroup(data));
          setModelUsageData(getModelUsageData(data));
        }
      } else {
        showError(message);
      }
      setLoading(false);
    } catch (error) {
      return;
    }
  };

  const loadCheckInList = async () => {
    const checkin = await CheckinService.getCheckinList();
    setCheckInList(checkin.records);

    // 获取签到统计信息用于显示
    const stats = CheckinService.getCheckinStats(checkin.records);
    console.log('签到统计:', stats);
  };

  useEffect(() => {
    userDashboard();
    loadCheckInList();
  }, []);

  // 检查活动状态
  useEffect(() => {
    if (siteInfo.NationalDayPromoEnabled !== undefined) {
      setShowNationalDayPromo(checkNationalDayPromo());
    }
  }, [siteInfo.NationalDayPromoEnabled, siteInfo.NationalDayPromoStartDate, siteInfo.NationalDayPromoEndDate]);

  // 倒计时定时器
  useEffect(() => {
    if (!showNationalDayPromo) return;

    const timer = setInterval(() => {
      const newCountdown = calculateCountdown();
      if (newCountdown) {
        setCountdown(newCountdown);
        if (newCountdown.days === 0 && newCountdown.hours === 0 && newCountdown.minutes === 0 && newCountdown.seconds === 0) {
          setShowNationalDayPromo(false);
        }
      }
    }, 10);

    const initialCountdown = calculateCountdown();
    if (initialCountdown) {
      setCountdown(initialCountdown);
    }

    return () => clearInterval(timer);
  }, [showNationalDayPromo, calculateCountdown]);

  // Dashboard content
  const dashboardContent = (
    <Grid container spacing={gridSpacing}>
      {/* 支持的模型   */}
      <Grid item xs={12}>
        <SupportModels />
      </Grid>
      {/* 今日请求、消费、token */}
      <Grid item xs={12}>
        <Grid container spacing={gridSpacing}>
          <Grid item lg={3} xs={6} sx={{ height: '160' }}>
            <StatisticalLineChartCard
              isLoading={isLoading}
              title={t('dashboard_index.today_requests')}
              type="request"
              chartData={requestChart?.chartData}
              todayValue={requestChart?.todayValue}
              lastDayValue={requestChart?.lastDayValue}
            />
          </Grid>
          <Grid item lg={3} xs={6} sx={{ height: '160' }}>
            <StatisticalLineChartCard
              isLoading={isLoading}
              title={t('dashboard_index.today_consumption')}
              type="quota"
              chartData={quotaChart?.chartData}
              todayValue={quotaChart?.todayValue}
              lastDayValue={quotaChart?.lastDayValue}
            />
          </Grid>
          <Grid item lg={3} xs={6} sx={{ height: '160' }}>
            <StatisticalLineChartCard
              isLoading={isLoading}
              title={t('dashboard_index.today_tokens')}
              type="token"
              chartData={tokenChart?.chartData}
              todayValue={tokenChart?.todayValue}
              lastDayValue={tokenChart?.lastDayValue}
            />
          </Grid>
          <Grid item lg={3} xs={6} sx={{ height: '160' }}>
            <RPM />
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Grid container spacing={gridSpacing}>
          <Grid item lg={12} xs={12}>
            <Box>
              <QuickStartCard />
            </Box>
          </Grid>
          {/* 日历插件 */}
          <Grid item lg={6} xs={12}>
            <Calendar checkinDates={checkInList} />
          </Grid>
          <Grid item lg={6} xs={12}>
            <InviteCard />
          </Grid>

          <Grid item lg={12} xs={12}>
            {/* 7日模型消费统计 */}
            <QuotaLogWeek data={dashboardData} />
          </Grid>

          <Grid item lg={12} xs={12}>
            {/* 用户信息 */}
            <ModelUsagePieChart isLoading={isLoading} data={modelUsageData} />
          </Grid>
          <Grid item lg={12} xs={12}>
            {/* 7日模型消费统计 */}
            <ApexCharts isLoading={isLoading} chartDatas={statisticalData} title={t('dashboard_index.week_model_statistics')} />
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );

  return (
    <>
      {/* 全屏宽度活动横幅 - 只在活动期间显示 */}
      {showNationalDayPromo && (
        <Box
          sx={{
            width: '100vw',
            position: 'relative',
            left: '50%',
            right: '50%',
            marginLeft: '-50vw',
            marginRight: '-50vw',
            marginBottom: 2,
            background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
            py: 1.5,
            textAlign: 'center',
            zIndex: 1000,
            boxShadow: '0 2px 8px rgba(33, 150, 243, 0.15)',
            borderBottom: '1px solid rgba(33, 150, 243, 0.1)'
          }}
        >
          <Container maxWidth={false}>
            <Typography
              variant="h6"
              sx={{
                color: '#1976d2',
                fontWeight: 600,
                fontSize: { xs: '0.9rem', md: '1.1rem' },
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1
              }}
            >
              <Box
                component="span"
                sx={{
                  fontSize: '1.2em'
                }}
              >
                🎊
              </Box>
              国庆盛典，充值有惊喜！
              <Box
                component="span"
                sx={{
                  ml: 2,
                  px: 2,
                  py: 0.5,
                  backgroundColor: 'rgba(25, 118, 210, 0.1)',
                  borderRadius: '16px',
                  fontSize: '0.8em',
                  border: '1px solid rgba(25, 118, 210, 0.2)',
                  color: '#1565c0',
                  display: { xs: 'none', md: 'inline-block' },
                  fontFamily: 'monospace',
                  fontWeight: 'bold'
                }}
              >
                ⏰ 活动倒计时: {countdown.days}天 {countdown.hours.toString().padStart(2, '0')}:
                {countdown.minutes.toString().padStart(2, '0')}:{countdown.seconds.toString().padStart(2, '0')}.
                {countdown.milliseconds.toString().padStart(2, '0')}
              </Box>
            </Typography>
          </Container>
        </Box>
      )}

      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
        <Stack direction="row" alignItems="center" spacing={3}>
          <Stack direction="column" spacing={1}>
            <Typography variant="h2">{t('dashboard_index.title')}</Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Dashboard
            </Typography>
          </Stack>

          {siteInfo.UptimeEnabled && (
            <Stack direction="row" spacing={1}>
              <Button
                onClick={() => handleTabChange(0)}
                variant={currentTab === 0 ? 'contained' : 'text'}
                size="small"
                disableElevation
                sx={{
                  padding: '6px 16px',
                  borderRadius: '4px',
                  backgroundColor: currentTab === 0 ? 'primary.main' : 'transparent',
                  color: currentTab === 0 ? 'white' : 'text.primary',
                  '&:hover': {
                    backgroundColor: currentTab === 0 ? 'primary.dark' : 'action.hover'
                  }
                }}
              >
                {t('dashboard_index.tab_dashboard')}
              </Button>
              <Button
                onClick={() => handleTabChange(1)}
                variant={currentTab === 1 ? 'contained' : 'text'}
                size="small"
                disableElevation
                sx={{
                  padding: '6px 16px',
                  borderRadius: '4px',
                  backgroundColor: currentTab === 1 ? 'primary.main' : 'transparent',
                  color: currentTab === 1 ? 'white' : 'text.primary',
                  '&:hover': {
                    backgroundColor: currentTab === 1 ? 'primary.dark' : 'action.hover'
                  }
                }}
              >
                {t('dashboard_index.tab_status')}
              </Button>
            </Stack>
          )}
        </Stack>
      </Stack>

      {siteInfo.UptimeEnabled ? (
        <>
          <TabPanel value={currentTab} index={0}>
            {dashboardContent}
          </TabPanel>
          <TabPanel value={currentTab} index={1}>
            <StatusPanel />
          </TabPanel>
        </>
      ) : (
        dashboardContent
      )}
    </>
  );
};

// 新增函数来处理模型使用数据
function getModelUsageData(data) {
  const modelUsage = {};
  data.forEach((item) => {
    if (!modelUsage[item.ModelName]) {
      modelUsage[item.ModelName] = 0;
    }
    modelUsage[item.ModelName] += item.RequestCount;
  });

  return Object.entries(modelUsage).map(([name, count]) => ({
    name,
    value: count
  }));
}
export default Dashboard;

function getLineDataGroup(statisticalData) {
  let groupedData = statisticalData.reduce((acc, cur) => {
    if (!acc[cur.Date]) {
      acc[cur.Date] = {
        date: cur.Date,
        RequestCount: 0,
        Quota: 0,
        PromptTokens: 0,
        CompletionTokens: 0
      };
    }
    acc[cur.Date].RequestCount += cur.RequestCount;
    acc[cur.Date].Quota += cur.Quota;
    acc[cur.Date].PromptTokens += cur.PromptTokens;
    acc[cur.Date].CompletionTokens += cur.CompletionTokens;
    return acc;
  }, {});
  let lastSevenDays = getLastSevenDays();
  return lastSevenDays.map((Date) => {
    if (!groupedData[Date]) {
      return {
        date: Date,
        RequestCount: 0,
        Quota: 0,
        PromptTokens: 0,
        CompletionTokens: 0
      };
    } else {
      return groupedData[Date];
    }
  });
}

function getBarDataGroup(data) {
  const lastSevenDays = getLastSevenDays();
  const result = [];
  const map = new Map();
  let totalCosts = 0;

  for (const item of data) {
    if (!map.has(item.ModelName)) {
      const newData = { name: item.ModelName, data: new Array(7).fill(0) };
      map.set(item.ModelName, newData);
      result.push(newData);
    }
    const index = lastSevenDays.indexOf(item.Date);
    if (index !== -1) {
      let costs = Number(calculateQuota(item.Quota, 3));
      map.get(item.ModelName).data[index] = costs;
      totalCosts += parseFloat(costs.toFixed(3));
    }
  }

  let chartData = generateBarChartOptions(lastSevenDays, result, 'USD', 3);
  chartData.options.title.text = 'Total：$' + renderChartNumber(totalCosts, 3);

  return chartData;
}

function getLineCardOption(lineDataGroup, field) {
  let todayValue = 0;
  let lastDayValue = 0;
  let chartData = null;

  let lineData = lineDataGroup.map((item) => {
    let tmp = {
      x: item.date,
      y: item[field]
    };
    switch (field) {
      case 'Quota':
        tmp.y = calculateQuota(item.Quota, 6);
        break;
      case 'PromptTokens':
        tmp.y += item.CompletionTokens;
        break;
    }

    return tmp;
  });

  // 获取今天和昨天的数据
  if (lineData.length > 1) {
    todayValue = lineData[lineData.length - 1].y;
    if (lineData.length > 2) {
      lastDayValue = lineData[lineData.length - 2].y;
    }
  }

  switch (field) {
    case 'RequestCount':
      // chartData = generateLineChartOptions(lineData, '次');
      lastDayValue = parseFloat(lastDayValue);
      todayValue = parseFloat(todayValue);
      break;
    case 'Quota':
      // chartData = generateLineChartOptions(lineData, '美元');
      lastDayValue = parseFloat(lastDayValue);
      todayValue = '$' + parseFloat(todayValue);
      break;
    case 'PromptTokens':
      // chartData = generateLineChartOptions(lineData, '');
      lastDayValue = parseFloat(lastDayValue);
      todayValue = parseFloat(todayValue);
      break;
  }

  chartData = {
    series: [
      {
        data: lineData
      }
    ]
  };

  return { chartData: chartData, todayValue: todayValue, lastDayValue: lastDayValue };
}
