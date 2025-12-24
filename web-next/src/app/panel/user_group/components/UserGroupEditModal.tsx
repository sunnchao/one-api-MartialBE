'use client';

import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Switch, message } from 'antd';
import { useTranslation } from 'react-i18next';
import { API } from '@/utils/api';
import { showError, showSuccess } from '@/utils/common';

export default function UserGroupEditModal({ open, onCancel, onSuccess, userGroupId }: any) {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
        form.resetFields();
        if (userGroupId) {
            fetchUserGroup(userGroupId);
        } else {
            form.setFieldsValue({
                ratio: 1,
                api_rate: 300,
                public: false,
                promotion: false,
                min: 0,
                max: 0
            });
        }
    }
  }, [open, userGroupId]);

  const fetchUserGroup = async (id: number) => {
      setLoading(true);
      try {
          const res = await API.get(`/api/user_group/${id}`);
          const { success, data } = res.data;
          if (success) {
              form.setFieldsValue(data);
          }
      } catch (error) {
          console.error(error);
      } finally {
          setLoading(false);
      }
  };

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      let res;
      if (userGroupId) {
        res = await API.put('/api/user_group/', { ...values, id: userGroupId });
      } else {
        res = await API.post('/api/user_group/', values);
      }
      
      const { success, message: msg } = res.data;
      if (success) {
        showSuccess(t('userPage.saveSuccess'));
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

  return (
    <Modal
      title={userGroupId ? t('common.edit') : t('common.create')}
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={loading}
      okButtonProps={{
        size: 'middle'
      }}
      cancelButtonProps={{
        size: 'middle'
      }}
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          name="symbol"
          label={t('userGroup.symbol')}
          rules={[{ required: true, message: 'symbol is required' }]}
          help={t('userGroup.symbolTip')}
        >
          <Input disabled={!!userGroupId} size='middle'/>
        </Form.Item>
        
        <Form.Item
          name="name"
          label={t('userGroup.name')}
          rules={[{ required: true, message: 'name is required' }]}
          help={t('userGroup.nameTip')}
        >
          <Input  size='middle'/>
        </Form.Item>

        <Form.Item
          name="ratio"
          label={t('userGroup.ratio')}
          rules={[{ required: true, message: 'ratio is required' }]}
        >
          <InputNumber style={{ width: '100%' }} step={0.1}  size='middle'/>
        </Form.Item>

        <Form.Item
          name="api_rate"
          label={t('userGroup.apiRate')}
          help={t('userGroup.apiRateTip')}
        >
          <InputNumber style={{ width: '100%' }}  size='middle'/>
        </Form.Item>

        <Form.Item
          name="promotion"
          label={t('userGroup.promotion')}
          help={t('userGroup.promotionTip')}
          valuePropName="checked"
        >
          <Switch size="default" />
        </Form.Item>

        <Form.Item
          name="min"
          label={t('userGroup.min')}
          help={t('userGroup.minTip')}
        >
          <InputNumber style={{ width: '100%' }}  size='middle'/>
        </Form.Item>

        <Form.Item
          name="max"
          label={t('userGroup.max')}
          help={t('userGroup.maxTip')}
        >
          <InputNumber style={{ width: '100%' }}  size='middle'/>
        </Form.Item>

        <Form.Item
          name="public"
          label={t('userGroup.public')}
          valuePropName="checked"
        >
          <Switch size="default" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
