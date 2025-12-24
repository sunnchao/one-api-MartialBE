'use client';

import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Select, message } from 'antd';
import { useTranslation } from 'react-i18next';
import { API } from '@/utils/api';
import { showError, showSuccess, trims } from '@/utils/common';
import { PaymentType, CurrencyType, PaymentConfig } from '../type/config';

export default function PaymentGatewayEditModal({ open, onCancel, onSuccess, paymentId }: any) {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [currentType, setCurrentType] = useState('epay');

  const originInputs = {
    type: 'epay',
    uuid: '',
    name: '',
    icon: '',
    notify_domain: '',
    fixed_fee: 0,
    percent_fee: 0,
    currency: 'CNY',
    config: {},
    sort: 0,
    enable: true
  };

  useEffect(() => {
    if (open) {
        form.resetFields();
        if (paymentId) {
            fetchPayment(paymentId);
        } else {
            form.setFieldsValue(originInputs);
            setCurrentType('epay');
        }
    }
  }, [open, paymentId]);

  const fetchPayment = async (id: number) => {
      setLoading(true);
      try {
          const res = await API.get(`/api/payment/${id}`);
          const { success, data } = res.data;
          if (success) {
              // Parse config string to object if needed, though backend usually sends it as string or json
              // In original code: data.config = JSON.parse(data.config);
              // But let's check if it's already an object or string
              if (typeof data.config === 'string') {
                  try {
                      data.config = JSON.parse(data.config);
                  } catch (e) {
                      data.config = {};
                  }
              }
              form.setFieldsValue(data);
              setCurrentType(data.type);
          }
      } catch (error) {
          console.error(error);
      } finally {
          setLoading(false);
      }
  };

  const onFinish = async (values: any) => {
    setLoading(true);
    // Ensure config is stringified
    const configStr = JSON.stringify(values.config || {});
    const submitValues = { ...values, config: configStr };

    try {
      let res;
      if (paymentId) {
        res = await API.put('/api/payment/', { ...submitValues, id: paymentId });
      } else {
        res = await API.post('/api/payment/', submitValues);
      }
      
      const { success, message: msg } = res.data;
      if (success) {
        if (paymentId) {
            showSuccess(t('payment_edit.updateOk'));
        } else {
            showSuccess(t('payment_edit.addOk'));
        }
        onSuccess();
      } else {
        showError(msg);
      }
    } catch (error: any) {
      showError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTypeChange = (value: string) => {
      setCurrentType(value);
      // Clear config when type changes
      form.setFieldValue('config', {});
  };

  return (
    <Modal
      title={paymentId ? t('payment_edit.paymentEdit') : t('paymentGatewayPage.createPayment')}
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={loading}
      width={800}
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          name="type"
          label={t('paymentGatewayPage.tableHeaders.type')}
          help={t('payment_edit.paymentType')}
        >
          <Select onChange={handleTypeChange}>
              {Object.entries(PaymentType).map(([value, text]) => (
                  <Select.Option key={value} value={value}>{text}</Select.Option>
              ))}
          </Select>
        </Form.Item>
        
        <Form.Item
          name="name"
          label={t('paymentGatewayPage.tableHeaders.name')}
          rules={[{ required: true, message: t('validation.requiredName') }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="icon"
          label={t('paymentGatewayPage.tableHeaders.icon')}
          rules={[{ required: true, message: t('payment_edit.requiredIcon') }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="notify_domain"
          label={t('payment_edit.notifyDomain')}
          help={t('payment_edit.notifyDomainTip')}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="fixed_fee"
          label={t('paymentGatewayPage.tableHeaders.fixedFee')}
          help={t('payment_edit.FixedTip')}
        >
          <InputNumber style={{ width: '100%' }} min={0} step={0.01} />
        </Form.Item>

        <Form.Item
          name="percent_fee"
          label={t('paymentGatewayPage.tableHeaders.percentFee')}
          help={t('payment_edit.percentTip')}
        >
          <InputNumber style={{ width: '100%' }} min={0} step={0.01} />
        </Form.Item>

        <Form.Item
          name="currency"
          label={t('payment_edit.currencyType')}
          help={t('payment_edit.currencyTip')}
          rules={[{ required: true, message: t('payment_edit.requiredCurrency') }]}
        >
          <Select>
              {Object.entries(CurrencyType).map(([value, text]) => (
                  <Select.Option key={value} value={value}>{text}</Select.Option>
              ))}
          </Select>
        </Form.Item>

        {/* Dynamic Config Fields */}
        {PaymentConfig[currentType] && Object.entries(PaymentConfig[currentType]).map(([key, configItem]) => (
            <Form.Item
                key={key}
                name={['config', key]}
                label={configItem.name}
                help={configItem.description}
            >
                {configItem.type === 'select' ? (
                    <Select>
                        {configItem.options?.map(opt => (
                            <Select.Option key={opt.value} value={opt.value}>{opt.name}</Select.Option>
                        ))}
                    </Select>
                ) : (
                    <Input />
                )}
            </Form.Item>
        ))}

      </Form>
    </Modal>
  );
}
