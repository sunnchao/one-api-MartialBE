'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button, Row, Col, Typography, Divider, Table, Descriptions, Spin } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { API } from '@/utils/api';
import { showError, calculateQuota, thousandsSeparator } from '@/utils/common';
import { useNavigate, useParams } from 'react-router-dom';

const { Title, Text } = Typography;

export default function InvoiceDetailPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { date } = useParams();
  const safeDate = date || '';
  
  const [loading, setLoading] = useState(true);
  const [invoiceData, setInvoiceData] = useState<any[]>([]);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const fetchInvoiceDetail = async () => {
      setLoading(true);
      try {
        const res = await API.get(`/api/user/invoice/detail`, {
          params: {
            date: date + '-01'
          }
        });
        const { success, message, data } = res.data;
        if (success) {
          setInvoiceData(data);
          // Fetch user data
          const userRes = await API.get('/api/user/self');
          if (userRes.data.success) {
            setUserData(userRes.data.data);
          }
        } else {
          showError(message);
          navigate('/panel/invoice', { replace: true });
        }
      } catch (error) {
        console.error(error);
        showError('Failed to fetch invoice details');
        navigate('/panel/invoice', { replace: true });
      }
      setLoading(false);
    };

    if (date) {
      fetchInvoiceDetail();
    } else {
      navigate('/panel/invoice', { replace: true });
    }
  }, [date, navigate]);

  if (loading || !invoiceData || !userData) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" tip={t('dashboard_index.loading')} />
      </div>
    );
  }

  // Calculate totals
  const totalQuota = invoiceData.reduce((sum, item) => sum + item.quota, 0);
  const totalPromptTokens = invoiceData.reduce((sum, item) => sum + item.prompt_tokens, 0);
  const totalCompletionTokens = invoiceData.reduce((sum, item) => sum + item.completion_tokens, 0);
  const totalRequestCount = invoiceData.reduce((sum, item) => sum + item.request_count, 0);
  const totalRequestTime = invoiceData.reduce((sum, item) => sum + item.request_time, 0);

  const columns = [
    {
      title: t('invoice_index.modelName') || 'Model Name',
      dataIndex: 'model_name',
      key: 'model_name',
    },
    {
      title: t('invoice_index.promptTokens') || 'Prompt Tokens',
      dataIndex: 'prompt_tokens',
      key: 'prompt_tokens',
      align: 'right' as const,
      render: (text: number) => thousandsSeparator(text)
    },
    {
      title: t('invoice_index.completionTokens') || 'Completion Tokens',
      dataIndex: 'completion_tokens',
      key: 'completion_tokens',
      align: 'right' as const,
      render: (text: number) => thousandsSeparator(text)
    },
    {
      title: t('invoice_index.requestCount') || 'Request Count',
      dataIndex: 'request_count',
      key: 'request_count',
      align: 'right' as const,
      render: (text: number) => thousandsSeparator(text)
    },
    {
      title: t('invoice_index.requestTime') || 'Request Time',
      dataIndex: 'request_time',
      key: 'request_time',
      align: 'right' as const,
      render: (text: number) => `${(text / 1000).toFixed(3)}s`
    },
    {
      title: t('invoice_index.amount') || 'Amount',
      dataIndex: 'quota',
      key: 'quota',
      align: 'right' as const,
      render: (text: number) => `$${calculateQuota(text, 6)}`
    }
  ];

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>{t('invoice_index.invoice')}</Title>
        <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate('/panel/invoice')}
        >
            {t('back') || 'Back'}
        </Button>
      </div>

      <Card>
        <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={3} style={{ margin: 0 }}>One API</Title>
          <Text type="secondary" style={{ fontSize: 18 }}>
            #{safeDate.replace(/-/g, '')}-{userData.id}
          </Text>
        </div>

        <Divider dashed />

        <Row gutter={32} style={{ marginBottom: 32 }}>
          <Col xs={24} md={12}>
            <Title level={4} style={{ marginBottom: 16 }}>{t('invoice_index.userinfo')}</Title>
            <Descriptions column={1} bordered size="small">
                <Descriptions.Item label={t('invoice_index.username')}>{userData.username}</Descriptions.Item>
                <Descriptions.Item label={t('invoice_index.email')}>{userData.email}</Descriptions.Item>
                <Descriptions.Item label={t('invoice_index.date')}>{safeDate ? safeDate.substring(0, 7) : ''}</Descriptions.Item>
            </Descriptions>
          </Col>
          <Col xs={24} md={12}>
            <Title level={4} style={{ marginBottom: 16 }}>{t('invoice_index.usage_statistics')}</Title>
            <Descriptions column={1} bordered size="small">
                <Descriptions.Item label={t('invoice_index.promptTokens')}>{thousandsSeparator(totalPromptTokens)}</Descriptions.Item>
                <Descriptions.Item label={t('invoice_index.completionTokens')}>{thousandsSeparator(totalCompletionTokens)}</Descriptions.Item>
                <Descriptions.Item label={t('invoice_index.requestTime')}>{`${(totalRequestTime / 1000).toFixed(3)}s`}</Descriptions.Item>
                <Descriptions.Item label={t('invoice_index.requestCount')}>{thousandsSeparator(totalRequestCount)}</Descriptions.Item>
            </Descriptions>
          </Col>
        </Row>

        <Divider dashed />

        <Title level={4} style={{ marginBottom: 16 }}>{t('invoice_index.usage_details') || 'Usage Details'}</Title>
        
        <Table
            columns={columns}
            dataSource={invoiceData}
            rowKey="model_name"
            pagination={false}
            bordered
            size="small"
            style={{ marginBottom: 32 }}
        />

        <Divider dashed />

        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'baseline', gap: 16 }}>
            <Text style={{ fontSize: 20 }}>{t('invoice_index.quota')}</Text>
            <Title level={2} style={{ margin: 0, color: '#52c41a' }}>
                ${calculateQuota(totalQuota, 6)}
            </Title>
        </div>
      </Card>
    </div>
  );
}
