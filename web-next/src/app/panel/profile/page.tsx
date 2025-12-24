'use client';

import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, Row, Col, Space, Alert, Tag, Divider, message, Modal } from 'antd';
import { useTranslation } from 'react-i18next';
import { API } from '@/utils/api';
import { showError, showSuccess, copy } from '@/utils/common';
import { useSelector } from 'react-redux';
import { 
    GithubOutlined, 
    WechatOutlined, 
    MailOutlined, 
    LinkOutlined,
    SafetyCertificateOutlined 
} from '@ant-design/icons';
import Turnstile from 'react-turnstile';

export default function ProfilePage() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [inputs, setInputs] = useState<any>({});
  const [form] = Form.useForm();
  const siteInfo = useSelector((state: any) => state.siteInfo);
  const userGroup = useSelector((state: any) => state.account.userGroup);
  
  const [turnstileToken, setTurnstileToken] = useState('');
  const [emailModalOpen, setEmailModalOpen] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const res = await API.get('/api/user/self');
      const { success, message: msg, data } = res.data;
      if (success) {
        setInputs(data);
        form.setFieldsValue(data);
      } else {
        showError(msg);
      }
    } catch (error: any) {
      showError(error.message);
    }
  };

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
        const res = await API.put('/api/user/self', values);
        const { success, message: msg } = res.data;
        if (success) {
            showSuccess(t('profilePage.updateSuccess'));
            loadUser();
        } else {
            showError(msg);
        }
    } catch (error: any) {
        showError(error.message);
    } finally {
        setLoading(false);
    }
  };

  const generateAccessToken = async () => {
      try {
          const res = await API.get('/api/user/token');
          const { success, message: msg, data } = res.data;
          if (success) {
              setInputs({ ...inputs, access_token: data });
              copy(data, t('profilePage.token'));
          } else {
              showError(msg);
          }
      } catch (error: any) {
          showError(error.message);
      }
  };

  const handleBind = (type: string) => {
      // Implement binding logic based on type
      message.info('Binding feature to be implemented');
  };

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
        <Card title={t('profilePage.personalInfo')}>
            <Form form={form} layout="vertical" onFinish={onFinish}>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="username" label={t('profilePage.username')}>
                            <Input disabled />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="display_name" label={t('profilePage.displayName')}>
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="password" label={t('profilePage.password')}>
                            <Input.Password placeholder={t('profilePage.inputPasswordPlaceholder')} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item 
                            name="confirm_password" 
                            label={t('profilePage.confirmPassword')}
                            dependencies={['password']}
                            rules={[
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (!value || getFieldValue('password') === value) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error('Passwords do not match!'));
                                    },
                                }),
                            ]}
                        >
                            <Input.Password placeholder={t('profilePage.inputConfirmPasswordPlaceholder')} />
                        </Form.Item>
                    </Col>
                </Row>
                <Button type="primary" htmlType="submit" loading={loading}>
                    {t('profilePage.submit')}
                </Button>
            </Form>
        </Card>

        <Card title={t('profilePage.accountBinding')}>
            <Space size="large">
                {siteInfo.github_oauth && (
                    <Button icon={<GithubOutlined />} onClick={() => handleBind('github')}>
                        {inputs.github_id || t('profilePage.notBound')}
                    </Button>
                )}
                {siteInfo.wechat_login && (
                    <Button icon={<WechatOutlined />} onClick={() => handleBind('wechat')}>
                        {inputs.wechat_id || t('profilePage.notBound')}
                    </Button>
                )}
                <Button icon={<MailOutlined />} onClick={() => setEmailModalOpen(true)}>
                    {inputs.email || t('profilePage.notBound')}
                </Button>
            </Space>
        </Card>

        <Card title={t('profilePage.other')}>
            <Alert message={t('profilePage.tokenNotice')} type="info" showIcon style={{ marginBottom: 16 }} />
            {inputs.access_token && (
                <Alert 
                    message={
                        <Space>
                            {t('profilePage.yourTokenIs')}
                            <Tag color="error">{inputs.access_token}</Tag>
                        </Space>
                    } 
                    type="error" 
                    style={{ marginBottom: 16 }} 
                />
            )}
            <Button type="primary" onClick={generateAccessToken}>
                {inputs.access_token ? t('profilePage.resetToken') : t('profilePage.generateToken')}
            </Button>
        </Card>
        
        {/* Email Bind Modal placeholder */}
        <Modal 
            title={t('profilePage.bindEmail')} 
            open={emailModalOpen} 
            onCancel={() => setEmailModalOpen(false)}
            footer={null}
        >
            <p>Email binding form goes here (Verification code logic needed)</p>
        </Modal>
    </Space>
  );
}
