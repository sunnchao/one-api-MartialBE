'use client';

import React from 'react';
import { Table, Button, Space } from 'antd';
import { useTranslation } from 'react-i18next';
import { renderNumber, calculateQuota } from '@/utils/common';

interface InvoiceTableProps {
  loading: boolean;
  invoices: any[];
  pagination: any;
  onPageChange: (page: number, pageSize: number) => void;
  onManage: (date: string) => void;
}

export default function InvoiceTable({ 
    loading, 
    invoices, 
    pagination, 
    onPageChange,
    onManage
}: InvoiceTableProps) {
  const { t } = useTranslation();

  const columns = [
    {
      title: t('invoice_index.date') || 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (text: string) => text ? text.substring(0, 7) : ''
    },
    {
      title: t('invoice_index.quota') || 'Amount',
      dataIndex: 'quota',
      key: 'quota',
      render: (text: number) => `$${calculateQuota(text, 6)}`
    },
    {
      title: t('invoice_index.tokens') || 'Tokens (Prompt/Completion)',
      key: 'tokens',
      render: (text: any, record: any) => `${renderNumber(record.prompt_tokens)} / ${renderNumber(record.completion_tokens)}`
    },
    {
      title: t('invoice_index.requestCount') || 'Request Count',
      dataIndex: 'request_count',
      key: 'request_count',
    },
    {
      title: t('invoice_index.requestTime') || 'Request Time',
      dataIndex: 'request_time',
      key: 'request_time',
      render: (text: number) => `${(text / 1000).toFixed(3)}s`
    },
    {
      title: t('invoice_index.option') || 'Option',
      key: 'option',
      render: (text: any, record: any) => (
          <Button type="primary" size="small" onClick={() => onManage(record.date)}>
              {t('invoice_index.viewInvoice') || 'View Details'}
          </Button>
      )
    }
  ];

  return (
    <Table
      columns={columns}
      dataSource={invoices}
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
