'use client';

import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { Alert, Badge, Button, Card, Col, Divider, Input, InputNumber, Radio, Row, Space, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { API } from '@/utils/api';
import { showError, showSuccess, showInfo, renderQuota } from '@/utils/common';
import { useSelector } from 'react-redux';
import { BankOutlined, GiftOutlined } from '@ant-design/icons';
import InviteCard from '@/app/panel/dashboard/component/InviteCard';
import PayModal from './components/PayModal';

const { Title, Text } = Typography;

type PaymentGateway = {
  uuid: string;
  name: string;
  icon?: string;
  sort?: number;
  currency?: string;
  percent_fee?: number;
  fixed_fee?: number;
};

export default function TopupPage() {
  const { t } = useTranslation();
  const [userQuota, setUserQuota] = useState(0);
  const [redemptionCode, setRedemptionCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const siteInfo = useSelector((state: any) => state.siteInfo);

  useEffect(() => {
    getUserQuota();
  }, []);

  const getUserQuota = useCallback(async () => {
    try {
      const res = await API.get('/api/user/self');
      const { success, message: msg, data } = res.data;
      if (success) {
        setUserQuota(data.quota);
      } else {
        showError(msg);
      }
    } catch (error) {
      console.error(error);
    }
  }, []);

  const RechargeDiscount = useMemo(() => {
    if (!siteInfo?.RechargeDiscount) return {};
    try {
      return JSON.parse(siteInfo.RechargeDiscount);
    } catch {
      return {};
    }
  }, [siteInfo?.RechargeDiscount]);

  const [payment, setPayment] = useState<PaymentGateway[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<PaymentGateway | null>(null);
  const [amount, setAmount] = useState<number>(0);
  const [discountTotal, setDiscountTotal] = useState<number>(0);
  const [openPay, setOpenPay] = useState(false);
  const [disabledPay, setDisabledPay] = useState(false);

  const paymentButtonStyle: React.CSSProperties = {
    height: 40,
    paddingInline: 16,
    borderRadius: 20,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
  };

  const amountButtonStyle: React.CSSProperties = {
    height: 40,
    minWidth: 84,
    borderRadius: 20,
    paddingInline: 16,
  };

  const fetchPayment = useCallback(async () => {
    try {
      const res = await API.get('/api/user/payment');
      const { success, data } = res.data;
      if (success && Array.isArray(data)) {
        const sorted = [...data].sort((a, b) => (b?.sort || 0) - (a?.sort || 0));
        setPayment(sorted);
        setSelectedPayment(sorted[0] || null);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetchPayment();
  }, [fetchPayment]);

  const calculateFee = useCallback(() => {
    if (!selectedPayment) return 0;
    if ((selectedPayment.fixed_fee || 0) > 0) return Number(selectedPayment.fixed_fee);
    const discount = (RechargeDiscount as any)[amount] || 1;
    const discountedAmount = amount * discount;
    return Number(((selectedPayment.percent_fee || 0) * discountedAmount).toFixed(2));
  }, [RechargeDiscount, amount, selectedPayment]);

  const calculateTotal = useCallback(() => {
    if (amount === 0) return 0;
    const discount = (RechargeDiscount as any)[amount] || 1;
    const discountedAmount = amount * discount;
    let total = Number(discountedAmount) + Number(calculateFee());
    if (selectedPayment?.currency === 'CNY') {
      total = Number((total * Number(siteInfo?.PaymentUSDRate || 1)).toFixed(2));
    }
    return total;
  }, [RechargeDiscount, amount, calculateFee, selectedPayment?.currency, siteInfo?.PaymentUSDRate]);

  const handleDiscountTotal = useCallback(
    (value: number) => {
      if (!value) {
        setDiscountTotal(0);
        return;
      }
      const discount = (RechargeDiscount as any)[value] || 1;
      setDiscountTotal(value * discount);
    },
    [RechargeDiscount],
  );

  useEffect(() => {
    handleDiscountTotal(amount);
  }, [amount, handleDiscountTotal]);

  const topUp = async () => {
    if (redemptionCode === '') {
      showInfo(t('topupCard.inputPlaceholder'));
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await API.post('/api/user/topup', {
        key: redemptionCode.trim()
      });
      const { success, message: msg, data } = res.data;
      if (success) {
        showSuccess('充值成功！');
        setUserQuota((quota) => quota + data);
        setRedemptionCode('');
      } else {
        showError(msg);
      }
    } catch (err) {
      showError('请求失败');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openTopUpLink = () => {
    if (!siteInfo.top_up_link) {
      showError(t('topupCard.adminSetupRequired'));
      return;
    }
    window.open(siteInfo.top_up_link, '_blank');
  };

  const handlePay = () => {
    if (!selectedPayment) {
      showError(t('topupCard.selectPaymentMethod'));
      return;
    }
    const minAmount = Number(siteInfo?.PaymentMinAmount || 0);
    if (amount <= 0 || (minAmount > 0 && amount < minAmount)) {
      showError(`${t('topupCard.amountMinLimit')} ${minAmount}`);
      return;
    }
    if (amount > 1000000) {
      showError(t('topupCard.amountMaxLimit'));
      return;
    }
    if (!Number.isInteger(amount) || amount <= 0) {
      showError(t('topupCard.positiveIntegerAmount'));
      return;
    }
    setDisabledPay(true);
    setOpenPay(true);
  };

  const closePay = () => {
    setOpenPay(false);
    setDisabledPay(false);
  };

  return (
    <Row gutter={[16, 16]}>
      <Col span={24}>
        <Alert type="warning" message={t('topupPage.alertMessage')} showIcon />
      </Col>

      <Col xs={24} md={14} lg={16}>
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <Card>
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <Space size="middle" align="center" wrap>
                <BankOutlined style={{ fontSize: 32, color: '#1677ff' }} />
                <Title level={2} style={{ margin: 0 }}>
                  {t('topupCard.currentQuota')}
                </Title>
                <Title level={2} style={{ margin: 0, color: '#1677ff' }}>
                  {renderQuota(userQuota)}
                </Title>
              </Space>
            </div>
          </Card>

          <Card title={t('topupCard.onlineTopup')}  size={"default"}>
            <Text type="danger">{t('topupCard.invoiceAndRefundWarning')}</Text>
            <Divider style={{ margin: '12px 0' }} />

            {payment.length > 0 ? (
              <Space direction="vertical" style={{ width: '100%' }} size={12}>
                <Radio.Group
                  value={selectedPayment?.uuid}
                  onChange={(e) => setSelectedPayment(payment.find((p) => p.uuid === e.target.value) || null)}
                >
                  <Space wrap size={[8, 8]}>
                    {payment.map((item) => (
                      <Radio.Button key={item.uuid} value={item.uuid} style={paymentButtonStyle}>
                        {item.icon ? <img src={item.icon} alt={item.name} width={18} height={18} /> : null}
                        <span style={{ lineHeight: 1 }}>{item.name}</span>
                      </Radio.Button>
                    ))}
                  </Space>
                </Radio.Group>

                {Object.keys(RechargeDiscount).length > 0 && (
                  <Space wrap size={[4, 4]}>
                    {Object.entries(RechargeDiscount).map(([key, value]) => (
                      <Badge
                        key={key}
                        count={value !== 1 ? `${Number(value) * 10}折` : 0}
                        color="red"
                        offset={[-4, 4]}
                        styles={{ indicator: { boxShadow: 'none', fontSize: 12, paddingInline: 4 } }}
                        size={'default'}
                      >
                        <Button
                          onClick={() => setAmount(Number(key))}
                          type={amount === Number(key) ? 'primary' : 'default'}
                          style={amountButtonStyle}
                          size={'small'}
                        >
                          ${key}
                        </Button>
                      </Badge>
                    ))}
                  </Space>
                )}

                <InputNumber
                  value={amount}
                  min={0}
                  step={1}
                  precision={0}
                  style={{ width: '100%' }}
                  placeholder={t('topupCard.amount')}
                  onChange={(v) => setAmount(Number(v || 0))}
                  size={'middle'}
                />

                <Divider style={{ margin: '12px 0' }} />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 8, alignItems: 'center' }}>
                  <Text type="secondary" style={{ textAlign: 'right' }}>
                    {t('topupCard.topupAmount')}:
                  </Text>
                  <Text>${Number(amount)}</Text>

                  {discountTotal !== amount && amount > 0 && (
                    <>
                      <Text type="secondary" style={{ textAlign: 'right' }}>
                        {t('topupCard.discountedPrice')}:
                      </Text>
                      <Text>${Number(discountTotal || 0)}</Text>
                    </>
                  )}

                  {selectedPayment && ((selectedPayment.percent_fee || 0) > 0 || (selectedPayment.fixed_fee || 0) > 0) && (
                    <>
                      <Text type="secondary" style={{ textAlign: 'right' }}>
                        {t('topupCard.fee')}:{' '}
                        {(selectedPayment.fixed_fee || 0) > 0
                          ? '(固定)'
                          : (selectedPayment.percent_fee || 0) > 0
                            ? `(${Number(selectedPayment.percent_fee) * 100}%)`
                            : ''}
                      </Text>
                      <Text>${calculateFee()}</Text>
                    </>
                  )}

                  <Text type="secondary" style={{ textAlign: 'right' }}>
                    {t('topupCard.actualAmountToPay')}:
                  </Text>
                  <Text>
                    {calculateTotal()}{' '}
                    {selectedPayment?.currency === 'CNY'
                      ? `CNY (${t('topupCard.exchangeRate')}: ${siteInfo?.PaymentUSDRate || 1})`
                      : selectedPayment?.currency || 'USD'}
                  </Text>
                </div>

                <Divider style={{ margin: '12px 0' }} />

                <Button type="primary" onClick={handlePay} disabled={disabledPay} block size={'large'}>
                  {t('topupCard.topup')}
                </Button>

                <PayModal
                  open={openPay}
                  onClose={closePay}
                  amount={amount}
                  uuid={selectedPayment?.uuid}
                  onPaid={() => {
                    getUserQuota();
                  }}
                />
              </Space>
            ) : (
              <Space direction="vertical" style={{ width: '100%' }}>
                <Text type="secondary">暂无可用的在线支付方式。</Text>
                {siteInfo?.top_up_link && (
                  <Button type="primary" icon={<GiftOutlined />} onClick={openTopUpLink}>
                    {t('topupCard.getRedemptionCode')}
                  </Button>
                )}
              </Space>
            )}
          </Card>

          <Card title={t('topupCard.redemptionCodeTopup')} size={"default"}>
            <Space.Compact style={{ width: '100%' }}>
              <Input
                size={'middle'}
                placeholder={t('topupCard.inputPlaceholder')}
                value={redemptionCode}
                onChange={(e) => setRedemptionCode(e.target.value)}
              />
              <Button type="primary" size={'middle'} onClick={topUp} loading={isSubmitting}>
                {t('topupCard.exchangeButton.default')}
              </Button>
            </Space.Compact>

            {siteInfo.top_up_link && (
              <div style={{ textAlign: 'center', marginTop: 24 }}>
                <Text type="secondary" style={{ display: 'block', marginBottom: 16, fontSize: 16 }}>
                  {t('topupCard.noRedemptionCodeText')}
                </Text>
                <Button type="primary" onClick={openTopUpLink} size={'middle'}>
                  {t('topupCard.getRedemptionCode')}
                </Button>
              </div>
            )}
          </Card>
        </Space>
      </Col>

      <Col xs={24} md={10} lg={8}>
        <InviteCard />
      </Col>
    </Row>
  );
}
