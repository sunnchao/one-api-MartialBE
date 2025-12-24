'use client';

import React from 'react';
import { Table, Button, Space, Tooltip, Popconfirm, Avatar } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

interface ModelOwnedbyTableProps {
  loading: boolean;
  data: any[];
  onManage: (id: number, action: string) => void;
  onEdit: (id: number) => void;
}

export default function ModelOwnedbyTable({ 
    loading, 
    data, 
    onManage, 
    onEdit 
}: ModelOwnedbyTableProps) {
  const { t } = useTranslation();

  const columns = [
    {
      title: t('modelOwnedby.id'),
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: t('modelOwnedby.name'),
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: t('modelOwnedby.icon'),
      dataIndex: 'icon',
      key: 'icon',
      render: (text: string) => <Avatar src={text}>{text ? null : 'Icon'}</Avatar>
    },
    {
      title: t('modelOwnedby.action'),
      key: 'action',
      render: (text: any, record: any) => (
        <Space size="small">
            <Tooltip title={t('common.edit')}>
                <Button 
                    size="small" 
                    icon={<EditOutlined />} 
                    onClick={() => onEdit(record.id)}
                />
            </Tooltip>
            <Popconfirm
                title={t('common.deleteConfirm', { title: record.name })}
                onConfirm={() => onManage(record.id, 'delete')}
                okText={t('common.delete')}
                cancelText={t('common.cancel')}
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
      dataSource={data}
      rowKey="id"
      loading={loading}
      pagination={{ pageSize: 10 }}
    />
  );
}
