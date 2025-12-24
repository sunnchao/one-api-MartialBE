'use client';

import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, InputNumber, message } from 'antd';
import { useTranslation } from 'react-i18next';
import { API } from '@/utils/api';
import { showError, showSuccess, renderQuotaWithPrompt, downloadTextAsFile } from '@/utils/common';

export default function RedemptionEditModal({ open, onCancel, onSuccess, redemptionId }: any) {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
        form.resetFields();
        if (redemptionId) {
            fetchRedemption(redemptionId);
        } else {
            form.setFieldsValue({
                quota: 100000,
                count: 1
            });
        }
    }
  }, [open, redemptionId]);

  const fetchRedemption = async (id: number) => {
      setLoading(true);
      try {
          const res = await API.get(`/api/redemption/${id}`);
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
      if (redemptionId) {
        res = await API.put('/api/redemption/', { ...values, id: redemptionId });
      } else {
        res = await API.post('/api/redemption/', values);
      }
      
      const { success, message: msg, data } = res.data;
      if (success) {
        if (redemptionId) {
            showSuccess(t('redemption_edit.editOk'));
        } else {
            showSuccess(t('redemption_edit.addOk'));
            if (data.length > 1) {
                let text = '';
                for (let i = 0; i < data.length; i++) {
                    text += data[i] + '\n';
                }
                downloadTextAsFile(text, `${values.name}.txt`);
            }
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

  return (
    <Modal
      title={redemptionId ? t('common.edit') : t('common.create')}
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={loading}
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          name="name"
          label={t('redemptionPage.headLabels.name')}
          rules={[{ required: true, message: t('validation.requiredName') }]}
        >
          <Input size={"middle"}/>
        </Form.Item>
        
        <Form.Item
          name="quota"
          label={t('redemptionPage.headLabels.quota')}
          rules={[{ required: true, message: t('redemption_edit.requiredQuota') }]}
          extra={
              <Form.Item shouldUpdate={(prev, curr) => prev.quota !== curr.quota} noStyle>
                  {({ getFieldValue }) => renderQuotaWithPrompt(getFieldValue('quota') || 0, 4)}
              </Form.Item>
          }
        >
          <InputNumber style={{ width: '100%' }} min={0} size={"middle"}/>
        </Form.Item>

        {!redemptionId && (
            <Form.Item
            name="count"
            label={t('redemption_edit.number')}
            rules={[{ required: true, message: t('redemption_edit.requiredCount') }]}
            >
            <InputNumber style={{ width: '100%' }} min={1} size={"middle"} />
            </Form.Item>
        )}
      </Form>
    </Modal>
  );
}
