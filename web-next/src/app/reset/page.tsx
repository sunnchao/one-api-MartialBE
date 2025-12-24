'use client';

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Form, Input, Button, Card, Typography, message, Alert } from 'antd';
import { MailOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import Logo from '@/ui-component/Logo';
import Turnstile from 'react-turnstile';
import { API } from '@/utils/api';

const { Title, Text } = Typography;

export default function ForgetPasswordPage() {
  const { t } = useTranslation();
  const siteInfo = useSelector((state: any) => state.siteInfo);
  const [loading, setLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState('');
  const [sendEmail, setSendEmail] = useState(false);
  const [disableButton, setDisableButton] = useState(false);
  const [countdown, setCountdown] = useState(30);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;
    if (disableButton && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      setDisableButton(false);
      setCountdown(30);
    }
    return () => timer && clearInterval(timer);
  }, [disableButton, countdown]);

  const onFinish = async (values: any) => {
    if (siteInfo.turnstile_check && !turnstileToken) {
      message.error(t('registerForm.turnstileError'));
      return;
    }

    setLoading(true);
    setDisableButton(true);
    
    try {
      const res = await API.get(`/api/reset_password?email=${values.email}&turnstile=${turnstileToken}`);
      const { success, message: msg } = res.data;
      if (success) {
        setSendEmail(true);
        message.success(t('registerForm.restSendEmail'));
      } else {
        message.error(msg);
        setDisableButton(false);
      }
    } catch (err) {
      message.error(t('common.serverError'));
      setDisableButton(false);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: '#f8f9fa' }}>
      <Card style={{ width: '100%', maxWidth: 480, padding: 24, borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
            <Logo />
          </div>
          <Title level={3} style={{ color: '#1677ff', margin: 0 }}>{t('login.passwordRest')}</Title>
          <Text type="secondary">Enter your email to reset password</Text>
        </div>

        {sendEmail ? (
          <Alert
             message={t('registerForm.restSendEmail')}
             type="success"
             showIcon
             style={{ marginBottom: 24 }}
          />
        ) : (
            <Form
            name="forgetPassword"
            onFinish={onFinish}
            layout="vertical"
            size="large"
            >
            <Form.Item
                name="email"
                label="Email"
                rules={[
                { required: true, message: t('registerForm.emailRequired') },
                { type: 'email', message: t('registerForm.validEmailRequired') }
                ]}
            >
                <Input prefix={<MailOutlined />} placeholder="Email" />
            </Form.Item>

            {siteInfo.turnstile_check && (
                <Form.Item>
                <Turnstile
                    sitekey={siteInfo.turnstile_site_key}
                    onVerify={(token) => setTurnstileToken(token)}
                />
                </Form.Item>
            )}

            <Form.Item>
                <Button type="primary" htmlType="submit" block loading={loading} disabled={disableButton}>
                {disableButton ? t('common.again', { count: countdown }) : t('common.submit')}
                </Button>
            </Form.Item>
            </Form>
        )}
        
        <div style={{ textAlign: 'center', marginTop: 16 }}>
             <Link to="/login" style={{ color: '#1677ff' }}>{t('menu.login')}</Link>
        </div>
      </Card>
    </div>
  );
}
