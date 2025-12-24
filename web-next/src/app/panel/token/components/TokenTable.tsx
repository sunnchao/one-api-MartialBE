'use client';

import React from 'react';
import { Table, Button, Space, Switch, Tooltip, Popconfirm, Dropdown, MenuProps } from 'antd';
import { DeleteOutlined, CopyOutlined, MoreOutlined, WechatOutlined, EditOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { renderQuota, timestamp2string, copy, getChatLinks, replaceChatPlaceholders, renderGroup } from '@/utils/common';
import { useSelector } from 'react-redux';

export default function TokenTable({ 
    loading, 
    tokens, 
    pagination, 
    onPageChange, 
    onManage, 
    onEdit, 
    userGroupOptions 
}: any) {
  const { t } = useTranslation();
  const siteInfo = useSelector((state: any) => state.siteInfo);

  const handleCopyLink = (url: string, key: string, type: 'copy' | 'link') => {
    let server = '';
    if (siteInfo?.server_address) {
      server = siteInfo.server_address;
    } else if (typeof window !== 'undefined') {
      server = window.location.host;
    }
    server = encodeURIComponent(server);
    const tokenKey = 'sk-' + key;
    const text = replaceChatPlaceholders(url, tokenKey, server);
    
    if (type === 'link') {
        window.open(text);
    } else {
        copy(text, t('common.link'));
    }
  };

  const getChatMenuItems = (key: string): MenuProps['items'] => {
      const links = getChatLinks();
      return links.map((link: any, index: number) => ({
          key: index,
          label: link.name,
          onClick: () => handleCopyLink(link.url, key, 'link')
      }));
  };

  const columns = [
    {
      title: t('token_index.name'),
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: t('token_index.userGroup'),
      dataIndex: 'group',
      key: 'group',
      render: (text: string) => renderGroup(userGroupOptions, text)
    },
    {
      title: t('token_index.status'),
      dataIndex: 'status',
      key: 'status',
      render: (text: number, record: any) => (
          <Switch 
            checked={text === 1} 
            onChange={(checked) => onManage(record.id, 'status', checked ? 1 : 2)}
            size="default"
          />
      )
    },
    {
      title: t('token_index.usedQuota'),
      dataIndex: 'used_quota',
      key: 'used_quota',
      render: (text: number) => renderQuota(text, 6)
    },
    {
      title: t('token_index.remainingQuota'),
      dataIndex: 'remain_quota',
      key: 'remain_quota',
      render: (text: number, record: any) => record.unlimited_quota ? t('token_index.unlimited') : renderQuota(text, 6)
    },
    {
      title: t('token_index.createdTime'),
      dataIndex: 'created_time',
      key: 'created_time',
      render: (text: number) => timestamp2string(text)
    },
    {
      title: t('token_index.expiryTime'),
      dataIndex: 'expired_time',
      key: 'expired_time',
      render: (text: number) => text === -1 ? t('token_index.neverExpires') : timestamp2string(text)
    },
    {
      title: t('token_index.actions'),
      key: 'action',
      render: (text: any, record: any) => (
        <Space size="small">
            <Button 
                size="small" 
                icon={<CopyOutlined />}
                onClick={() => copy(`sk-${record.key}`, t('token_index.token'))}
            >
                {t('token_index.copy')}
            </Button>
            <Dropdown menu={{ items: getChatMenuItems(record.key) }}>
                <Button size="small" icon={<WechatOutlined />}>
                    {t('token_index.chat')}
                </Button>
            </Dropdown>
            <Tooltip title={t('common.edit')}>
                <Button size="small" icon={<EditOutlined />} onClick={() => onEdit(record)} />
            </Tooltip>
            <Popconfirm
                title={t('token_index.confirmDeleteToken')}
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
      dataSource={tokens}
      rowKey="id"
      loading={loading}
      pagination={{
          current: pagination.page + 1,
          pageSize: pagination.pageSize,
          total: pagination.total,
          onChange: (page, pageSize) => onPageChange(page - 1, pageSize),
          showSizeChanger: true
      }}
    />
  );
}
