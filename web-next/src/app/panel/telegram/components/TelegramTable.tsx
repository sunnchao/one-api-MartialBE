'use client';

import React from 'react';
import { Table, Button, Space, Tooltip, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

interface TelegramTableProps {
  loading: boolean;
  data: any[];
  onManage: (id: number, action: string) => void;
  onEdit: (id: number) => void;
}

export default function TelegramTable({ 
    loading, 
    data, 
    onManage, 
    onEdit 
}: TelegramTableProps) {
  const { t } = useTranslation();

  const columns = [
    {
      title: t('telegramPage.id') || 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80
    },
    {
      title: t('telegramPage.command') || 'Command',
      dataIndex: 'command',
      key: 'command',
    },
    {
      title: t('telegramPage.description') || 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: t('telegramPage.replyType') || 'Parse Mode',
      dataIndex: 'parse_mode',
      key: 'parse_mode',
    },
    {
      title: t('telegramPage.replyContent') || 'Reply Content',
      dataIndex: 'reply_message',
      key: 'reply_message',
      ellipsis: true
    },
    {
      title: t('telegramPage.action') || 'Action',
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
                title={t('common.deleteConfirm', { title: record.command }) || `Delete ${record.command}?`}
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
