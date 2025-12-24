'use client';

import React, { useState, useEffect } from 'react';
import {
  Typography,
  Card,
  Grid,
  Row,
  Col,
  Tabs,
  Button,
  Spin,
  Empty,
  Statistic,
  List,
  Avatar,
  Divider,
  Tag,
  Modal,
  InputNumber
} from 'antd';
import {
  GiftOutlined,
  HistoryOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CalendarOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { API } from '@/utils/api';
import { showError, showSuccess } from '@/utils/common';
import { useTranslation } from 'react-i18next';

const { Title, Text } = Typography;

export default function UserCoupon() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [checkinData, setCheckinData] = useState<any>({
    records: [],
    consecutive_days: 0,
    has_checked_today: false
  });
  const [checkinLoading, setCheckinLoading] = useState(false);

  // Test Dialog
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<any>(null);
  const [testAmount, setTestAmount] = useState<number>(50);
  const [testResult, setTestResult] = useState<any>(null);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await API.get('/api/user/coupons');
      if (res.data.success) {
        setCoupons(res.data.data || []);
      }
    } catch (error) {
      showError('获取优惠券失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchCheckinData = async () => {
    try {
      const res = await API.get('/api/user/checkin/list');
      if (res.data.success) {
        setCheckinData(res.data.data);
      }
    } catch (error) {
      showError('获取签到记录失败');
    }
  };

  const performCheckin = async () => {
    setCheckinLoading(true);
    try {
      const res = await API.post('/api/user/checkin');
      if (res.data.success) {
        showSuccess(res.data.message);
        fetchCheckinData();
        fetchCoupons();
      } else {
        showError(res.data.message);
      }
    } catch (error) {
      showError('签到失败');
    } finally {
      setCheckinLoading(false);
    }
  };

  const testCouponUsage = async () => {
    if (!selectedCoupon) return;
    try {
      const res = await API.get(`/api/user/coupons/validate?code=${selectedCoupon.code}&amount=${testAmount}`);
      if (res.data.success) {
        setTestResult(res.data.data);
      } else {
        showError(res.data.message);
        setTestResult(null);
      }
    } catch (error) {
      showError('验证优惠券失败');
      setTestResult(null);
    }
  };

  useEffect(() => {
    fetchCoupons();
    fetchCheckinData();
  }, []);

  useEffect(() => {
    if (testModalOpen && selectedCoupon) {
      testCouponUsage();
    }
  }, [testAmount, selectedCoupon, testModalOpen]);

  const couponStats = {
    available: coupons.filter((c) => c.status === 1).length,
    used: coupons.filter((c) => c.status === 2).length,
    expired: coupons.filter((c) => c.status === 3).length
  };

  const getCouponStatusColor = (status: number) => {
    switch (status) {
      case 1: return 'green';
      case 2: return 'default';
      case 3: return 'red';
      default: return 'default';
    }
  };

  const getCouponStatusText = (status: number) => {
    switch (status) {
      case 1: return '可用';
      case 2: return '已使用';
      case 3: return '已过期';
      default: return '未知';
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <Title level={2} style={{ marginBottom: 24 }}>我的优惠券</Title>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="可用优惠券" value={couponStats.available} prefix={<GiftOutlined style={{ color: '#52c41a' }} />} valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="已使用" value={couponStats.used} prefix={<HistoryOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="已过期" value={couponStats.expired} prefix={<ClockCircleOutlined style={{ color: '#ff4d4f' }} />} valueStyle={{ color: '#ff4d4f' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="连续签到天数" value={checkinData.consecutive_days} prefix={<CalendarOutlined style={{ color: '#1677ff' }} />} valueStyle={{ color: '#1677ff' }} />
          </Card>
        </Col>
      </Row>

      <Card>
        <Tabs
          items={[
            {
              key: 'available',
              label: `可用优惠券 (${couponStats.available})`,
              children: (
                <div>
                  <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button icon={<ReloadOutlined />} onClick={fetchCoupons}>刷新</Button>
                  </div>
                  {loading ? <Spin /> : coupons.length === 0 ? <Empty description="暂无优惠券" /> : (
                    <Row gutter={[16, 16]}>
                      {coupons.map(coupon => (
                        <Col xs={24} sm={12} md={8} key={coupon.id}>
                          <Card
                            title={coupon.name}
                            extra={<Tag color={getCouponStatusColor(coupon.status)}>{getCouponStatusText(coupon.status)}</Tag>}
                            actions={coupon.status === 1 ? [
                              <Button type="link" onClick={() => { setSelectedCoupon(coupon); setTestModalOpen(true); }}>测试使用</Button>
                            ] : []}
                          >
                            <p>{coupon.description || '暂无描述'}</p>
                            <p>优惠券码: <Text copyable>{coupon.code}</Text></p>
                            <p>有效期至: {new Date(coupon.expire_time).toLocaleDateString()}</p>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  )}
                </div>
              )
            },
            {
              key: 'checkin',
              label: '签到中心',
              children: (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <Title level={4}>每日签到</Title>
                    <Button 
                        type="primary" 
                        icon={<CheckCircleOutlined />} 
                        onClick={performCheckin} 
                        disabled={checkinLoading || checkinData.has_checked_today}
                    >
                        {checkinData.has_checked_today ? '今日已签到' : '立即签到'}
                    </Button>
                  </div>
                  
                  <List
                    header={<div>最近签到记录</div>}
                    dataSource={checkinData.records.slice(0, 10)}
                    renderItem={(item: any) => (
                      <List.Item>
                        <List.Item.Meta
                          avatar={<Avatar icon={<CalendarOutlined />} style={{ backgroundColor: '#1677ff' }} />}
                          title={`第${item.day}天签到`}
                          description={`${new Date(item.created_time).toLocaleString()} - ${item.description}`}
                        />
                      </List.Item>
                    )}
                  />
                </div>
              )
            },
            {
              key: 'history',
              label: '使用记录',
              children: (
                <List
                    dataSource={coupons.filter(c => c.status === 2)}
                    renderItem={(item: any) => (
                        <List.Item>
                            <List.Item.Meta
                                title={item.name}
                                description={
                                    <div>
                                        <div>订单号: {item.order_id}</div>
                                        <div>使用时间: {new Date(item.used_time).toLocaleString()}</div>
                                        <div>节省: ${item.saved_amount}</div>
                                    </div>
                                }
                            />
                        </List.Item>
                    )}
                    locale={{ emptyText: '暂无使用记录' }}
                />
              )
            }
          ]}
        />
      </Card>

      <Modal
        title="测试优惠券使用"
        open={testModalOpen}
        onCancel={() => setTestModalOpen(false)}
        footer={[
            <Button key="close" onClick={() => setTestModalOpen(false)}>关闭</Button>
        ]}
      >
        {selectedCoupon && (
            <div>
                <p><strong>{selectedCoupon.name}</strong></p>
                <p>优惠券码: {selectedCoupon.code}</p>
                <div style={{ marginBottom: 16 }}>
                    <Text>测试金额: </Text>
                    <InputNumber 
                        value={testAmount} 
                        onChange={(val) => setTestAmount(val || 0)} 
                        prefix="$" 
                        style={{ width: '100%' }} 
                    />
                </div>
                {testResult && (
                    <Card style={{ backgroundColor: '#f6ffed', borderColor: '#b7eb8f' }}>
                        <p>原价: ${testAmount.toFixed(2)}</p>
                        <p style={{ color: '#52c41a' }}>优惠: -${testResult.discount_amount.toFixed(2)}</p>
                        <Divider style={{ margin: '8px 0' }} />
                        <Title level={5} style={{ color: '#1677ff' }}>应付: ${testResult.final_amount.toFixed(2)}</Title>
                    </Card>
                )}
            </div>
        )}
      </Modal>
    </div>
  );
}
