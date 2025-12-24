'use client';

import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Avatar, message } from 'antd';
import { useTranslation } from 'react-i18next';
import { API } from '@/utils/api';
import { showError, showSuccess, trims } from '@/utils/common';

interface EditModalProps {
  open: boolean;
  editId: number;
  onCancel: () => void;
  onOk: (status: boolean) => void;
}

export default function EditModal({ open, editId, onCancel, onOk }: EditModalProps) {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [iconUrl, setIconUrl] = useState('');

  const loadModelOwnedBy = async () => {
    try {
      const res = await API.get(`/api/model_ownedby/${editId}`);
      const { success, message, data } = res.data;
      if (success) {
        form.setFieldsValue(data);
        setIconUrl(data.icon);
      } else {
        showError(message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (open) {
      if (editId) {
        loadModelOwnedBy();
      } else {
        form.resetFields();
        setIconUrl('');
      }
    }
  }, [open, editId]);

  const onFinish = async (values: any) => {
    setLoading(true);
    
    try {
      let res;
      if (editId) {
        res = await API.put('/api/model_ownedby/', { ...values, id: editId });
      } else {
        res = await API.post('/api/model_ownedby/', values);
      }
      
      const { success, message: msg } = res.data;
      if (success) {
        showSuccess(t('userPage.saveSuccess'));
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
      title={editId ? t('common.edit') : t('common.create')}
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={loading}
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
            name="id"
            label={t('modelOwnedby.id')}
            rules={[{ required: true, message: 'ID不能为空' }]}
            help={t('modelOwnedby.idTip')}
        >
            <InputNumber style={{ width: '100%' }} disabled={!!editId} />
        </Form.Item>

        <Form.Item
            name="name"
            label={t('modelOwnedby.name')}
            rules={[{ required: true, message: '名称不能为空' }]}
            help={t('modelOwnedby.nameTip')}
        >
            <Input />
        </Form.Item>

        <Form.Item
            name="icon"
            label={t('modelOwnedby.icon')}
        >
            <Input 
                onChange={(e) => setIconUrl(e.target.value)} 
                addonAfter={iconUrl ? <Avatar src={iconUrl} size="small" /> : null}
            />
        </Form.Item>
      </Form>
    </Modal>
  );
}
