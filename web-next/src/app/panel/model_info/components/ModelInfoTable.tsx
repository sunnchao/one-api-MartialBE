'use client';

import React from 'react';
import { Table, Button, Space, Tooltip, Popconfirm, Tag, Typography, message } from 'antd';
import { EditOutlined, DeleteOutlined, CopyOutlined } from '@ant-design/icons';
import { MODALITY_OPTIONS } from '@/constants/Modality';

const { Text } = Typography;

interface ModelInfoTableProps {
  loading: boolean;
  modelInfos: any[];
  pagination: any;
  onPageChange: (page: number, pageSize: number) => void;
  onManage: (id: number, action: string) => void;
  onEdit: (id: number) => void;
}

export default function ModelInfoTable({ 
    loading, 
    modelInfos, 
    pagination, 
    onPageChange, 
    onManage, 
    onEdit 
}: ModelInfoTableProps) {

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    message.success('已复制到剪贴板');
  };

  const renderModalities = (jsonString: string, type: 'input' | 'output') => {
      try {
          const modalities = JSON.parse(jsonString || '[]');
          if (!Array.isArray(modalities)) return null;
          
          return modalities.map((modality: string, index: number) => {
              const option = MODALITY_OPTIONS[modality];
              return (
                  <Tag 
                    key={index} 
                    color={option?.color || (type === 'input' ? 'blue' : 'cyan')}
                    style={{ marginRight: 4 }}
                  >
                      {option?.text || modality}
                  </Tag>
              );
          });
      } catch (e) {
          return null;
      }
  };

  const renderTags = (jsonString: string) => {
      try {
          const tags = JSON.parse(jsonString || '[]');
          if (!Array.isArray(tags)) return null;

          return tags.map((tag: string, index: number) => (
              <Tag key={index} style={{ marginRight: 4 }}>
                  {tag}
              </Tag>
          ));
      } catch (e) {
          return null;
      }
  };

  const columns = [
    {
      title: '模型标识',
      dataIndex: 'model',
      key: 'model',
      render: (text: string) => (
          <Tooltip title="点击复制">
              <Tag 
                color="green" 
                style={{ cursor: 'pointer' }}
                onClick={() => handleCopy(text)}
              >
                  {text}
              </Tag>
          </Tooltip>
      )
    },
    {
      title: '模型名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '上下文长度',
      dataIndex: 'context_length',
      key: 'context_length',
    },
    {
      title: '最大Token',
      dataIndex: 'max_tokens',
      key: 'max_tokens',
    },
    {
      title: '输入模态',
      dataIndex: 'input_modalities',
      key: 'input_modalities',
      render: (text: string) => renderModalities(text, 'input')
    },
    {
      title: '输出模态',
      dataIndex: 'output_modalities',
      key: 'output_modalities',
      render: (text: string) => renderModalities(text, 'output')
    },
    {
      title: '标签',
      dataIndex: 'tags',
      key: 'tags',
      render: (text: string) => renderTags(text)
    },
    {
      title: '操作',
      key: 'action',
      render: (text: any, record: any) => (
        <Space size="small">
            <Tooltip title="编辑">
                <Button 
                    size="small" 
                    icon={<EditOutlined />} 
                    onClick={() => onEdit(record.id)}
                />
            </Tooltip>
            <Popconfirm
                title={`确定要删除 ${record.name} 吗？`}
                onConfirm={() => onManage(record.id, 'delete')}
                okText="删除"
                cancelText="取消"
            >
                <Button size="small" danger icon={<DeleteOutlined />} />
            </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <Table
      columns={columns}
      dataSource={modelInfos}
      rowKey="id"
      loading={loading}
      pagination={{
          current: pagination.page + 1,
          pageSize: pagination.pageSize,
          total: pagination.total,
          onChange: (page, pageSize) => onPageChange(page - 1, pageSize),
          showSizeChanger: true,
          pageSizeOptions: ['10', '30', '50', '100']
      }}
      scroll={{ x: 1200 }}
    />
  );
}
