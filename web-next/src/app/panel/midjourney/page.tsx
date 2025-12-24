'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Row, Col, Typography } from 'antd';
import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { API } from '@/utils/api';
import { showError, showSuccess, trims } from '@/utils/common';
import MjTable from './components/MjTable';
import MjFilter from './components/MjFilter';
import useIsAdmin from '@/hooks/useIsAdmin';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

export default function MidjourneyPage() {
  const { t } = useTranslation();
  const userIsAdmin = useIsAdmin();
  
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ page: 0, pageSize: 10, total: 0 });
  
  const initialFilter = {
    channel_id: '',
    mj_id: '',
    start_timestamp: 0,
    end_timestamp: dayjs().valueOf() + 3600000 // Current time + 1 hour in ms
  };
  
  const [filterName, setFilterName] = useState(initialFilter);

  const fetchData = useCallback(async (page = 0, pageSize = 10, filter = initialFilter) => {
    setLoading(true);
    // Deep clone and trim
    const params: any = { ...filter };
    if (!userIsAdmin) {
        delete params.channel_id;
    }
    
    // Cleanup empty strings and normalize timestamps (ms -> s if API expects s)
    // Original code: dayjs().unix() * 1000 + 3600 (ms)
    // But API call doesn't seem to divide by 1000 for timestamps in params in original code?
    // Wait, original code: dayjs().unix() * 1000 + 3600 is passed to filterName.
    // And in fetchData: ...keyword.
    // Usually backend expects seconds or ms. Let's check original fetchData.
    // "start_timestamp: 0, end_timestamp: dayjs().unix() * 1000 + 3600"
    // It seems it uses ms for UI state but maybe backend handles it.
    // However, LogTableRow uses `timestamp2string(item.submit_time / 1000)`. So backend returns ms.
    // Let's assume input params are also expected in ms or s.
    // If original passed `dayjs().unix() * 1000`, it is passing ms.
    
    // Trim strings
    Object.keys(params).forEach(key => {
        if (typeof params[key] === 'string') {
            params[key] = params[key].trim();
            if (params[key] === '') delete params[key];
        }
    });
    
    // Convert timestamps to seconds if backend expects seconds?
    // If original code uses `dayjs().unix() * 1000`, it sends ms.
    // If backend expects seconds, it would be weird.
    // Let's stick to what original code does: send whatever is in filterName.
    // But original code `filterName.start_timestamp` defaults to 0.
    // `dayjs().unix() * 1000` is ms.
    
    // Note: TableToolBar uses `value.unix() * 1000`. So it sends ms.

    try {
      const url = userIsAdmin ? '/api/mj/' : '/api/mj/self/';
      const res = await API.get(url, {
        params: {
          page: page + 1,
          size: pageSize,
          order: '-id',
          ...params
        }
      });
      const { success, message, data } = res.data;
      if (success) {
        setLogs(data.data);
        setPagination({ page, pageSize, total: data.total_count });
      } else {
        showError(message);
      }
    } catch (error: any) {
      showError(error.message);
    } finally {
      setLoading(false);
    }
  }, [userIsAdmin]);

  useEffect(() => {
    fetchData(pagination.page, pagination.pageSize, filterName);
  }, []);

  const handleFilterChange = (name: string, value: any) => {
      setFilterName(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = () => {
      fetchData(0, pagination.pageSize, filterName);
  };

  const handleRefresh = () => {
      setFilterName(initialFilter);
      fetchData(0, pagination.pageSize, initialFilter);
  };

  const handlePageChange = (page: number, pageSize: number) => {
      fetchData(page, pageSize, filterName);
  };

  return (
    <div>
      <Card>
        <div style={{ marginBottom: 16 }}>
            <Title level={4} style={{ margin: 0 }}>{t('midjourneyPage.midjourney')}</Title>
            <Text type="secondary">Midjourney</Text>
        </div>

        <MjFilter 
            filterName={filterName}
            handleFilterName={handleFilterChange}
            userIsAdmin={userIsAdmin}
        />

        <Row style={{ marginBottom: 16, justifyContent: 'flex-end' }} gutter={16}>
            <Col>
                <Button icon={<ReloadOutlined />} onClick={handleRefresh} size='middle'>
                    {t('midjourneyPage.refreshClearSearch')}
                </Button>
            </Col>
            <Col>
                <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch} size='middle'>
                    {t('midjourneyPage.search')}
                </Button>
            </Col>
        </Row>

        <MjTable 
            loading={loading}
            logs={logs}
            pagination={pagination}
            onPageChange={handlePageChange}
            userIsAdmin={userIsAdmin}
        />
      </Card>
    </div>
  );
}
