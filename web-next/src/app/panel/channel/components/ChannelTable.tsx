'use client';

import React, { useState } from 'react';
import { Table, Button, Space, Tag, Switch, Tooltip, Popconfirm, Dropdown, InputNumber } from 'antd';
import { EditOutlined, DeleteOutlined, CopyOutlined, MoreOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { CHANNEL_OPTIONS } from '@/constants/ChannelConstants';
import { ResponseTimeLabel, GroupLabel } from './Labels';
import { renderQuota } from '@/utils/common';

export default function ChannelTable({ 
    loading, 
    channels, 
    pagination, 
    onPageChange, 
    onManage, 
    onEdit, 
    onRefresh 
}: any) {
  const { t } = useTranslation();
  const [priorityDraft, setPriorityDraft] = useState<Record<number, number | undefined>>({});

  const commitPriority = async (record: any) => {
    const next = priorityDraft[record.id];
    if (next === undefined) return;
    const current = typeof record.priority === 'number' ? record.priority : Number(record.priority || 0);
    if (Number(next) === Number(current)) return;
    await onManage(record.id, 'priority', Number(next));
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      render: (text: any, record: any) => (
          <Space>
              {record.tag ? <Tag color="blue">TAG</Tag> : text}
          </Space>
      )
    },
    {
      title: t('channel_index.name'),
      dataIndex: 'name',
      key: 'name',
      render: (text: any, record: any) => (
          <div>
              <div style={{ fontWeight: 500 }}>{text}</div>
              {record.tag && <div style={{ fontSize: 12, color: '#1890ff' }}>{record.tag}</div>}
          </div>
      )
    },
    {
      title: t('channel_index.group'),
      dataIndex: 'group',
      key: 'group',
      render: (text: any) => <GroupLabel group={text} />
    },
    {
      title: t('channel_index.type'),
      dataIndex: 'type',
      key: 'type',
      render: (text: any) => {
          const option = CHANNEL_OPTIONS[text];
          return option ? <Tag color={option.color}>{option.text}</Tag> : <Tag>Unknown</Tag>;
      }
    },
    {
      title: t('channel_index.status'),
      dataIndex: 'status',
      key: 'status',
      render: (text: any, record: any) => (
          <Switch 
            checked={text === 1} 
            onChange={(checked) => onManage(record.id, 'status', checked ? 1 : 2)}
            size="default"
          />
      )
    },
    {
        title: t('channel_index.responseTime'),
        dataIndex: 'response_time',
        key: 'response_time',
        render: (text: any, record: any) => (
            <ResponseTimeLabel 
                test_time={record.test_time} 
                response_time={record.response_time} 
                handle_action={() => onManage(record.id, 'test', record.test_model || '')}
            />
        )
    },
    {
        title: t('channel_index.usedBalance'),
        key: 'balance',
        render: (text: any, record: any) => (
            <div>
                <div>{renderQuota(record.used_quota)}</div>
                <div style={{ fontSize: 12, color: '#52c41a' }}>${record.balance?.toFixed(2)}</div>
            </div>
        )
    },
    {
        title: t('channel_index.priority'),
        dataIndex: 'priority',
        key: 'priority',
        width: 80,
        render: (_: any, record: any) => {
          const value =
            priorityDraft[record.id] !== undefined
              ? priorityDraft[record.id]
              : typeof record.priority === 'number'
                ? record.priority
                : Number(record.priority || 0);
          return (
            <InputNumber
              size="small"
              value={value}
              step={1}
              precision={0}
              style={{ width: 80 }}
              onChange={(v) => setPriorityDraft((p) => ({ ...p, [record.id]: Number(v ?? 0) }))}
              onPressEnter={() => commitPriority(record)}
              onBlur={() => commitPriority(record)}
            />
          );
        },
    },
    {
      title: t('channel_index.actions'),
      key: 'action',
      render: (text: any, record: any) => (
        <Space size="small">
            <Tooltip title={t('common.edit')}>
                <Button 
                    icon={<EditOutlined />} 
                    onClick={() => onEdit(record)}
                    size='middle'
                />
            </Tooltip>
            <Tooltip title={t('channel_row.test')}>
                <Button 
                    icon={<ThunderboltOutlined />} 
                    size='middle'
                    onClick={() => onManage(record.id, 'test', record.test_model || '')} 
                />
            </Tooltip>
            <Popconfirm
                title={t('common.deleteConfirm', { title: record.name })}
                onConfirm={() => onManage(record.id, 'delete')}
                okText={t('common.delete')}
                cancelText={t('common.cancel')}
            >
                <Button icon={<DeleteOutlined />} size='middle' danger />
            </Popconfirm>
            <Dropdown
                menu={{
                    items: [
                        {
                            key: 'copy',
                            label: t('token_index.copy'),
                            icon: <CopyOutlined />,
                            onClick: () => onManage(record.id, 'copy')
                        }
                    ]
                }}
            >
                <Button icon={<MoreOutlined />} size='middle' />
            </Dropdown>
        </Space>
      )
    }
  ];

  return (
    <Table
      columns={columns}
      dataSource={channels}
      rowKey="id"
      loading={loading}
      pagination={{
          current: pagination.page + 1,
          pageSize: pagination.pageSize,
          total: pagination.total,
          onChange: (page, pageSize) => onPageChange(page - 1, pageSize),
          showSizeChanger: true
      }}
      size='middle'
    />
  );
}
