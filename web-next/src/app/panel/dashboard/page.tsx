'use client';

import React, { useEffect, useState } from 'react';
import { Typography, Row, Col, Tabs } from 'antd';
import { useTranslation } from 'react-i18next';
import { API } from '@/utils/api';
import { showError, calculateQuota } from '@/utils/common';
import { getLastSevenDays, generateBarChartOptions, renderChartNumber } from '@/utils/chart';
import CheckinService from '@/services/checkinService';

// Components
import SupportModels from './component/SupportModels';
import StatisticalLineChartCard from './component/StatisticalLineChartCard';
import RPM from './component/RPM';
import QuickStartCard from './component/QuickStartCard';
import Calendar from './component/Calendar';
import InviteCard from './component/InviteCard';
import QuotaLogWeek from './component/QuotaLogWeek';
import ModelUsagePieChart from './component/ModelUsagePieChart';
import ApexCharts from './component/ApexCharts';
import StatusPanel from './component/StatusPanel';

const { Title } = Typography;

const Dashboard = () => {
  const { t } = useTranslation();
  const [isLoading, setLoading] = useState(true);
  
  // Chart Data States
  const [statisticalData, setStatisticalData] = useState<any>([]);
  const [requestChart, setRequestChart] = useState<any>(null);
  const [quotaChart, setQuotaChart] = useState<any>(null);
  const [tokenChart, setTokenChart] = useState<any>(null);
  const [modelUsageData, setModelUsageData] = useState<any[]>([]);
  
  // Other Data
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [checkInList, setCheckInList] = useState<any[]>([]);
  
  // Mock Site Info for now
  const siteInfo = { NationalDayPromoEnabled: false, UptimeEnabled: true };
  
  const [activeTab, setActiveTab] = useState('dashboard');

  const userDashboard = async () => {
    try {
      const res = await API.get('/api/user/dashboard');
      const { success, message, data } = res.data;
      if (success && data) {
          setDashboardData(data);
          let lineData = getLineDataGroup(data);
          setRequestChart(getLineCardOption(lineData, 'RequestCount'));
          setQuotaChart(getLineCardOption(lineData, 'Quota'));
          setTokenChart(getLineCardOption(lineData, 'PromptTokens'));
          setStatisticalData(getBarDataGroup(data));
          setModelUsageData(getModelUsageData(data));
      } else {
        showError(message);
      }
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const loadCheckInList = async () => {
    const checkin = await CheckinService.getCheckinList();
    setCheckInList(checkin);
  };

  useEffect(() => {
    userDashboard();
    loadCheckInList();
  }, []);

  // Dashboard Content
  const DashboardContent = (
    <div style={{ marginTop: 24 }}>
      <Row gutter={[24, 24]}>
        <Col span={24}>
           <SupportModels />
        </Col>
        
        <Col span={24}>
          <Row gutter={[24, 24]}>
            <Col xs={24} sm={12} lg={6} style={{ height: 160 }}>
               <StatisticalLineChartCard
                 isLoading={isLoading}
                 title={t('dashboard_index.today_requests')}
                 type="request"
                 chartData={requestChart?.chartData}
                 todayValue={requestChart?.todayValue}
                 lastDayValue={requestChart?.lastDayValue}
               />
            </Col>
            <Col xs={24} sm={12} lg={6} style={{ height: 160 }}>
               <StatisticalLineChartCard
                 isLoading={isLoading}
                 title={t('dashboard_index.today_consumption')}
                 type="quota"
                 chartData={quotaChart?.chartData}
                 todayValue={quotaChart?.todayValue}
                 lastDayValue={quotaChart?.lastDayValue}
               />
            </Col>
            <Col xs={24} sm={12} lg={6} style={{ height: 160 }}>
               <StatisticalLineChartCard
                 isLoading={isLoading}
                 title={t('dashboard_index.today_tokens')}
                 type="token"
                 chartData={tokenChart?.chartData}
                 todayValue={tokenChart?.todayValue}
                 lastDayValue={tokenChart?.lastDayValue}
               />
            </Col>
            <Col xs={24} sm={12} lg={6} style={{ height: 160 }}>
               <RPM />
            </Col>
          </Row>
        </Col>

        <Col span={24}>
           <QuickStartCard />
        </Col>

        <Col xs={24} lg={24}>
           <Calendar checkinDates={checkInList} refreshCheckins={loadCheckInList} />
        </Col>
        <Col xs={24} lg={24}>
           <InviteCard />
        </Col>

        <Col span={24}>
           <QuotaLogWeek data={dashboardData} />
        </Col>

        <Col xs={24} lg={12} style={{ height: 500 }}>
           <ModelUsagePieChart isLoading={isLoading} data={modelUsageData} />
        </Col>
        <Col xs={24} lg={12} style={{ height: 500 }}>
           <ApexCharts isLoading={isLoading} chartDatas={statisticalData} title="dashboard_index.week_model_statistics" />
        </Col>
      </Row>
    </div>
  );

  const items = [
    {
      key: 'dashboard',
      label: t('dashboard_index.tab_dashboard'),
      children: DashboardContent,
    },
    ...(siteInfo.UptimeEnabled ? [{
      key: 'status',
      label: t('dashboard_index.tab_status'),
      children: <StatusPanel />,
    }] : []),
  ];

  return (
    <div>
      <Title level={2}>{t('dashboard_index.title')}</Title>
      <Tabs 
         activeKey={activeTab} 
         onChange={setActiveTab} 
         items={items} 
         type="card"
         destroyOnHidden
      />
    </div>
  );
};

// Helper Functions
function getModelUsageData(data: any[]) {
    const modelUsage: Record<string, number> = {};
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

function getLineDataGroup(statisticalData: any[]) {
    let groupedData = statisticalData.reduce((acc: any, cur: any) => {
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

function getBarDataGroup(data: any[]) {
    const lastSevenDays = getLastSevenDays();
    const result: any[] = [];
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
    if (chartData.options.title) {
        chartData.options.title.text = 'Total：$' + renderChartNumber(totalCosts, 3);
    }
  
    return chartData;
}

function getLineCardOption(lineDataGroup: any[], field: string) {
    let todayValue: any = 0;
    let lastDayValue: any = 0;
    let chartData: any = null;
  
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
  
    if (lineData.length > 1) {
      todayValue = lineData[lineData.length - 1].y;
      if (lineData.length > 2) {
        lastDayValue = lineData[lineData.length - 2].y;
      }
    }
  
    switch (field) {
      case 'RequestCount':
        lastDayValue = parseFloat(lastDayValue);
        todayValue = parseFloat(todayValue);
        break;
      case 'Quota':
        lastDayValue = parseFloat(lastDayValue);
        todayValue = '$' + parseFloat(todayValue);
        break;
      case 'PromptTokens':
        lastDayValue = parseFloat(lastDayValue);
        todayValue = parseFloat(todayValue);
        break;
    }
  
    chartData = {
      series: [{ data: lineData }]
    };
  
    return { chartData, todayValue, lastDayValue };
}

export default Dashboard;
