'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Row, Col, Typography } from 'antd';
import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { API } from '@/utils/api';
import { showError, showSuccess, trims } from '@/utils/common';
import TaskTable from './components/TaskTable';
import TaskFilter from './components/TaskFilter';
import useIsAdmin from '@/hooks/useIsAdmin';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

export default function TaskPage() {
  const { t } = useTranslation();
  const userIsAdmin = useIsAdmin();
  
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ page: 0, pageSize: 10, total: 0 });
  
  const initialFilter = {
    channel_id: '',
    task_id: '',
    action: '',
    platform: '',
    start_timestamp: 0,
    end_timestamp: dayjs().unix() + 3600
  };
  
  const [filterName, setFilterName] = useState(initialFilter);

  const fetchData = useCallback(async (page = 0, pageSize = 10, filter = initialFilter) => {
    setLoading(true);
    // Deep clone and trim
    const params: any = { ...filter };
    if (!userIsAdmin) {
        delete params.channel_id;
    }
    
    // Cleanup empty strings
    Object.keys(params).forEach(key => {
        if (typeof params[key] === 'string') {
            params[key] = params[key].trim();
            if (params[key] === '') delete params[key];
        }
    });

    try {
      const url = userIsAdmin ? '/api/task/' : '/api/task/self/';
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
            <Title level={4} style={{ margin: 0 }}>{t('taskPage.title')}</Title>
            <Text type="secondary">Task</Text>
        </div>

        <TaskFilter 
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

        <TaskTable 
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
