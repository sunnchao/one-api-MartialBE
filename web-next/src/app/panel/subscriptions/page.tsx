'use client';

import React, { useState, useEffect } from 'react';
import {
  Typography,
  Card,
  Button,
  Row,
  Col,
  Progress,
  Alert,
  Modal,
  Input,
  Divider,
  Spin,
  Select,
  List,
  Space,
  Tag
} from 'antd';
import {
  StarOutlined,
  PlusOutlined,
  ReloadOutlined,
  CloseCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import { API } from '@/utils/api';
import { renderQuota, showError, showSuccess } from '@/utils/common';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const durationDisplayMap: Record<string, { label: string; short: string }> = {
  day: { label: '天', short: '天' },
  week: { label: '周', short: '周' },
  month: { label: '月', short: '月' },
  quarter: { label: '季度', short: '季度' }
};

const durationUnitTextMap: Record<string, string> = {
  day: '天',
  week: '周',
  month: '月',
  quarter: '季度'
};

const resolvePlanDuration = (plan: any) => {
  const unit = plan?.duration_unit || 'month';
  const value = plan?.duration_value || plan?.duration_months || 1;
  const display = durationDisplayMap[unit] || durationDisplayMap.month;
  const safeValue = value > 0 ? value : 1;
  return {
    unit,
    text: `${safeValue}${display.label}`,
    short: display.short
  };
};

const getQuotaDurationText = (plan: any) => {
  if (!plan) return '';
  const unit = plan.duration_unit || 'month';
  const value = plan.duration_value || plan.duration_months || 1;
  const unitLabel = durationUnitTextMap[unit] || durationUnitTextMap.month;
  if (value <= 1) {
    return unitLabel;
  }
  return `${value}${unitLabel}`;
};

export default function ClaudeCodeSubscription() {
  const { t } = useTranslation();
  // @ts-ignore
  const account = useSelector((state) => state.account);
  // @ts-ignore
  const siteInfo = useSelector((state) => state.siteInfo);
  const quotaPerUnit = Number(siteInfo?.quota_per_unit) || 500000;
  const balanceQuota = account?.user?.quota || 0;
  const [subscription, setSubscription] = useState<any>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [createKeyModal, setCreateKeyModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [purchaseModal, setPurchaseModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState('balance');
  const [newApiKey, setNewApiKey] = useState('');
  
  const selectedPlanDuration = selectedPlan ? resolvePlanDuration(selectedPlan) : null;
  const currentPlan = subscription ? plans.find((plan) => plan.type === subscription.plan_type) : null;
  const currentPlanDuration = currentPlan ? resolvePlanDuration(currentPlan) : null;

  const formatQuotaCount = (value: number) => {
    if (typeof value !== 'number' || Number.isNaN(value)) {
      return '0';
    }
    return Math.max(value, 0).toLocaleString();
  };

  const getPlanQuotaValue = (plan: any) => {
    if (!plan) return 0;
    const quota = plan.total_quota ?? plan.max_requests_per_month ?? 0;
    if (typeof quota !== 'number' || Number.isNaN(quota)) {
      return 0;
    }
    return Math.max(quota, 0);
  };

  const calculateBalanceCost = (plan: any) => {
    if (!plan) return 0;
    return Math.max(0, Math.round((plan.price || 0) * quotaPerUnit));
  };

  const balanceCost = calculateBalanceCost(selectedPlan);
  const hasEnoughBalance = paymentMethod !== 'balance' || balanceQuota >= balanceCost;

  // Fetch data
  const fetchSubscription = async () => {
    try {
      const res = await API.get('/api/user/claude-code/subscription');
      if (res.data.success) {
        setSubscription(res.data.data);
      } else {
        setSubscription(null);
      }
    } catch (error) {
      console.error('获取订阅信息失败:', error);
      setSubscription(null);
    }
  };

  const fetchPlans = async () => {
    try {
      const res = await API.get('/api/user/claude-code/plans');
      if (res.data.success) {
        setPlans(res.data.data || []);
      } else {
        setPlans([]);
      }
    } catch (error) {
      showError('获取套餐信息失败');
      setPlans([]);
    }
  };

  const fetchApiKeys = async () => {
    try {
      const res = await API.get('/api/user/claude-code/api-keys');
      if (res.data.success) {
        setApiKeys(res.data.data || []);
      } else {
        setApiKeys([]);
      }
    } catch (error) {
      console.error('获取API Keys失败:', error);
      setApiKeys([]);
    }
  };

  useEffect(() => {
    fetchSubscription();
    fetchPlans();
    fetchApiKeys();
  }, []);

  // Actions
  const purchaseSubscription = async () => {
    if (!selectedPlan) return;
    if (paymentMethod === 'balance' && balanceCost > balanceQuota) {
      showError('余额不足，请先充值');
      return;
    }

    setLoading(true);
    try {
      const res = await API.post('/api/user/claude-code/purchase', {
        plan_type: selectedPlan.type,
        payment_method: paymentMethod
      });

      if (res.data.success) {
        if (paymentMethod === 'balance') {
          showSuccess(res.data.message || '订阅已激活');
          setPurchaseModal(false);
          fetchSubscription();
          return;
        }
        showSuccess('订单创建成功！正在跳转到支付页面...');
        if (res.data.payment_url) {
          window.open(res.data.payment_url, '_blank');
        }
        setPurchaseModal(false);
        setTimeout(() => {
          fetchSubscription();
        }, 3000);
      } else {
        showError(res.data.message);
      }
    } catch (error) {
      showError('购买失败');
    } finally {
      setLoading(false);
    }
  };

  const createApiKey = async () => {
    if (!newKeyName.trim()) {
      showError('请输入API Key名称');
      return;
    }

    setLoading(true);
    try {
      const res = await API.post('/api/user/claude-code/api-keys', {
        name: newKeyName
      });

      if (res.data.success) {
        showSuccess('API Key创建成功！');
        setNewApiKey(res.data.data.key);
        setNewKeyName('');
        fetchApiKeys();
      } else {
        showError(res.data.message);
      }
    } catch (error) {
      showError('创建失败');
    } finally {
      setLoading(false);
    }
  };

  const deleteApiKey = async (keyId: number) => {
    if (!window.confirm('确定要删除这个API Key吗？删除后将无法恢复！')) {
      return;
    }

    try {
      const res = await API.delete(`/api/user/claude-code/api-keys/${keyId}`);
      if (res.data.success) {
        showSuccess('删除成功');
        fetchApiKeys();
      } else {
        showError(res.data.message);
      }
    } catch (error) {
      showError('删除失败');
    }
  };

  const cancelSubscription = async () => {
    if (!window.confirm('确定要取消订阅吗？订阅将在到期时失效。')) {
      return;
    }

    try {
      const res = await API.post('/api/user/claude-code/cancel');
      if (res.data.success) {
        showSuccess('订阅已取消');
        fetchSubscription();
      } else {
        showError(res.data.message);
      }
    } catch (error) {
      showError('取消失败');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      showSuccess('已复制到剪贴板');
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'expired': return 'error';
      case 'cancelled': return 'warning';
      case 'pending': return 'processing';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return t('claudeCode.subscription.status.active') || 'Active';
      case 'expired': return t('claudeCode.subscription.status.expired') || 'Expired';
      case 'cancelled': return t('claudeCode.subscription.status.cancelled') || 'Cancelled';
      case 'pending': return t('claudeCode.subscription.status.pending') || 'Pending';
      default: return t('claudeCode.subscription.status.unknown') || 'Unknown';
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('zh-CN', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit'
    });
  };

  // Calculations
  const totalQuota = subscription ? subscription.total_quota ?? subscription.max_requests_per_month ?? 0 : 0;
  const fallbackUsedQuota =
    subscription && typeof subscription?.total_quota === 'number' && typeof subscription?.remain_quota === 'number'
      ? subscription.total_quota - subscription.remain_quota
      : subscription?.used_requests_this_month ?? 0;
  const usedQuota = subscription ? subscription.used_quota ?? fallbackUsedQuota : fallbackUsedQuota;
  const normalizedTotalQuota =
    typeof totalQuota === 'number' && totalQuota > 0
      ? totalQuota
      : currentPlan
        ? getPlanQuotaValue(currentPlan)
        : 0;
  const normalizedUsedQuota =
    typeof usedQuota === 'number' && usedQuota > 0
      ? Math.min(usedQuota, normalizedTotalQuota || usedQuota)
      : 0;
  const usagePercentage = normalizedTotalQuota > 0 ? (normalizedUsedQuota / normalizedTotalQuota) * 100 : 0;
  const isUnlimitedSubscription = Boolean(subscription?.is_unlimited_time ?? currentPlan?.is_unlimited_time);
  
  const subscriptionQuotaDescription = (() => {
    if (!subscription && !currentPlan) {
      return '';
    }
    const quotaCountDisplay = formatQuotaCount(normalizedTotalQuota);
    if (isUnlimitedSubscription) {
      return (t('claudeCode.subscription.quotaDisplay.unlimited', { count: quotaCountDisplay } as any) as any) || `Unlimited (${quotaCountDisplay})`;
    }
    if (currentPlan) {
      const durationText = getQuotaDurationText(currentPlan) || currentPlanDuration?.text || durationDisplayMap.month.label;
      return (t('claudeCode.subscription.quotaDisplay.perDuration', {
        duration: durationText,
        count: quotaCountDisplay
      } as any) as any) || `${durationText}: ${quotaCountDisplay}`;
    }
    return (t('claudeCode.subscription.quotaDisplay.total', { count: quotaCountDisplay } as any) as any) || `Total: ${quotaCountDisplay}`;
  })();

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <Title level={2} style={{ margin: 0 }}>{t('claudeCode.subscription.title') || 'Subscription'}</Title>
        <Space>
          <Button 
            icon={<ReloadOutlined />} 
            onClick={() => { fetchSubscription(); fetchApiKeys(); }}
          >
            {t('common.refresh')}
          </Button>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={() => { setNewKeyName(''); setNewApiKey(''); setCreateKeyModal(true); }}
            disabled={!subscription || subscription.status !== 'active'}
          >
            {t('claudeCode.subscription.createApiKey') || 'Create API Key'}
          </Button>
        </Space>
      </div>

      {/* Current Subscription */}
      {subscription ? (
        <Card style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
            <Title level={4} style={{ margin: 0 }}>{t('claudeCode.subscription.currentSubscription') || 'Current Subscription'}</Title>
            <Tag color={getStatusColor(subscription.status)} style={{ fontSize: 14, padding: '4px 12px' }}>
                {getStatusText(subscription.status)}
            </Tag>
          </div>

          <Row gutter={[32, 32]}>
            <Col xs={24} md={12}>
              <Space direction="vertical" size={16} style={{ width: '100%' }}>
                <div>
                  <Text type="secondary">{t('claudeCode.subscription.planType') || 'Plan Type'}</Text>
                  <Title level={5} style={{ margin: 0 }}>{subscription.plan_type}</Title>
                </div>
                <div>
                  <Text type="secondary">{t('claudeCode.subscription.subscriptionPeriod') || 'Period'}</Text>
                  <Text strong style={{ display: 'block' }}>
                    {subscription.end_time > subscription.start_time + 50 * 365 * 24 * 60 * 60 ? (
                      <>{formatDate(subscription.start_time)} - <Tag color="success">Unlimited</Tag></>
                    ) : (
                      `${formatDate(subscription.start_time)} - ${formatDate(subscription.end_time)}`
                    )}
                  </Text>
                </div>
                <div>
                  <Text type="secondary">{t('claudeCode.subscription.price') || 'Price'}</Text>
                  <Title level={5} style={{ margin: 0, color: '#1677ff' }}>
                    ${subscription.price} {subscription.currency}/Month
                  </Title>
                </div>
              </Space>
            </Col>

            <Col xs={24} md={12}>
              <Space direction="vertical" size={16} style={{ width: '100%' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Text>{subscriptionQuotaDescription}</Text>
                    <Text type="secondary">{usagePercentage.toFixed(1)}%</Text>
                  </div>
                  <Progress percent={Math.min(usagePercentage, 100)} status={usagePercentage > 100 ? 'exception' : 'active'} showInfo={false} />
                </div>

                {subscription.status === 'active' && (
                  <Button danger icon={<CloseCircleOutlined />} onClick={cancelSubscription}>
                    {t('claudeCode.subscription.cancelSubscription') || 'Cancel Subscription'}
                  </Button>
                )}
              </Space>
            </Col>
          </Row>
        </Card>
      ) : (
        <Alert 
            message={t('claudeCode.subscription.noActiveSubscription') || 'No active subscription'} 
            type="info" 
            showIcon 
            style={{ marginBottom: 32 }} 
        />
      )}

      {/* Available Plans */}
      <Title level={3} style={{ marginBottom: 16 }}>{t('claudeCode.subscription.selectPlan') || 'Select Plan'}</Title>
      <Alert 
        message="管理员统一配置以下套餐，可直接使用账户余额或在线支付购买。" 
        type="info" 
        showIcon 
        style={{ marginBottom: 24 }} 
      />

      <Row gutter={[24, 24]}>
        {(plans || [])
          .filter((plan) => plan.show_in_portal !== false)
          .map((plan) => {
            const durationInfo = resolvePlanDuration(plan);
            const planQuotaDescription = plan.is_unlimited_time
                ? ((t('claudeCode.subscription.quotaDisplay.unlimited', { count: formatQuotaCount(getPlanQuotaValue(plan)) } as any) as any) || `Unlimited (${formatQuotaCount(getPlanQuotaValue(plan))})`)
                : ((t('claudeCode.subscription.quotaDisplay.perDuration', {
                    duration: getQuotaDurationText(plan) || durationInfo.text,
                    count: formatQuotaCount(getPlanQuotaValue(plan))
                } as any) as any) || `${getQuotaDurationText(plan) || durationInfo.text}: ${formatQuotaCount(getPlanQuotaValue(plan))}`);
            
            return (
                <Col xs={24} sm={12} md={8} key={plan.id}>
                    <Card 
                        hoverable
                        style={{ 
                            height: '100%', 
                            display: 'flex', 
                            flexDirection: 'column',
                            borderColor: plan.type === 'pro' ? '#1677ff' : undefined,
                            borderWidth: plan.type === 'pro' ? 2 : 1
                        }}
                        className={plan.type === 'pro' ? 'pro-plan-card' : ''}
                    >
                        {plan.type === 'pro' && (
                            <div style={{ 
                                position: 'absolute', top: -12, right: 24, 
                                background: '#1677ff', color: '#fff', padding: '2px 12px', 
                                borderRadius: 12, fontSize: 12, fontWeight: 'bold' 
                            }}>
                                <StarOutlined /> Recommended
                            </div>
                        )}
                        
                        <div style={{ textAlign: 'center', marginBottom: 24 }}>
                            <Title level={4} style={{ marginBottom: 8 }}>{plan.name}</Title>
                            <div style={{ color: '#1677ff', fontSize: 24, fontWeight: 'bold' }}>
                                ${plan.price} <span style={{ fontSize: 14, color: 'rgba(0,0,0,0.45)', fontWeight: 'normal' }}>/{plan.currency}/{plan.is_unlimited_time ? 'Forever' : durationInfo.short}</span>
                            </div>
                            <Paragraph type="secondary" style={{ marginTop: 16, minHeight: 44 }}>
                                {plan.description}
                            </Paragraph>
                        </div>

                        <Divider />

                        <Space direction="vertical" style={{ flex: 1, width: '100%' }}>
                            <Space><CheckCircleOutlined style={{ color: '#52c41a' }} /> {planQuotaDescription}</Space>
                            <Space><CheckCircleOutlined style={{ color: '#52c41a' }} /> {plan.is_unlimited_time ? <strong>无时间限制</strong> : `${durationInfo.text}订阅`}</Space>
                            {plan.features?.Data && Object.entries(plan.features.Data).map(([key, value]) => 
                                value === true && <Space key={key}><CheckCircleOutlined style={{ color: '#52c41a' }} /> {key}</Space>
                            )}
                        </Space>

                        <div style={{ marginTop: 24 }}>
                            <Button 
                                type={plan.type === 'pro' ? 'primary' : 'default'} 
                                block 
                                size="large"
                                disabled={loading || (subscription?.plan_type === plan.type && subscription?.status === 'active')}
                                onClick={() => { setSelectedPlan(plan); setPurchaseModal(true); }}
                            >
                                {subscription?.plan_type === plan.type && subscription?.status === 'active' 
                                    ? (t('claudeCode.subscription.currentPlan') || 'Current Plan') 
                                    : (t('claudeCode.subscription.selectThisPlan') || 'Select Plan')}
                            </Button>
                        </div>
                    </Card>
                </Col>
            );
        })}
      </Row>

      {/* Create Key Modal */}
      <Modal
        title={t('claudeCode.subscription.createApiKey') || 'Create API Key'}
        open={createKeyModal}
        onCancel={() => setCreateKeyModal(false)}
        footer={null}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="large">
            {!newApiKey && (
                <>
                    <Input 
                        placeholder={t('claudeCode.subscription.apiKeyPlaceholder') || 'Enter key name'} 
                        value={newKeyName}
                        onChange={(e) => setNewKeyName(e.target.value)}
                    />
                    <Button type="primary" block onClick={createApiKey} loading={loading}>
                        {t('common.create')}
                    </Button>
                </>
            )}

            {newApiKey && (
                <Alert
                    message={t('claudeCode.subscription.apiKeyCreatedSuccess') || 'API Key Created Successfully'}
                    description={
                        <div style={{ marginTop: 8 }}>
                            <div 
                                style={{ background: '#f5f5f5', padding: 8, borderRadius: 4, cursor: 'pointer', fontFamily: 'monospace' }}
                                onClick={() => copyToClipboard(newApiKey)}
                            >
                                {newApiKey}
                            </div>
                            <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 4 }}>
                                {t('claudeCode.subscription.clickToCopy') || 'Click to copy'}
                            </Text>
                        </div>
                    }
                    type="success"
                    showIcon
                />
            )}

            <Divider />
            
            <Title level={5}>{t('claudeCode.subscription.apiKeysManagement') || 'API Keys'}</Title>
            <List
                dataSource={apiKeys}
                renderItem={(key: any) => (
                    <List.Item
                        actions={[
                            <Button key="delete" type="text" danger icon={<DeleteOutlined />} onClick={() => deleteApiKey(key.id)} />
                        ]}
                    >
                        <List.Item.Meta
                            title={key.name}
                            description={
                                <Space>
                                    <Tag color={key.status === 1 ? 'success' : 'default'}>
                                        {key.status === 1 ? 'Active' : 'Disabled'}
                                    </Tag>
                                    <Text type="secondary" style={{ fontSize: 12 }}>
                                        Last used: {key.last_used_time ? formatDate(key.last_used_time) : 'Never'}
                                    </Text>
                                </Space>
                            }
                        />
                    </List.Item>
                )}
                locale={{ emptyText: t('claudeCode.subscription.noApiKeys') || 'No API Keys' }}
            />
            
            {newApiKey && (
                <Button block onClick={() => { setCreateKeyModal(false); setNewApiKey(''); setNewKeyName(''); }}>
                    {t('common.close')}
                </Button>
            )}
        </Space>
      </Modal>

      {/* Purchase Modal */}
      <Modal
        title={t('claudeCode.subscription.confirmPurchase') || 'Confirm Purchase'}
        open={purchaseModal}
        onCancel={() => setPurchaseModal(false)}
        onOk={purchaseSubscription}
        confirmLoading={loading}
        okButtonProps={{ disabled: !hasEnoughBalance && paymentMethod === 'balance' }}
      >
        {selectedPlan && (
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <div>
                    <Title level={4}>{selectedPlan.name}</Title>
                    <Text type="secondary">${selectedPlan.price} {selectedPlan.currency}/{selectedPlan.is_unlimited_time ? 'Forever' : selectedPlanDuration?.short}</Text>
                </div>
                <Paragraph>{selectedPlan.description}</Paragraph>
                
                <div>
                    <div style={{ marginBottom: 8 }}>{t('claudeCode.subscription.paymentMethod') || 'Payment Method'}</div>
                    <Select 
                        value={paymentMethod} 
                        onChange={setPaymentMethod} 
                        style={{ width: '100%' }}
                    >
                        <Option value="balance">{t('claudeCode.subscription.paymentMethods.balance') || 'Balance'}</Option>
                        {/* <Option value="stripe">Stripe</Option>
                        <Option value="alipay">Alipay</Option>
                        <Option value="wxpay">WeChat Pay</Option> */}
                    </Select>
                </div>

                {paymentMethod === 'balance' && (
                    <Alert
                        message={hasEnoughBalance ? 'Balance Sufficient' : 'Balance Insufficient'}
                        description={hasEnoughBalance
                            ? `Will deduct ${renderQuota(balanceCost, 6)} (approx $${selectedPlan.price}), current balance ${renderQuota(balanceQuota, 6)}`
                            : `Need ${renderQuota(balanceCost, 6)}, current balance ${renderQuota(balanceQuota, 6)}`
                        }
                        type={hasEnoughBalance ? 'info' : 'warning'}
                        showIcon
                    />
                )}
            </Space>
        )}
      </Modal>
    </div>
  );
}
