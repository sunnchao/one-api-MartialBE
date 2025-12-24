'use client';

import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, message } from 'antd';
import { useTranslation } from 'react-i18next';
import { API } from '@/utils/api';
import { showError, showSuccess } from '@/utils/common';

const { Option } = Select;

export default function UserEditModal({ open, onCancel, onSuccess, userId }: any) {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [groupOptions, setGroupOptions] = useState([]);

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    if (open) {
        form.resetFields();
        if (userId) {
            fetchUser(userId);
        }
    }
  }, [open, userId]);

  const fetchGroups = async () => {
    try {
      const res = await API.get('/api/group/');
      const { success, data } = res.data;
      if (success) {
        setGroupOptions(data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchUser = async (id: number) => {
      setLoading(true);
      try {
          const res = await API.get(`/api/user/${id}`);
          const { success, data } = res.data;
          if (success) {
              form.setFieldsValue({
                  ...data,
                  password: '' // Clear password field
              });
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
      if (userId) {
        res = await API.put('/api/user/', { ...values, id: userId });
      } else {
        res = await API.post('/api/user/', values);
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
      title={userId ? t('userPage.editUser') : t('userPage.createUser')}
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={loading}
    >
      <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ group: 'default' }}>
        <Form.Item
          name="username"
          label={t('userPage.username')}
          rules={[{ required: true, message: t('userPage.usernameRequired') }]}
        >
          <Input size='middle'/>
        </Form.Item>
        
        <Form.Item
          name="display_name"
          label={t('userPage.displayName')}
        >
          <Input size='middle'/>
        </Form.Item>

        <Form.Item
          name="password"
          label={t('userPage.password')}
          rules={[{ required: !userId, message: t('userPage.passwordRequired') }]}
        >
          <Input.Password placeholder={userId ? 'Leave blank to keep unchanged' : ''} size='middle'/>
        </Form.Item>

        <Form.Item
          name="group"
          label={t('userPage.group')}
          rules={[{ required: true, message: t('userPage.groupRequired') }]}
        >
          <Select size='middle'>
            {groupOptions.map((group: any) => (
                <Option key={group} value={group}>{group}</Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
}
