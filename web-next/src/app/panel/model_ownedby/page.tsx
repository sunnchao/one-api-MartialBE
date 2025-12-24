'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button, Row, Col, Typography, Space } from 'antd';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { API } from '@/utils/api';
import { showError, showSuccess } from '@/utils/common';
import ModelOwnedbyTable from './components/ModelOwnedbyTable';
import EditModal from './components/EditModal';
import { useTranslation } from 'react-i18next';

const { Title, Text } = Typography;

export default function ModelOwnedbyPage() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editId, setEditId] = useState(0);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await API.get('/api/model_ownedby/');
      const { success, message, data } = res.data;
      if (success) {
        setData(data);
      } else {
        showError(message);
      }
    } catch (error: any) {
      showError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleManage = async (id: number, action: string) => {
    try {
        let res;
        switch (action) {
            case 'delete':
                res = await API.delete(`/api/model_ownedby/${id}`);
                break;
        }
        
        if (res?.data.success) {
            showSuccess(t('userPage.operationSuccess'));
            fetchData();
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
                <Title level={4} style={{ margin: 0 }}>{t('modelOwnedby.title')}</Title>
                <Text type="secondary">Model Owned By</Text>
            </Space>

            <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditId(0); setEditModalOpen(true); }}>
                {t('modelOwnedby.create')}
            </Button>
        </div>

        <Row style={{ marginBottom: 16, justifyContent: 'flex-end' }}>
            <Button icon={<ReloadOutlined />} onClick={fetchData}>
                {t('userPage.refresh')}
            </Button>
        </Row>

        <ModelOwnedbyTable 
            loading={loading}
            data={data}
            onManage={handleManage}
            onEdit={(id: number) => { setEditId(id); setEditModalOpen(true); }}
        />
      </Card>

      <EditModal 
        open={editModalOpen}
        editId={editId}
        onCancel={() => setEditModalOpen(false)}
        onOk={() => { setEditModalOpen(false); fetchData(); }}
      />
    </div>
  );
}
