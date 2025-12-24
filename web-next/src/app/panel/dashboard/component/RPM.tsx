'use client';

import React, { useState, useEffect } from 'react';
import { Card, Typography, Progress, Button, Tooltip, Space, Skeleton } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { API } from '@/utils/api';
import { showError } from '@/utils/common';

const { Title, Text } = Typography;

const RPM = () => {
  const { t } = useTranslation();
  const [rateData, setRateData] = useState({ rpm: 0, maxRPM: 0, tpm: 0, maxTPM: 0, usageRpmRate: 0, usageTpmRate: 0 });
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const fetchRPMData = async () => {
    setLoading(true);
    try {
      const res = await API.get('/api/user/dashboard/rate');
      const { success, message, data } = res.data;
      if (success && data) {
        setRateData({
          rpm: data.rpm || 0,
          maxRPM: data.maxRPM || 0,
          tpm: data.tpm || 0,
          maxTPM: data.maxTPM || 0,
          usageRpmRate: data.usageRpmRate || 0,
          usageTpmRate: data.usageTpmRate || 0
        });
      } else {
        showError(message);
      }
    } catch (error) {
      console.error('Error fetching RPM data:', error);
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    fetchRPMData();
  }, []);

  if (initialLoading) {
    return (
      <Card style={{ height: '100%' }}>
         <Skeleton active paragraph={{ rows: 2 }} />
      </Card>
    );
  }

  // Determine color based on usage rate
  const getStatusColor = (percent: number) => {
     if (percent > 80) return '#ff4d4f'; // error
     if (percent > 50) return '#faad14'; // warning
     return '#52c41a'; // success
  };

  return (
    <Card style={{ height: '100%' }} styles={{ body: { padding: '24px' } }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <Title level={4} style={{ margin: 0 }}>{rateData.rpm} RPM</Title>
        <Tooltip title={t('dashboard_index.refresh')}>
          <Button 
            type="text" 
            icon={<ReloadOutlined spin={loading} />} 
            onClick={fetchRPMData} 
            disabled={loading}
          />
        </Tooltip>
      </div>

      <Text type="secondary" style={{ fontSize: '13px' }}>{t('dashboard_index.RPM')}</Text>

      <div style={{ marginTop: 12, marginBottom: 12 }}>
        <Progress 
           percent={Math.min(rateData.usageRpmRate, 100)} 
           strokeColor={getStatusColor(rateData.usageRpmRate)}
           showInfo={false}
           size="small"
        />
      </div>

      <Space>
         <Text style={{ 
             color: getStatusColor(rateData.usageRpmRate),
             fontSize: '14px' 
         }}>
            {t('dashboard_index.usage')} {rateData.usageRpmRate}%
         </Text>
      </Space>
    </Card>
  );
};

export default RPM;
