'use client';

import React, { useState, useEffect } from 'react';
import { Card, Typography, Button, Spin, Alert, Row, Col, Tooltip, Tag } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

const { Title, Text } = Typography;

const StatusPanel = () => {
  const { t } = useTranslation();
  const statusPageURL = '/api/user/dashboard/uptimekuma/status-page';
  const statusPageHeartbeatURL = '/api/user/dashboard/uptimekuma/status-page/heartbeat';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusData, setStatusData] = useState<any>(null);
  const [heartbeatData, setHeartbeatData] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  // ... fetch logic similar to original ...
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const statusResponse = await axios.get(statusPageURL);
      setStatusData(statusResponse.data);
      const heartbeatResponse = await axios.get(statusPageHeartbeatURL);
      setHeartbeatData(heartbeatResponse.data);
      setLoading(false);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to fetch status data');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  // Helper functions ...
  const getLatestHeartbeatStatus = (monitorId: any) => {
      if (!heartbeatData?.heartbeatList?.[monitorId]) return null;
      const list = heartbeatData.heartbeatList[monitorId];
      return list.length > 0 ? list[list.length - 1] : null;
  };

  const getUptimePercentage = (monitorId: any) => {
      const key = `${monitorId}_24`;
      const val = heartbeatData?.uptimeList?.[key];
      return val !== undefined ? (val * 100).toFixed(2) : null;
  };
  
  const getStatusColor = (percent: any) => {
      if (percent === null) return '#d9d9d9';
      if (percent >= 90) return '#52c41a';
      if (percent > 70) return '#faad14';
      return '#ff4d4f';
  };

  const renderStatusCard = (monitor: any) => {
    const latestStatus = getLatestHeartbeatStatus(monitor.id);
    const uptime = getUptimePercentage(monitor.id);
    const color = getStatusColor(uptime);
    const isNormal = latestStatus && latestStatus.status === 1;

    return (
      <Col xs={24} sm={12} md={6} key={monitor.id}>
        <Card size="small" style={{ borderColor: isNormal ? color : '#ff4d4f' }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Space>
                 <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: isNormal ? color : '#ff4d4f' }} />
                 <Text strong>{monitor.name}</Text>
              </Space>
              <div>
                 {monitor.tags?.map((tag: any, idx: number) => (
                    <Tag key={idx} color={tag.color} style={{ fontSize: 10, lineHeight: '16px' }}>
                       {tag.value || tag.name}
                    </Tag>
                 ))}
              </div>
           </div>
           
           <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text style={{ color: isNormal ? color : '#ff4d4f' }}>{uptime}%</Text>
              <Text type="secondary">{t('dashboard_index.availability')}(24H)</Text>
           </div>
           
           {/* Uptime History Bar (Simplified) */}
           <div style={{ display: 'flex', marginTop: 8, gap: 2 }}>
              {heartbeatData?.heartbeatList?.[monitor.id]?.slice(-30).map((beats: any, idx: number) => (
                  <Tooltip key={idx} title={new Date(beats.time).toLocaleString()}>
                     <div style={{ 
                        flex: 1, 
                        height: 16, 
                        backgroundColor: beats.status === 1 ? '#52c41a' : '#ff4d4f', 
                        opacity: 0.6,
                        borderRadius: 2
                     }} />
                  </Tooltip>
              ))}
           </div>
        </Card>
      </Col>
    );
  };

  return (
    <Card>
       <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
          <Title level={4} style={{ margin: '0 8px 0 0' }}>{t('dashboard_index.tab_status')}</Title>
          <Button 
            type="text" 
            icon={<ReloadOutlined spin={refreshing} />} 
            onClick={handleRefresh} 
            disabled={loading || refreshing}
          />
       </div>

       {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}><Spin /></div>
       ) : error ? (
          <Alert type="error" message={error} />
       ) : (
          <div>
             {statusData?.publicGroupList?.map((group: any) => (
                <div key={group.id} style={{ marginBottom: 24 }}>
                   <Title level={5}>{group.name}</Title>
                   <Row gutter={[16, 16]}>
                      {group.monitorList.map((monitor: any) => renderStatusCard(monitor))}
                   </Row>
                </div>
             ))}
          </div>
       )}
    </Card>
  );
};

// Simple space helper since I didn't import Space above in renderStatusCard
import { Space } from 'antd';

export default StatusPanel;
