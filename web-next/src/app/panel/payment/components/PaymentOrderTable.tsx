'use client';

import React from 'react';
import { Table, Tag } from 'antd';
import { useTranslation } from 'react-i18next';
import { timestamp2string } from '@/utils/common';

export default function PaymentOrderTable({ 
    loading, 
    orders, 
    pagination, 
    onPageChange
}: any) {
  const { t } = useTranslation();

  const StatusType: Record<string, { text: string, color: string }> = {
    pending: { text: '待支付', color: 'processing' },
    success: { text: '支付成功', color: 'success' },
    failed: { text: '支付失败', color: 'error' },
    closed: { text: '已关闭', color: 'default' }
  };

  const columns = [
    {
      title: t('orderlogPage.tableHeaders.created_at'),
      dataIndex: 'created_at',
      key: 'created_at',
      render: (text: number) => timestamp2string(text),
      width: 180,
    },
    {
      title: t('orderlogPage.tableHeaders.gateway_id'),
      dataIndex: 'gateway_id',
      key: 'gateway_id',
    },
    {
      title: t('orderlogPage.tableHeaders.user_id'),
      dataIndex: 'user_id',
      key: 'user_id',
    },
    {
      title: t('orderlogPage.tableHeaders.trade_no'),
      dataIndex: 'trade_no',
      key: 'trade_no',
    },
    {
      title: t('orderlogPage.tableHeaders.gateway_no'),
      dataIndex: 'gateway_no',
      key: 'gateway_no',
    },
    {
      title: t('orderlogPage.tableHeaders.amount'),
      dataIndex: 'amount',
      key: 'amount',
      render: (text: number) => `$${text}`
    },
    {
      title: t('orderlogPage.tableHeaders.fee'),
      dataIndex: 'fee',
      key: 'fee',
      render: (text: number) => `$${text}`
    },
    {
      title: t('orderlogPage.tableHeaders.discount'),
      key: 'discount',
      render: (text: any, record: any) => `${record.discount} ${record.order_currency}`
    },
    {
      title: t('orderlogPage.tableHeaders.order_amount'),
      key: 'order_amount',
      render: (text: any, record: any) => `${record.order_amount} ${record.order_currency}`
    },
    {
      title: t('orderlogPage.tableHeaders.quota'),
      dataIndex: 'quota',
      key: 'quota',
    },
    {
      title: t('orderlogPage.tableHeaders.status'),
      dataIndex: 'status',
      key: 'status',
      render: (text: string) => {
          const status = StatusType[text];
          return <Tag color={status?.color}>{status?.text || text}</Tag>;
      }
    }
  ];

  return (
    <Table
      columns={columns}
      dataSource={orders}
      rowKey="id"
      loading={loading}
      pagination={{
          current: pagination.page + 1,
          pageSize: pagination.pageSize,
          total: pagination.total,
          onChange: (page, pageSize) => onPageChange(page - 1, pageSize),
          showSizeChanger: true
      }}
      scroll={{ x: 1600 }}
      size={"middle"}
    />
  );
}
