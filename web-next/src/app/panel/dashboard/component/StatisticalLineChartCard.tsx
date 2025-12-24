'use client';

import React from 'react';
import { Card, Typography, Skeleton } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, MinusOutlined } from '@ant-design/icons';

import ReactApexChart from 'react-apexcharts';

const { Title, Text } = Typography;

interface StatisticalLineChartCardProps {
  isLoading: boolean;
  title: string;
  chartData: any;
  todayValue: number | string;
  lastDayValue?: number | string;
  type?: 'request' | 'quota' | 'token' | 'default';
}

const StatisticalLineChartCard: React.FC<StatisticalLineChartCardProps> = ({ 
  isLoading, 
  title, 
  chartData, 
  todayValue, 
  lastDayValue, 
  type = 'default' 
}) => {

  const getChartColor = () => {
    switch (type) {
      case 'request': return '#60A5FA';
      case 'quota': return '#FBBF24';
      case 'token': return '#F87171';
      default: return '#60A5FA';
    }
  };

  const chartOptions = {
    chart: {
      type: 'line' as const,
      sparkline: { enabled: true },
      animations: { enabled: true, easing: 'easeinout', speed: 800 }
    },
    stroke: { curve: 'smooth' as const, width: 2 },
    colors: [getChartColor()],
    tooltip: {
      fixed: { enabled: false },
      x: { show: false },
      y: { title: { formatter: () => '' } },
      marker: { show: false }
    }
  };

  const calculateTrend = () => {
    const today = parseFloat((todayValue || 0).toString().replace(/[$,]/g, ''));
    const last = parseFloat((lastDayValue || 0).toString().replace(/[$,]/g, ''));
    
    if (today === 0 && last === 0) return { percent: 0, status: 'neutral' };
    if (last === 0) return { percent: 100, status: 'up' }; // technically infinite growth, assume 100% for display
    
    const percent = Math.round(((today - last) / last) * 100);
    return { 
        percent: Math.abs(percent), 
        status: percent > 0 ? 'up' : percent < 0 ? 'down' : 'neutral'
    };
  };

  const trend = calculateTrend();
  const trendColor = trend.status === 'up' ? '#cf1322' : trend.status === 'down' ? '#3f8600' : '#8c8c8c'; // green for down? usually red/green reversed in finance contexts but adhere to original logic? 
  // Original: up -> error.main (red), down -> success.main (green), neutral -> info.main
  // Red usually means "increase" in some Asian markets or "bad" if cost. 
  // Let's stick to standard: Up = Red (Active/Hot) or Green (Good). 
  // Given original code: up -> error (red), down -> success (green). 
  
  const TrendIcon = trend.status === 'up' ? ArrowUpOutlined : trend.status === 'down' ? ArrowDownOutlined : MinusOutlined;

  return (
    <Card loading={isLoading} styles={{ body: { padding: 20, height: '100%' } }} style={{ height: '100%', overflow: 'hidden' }}>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
         <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
               <Title level={3} style={{ margin: 0 }}>{todayValue}</Title>
               {lastDayValue !== undefined && (
                  <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#f5f5f5', padding: '2px 8px', borderRadius: 4 }}>
                      <TrendIcon style={{ color: trendColor, fontSize: 12, marginRight: 4 }} />
                      <Text style={{ color: trendColor, fontSize: 12, fontWeight: 500 }}>{trend.percent}%</Text>
                  </div>
               )}
            </div>
            <Text type="secondary" style={{ fontSize: 12 }}>{title}</Text>
         </div>
         
         <div style={{ flex: 1, minHeight: 45, marginTop: 16 }}>
             {chartData && (
                 <ReactApexChart 
                    options={{...chartOptions, ...chartData.options}} 
                    series={chartData.series} 
                    type="line" 
                    height="100%" 
                    width="100%"
                 />
             )}
         </div>
      </div>
    </Card>
  );
};

export default StatisticalLineChartCard;
