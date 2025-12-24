'use client';

import React, { useEffect, useState } from 'react';
import { Card, Table, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { calculateQuota } from '@/utils/common'; // Check these utils
// import { getLastSevenDays } from '@/utils/chart'; 
import dayjs from 'dayjs';

const { Title } = Typography;

interface QuotaLogWeekProps {
  data: any[];
}

const QuotaLogWeek: React.FC<QuotaLogWeekProps> = ({ data }) => {
  const { t } = useTranslation();
  const [logData, setLogData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (data) {
      const lastSevenDays = Array.from({ length: 7 }, (_, i) => {
        return dayjs().subtract(i, 'day').format('YYYY-MM-DD');
      }).reverse();

      const processedData = lastSevenDays.map((date) => {
        const dayData = data.filter((item) => item.Date === date);

        const totalRequests = dayData.reduce((sum, item) => sum + item.RequestCount, 0);
        const totalAmount = dayData.reduce((sum, item) => sum + item.Quota, 0);
        const totalInputTokens = dayData.reduce((sum, item) => sum + item.PromptTokens, 0);
        const totalOutputTokens = dayData.reduce((sum, item) => sum + item.CompletionTokens, 0);
        const totalDuration = dayData.reduce((sum, item) => sum + item.RequestTime, 0);

        return {
          key: date,
          date,
          requests: totalRequests,
          amount: calculateQuota(totalAmount, 6),
          tokens: `${totalInputTokens}/${totalOutputTokens}`,
          duration: (totalDuration / 1000).toFixed(3)
        };
      }).reverse();

      setLogData(processedData);
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  }, [data]);

  const columns = [
    {
      title: t('dashboard_index.date'),
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: t('dashboard_index.request_count'),
      dataIndex: 'requests',
      key: 'requests',
      align: 'right' as const,
    },
    {
      title: t('dashboard_index.amount'),
      dataIndex: 'amount',
      key: 'amount',
      align: 'right' as const,
      render: (text: string) => `$${text}`,
    },
    {
      title: t('dashboard_index.tokens'),
      dataIndex: 'tokens',
      key: 'tokens',
      align: 'right' as const,
    },
    {
      title: t('dashboard_index.request_time'),
      dataIndex: 'duration',
      key: 'duration',
      align: 'right' as const,
    },
  ];

  return (
    <Card 
       title={t('dashboard_index.week_consumption_log')}
       loading={isLoading}
       size={'default'}
    >
      <Table 
        dataSource={logData} 
        columns={columns} 
        pagination={false} 
        size="middle"
        scroll={{ x: true }}
      />
    </Card>
  );
};

export default QuotaLogWeek;
