'use client';

import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, message } from 'antd';
import { useTranslation } from 'react-i18next';
import { API } from '@/utils/api';
import { showError, showSuccess } from '@/utils/common';

interface EditModalProps {
  open: boolean;
  actionId: number;
  onCancel: () => void;
  onOk: (status: boolean) => void;
}

export default function EditModal({ open, actionId, onCancel, onOk }: EditModalProps) {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    try {
      const res = await API.get(`/api/option/telegram/${actionId}`);
      const { success, message, data } = res.data;
      if (success) {
        form.setFieldsValue(data);
      } else {
        showError(message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (open) {
      if (actionId) {
        loadData();
      } else {
        form.resetFields();
        form.setFieldsValue({
            parse_mode: 'MarkdownV2'
        });
      }
    }
  }, [open, actionId]);

  const onFinish = async (values: any) => {
    setLoading(true);
    
    try {
      let res;
      if (actionId) {
        res = await API.post('/api/option/telegram/', { ...values, id: actionId });
      } else {
        res = await API.post('/api/option/telegram/', values);
      }
      
      const { success, message: msg } = res.data;
      if (success) {
        if (actionId) {
            showSuccess(t('telegram_edit.updateOk') || 'Update Success');
        } else {
            showSuccess(t('telegram_edit.addOk') || 'Add Success');
        }
        onOk(true);
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
      title={actionId ? t('common.edit') : t('common.create')}
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={loading}
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
            name="command"
            label={t('telegramPage.command') || 'Command'}
            rules={[{ required: true, message: t('telegram_edit.requiredCommand') || 'Required' }]}
        >
            <Input />
        </Form.Item>

        <Form.Item
            name="description"
            label={t('telegramPage.description') || 'Description'}
            rules={[{ required: true, message: t('telegram_edit.requiredDes') || 'Required' }]}
        >
            <Input />
        </Form.Item>

        <Form.Item
            name="parse_mode"
            label={t('telegram_edit.msgType') || 'Parse Mode'}
            rules={[{ required: true, message: t('telegram_edit.requiredParseMode') || 'Required' }]}
        >
            <Select>
                <Select.Option value="MarkdownV2">MarkdownV2</Select.Option>
                <Select.Option value="Markdown">Markdown</Select.Option>
                <Select.Option value="html">html</Select.Option>
            </Select>
        </Form.Item>

        <Form.Item
            name="reply_message"
            label={t('telegram_edit.msgInfo') || 'Reply Message'}
            rules={[{ required: true, message: t('telegram_edit.requiredMes') || 'Required' }]}
        >
            <Input.TextArea rows={5} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
