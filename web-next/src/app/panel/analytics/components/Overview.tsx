'use client';

import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Typography, Divider, Select, Input, Button, DatePicker } from 'antd';
import { showError, calculateQuota } from '@/utils/common';
import dayjs from 'dayjs';
import { API } from '@/utils/api';
import { generateBarChartOptions, renderChartNumber } from '@/utils/chart';
import { useTranslation } from 'react-i18next';
import ApexCharts from './ApexCharts';

const { RangePicker } = DatePicker;
const { Title } = Typography;
const { Option } = Select;

export default function Overview() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  
  const [channelData, setChannelData] = useState<any>({});
  const [redemptionData, setRedemptionData] = useState<any>(null);
  const [orderData, setOrderData] = useState<any>(null);
  const [usersData, setUsersData] = useState<any>(null);
  
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(6, 'day').startOf('day'), 
    dayjs().endOf('day')
  ]);

  const [groupType, setGroupType] = useState('model_type');
  const [userId, setUserId] = useState<string>('');

  const handleSearch = () => {
    fetchData();
  };

  const getDates = (start: dayjs.Dayjs, end: dayjs.Dayjs) => {
    var dates = [];
    var current = start;

    while (current.isBefore(end) || current.isSame(end, 'day')) {
        dates.push(current.format('YYYY-MM-DD'));
        current = current.add(1, 'day');
    }

    return dates;
  };

  const calculateDailyData = (item: any, dateMap: Map<string, number>) => {
    const index = dateMap.get(item.Date);
    if (index === undefined) return null;

    return {
        name: item.Channel,
        costs: calculateQuota(item.Quota, 3),
        tokens: item.PromptTokens + item.CompletionTokens,
        requests: item.RequestCount,
        latency: Number(item.RequestTime / 1000 / item.RequestCount).toFixed(3),
        index: index
    };
  };

  const getBarDataGroup = (data: any[], dates: string[]) => {
    const dateMap = new Map(dates.map((date, index) => [date, index]));

    const result = {
        costs: { total: 0, data: new Map() },
        tokens: { total: 0, data: new Map() },
        requests: { total: 0, data: new Map() },
        latency: { total: 0, data: new Map() }
    };

    for (const item of data) {
        const dailyData = calculateDailyData(item, dateMap);
        if (!dailyData) continue;

        for (let key in result) {
            // @ts-ignore
            const resultKey = result[key];
            if (!resultKey.data.has(dailyData.name)) {
                resultKey.data.set(dailyData.name, { name: dailyData.name, data: new Array(dates.length).fill(0) });
            }
            const channelDailyData = resultKey.data.get(dailyData.name);
            // @ts-ignore
            channelDailyData.data[dailyData.index] = dailyData[key];
            resultKey.total += Number(dailyData[key as keyof typeof dailyData]); // Simplified type access
        }
    }
    return result;
  };

  const getBarChartOptions = (data: any, dateRange: [dayjs.Dayjs, dayjs.Dayjs]) => {
    if (!data) return null;

    const dates = getDates(dateRange[0], dateRange[1]);
    const result = getBarDataGroup(data, dates);

    let channelData: any = {};

    channelData.costs = generateBarChartOptions(dates, Array.from(result.costs.data.values()), '美元', 3);
    channelData.costs.options.title.text = '总消费：$' + renderChartNumber(result.costs.total, 3);

    channelData.tokens = generateBarChartOptions(dates, Array.from(result.tokens.data.values()), '', 0);
    channelData.tokens.options.title.text = '总Tokens：' + renderChartNumber(result.tokens.total, 0);

    channelData.requests = generateBarChartOptions(dates, Array.from(result.requests.data.values()), '次', 0);
    channelData.requests.options.title.text = '总请求数：' + renderChartNumber(result.requests.total, 0);

    // Calculate latency
    let latency: any[] = Array.from(result.latency.data.values());
    let sums: number[] = [];
    let counts: number[] = [];
    
    // @ts-ignore
    for (let obj of latency) {
        for (let i = 0; i < obj.data.length; i++) {
            let value = parseFloat(obj.data[i]);
            sums[i] = sums[i] || 0;
            counts[i] = counts[i] || 0;
            if (value !== 0) {
                sums[i] = (sums[i] || 0) + value;
                counts[i] = (counts[i] || 0) + 1;
            }
        }
    }

    latency.push({
        name: '平均延迟',
        data: sums.map((sum, i) => Number(counts[i] ? sum / counts[i] : 0).toFixed(3))
    });

    let dashArray = new Array(latency.length - 1).fill(0);
    dashArray.push(5);

    channelData.latency = generateBarChartOptions(dates, latency, '秒', 3);
    channelData.latency.type = 'line';
    // @ts-ignore
    channelData.latency.options.chart = {
        type: 'line',
        zoom: { enabled: false },
        background: 'transparent'
    };
    // @ts-ignore
    channelData.latency.options.stroke = {
        curve: 'smooth',
        dashArray: dashArray
    };

    return channelData;
  };

  const getRedemptionData = (data: any, dateRange: [dayjs.Dayjs, dayjs.Dayjs]) => {
      if (!data) return null;
      const dates = getDates(dateRange[0], dateRange[1]);
      const result = [
          { name: '兑换金额($)', type: 'column', data: new Array(dates.length).fill(0) },
          { name: '独立用户(人)', type: 'line', data: new Array(dates.length).fill(0) }
      ];

      for (const item of data) {
          const index = dates.indexOf(item.date);
          if (index !== -1) {
              result[0].data[index] = calculateQuota(item.quota, 3);
              result[1].data[index] = item.user_count;
          }
      }

      return {
          height: 480,
          options: {
              chart: { type: 'line', background: 'transparent' },
              stroke: { width: [0, 4] },
              dataLabels: { enabled: true, enabledOnSeries: [1] },
              xaxis: { type: 'category', categories: dates },
              yaxis: [{ title: { text: '兑换金额($)' } }, { opposite: true, title: { text: '独立用户(人)' } }],
              tooltip: { theme: 'dark' }
          },
          series: result
      };
  };

  const getUsersData = (data: any, dateRange: [dayjs.Dayjs, dayjs.Dayjs]) => {
      if (!data) return null;
      const dates = getDates(dateRange[0], dateRange[1]);
      const result = [
          { name: '直接注册', data: new Array(dates.length).fill(0) },
          { name: '邀请注册', data: new Array(dates.length).fill(0) }
      ];

      let total = 0;
      for (const item of data) {
          const index = dates.indexOf(item.date);
          if (index !== -1) {
              result[0].data[index] = item.user_count - item.inviter_user_count;
              result[1].data[index] = item.inviter_user_count;
              total += item.user_count;
          }
      }

      let chartData = generateBarChartOptions(dates, result, '人', 0);
      chartData.options.title.text = '总注册人数：' + total;
      return chartData;
  };

  const getOrdersData = (data: any, dateRange: [dayjs.Dayjs, dayjs.Dayjs]) => {
      if (!data) return null;
      const dates = getDates(dateRange[0], dateRange[1]);
      const result = [{ name: '充值', data: new Array(dates.length).fill(0) }];
      let total = 0;

      for (const item of data) {
          const index = dates.indexOf(item.date);
          if (index !== -1) {
              result[0].data[index] = item.order_amount;
              total += item.order_amount;
          }
      }

      let chartData = generateBarChartOptions(dates, result, 'CNY', 0);
      chartData.options.title.text = '总充值数：' + total;
      return chartData;
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await API.get('/api/analytics/period', {
        params: {
          start_timestamp: dateRange[0].unix(),
          end_timestamp: dateRange[1].unix(),
          group_type: groupType,
          user_id: userId ? Number(userId) : 0
        }
      });
      const { success, message, data } = res.data;
      if (success && data) {
        setUsersData(getUsersData(data.user_statistics, dateRange));
        setChannelData(getBarChartOptions(data.channel_statistics, dateRange));
        setRedemptionData(getRedemptionData(data.redemption_statistics, dateRange));
        setOrderData(getOrdersData(data.order_statistics, dateRange));
      } else {
        showError(message);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div style={{ marginTop: 24 }}>
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12} lg={6}>
                <RangePicker 
                    value={dateRange}
                    onChange={(dates) => {
                        if (dates && dates[0] && dates[1]) {
                            setDateRange([dates[0], dates[1]]);
                        }
                    }}
                    style={{ width: '100%' }}
                    allowClear={false}
                    size={'middle'}
                />
            </Col>
            <Col xs={24} sm={12} lg={6}>
                <Select value={groupType} onChange={setGroupType} style={{ width: '100%' }}
                size={'middle'}
                >
                    <Option value="model_type">Model Type</Option>
                    <Option value="model">Model</Option>
                    <Option value="channel">Channel</Option>
                </Select>
            </Col>
            <Col xs={24} sm={12} lg={6}>
                <Input 
                    type="number" 
                    placeholder="用户ID" 
                    value={userId} 
                    onChange={(e) => setUserId(e.target.value)} 
                    size={'middle'}
                />
            </Col>
            <Col xs={24} sm={12} lg={6}>
                <Button type="primary" onClick={handleSearch} block loading={loading}
                size={'middle'}
                >
                    搜索
                </Button>
            </Col>
        </Row>

        <Title level={3} style={{ marginBottom: 16 }}>
            {dateRange[0].format('YYYY-MM-DD')} - {dateRange[1].format('YYYY-MM-DD')}
        </Title>
        <Divider />

        <Row gutter={[16, 16]}>
            <Col span={24}>
                <ApexCharts
                    isLoading={loading}
                    chartDatas={channelData?.costs || {}}
                    title={t('analytics_index.consumptionStatistics')}
                />
            </Col>
            <Col span={24}>
                <ApexCharts
                    isLoading={loading}
                    chartDatas={channelData?.tokens || {}}
                    title={t('analytics_index.tokensStatistics')}
                />
            </Col>
            <Col span={24}>
                <ApexCharts
                    isLoading={loading}
                    chartDatas={channelData?.requests || {}}
                    title={t('analytics_index.requestsCount')}
                />
            </Col>
            <Col xs={24} lg={12}>
                <ApexCharts 
                    isLoading={loading} 
                    chartDatas={redemptionData || {}} 
                    title={t('analytics_index.redemptionStatistics')} 
                />
            </Col>
            <Col xs={24} lg={12}>
                <ApexCharts 
                    isLoading={loading} 
                    chartDatas={usersData || {}} 
                    title={t('analytics_index.registrationStatistics')} 
                />
            </Col>
            <Col xs={24} lg={12}>
                <ApexCharts 
                    isLoading={loading} 
                    chartDatas={orderData || {}} 
                    title="充值" 
                />
            </Col>
        </Row>
    </div>
  );
}
