'use client';

import React from 'react';
import { Table, Button, Space, Switch, Tooltip, Popconfirm, Tag, Input, InputNumber, message } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { PaymentType } from '../type/config';
import { timestamp2string } from '@/utils/common';

export default function PaymentGatewayTable({ 
    loading, 
    gateways, 
    pagination, 
    onPageChange, 
    onManage, 
    onEdit 
}: any) {
  const { t } = useTranslation();

  const handleSortChange = async (id: number, value: number, originalValue: number) => {
      if (value === originalValue) return;
      if (value < 0) {
          message.error(t('payment_row.sortTip'));
          return;
      }
      await onManage(id, 'sort', value);
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: t('paymentGatewayPage.tableHeaders.uuid'),
      dataIndex: 'uuid',
      key: 'uuid',
      ellipsis: true,
    },
    {
      title: t('paymentGatewayPage.tableHeaders.name'),
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: t('paymentGatewayPage.tableHeaders.type'),
      dataIndex: 'type',
      key: 'type',
      render: (text: string) => <Tag color="blue">{PaymentType[text] || text}</Tag>
    },
    {
      title: t('paymentGatewayPage.tableHeaders.icon'),
      dataIndex: 'icon',
      key: 'icon',
      render: (text: string) => text ? <img src={text} alt="icon" style={{ width: 24, height: 24 }} /> : '-'
    },
    {
      title: t('paymentGatewayPage.tableHeaders.fixedFee'),
      dataIndex: 'fixed_fee',
      key: 'fixed_fee',
    },
    {
      title: t('paymentGatewayPage.tableHeaders.percentFee'),
      dataIndex: 'percent_fee',
      key: 'percent_fee',
      render: (text: number) => `${text}%`
    },
    {
      title: t('paymentGatewayPage.tableHeaders.sort'),
      dataIndex: 'sort',
      key: 'sort',
      render: (text: number, record: any) => (
          <InputNumber 
            defaultValue={text} 
            min={0}
            onBlur={(e) => handleSortChange(record.id, parseInt(e.target.value), text)}
            size={"middle"}
          />
      )
    },
    {
      title: t('paymentGatewayPage.tableHeaders.enable'),
      dataIndex: 'enable',
      key: 'enable',
      render: (text: boolean, record: any) => (
          <Switch 
            checked={text} 
            onChange={(checked) => onManage(record.id, 'status', checked)}
            size="default"
          />
      )
    },
    {
      title: t('paymentGatewayPage.tableHeaders.createdAt'),
      dataIndex: 'created_at',
      key: 'created_at',
      render: (text: number) => timestamp2string(text)
    },
    {
      title: t('paymentGatewayPage.tableHeaders.action'),
      key: 'action',
      render: (text: any, record: any) => (
        <Space size="middle">
            <Tooltip title={t('common.edit')}>
                <Button size="middle" icon={<EditOutlined />} onClick={() => onEdit(record)} />
            </Tooltip>
            <Popconfirm
                title={t('payment_row.delPaymentTip') + ` ${record.name}?`}
                onConfirm={() => onManage(record.id, 'delete')}
                okText={t('common.delete')}
                cancelText={t('common.cancel')}
            >
                <Button size="middle" danger icon={<DeleteOutlined />} />
            </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <Table
      columns={columns}
      dataSource={gateways}
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
