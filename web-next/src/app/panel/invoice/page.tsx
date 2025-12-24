'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button, Row, Col, Typography } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { API } from '@/utils/api';
import { showError } from '@/utils/common';
import InvoiceTable from './components/InvoiceTable';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

export default function InvoicePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [invoices, setInvoices] = useState([]);
  const [pagination, setPagination] = useState({ page: 0, pageSize: 10, total: 0 });

  const fetchData = async (page = 0, pageSize = 10) => {
    setLoading(true);
    try {
      const res = await API.get('/api/user/invoice', {
        params: {
          page: page + 1,
          size: pageSize,
          order: '-date'
        }
      });
      const { success, message, data } = res.data;
      if (success) {
        setInvoices(data.data || []);
        setPagination({ page, pageSize, total: data.total_count });
      } else {
        showError(message);
      }
    } catch (error: any) {
      showError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleManage = (date: string) => {
      const formattedDate = date.substring(0, 7);
      navigate(`/panel/invoice/detail/${formattedDate}`);
  };

  const handlePageChange = (page: number, pageSize: number) => {
      fetchData(page, pageSize);
  };

  return (
    <div>
      <Card>
        <div style={{ marginBottom: 16 }}>
            <Title level={4} style={{ margin: 0 }}>{t('invoice_index.invoice')}</Title>
            <Text type="secondary">{t('invoice_index.alert')}</Text>
        </div>

        <Row style={{ marginBottom: 16, justifyContent: 'flex-end' }}>
            <Button icon={<ReloadOutlined />} onClick={() => fetchData(pagination.page, pagination.pageSize)}>
                {t('invoice_index.refresh')}
            </Button>
        </Row>

        <InvoiceTable 
            loading={loading}
            invoices={invoices}
            pagination={pagination}
            onPageChange={handlePageChange}
            onManage={handleManage}
        />
      </Card>
    </div>
  );
}
