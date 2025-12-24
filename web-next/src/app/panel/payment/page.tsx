'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, Tabs, Button, Input, Row, Col, DatePicker, Select } from 'antd';
import { useTranslation } from 'react-i18next';
import { ReloadOutlined, SearchOutlined, PlusOutlined } from '@ant-design/icons';
import { API } from '@/utils/api';
import { showError, showSuccess } from '@/utils/common';
import PaymentGatewayTable from './components/PaymentGatewayTable';
import PaymentOrderTable from './components/PaymentOrderTable';
import PaymentGatewayEditModal from './components/PaymentGatewayEditModal';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

export default function PaymentPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('order');
  
  // Order State
  const [orders, setOrders] = useState([]);
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderPagination, setOrderPagination] = useState({ page: 0, pageSize: 10, total: 0 });
  const [orderKeyword, setOrderKeyword] = useState({});

  // Gateway State
  const [gateways, setGateways] = useState([]);
  const [gatewayLoading, setGatewayLoading] = useState(false);
  const [gatewayPagination, setGatewayPagination] = useState({ page: 0, pageSize: 10, total: 0 });
  const [gatewayKeyword, setGatewayKeyword] = useState('');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editPaymentId, setEditPaymentId] = useState<number | undefined>(undefined);

  // Fetch Orders
  const fetchOrders = useCallback(async (page = 0, pageSize = 10, keyword = {}) => {
    setOrderLoading(true);
    try {
      const res = await API.get('/api/payment/order', {
        params: {
          page: page + 1,
          size: pageSize,
          order: '-created_at',
          ...keyword
        }
      });
      const { success, message, data } = res.data;
      if (success) {
        setOrders(data.data);
        setOrderPagination({ page, pageSize, total: data.total_count });
      } else {
        showError(message);
      }
    } catch (error: any) {
      showError(error.message);
    } finally {
      setOrderLoading(false);
    }
  }, []);

  // Fetch Gateways
  const fetchGateways = useCallback(async (page = 0, pageSize = 10, keyword = '') => {
    setGatewayLoading(true);
    try {
      const res = await API.get('/api/payment/', {
        params: {
          page: page + 1,
          size: pageSize,
          order: 'sort',
          keyword
        }
      });
      const { success, message, data } = res.data;
      if (success) {
        setGateways(data.data);
        setGatewayPagination({ page, pageSize, total: data.total_count });
      } else {
        showError(message);
      }
    } catch (error: any) {
      showError(error.message);
    } finally {
      setGatewayLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'order') {
      fetchOrders(orderPagination.page, orderPagination.pageSize, orderKeyword);
    } else {
      fetchGateways(gatewayPagination.page, gatewayPagination.pageSize, gatewayKeyword);
    }
  }, [activeTab]);

  const handleGatewayManage = async (id: number, action: string, value?: any) => {
    try {
        let res;
        switch (action) {
            case 'delete':
                res = await API.delete(`/api/payment/${id}`);
                break;
            case 'status':
                res = await API.put(`/api/payment/`, { id, enable: value });
                break;
            case 'sort':
                res = await API.put(`/api/payment/`, { id, sort: value });
                break;
        }
        
        if (res?.data.success) {
            showSuccess(t('userPage.operationSuccess'));
            fetchGateways(gatewayPagination.page, gatewayPagination.pageSize, gatewayKeyword);
        } else {
            showError(res?.data.message || 'Operation failed');
        }
    } catch (error: any) {
        showError(error.message);
    }
  };

  const items = [
    {
      key: 'order',
      label: t('paymentPage.orderList'),
      children: (
        <div>
            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                <Col>
                    <Button size={"middle"} icon={<ReloadOutlined />} onClick={() => fetchOrders(0, orderPagination.pageSize, orderKeyword)}>
                        {t('orderlogPage.refreshClear')}
                    </Button>
                </Col>
            </Row>
            <PaymentOrderTable 
                loading={orderLoading}
                orders={orders}
                pagination={orderPagination}
                onPageChange={(page: number, pageSize: number) => fetchOrders(page, pageSize, orderKeyword)}
            />
        </div>
      )
    },
    {
      key: 'gateway',
      label: t('paymentPage.gatewaySettings'),
      children: (
        <div>
            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                <Col>
                    <Input 
                        placeholder={t('paymentGatewayPage.searchPlaceholder')} 
                        style={{ width: 250 }} 
                        value={gatewayKeyword}
                        onChange={(e) => setGatewayKeyword(e.target.value)}
                        onPressEnter={() => fetchGateways(0, gatewayPagination.pageSize, gatewayKeyword)}
                        size={"middle"}
                    />
                </Col>
                <Col>
                    <Button size={"middle"} type="primary" icon={<SearchOutlined />} onClick={() => fetchGateways(0, gatewayPagination.pageSize, gatewayKeyword)}>
                        {t('common.search')}
                    </Button>
                </Col>
                <Col>
                    <Button size={"middle"} icon={<ReloadOutlined />} onClick={() => { setGatewayKeyword(''); fetchGateways(0, gatewayPagination.pageSize, ''); }}>
                        {t('paymentGatewayPage.refreshClear')}
                    </Button>
                </Col>
                <Col style={{ marginLeft: 'auto' }}>
                    <Button size={"middle"} type="primary" icon={<PlusOutlined />} onClick={() => { setEditPaymentId(undefined); setEditModalOpen(true); }}>
                        {t('paymentGatewayPage.createPayment')}
                    </Button>
                </Col>
            </Row>
            <PaymentGatewayTable 
                loading={gatewayLoading}
                gateways={gateways}
                pagination={gatewayPagination}
                onPageChange={(page: number, pageSize: number) => fetchGateways(page, pageSize, gatewayKeyword)}
                onManage={handleGatewayManage}
                onEdit={(record: any) => { setEditPaymentId(record.id); setEditModalOpen(true); }}
            />
        </div>
      )
    }
  ];

  return (
    <div>
      <Card>
        <Tabs 
            activeKey={activeTab} 
            onChange={setActiveTab} 
            items={items}
        />
      </Card>
      <PaymentGatewayEditModal 
        open={editModalOpen}
        paymentId={editPaymentId}
        onCancel={() => setEditModalOpen(false)}
        onSuccess={() => { setEditModalOpen(false); fetchGateways(gatewayPagination.page, gatewayPagination.pageSize, gatewayKeyword); }}
      />
    </div>
  );
}
