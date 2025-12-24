'use client';

import React from 'react';
import { Table, Button, Space, Switch, Tooltip, Popconfirm, Dropdown, Tag } from 'antd';
import { EditOutlined, DeleteOutlined, MoreOutlined, UserOutlined, LockOutlined, KeyOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { renderQuota, timestamp2string, renderNumber } from '@/utils/common';
import { GroupLabel } from '@/app/panel/channel/components/Labels';

export default function UserTable({ 
    loading, 
    users, 
    pagination, 
    onPageChange, 
    onManage, 
    onEdit,
    onManageQuota,
    onShowToken
}: any) {
  const { t } = useTranslation();

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: t('userPage.username'),
      dataIndex: 'username',
      key: 'username',
      render: (text: string, record: any) => (
          <Space direction="vertical" size={0}>
              <span>{text}</span>
              {record.display_name && <span style={{ fontSize: 12, color: '#888' }}>{record.display_name}</span>}
          </Space>
      )
    },
    {
      title: t('userPage.group'),
      dataIndex: 'group',
      key: 'group',
      render: (text: string) => <GroupLabel group={text} />
    },
    {
        title: t('userPage.statistics'),
        key: 'stats',
        render: (_: any, record: any) => (
            <Space size={4}>
                <Tooltip title={t('token_index.remainingQuota')}>
                    <Tag color="geekblue">{renderQuota(record.quota, 6)}</Tag>
                </Tooltip>
                <Tooltip title={t('token_index.usedQuota')}>
                    <Tag color="orange">{renderQuota(record.used_quota, 6)}</Tag>
                </Tooltip>
                <Tooltip title={t('userPage.useQuota')}>
                    <Tag color="purple">{renderNumber(record.request_count)}</Tag>
                </Tooltip>
            </Space>
        )
    },
    {
      title: t('userPage.userRole'),
      dataIndex: 'role',
      key: 'role',
      render: (role: number) => {
          switch (role) {
              case 1: return <Tag>{t('userPage.cUserRole')}</Tag>;
              case 10: return <Tag color="gold">{t('userPage.adminUserRole')}</Tag>;
              case 100: return <Tag color="green">{t('userPage.superAdminRole')}</Tag>;
              default: return <Tag color="red">{t('userPage.uUserRole')}</Tag>;
          }
      }
    },
    {
      title: t('userPage.status'),
      dataIndex: 'status',
      key: 'status',
      render: (text: number, record: any) => (
          <Switch 
            checked={text === 1} 
            onChange={(checked) => onManage(record.username, 'status', checked ? 1 : 2)}
            size="default"
          />
      )
    },
    {
      title: t('userPage.action'),
      key: 'action',
      render: (text: any, record: any) => (
        <Space size="small">
            <Tooltip title={t('common.edit')}>
                <Button size="middle" icon={<EditOutlined />} onClick={() => onEdit(record)} />
            </Tooltip>
            <Dropdown
                menu={{
                    items: [
                        ...(record.role !== 100 ? [{
                            key: 'role',
                            label: record.role === 1 ? t('userPage.setAdmin') : t('userPage.cancelAdmin'),
                            icon: <UserOutlined />,
                            onClick: () => onManage(record.username, 'role', record.role === 1)
                        }] : []),
                        {
                            key: 'quota',
                            label: t('userPage.changeQuota'),
                            icon: <LockOutlined />,
                            onClick: () => onManageQuota(record)
                        },
                        {
                            key: 'token',
                            label: t('userPage.tokenInfo'),
                            icon: <KeyOutlined />,
                            onClick: () => onShowToken(record)
                        },
                        {
                            key: 'delete',
                            label: t('common.delete'),
                            icon: <DeleteOutlined />,
                            danger: true,
                            onClick: () => onManage(record.username, 'delete')
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
      dataSource={users}
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
    />
  );
}
