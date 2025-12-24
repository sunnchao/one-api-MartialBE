'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button, Row, Col, Typography, Alert, Tag, Input, Space } from 'antd';
import { PlusOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { API } from '@/utils/api';
import { showError, showSuccess } from '@/utils/common';
import TelegramTable from './components/TelegramTable';
import EditModal from './components/EditModal';

const { Title, Text } = Typography;

export default function TelegramPage() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [status, setStatus] = useState(false);
  const [isWebhook, setIsWebhook] = useState(false);
  const [pagination, setPagination] = useState({ page: 0, pageSize: 10, total: 0 });
  const [keyword, setKeyword] = useState('');
  
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editId, setEditId] = useState(0);

  const getStatus = async () => {
    try {
      const res = await API.get('/api/option/telegram/status');
      const { success, data } = res.data;
      if (success) {
        setStatus(data.status);
        setIsWebhook(data.is_webhook);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchData = async (page = 0, pageSize = 10, search = '') => {
    setLoading(true);
    try {
      const res = await API.get('/api/option/telegram/', {
        params: {
          page: page + 1,
          size: pageSize,
          keyword: search,
          order: 'desc'
        }
      });
      const { success, message, data } = res.data;
      if (success) {
        setData(data.data);
        setPagination({ page, pageSize, total: data.total_count });
      } else {
        showError(message);
      }
    } catch (error: any) {
      showError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const reload = async () => {
    try {
      const res = await API.put('/api/option/telegram/reload');
      const { success, message } = res.data;
      if (success) {
        showSuccess(t('telegramPage.reloadSuccess') || 'Reload Success');
      } else {
        showError(message);
      }
    } catch (error: any) {
      showError(error.message);
    }
  };

  useEffect(() => {
    fetchData();
    getStatus();
  }, []);

  const handleManage = async (id: number, action: string) => {
    try {
        let res;
        switch (action) {
            case 'delete':
                res = await API.delete(`/api/option/telegram/${id}`);
                break;
        }
        
        if (res?.data.success) {
            showSuccess(t('telegramPage.operationSuccess') || 'Operation Success');
            fetchData(pagination.page, pagination.pageSize, keyword);
        } else {
            showError(res?.data.message || 'Operation failed');
        }
    } catch (error: any) {
        showError(error.message);
    }
  };

  return (
    <div>
      <Card>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Space direction="vertical" size={0}>
                <Title level={4} style={{ margin: 0 }}>{t('telegramPage.title') || 'Telegram'}</Title>
                <Text type="secondary">Telegram</Text>
            </Space>

            <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditId(0); setEditModalOpen(true); }}>
                {t('telegramPage.createMenu') || 'Create Menu'}
            </Button>
        </div>

        <Alert 
            message={t('telegramPage.infoMessage') || 'Info'} 
            type="info" 
            showIcon 
            style={{ marginBottom: 24 }} 
        />

        <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
            <Tag color={status ? 'blue' : 'red'}>
                {(status ? (t('telegramPage.online') || 'Online') : (t('telegramPage.offline') || 'Offline')) + (isWebhook ? ' (Webhook)' : ' (Polling)')}
            </Tag>
            <Button size="small" icon={<ReloadOutlined />} onClick={reload}>
                {t('telegramPage.reloadMenu') || 'Reload Menu'}
            </Button>
        </div>

        <Row style={{ marginBottom: 16, justifyContent: 'space-between' }}>
            <Input 
                placeholder={t('telegramPage.searchPlaceholder') || 'Search'}
                style={{ width: 300 }}
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                suffix={<SearchOutlined style={{ color: 'rgba(0,0,0,.45)' }} onClick={() => fetchData(0, pagination.pageSize, keyword)} />}
                onPressEnter={() => fetchData(0, pagination.pageSize, keyword)}
            />
            <Button icon={<ReloadOutlined />} onClick={() => { setKeyword(''); fetchData(0, pagination.pageSize, ''); }}>
                {t('telegramPage.refresh') || 'Refresh'}
            </Button>
        </Row>

        <TelegramTable 
            loading={loading}
            data={data}
            onManage={handleManage}
            onEdit={(id: number) => { setEditId(id); setEditModalOpen(true); }}
        />
      </Card>

      <EditModal 
        open={editModalOpen}
        actionId={editId}
        onCancel={() => setEditModalOpen(false)}
        onOk={() => { setEditModalOpen(false); fetchData(pagination.page, pagination.pageSize, keyword); }}
      />
    </div>
  );
}
