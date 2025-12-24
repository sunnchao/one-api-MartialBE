'use client';

import React from 'react';
import { Card, Typography, Spin, Empty } from 'antd';
import { useTranslation } from 'react-i18next';

import ReactApexChart from 'react-apexcharts';

const { Title } = Typography;

interface ApexChartsProps {
  isLoading: boolean;
  chartDatas: any;
  title?: string;
}

const ApexCharts: React.FC<ApexChartsProps> = ({ isLoading, chartDatas, title = 'dashboard_index.statistics' }) => {
  const { t } = useTranslation();

  return (
    <Card loading={isLoading} style={{ width: '100%', height: '100%' }} size='default'>
      {/* Title */}
      <div style={{ marginBottom: 16 }}>
        <Title level={4}>{t(title)}</Title>
      </div>

      {/* Chart or Empty State */}
      {chartDatas?.series ? (
        <ReactApexChart
          options={chartDatas.options}
          series={chartDatas.series}
          type={chartDatas.options?.chart?.type || 'bar'}
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

export default ApexCharts;
