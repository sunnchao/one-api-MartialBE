'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, List, Typography, Space, Tag, Input, Select, Switch, Button, Row, Col, Empty } from 'antd';
import { SearchOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { API } from '@/utils/api';
import dayjs from 'dayjs';

const { Text } = Typography;
const { Option } = Select;

export default function SystemLogs() {
  const { t } = useTranslation();
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(5000); // Default: 5 seconds
  const [maxEntries, setMaxEntries] = useState(50);
  const [logs, setLogs] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredLogs, setFilteredLogs] = useState<any[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const logsContainerRef = useRef<HTMLDivElement>(null);

  // Process a log entry from the backend
  const processLogEntry = (entry: any) => {
    try {
      let type = entry.Level.toLowerCase();

      switch (type) {
        case 'info':
          type = 'info';
          break;
        case 'error':
        case 'err':
        case 'fatal':
          type = 'error';
          break;
        case 'warn':
        case 'warning':
          type = 'warning';
          break;
        case 'debug':
          type = 'debug';
          break;
        default:
          type = 'info';
      }

      return {
        timestamp: entry.Timestamp,
        type,
        message: entry.Message
      };
    } catch (error) {
      console.error('Error processing log entry:', error, entry);
      return {
        timestamp: new Date().toISOString(),
        type: 'error',
        message: `Failed to process log entry: ${JSON.stringify(entry)}`
      };
    }
  };

  const fetchLogs = useCallback(async () => {
    try {
      const response = await API.post('/api/system_info/log', {
        count: maxEntries
      });

      if (response.data.success) {
        const logData = response.data.data;
        const processedLogs = logData.map(processLogEntry);
        setLogs(processedLogs);
      } else {
        console.error('Failed to fetch logs:', response.data.message);
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
    }
  }, [maxEntries]);

  useEffect(() => {
    if (!isInitialized) {
      fetchLogs();
      setIsInitialized(true);
    }
  }, [fetchLogs, isInitialized]);

  useEffect(() => {
    if (isInitialized) {
      fetchLogs();
    }
  }, [maxEntries, fetchLogs, isInitialized]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (autoRefresh && isInitialized) {
      interval = setInterval(fetchLogs, refreshInterval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, fetchLogs, refreshInterval, isInitialized]);

  useEffect(() => {
    const term = searchTerm.toLowerCase();
    if (!term.trim()) {
      setFilteredLogs(logs);
    } else {
        const filtered = logs.filter(
        (log) =>
          log.message.toLowerCase().includes(term) ||
          log.type.toLowerCase().includes(term) ||
          dayjs(log.timestamp).format('YYYY-MM-DD HH:mm:ss').toLowerCase().includes(term)
      );
      setFilteredLogs(filtered);
    }
  }, [logs, searchTerm]);

  useEffect(() => {
    if (autoRefresh && logsContainerRef.current) {
        // Scroll to bottom logic if needed, but Ant List handles scroll usually or we just show latest on top
        // Original code reverses logs when rendering, meaning latest at bottom? 
        // Actually original: filteredLogs.reverse().map... so latest is at bottom.
        // Let's keep latest at top for better UX in web console usually? 
        // Or follow original: "Scroll to bottom when logs update"
        // Let's just render naturally (latest first in array usually implies top, but let's check fetch order)
        // Usually backend returns latest? Or oldest?
        // Let's assume we want to show logs.
    }
  }, [logs, autoRefresh]);

  const getLogTypeColor = (type: string) => {
    switch (type) {
      case 'info':
        return 'blue';
      case 'warning':
        return 'orange';
      case 'error':
        return 'red';
      case 'debug':
        return 'green';
      default:
        return 'default';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss');
  };

  return (
    <Card 
        title={t('System Logs')}
        extra={
            <Space wrap>
                <Space>
                    <Switch 
                        checked={autoRefresh} 
                        onChange={setAutoRefresh} 
                        size="default"
                    />
                    <Select 
                        value={refreshInterval} 
                        onChange={setRefreshInterval} 
                        style={{ width: 120 }}
                    >
                        <Option value={1000}>{t('1 second')}</Option>
                        <Option value={3000}>{t('3 seconds')}</Option>
                        <Option value={5000}>{t('5 seconds')}</Option>
                        <Option value={10000}>{t('10 seconds')}</Option>
                        <Option value={30000}>{t('30 seconds')}</Option>
                        <Option value={60000}>{t('1 minute')}</Option>
                    </Select>
                </Space>
                <Space>
                    <Input 
                        type="number" 
                        value={maxEntries} 
                        onChange={(e) => setMaxEntries(Number(e.target.value))} 
                        min={1} 
                        max={500} 
                        addonBefore={t('Max Entries')}
                        style={{ width: 150 }}
                    />
                    <Button 
                        danger 
                        icon={<DeleteOutlined />} 
                        onClick={() => setLogs([])}
                    >
                        {t('Clear')}
                    </Button>
                </Space>
            </Space>
        }
    >
      <div style={{ marginBottom: 16 }}>
        <Text type="secondary" style={{ display: 'block', textAlign: 'center', marginBottom: 16 }}>
            {t('view_more_logs_on_server')}
        </Text>
        <Input 
            prefix={<SearchOutlined />} 
            placeholder={t('Search logs...')} 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            allowClear
        />
      </div>

      <div 
        ref={logsContainerRef}
        style={{ 
            height: 500, 
            overflowY: 'auto', 
            padding: 8, 
            border: '1px solid #f0f0f0', 
            borderRadius: 4,
            backgroundColor: '#fafafa'
        }}
      >
          {logs.length === 0 ? (
              <Empty description={t('No logs available')} image={Empty.PRESENTED_IMAGE_SIMPLE} />
          ) : filteredLogs.length === 0 ? (
              <Empty description={t('No matching logs found')} image={Empty.PRESENTED_IMAGE_SIMPLE} />
          ) : (
            <List
                dataSource={[...filteredLogs].reverse()} // Original code reverses to show latest at bottom? Or oldest at top?
                // If backend returns chronological, then reverse makes it latest at bottom.
                // Let's render item
                renderItem={(item) => (
                    <List.Item style={{ padding: '8px 0', borderBottom: '1px solid #e8e8e8' }}>
                        <Row style={{ width: '100%' }} gutter={8}>
                            <Col flex="160px">
                                <Text type="secondary" style={{ fontSize: 12 }}>{formatTimestamp(item.timestamp)}</Text>
                            </Col>
                            <Col flex="60px">
                                <Tag color={getLogTypeColor(item.type)} style={{ margin: 0 }}>
                                    {item.type.toUpperCase()}
                                </Tag>
                            </Col>
                            <Col flex="auto">
                                <Text style={{ wordBreak: 'break-all' }}>{item.message}</Text>
                            </Col>
                        </Row>
                    </List.Item>
                )}
            />
          )}
      </div>
    </Card>
  );
}
