import { useEffect, useState } from 'react';
import { Grid, Typography, Button } from '@mui/material';
import { gridSpacing } from '@/store/constant';
import StatisticalLineChartCard from './component/StatisticalLineChartCard';
import ApexCharts from '@/ui-component/chart/ApexCharts';
import SupportModels from './component/SupportModels';
import { generateLineChartOptions, getLastSevenDays, generateBarChartOptions, renderChartNumber } from '@/utils/chart';
import { API } from '@/utils/api';
import { showError, calculateQuota, renderNumber } from '@/utils/common';
import UserCard from '@/ui-component/cards/UserCard';
import BaseCheckInButton from '@/ui-component/BaseCheckInButton';

const Dashboard = () => {
  const [isLoading, setLoading] = useState(true);
  const [statisticalData, setStatisticalData] = useState([]);
  const [requestChart, setRequestChart] = useState(null);
  const [quotaChart, setQuotaChart] = useState(null);
  const [tokenChart, setTokenChart] = useState(null);
  const [users, setUsers] = useState([]);

  // 是否显示 51 活动的文案
  const [show51Panel, setShow51Panel] = useState(true);

  const userDashboard = async () => {
    try {
      const res = await API.get('/api/user/dashboard');
      const { success, message, data } = res.data;
      if (success) {
        if (data) {
          let lineData = getLineDataGroup(data);
          setRequestChart(getLineCardOption(lineData, 'RequestCount'));
          setQuotaChart(getLineCardOption(lineData, 'Quota'));
          setTokenChart(getLineCardOption(lineData, 'PromptTokens'));
          setStatisticalData(getBarDataGroup(data));
        }
      } else {
        showError(message);
      }
      setLoading(false);
    } catch (error) {
      return;
    }
  };

  const loadUser = async () => {
    try {
      let res = await API.get(`/api/user/self`);
      const { success, message, data } = res.data;
      if (success) {
        setUsers(data);
      } else {
        showError(message);
      }
    } catch (error) {
      return;
    }
  };

  useEffect(() => {
    userDashboard();
    loadUser();
    if (Date.now() > new Date('2024-05-06').getTime()) {
      setShow51Panel(false);
    }
  }, []);

  return (
    <Grid container spacing={gridSpacing}>
      <Grid item xs={12}>
        <SupportModels />
      </Grid>
      <Grid item xs={12}>
        <Grid container spacing={gridSpacing}>
          <Grid item lg={4} xs={12}>
            <StatisticalLineChartCard
              isLoading={isLoading}
              title="今日请求"
              chartData={requestChart?.chartData}
              todayValue={requestChart?.todayValue}
            />
          </Grid>
          <Grid item lg={4} xs={12}>
            <StatisticalLineChartCard
              isLoading={isLoading}
              title="今日消费"
              chartData={quotaChart?.chartData}
              todayValue={quotaChart?.todayValue}
            />
          </Grid>
          <Grid item lg={4} xs={12}>
            <StatisticalLineChartCard
              isLoading={isLoading}
              title="今日Token"
              chartData={tokenChart?.chartData}
              todayValue={tokenChart?.todayValue}
            />
          </Grid>
        </Grid>
      </Grid>

      <Grid item xs={12}>
        <Grid container spacing={gridSpacing}>
          <Grid item lg={8} xs={12}>
            <ApexCharts isLoading={isLoading} chartDatas={statisticalData} />
          </Grid>
          <Grid item lg={4} xs={12}>
            <UserCard>
              <Grid container spacing={gridSpacing} justifyContent="center" alignItems="center" paddingTop={'20px'}>
                <Grid item xs={4}>
                  <Typography variant="h4">余 额:</Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography variant="h3"> {users?.quota ? '$' + calculateQuota(users.quota) : '未知'}</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="h4">已使用:</Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography variant="h3"> {users?.used_quota ? '$' + calculateQuota(users.used_quota) : '未知'}</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="h4">调用次数:</Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography variant="h3"> {users?.request_count || '未知'}</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="h4">签到:</Typography>
                </Grid>
                <Grid item xs={8}>
                  <Button variant="contained" disabled={!!users?.check_in}>
                    <BaseCheckInButton check_in={!!users?.check_in} loadUser={loadUser}></BaseCheckInButton>
                  </Button>
                  {/* <LoadingButton disabled={!!users?.check_in} variant="contained">
                    {users?.check_in ? '已签到' : '立即签到'}
                  </LoadingButton> */}
                </Grid>
                {show51Panel && (
                  <Grid item xs={12}>
                    <Typography variant={'h2'}>5️⃣.1️⃣ 加倍快乐！</Typography>
                    <Typography>
                      <p>即日起，截止到 5月6号 0 点，在本站充值额度享受加倍赠送，充多少送多少。</p>
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </UserCard>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};
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

  let chartData = generateBarChartOptions(lastSevenDays, result, '美元', 3);
  chartData.options.title.text = '7日总消费：$' + renderChartNumber(totalCosts, 3);

  return chartData;
}

function getLineCardOption(lineDataGroup, field) {
  let todayValue = 0;
  let chartData = null;
  const lastItem = lineDataGroup.length - 1;
  let lineData = lineDataGroup.map((item, index) => {
    let tmp = {
      date: item.date,
      value: item[field]
    };
    switch (field) {
      case 'Quota':
        tmp.value = calculateQuota(item.Quota, 3);
        break;
      case 'PromptTokens':
        tmp.value += item.CompletionTokens;
        break;
    }

    if (index == lastItem) {
      todayValue = tmp.value;
    }
    return tmp;
  });

  switch (field) {
    case 'RequestCount':
      chartData = generateLineChartOptions(lineData, '次');
      todayValue = renderNumber(todayValue);
      break;
    case 'Quota':
      chartData = generateLineChartOptions(lineData, '美元');
      todayValue = '$' + renderNumber(todayValue);
      break;
    case 'PromptTokens':
      chartData = generateLineChartOptions(lineData, '');
      todayValue = renderNumber(todayValue);
      break;
  }

  return { chartData: chartData, todayValue: todayValue };
}
