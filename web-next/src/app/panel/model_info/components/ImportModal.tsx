'use client';

import React, { useState } from 'react';
import { Modal, Input, Button, Alert, Progress, Table, Typography, Space, Radio, message, Card } from 'antd';
import { CloudDownloadOutlined, UploadOutlined, ExclamationCircleOutlined, RightCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import { API } from '@/utils/api';
import { showError, showSuccess } from '@/utils/common';

const { Text } = Typography;

interface ImportModalProps {
  open: boolean;
  onCancel: () => void;
  onOk: (status: boolean) => void;
  existingModels: string[];
}

export default function ImportModal({ open, onCancel, onOk, existingModels = [] }: ImportModalProps) {
  const [jsonUrl, setJsonUrl] = useState('');
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [conflictStrategy, setConflictStrategy] = useState<'skip' | 'overwrite'>('skip');
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0 });
  const [urlError, setUrlError] = useState('');

  const handleFetchData = async () => {
    if (!jsonUrl.trim()) {
      setUrlError('请输入 JSON URL');
      return;
    }

    setLoading(true);
    setUrlError('');
    setPreviewData([]);

    try {
      const response = await fetch(jsonUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const jsonData = await response.json();

      if (!jsonData.data || !Array.isArray(jsonData.data)) {
        throw new Error('JSON 格式错误：缺少 data 数组');
      }

      const transformedData = jsonData.data
        .filter((item: any) => item.model_info)
        .map((item: any) => {
          const modelInfo = item.model_info;
          return {
            model: modelInfo.model || item.model,
            name: modelInfo.name || modelInfo.model || item.model,
            description: modelInfo.description || '',
            context_length: modelInfo.context_length || 0,
            max_tokens: modelInfo.max_tokens || 0,
            input_modalities: JSON.stringify(modelInfo.input_modalities || []),
            output_modalities: JSON.stringify(modelInfo.output_modalities || []),
            tags: JSON.stringify(modelInfo.tags || []),
            isConflict: existingModels.includes(modelInfo.model || item.model)
          };
        });

      setPreviewData(transformedData);
      if (transformedData.length === 0) {
        showError('没有找到有效的模型数据');
      } else {
        showSuccess(`成功获取 ${transformedData.length} 条模型数据`);
      }
    } catch (error: any) {
      console.error('Failed to fetch JSON data:', error);
      setUrlError(error.message || '获取 JSON 数据失败');
      showError('获取 JSON 数据失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (previewData.length === 0) {
      showError('没有可导入的数据');
      return;
    }

    setImporting(true);
    setImportProgress({ current: 0, total: previewData.length });

    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    for (let i = 0; i < previewData.length; i++) {
      const item = previewData[i];
      setImportProgress({ current: i + 1, total: previewData.length });

      if (item.isConflict && conflictStrategy === 'skip') {
        skipCount++;
        continue;
      }

      try {
        const submitData = { ...item };
        delete submitData.isConflict;

        // Both update (overwrite) and create use POST in original code, 
        // but let's verify if overwrite needs PUT?
        // Original code: await API.post('/api/model_info/', submitData); for both cases.
        // Assuming backend handles update if exists or just overwrites.
        await API.post('/api/model_info/', submitData);
        successCount++;
      } catch (error) {
        console.error(`Failed to import model ${item.model}:`, error);
        errorCount++;
      }
    }

    setImporting(false);

    const messages = [];
    if (successCount > 0) messages.push(`成功导入 ${successCount} 条`);
    if (skipCount > 0) messages.push(`跳过 ${skipCount} 条`);
    if (errorCount > 0) messages.push(`失败 ${errorCount} 条`);

    if (errorCount > 0) {
      showError(`导入完成：${messages.join('，')}`);
    } else {
      showSuccess(`导入完成：${messages.join('，')}`);
    }

    handleClose();
    onOk(true);
  };

  const handleClose = () => {
    setJsonUrl('');
    setPreviewData([]);
    setUrlError('');
    setImportProgress({ current: 0, total: 0 });
    onCancel();
  };

  const conflictCount = previewData.filter((item) => item.isConflict).length;

  const columns = [
    { title: '模型标识', dataIndex: 'model', key: 'model' },
    { title: '模型名称', dataIndex: 'name', key: 'name' },
    { title: '上下文长度', dataIndex: 'context_length', key: 'context_length' },
    { title: '最大Token', dataIndex: 'max_tokens', key: 'max_tokens' },
    { 
        title: '输入模态', 
        dataIndex: 'input_modalities', 
        key: 'input_modalities',
        render: (text: string) => JSON.parse(text).join(', ')
    },
    { 
        title: '输出模态', 
        dataIndex: 'output_modalities', 
        key: 'output_modalities',
        render: (text: string) => JSON.parse(text).join(', ')
    },
    { 
        title: '标签', 
        dataIndex: 'tags', 
        key: 'tags',
        render: (text: string) => JSON.parse(text).join(', ')
    },
    {
      title: '状态',
      key: 'status',
      render: (text: any, record: any) => (
        record.isConflict ? <Text type="warning">已存在</Text> : <Text type="success">新增</Text>
      )
    }
  ];

  return (
    <Modal
      title="批量导入模型信息"
      open={open}
      onCancel={handleClose}
      width={1000}
      footer={[
        <Button key="cancel" onClick={handleClose} disabled={importing}>
          取消
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={handleImport}
          disabled={previewData.length === 0 || importing}
          loading={importing}
          icon={<UploadOutlined />}
        >
          {importing ? '导入中...' : '开始导入'}
        </Button>
      ]}
    >
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <Space.Compact style={{ width: '100%' }}>
            <Input 
                placeholder="https://example.com/models.json" 
                value={jsonUrl}
                onChange={(e) => {
                    setJsonUrl(e.target.value);
                    setUrlError('');
                }}
                status={urlError ? 'error' : ''}
            />
            <Button 
                type="primary" 
                onClick={handleFetchData} 
                loading={loading}
                icon={<CloudDownloadOutlined />}
            >
                获取数据
            </Button>
        </Space.Compact>
        {urlError && <Text type="danger">{urlError}</Text>}

        {previewData.length > 0 && conflictCount > 0 && (
            <Alert
                message={`检测到 ${conflictCount} 个模型标识冲突，请选择处理策略`}
                type="warning"
                showIcon
                icon={<ExclamationCircleOutlined />}
            />
        )}

        {previewData.length > 0 && conflictCount > 0 && (
            <div style={{ display: 'flex', gap: 16 }}>
                <Card
                    hoverable
                    style={{ 
                        flex: 1, 
                        borderColor: conflictStrategy === 'skip' ? '#1677ff' : undefined,
                        backgroundColor: conflictStrategy === 'skip' ? 'rgba(22, 119, 255, 0.05)' : undefined
                    }}
                    onClick={() => setConflictStrategy('skip')}
                >
                    <Space>
                        <RightCircleOutlined style={{ color: conflictStrategy === 'skip' ? '#1677ff' : undefined }} />
                        <div>
                            <Text strong style={{ color: conflictStrategy === 'skip' ? '#1677ff' : undefined }}>跳过已存在的</Text>
                            <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.45)' }}>保留现有数据，仅导入新模型</div>
                        </div>
                    </Space>
                </Card>
                <Card
                    hoverable
                    style={{ 
                        flex: 1, 
                        borderColor: conflictStrategy === 'overwrite' ? '#faad14' : undefined,
                        backgroundColor: conflictStrategy === 'overwrite' ? 'rgba(250, 173, 20, 0.05)' : undefined
                    }}
                    onClick={() => setConflictStrategy('overwrite')}
                >
                    <Space>
                        <ReloadOutlined style={{ color: conflictStrategy === 'overwrite' ? '#faad14' : undefined }} />
                        <div>
                            <Text strong style={{ color: conflictStrategy === 'overwrite' ? '#faad14' : undefined }}>覆盖已存在的</Text>
                            <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.45)' }}>使用新数据替换现有模型</div>
                        </div>
                    </Space>
                </Card>
            </div>
        )}

        {importing && (
            <div>
                <Text type="secondary">正在导入：{importProgress.current} / {importProgress.total}</Text>
                <Progress percent={Math.round((importProgress.current / importProgress.total) * 100)} />
            </div>
        )}

        {previewData.length > 0 ? (
            <Table
                columns={columns}
                dataSource={previewData}
                rowKey="model"
                size="small"
                scroll={{ y: 400 }}
                pagination={false}
                rowClassName={(record) => record.isConflict ? 'bg-warning-light' : ''}
            />
        ) : !loading && (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'rgba(0,0,0,0.45)' }}>
                <CloudDownloadOutlined style={{ fontSize: 48, opacity: 0.5, marginBottom: 8 }} />
                <div>输入JSON URL并点击"获取数据"开始</div>
            </div>
        )}
      </Space>
    </Modal>
  );
}
