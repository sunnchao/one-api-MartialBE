'use client';

import React from 'react';
import { Table, Button, Space, Switch, Tooltip, Popconfirm, Tag } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

export default function UserGroupTable({ 
    loading, 
    userGroups, 
    pagination, 
    onPageChange, 
    onManage, 
    onEdit 
}: any) {
  const { t } = useTranslation();

  const columns = [
    {
      title: t('userGroup.id'),
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: t('userGroup.symbol'),
      dataIndex: 'symbol',
      key: 'symbol',
      render: (text: string) => <Tag color="blue">{text}</Tag>
    },
    {
      title: t('userGroup.name'),
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: t('userGroup.ratio'),
      dataIndex: 'ratio',
      key: 'ratio',
    },
    {
        title: t('userGroup.apiRate'),
        dataIndex: 'api_rate',
        key: 'api_rate',
    },
    {
        title: t('userGroup.public'),
        dataIndex: 'public',
        key: 'public',
        render: (text: boolean) => <Tag color={text ? 'green' : 'red'}>{text ? '是' : '否'}</Tag>
    },
    {
        title: t('userGroup.promotion'),
        dataIndex: 'promotion',
        key: 'promotion',
        render: (text: boolean) => <Tag color={text ? 'green' : 'red'}>{text ? '是' : '否'}</Tag>
    },
    {
        title: t('userGroup.min') + '$',
        dataIndex: 'min',
        key: 'min',
    },
    {
        title: `${t('userGroup.max')}('$')`,
        dataIndex: 'max',
        key: 'max',
    },
    {
      title: t('userGroup.enable'),
      dataIndex: 'enable',
      key: 'enable',
      render: (text: boolean, record: any) => (
          <Switch 
            checked={text} 
            onChange={() => onManage(record.id, 'status')}
            size="default"
          />
      )
    },
    {
      title: t('userPage.action'),
      key: 'action',
      render: (text: any, record: any) => (
        <Space size='middle'>
            <Tooltip title={t('common.edit')}>
                <Button size='middle' icon={<EditOutlined />} onClick={() => onEdit(record)} />
            </Tooltip>
            <Popconfirm
                title={t('common.deleteConfirm', { title: record.name })}
                onConfirm={() => onManage(record.id, 'delete')}
                okText={t('common.delete')}
                cancelText={t('common.cancel')}
            >
                <Button size='middle' danger icon={<DeleteOutlined />} />
            </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <Table
      columns={columns}
      dataSource={userGroups}
      rowKey="id"
      loading={loading}
      pagination={{
          current: pagination.page + 1,
          pageSize: pagination.pageSize,
          total: pagination.total,
          onChange: (page, pageSize) => onPageChange(page - 1, pageSize),
          showSizeChanger: true
      }}
      scroll={{ x: 1000 }}
      size='middle'
    />
  );
}
