'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Row, Col, Typography, Space } from 'antd';
import { PlusOutlined, ReloadOutlined, CloudUploadOutlined, SearchOutlined } from '@ant-design/icons';
import { API } from '@/utils/api';
import { showError, showSuccess } from '@/utils/common';
import ModelInfoTable from './components/ModelInfoTable';
import EditModal from './components/EditModal';
import ImportModal from './components/ImportModal';

const { Title, Text } = Typography;

export default function ModelInfoPage() {
  const [loading, setLoading] = useState(false);
  const [modelInfos, setModelInfos] = useState<any[]>([]);
  const [filteredModelInfos, setFilteredModelInfos] = useState<any[]>([]);
  const [keyword, setKeyword] = useState('');
  
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editId, setEditId] = useState(0);
  
  const [importModalOpen, setImportModalOpen] = useState(false);

  const [pagination, setPagination] = useState({ page: 0, pageSize: 10, total: 0 });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await API.get('/api/model_info/');
      const { success, message, data } = res.data;
      if (success) {
        setModelInfos(data);
        setFilteredModelInfos(data);
        setPagination(prev => ({ ...prev, total: data.length }));
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

  useEffect(() => {
    if (!keyword.trim()) {
        setFilteredModelInfos(modelInfos);
        setPagination(prev => ({ ...prev, total: modelInfos.length }));
    } else {
        const lowerKeyword = keyword.toLowerCase();
        const filtered = modelInfos.filter((info) => (
            info.model.toLowerCase().includes(lowerKeyword) ||
            info.name.toLowerCase().includes(lowerKeyword) ||
            (info.input_modalities && info.input_modalities.toLowerCase().includes(lowerKeyword)) ||
            (info.output_modalities && info.output_modalities.toLowerCase().includes(lowerKeyword)) ||
            (info.tags && info.tags.toLowerCase().includes(lowerKeyword))
        ));
        setFilteredModelInfos(filtered);
        setPagination(prev => ({ ...prev, total: filtered.length, page: 0 }));
    }
  }, [keyword, modelInfos]);

  const handleManage = async (id: number, action: string) => {
    try {
        let res;
        switch (action) {
            case 'delete':
                res = await API.delete(`/api/model_info/${id}`);
                break;
        }
        
        if (res?.data.success) {
            showSuccess('操作成功');
            fetchData();
        } else {
            showError(res?.data.message || 'Operation failed');
        }
    } catch (error: any) {
        showError(error.message);
    }
  };

  const handlePageChange = (page: number, pageSize: number) => {
      setPagination(prev => ({ ...prev, page, pageSize }));
  };

  // Get current page data
  const getCurrentPageData = () => {
      const start = pagination.page * pagination.pageSize;
      const end = start + pagination.pageSize;
      return filteredModelInfos.slice(start, end);
  };

  return (
    <div>
      <Card>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <Space>
                <Title level={4} style={{ margin: 0 }}>模型详情</Title>
                <Text type="secondary">Model Info</Text>
            </Space>

            <Space>
                <Button icon={<CloudUploadOutlined />} onClick={() => setImportModalOpen(true)}>
                    批量导入
                </Button>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditId(0); setEditModalOpen(true); }}>
                    新建模型信息
                </Button>
            </Space>
        </div>

        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
            <Col flex="auto">
                <Input 
                    prefix={<SearchOutlined />}
                    placeholder="搜索模型标识、名称、模态或标签..." 
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    allowClear
                />
            </Col>
            <Col>
                <Button icon={<ReloadOutlined />} onClick={fetchData}>
                    刷新
                </Button>
            </Col>
        </Row>

        <ModelInfoTable 
            loading={loading}
            modelInfos={getCurrentPageData()}
            pagination={pagination}
            onPageChange={handlePageChange}
            onManage={handleManage}
            onEdit={(id: number) => { setEditId(id); setEditModalOpen(true); }}
        />
      </Card>

      <EditModal 
        open={editModalOpen}
        editId={editId}
        onCancel={() => setEditModalOpen(false)}
        onOk={() => { setEditModalOpen(false); fetchData(); }}
        existingModels={modelInfos.map(info => info.model)}
      />

      <ImportModal
        open={importModalOpen}
        onCancel={() => setImportModalOpen(false)}
        onOk={() => { setImportModalOpen(false); fetchData(); }}
        existingModels={modelInfos.map(info => info.model)}
      />
    </div>
  );
}
