'use client';

import React from 'react';
import { Table, Button, Space, Switch, Tooltip, Popconfirm, Tag, message } from 'antd';
import { DeleteOutlined, EditOutlined, CopyOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { renderQuota, timestamp2string, copy } from '@/utils/common';

export default function RedemptionTable({ 
    loading, 
    redemptions, 
    pagination, 
    onPageChange, 
    onManage, 
    onEdit 
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
      title: t('redemptionPage.headLabels.name'),
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: t('redemptionPage.headLabels.status'),
      dataIndex: 'status',
      key: 'status',
      render: (text: number, record: any) => {
          if (text !== 1 && text !== 2) {
              return (
                  <Tag color={text === 3 ? 'green' : 'orange'}>
                      {text === 3 ? t('analytics_index.used') : t('common.unknown')}
                  </Tag>
              );
          }
          return (
            <Switch 
                checked={text === 1} 
                onChange={(checked) => onManage(record.id, 'status', checked ? 1 : 2)}
                size="default"
            />
          );
      }
    },
    {
      title: t('redemptionPage.headLabels.quota'),
      dataIndex: 'quota',
      key: 'quota',
      render: (text: number) => renderQuota(text)
    },
    {
      title: t('redemptionPage.headLabels.createdTime'),
      dataIndex: 'created_time',
      key: 'created_time',
      render: (text: number) => timestamp2string(text)
    },
    {
      title: t('redemptionPage.headLabels.redeemedTime'),
      dataIndex: 'redeemed_time',
      key: 'redeemed_time',
      render: (text: number) => text ? timestamp2string(text) : t('redemptionPage.unredeemed')
    },
    {
      title: t('redemptionPage.headLabels.action'),
      key: 'action',
      render: (text: any, record: any) => (
        <Space size="middle">
            <Button
                onClick={() => copy(record.key, t('topupCard.inputLabel'))}
                size={"middle"}
            >
                {t('token_index.copy')}
            </Button>
            <Tooltip title={t('common.edit')}>
                <Button
                    icon={<EditOutlined />} 
                    onClick={() => onEdit(record)}
                    disabled={record.status !== 1 && record.status !== 2}
                    size={"middle"}
                />
            </Tooltip>
            <Popconfirm
                title={t('redemptionPage.delTip')}
                onConfirm={() => onManage(record.id, 'delete')}
                okText={t('common.delete')}
                cancelText={t('common.cancel')}
            >
                <Button size={"middle"} danger icon={<DeleteOutlined />} />
            </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <Table
      columns={columns}
      dataSource={redemptions}
      rowKey="id"
      loading={loading}
      pagination={{
          current: pagination.page + 1,
          pageSize: pagination.pageSize,
          total: pagination.total,
          onChange: (page, pageSize) => onPageChange(page - 1, pageSize),
          showSizeChanger: true
      }}
      size={"middle"}
    />
  );
}
