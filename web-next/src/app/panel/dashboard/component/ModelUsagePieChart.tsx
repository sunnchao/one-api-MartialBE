'use client';

import React from 'react';
import { Card, Typography, Empty, theme } from 'antd';
import { useTranslation } from 'react-i18next';

import ReactApexChart from 'react-apexcharts';

const { Title } = Typography;

interface ModelUsagePieChartProps {
  isLoading: boolean;
  data: Array<{ name: string; value: number }>;
}

const ModelUsagePieChart: React.FC<ModelUsagePieChartProps> = ({ isLoading, data }) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();

  const chartData = {
    options: {
      chart: {
        type: 'donut' as const,
        fontFamily: token.fontFamily,
        background: 'transparent',
      },
      labels: data.map((item) => item.name),
      dataLabels: {
        enabled: false
      },
      legend: {
        show: true,
        position: 'bottom' as const,
        fontSize: '14px',
        offsetY: 0,
      },
      plotOptions: {
        pie: {
          donut: {
            size: '60%',
            labels: {
              show: true,
              total: {
                show: true,
                label: t('dashboard_index.total'),
                formatter: function (w: any) {
                  return w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0).toLocaleString();
                }
              }
            }
          }
        }
      },
      theme: {
        mode: 'light' as const // or use token.mode if updated dynamically but usually 'light' or 'dark' string
      },
      tooltip: {
        theme: 'light' 
      }
    },
    series: data.map((item) => item.value)
  };

  return (
    <Card loading={isLoading} style={{ height: '100%' }} size='default'>
      <div style={{ marginBottom: 16 }}>
         <Title level={4}>{t('dashboard_index.7days_model_usage_pie')}</Title>
      </div>
      
      {data.length > 0 ? (
        <ReactApexChart 
          options={chartData.options} 
          series={chartData.series} 
          type="donut" 
          height={450} 
        />
      ) : (
         <div style={{ 
            height: 450, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}>
            <Empty description={t('dashboard_index.no_data_available')} />
          </div>
      )}
    </Card>
  );
};

export default ModelUsagePieChart;
