'use client';

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Form, Input, Button, Card, Divider, Space, Typography, message, Progress } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { Link, useSearchParams } from 'react-router-dom';
import useRegister from '@/hooks/useRegister';
import Logo from '@/ui-component/Logo';
import Turnstile from 'react-turnstile';

const { Title, Text } = Typography;

export default function RegisterPage() {
  const { t } = useTranslation();
  const { register, sendVerificationCode } = useRegister();
  const siteInfo = useSelector((state: any) => state.siteInfo);
  const [loading, setLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [emailVerified, setEmailVerified] = useState(false);
  
  const [searchParams] = useSearchParams();

  const [form] = Form.useForm();
  
  useEffect(() => {
    const affCode = searchParams.get('aff');
    if (affCode) {
      localStorage.setItem('aff', affCode);
    }
  }, [searchParams]);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => timer && clearInterval(timer);
  }, [countdown]);

  const onFinish = async (values: any) => {
    if (siteInfo.turnstile_check && !turnstileToken) {
      message.error(t('registerForm.turnstileError'));
      return;
    }

    if (siteInfo.email_verification && !values.verification_code) {
        message.error(t('registerForm.verificationCodeRequired'));
        return;
    }

    setLoading(true);
    const { success, message: msg } = await register(values, turnstileToken);
    setLoading(false);
    if (!success) {
      message.error(msg || t('register.error'));
    }
  };

  const handleSendCode = async () => {
    const email = form.getFieldValue('email');
    if (!email) {
      message.error(t('registerForm.enterEmail'));
      return;
    }
    // Validate email format basic check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        message.error(t('registerForm.validEmailRequired'));
        return;
    }

    if (siteInfo.turnstile_check && !turnstileToken) {
      message.error(t('registerForm.turnstileError'));
      return;
    }

    setLoading(true);
    const { success, message: msg } = await sendVerificationCode(email, turnstileToken);
    setLoading(false);
    if (success) {
      setCountdown(30);
    } else {
      message.error(msg);
    }
  };

  const backgroundStyle: React.CSSProperties = {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '56px 16px',
    backgroundColor: '#f5f7fb',
    backgroundImage:
      'linear-gradient(135deg, rgba(22,119,255,0.12) 0%, rgba(90,200,250,0.12) 30%, rgba(124,77,255,0.08) 60%, rgba(22,119,255,0.14) 100%), url(/login-bg.svg)',
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  };

  const cardStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: 520,
    padding: 28,
    borderRadius: 14,
    boxShadow: '0 12px 40px rgba(0,0,0,0.08)',
    background: 'rgba(255,255,255,0.9)',
    backdropFilter: 'blur(6px)',
  };

  return (
    <div style={backgroundStyle}>
      <Card style={cardStyle}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
            <Logo />
          </div>
          <Title level={3} style={{ color: '#1677ff', margin: 0 }}>{t('menu.signup')}</Title>
          <Text type="secondary">Create a new account</Text>
        </div>

        <Form
          form={form}
          name="register"
          onFinish={onFinish}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="username"
            label={t('registerForm.usernameRequired')}
            rules={[{ required: true, message: t('registerForm.usernameRequired') }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Username" />
          </Form.Item>

          <Form.Item
            name="password"
            label={t('registerForm.passwordRequired')}
            rules={[{ required: true, message: t('registerForm.passwordRequired') }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Password" />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label={t('registerForm.confirmPasswordRequired')}
            dependencies={['password']}
            rules={[
              { required: true, message: t('registerForm.confirmPasswordRequired') },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error(t('registerForm.passwordsNotMatch')));
                },
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Confirm Password" />
          </Form.Item>

          {siteInfo.email_verification && (
            <>
              <Form.Item
                label="Email"
                required
                style={{ marginBottom: 0 }}
              >
                 <Space.Compact style={{ width: '100%' }}>
                    <Form.Item
                        name="email"
                        noStyle
                        rules={[
                            { required: true, message: t('registerForm.emailRequired') },
                            { type: 'email', message: t('registerForm.validEmailRequired') }
                        ]}
                    >
                        <Input prefix={<MailOutlined />} placeholder="Email" />
                    </Form.Item>
                    <Button onClick={handleSendCode} disabled={countdown > 0 || loading}>
                        {countdown > 0 ? `${countdown}s` : t('registerForm.getCode')}
                    </Button>
                 </Space.Compact>
              </Form.Item>
              <div style={{ marginBottom: 24 }}></div> {/* Spacing */}
              
              <Form.Item
                name="verification_code"
                label={t('registerForm.verificationCodeRequired')}
                rules={[{ required: true, message: t('registerForm.verificationCodeRequired') }]}
              >
                <Input prefix={<SafetyCertificateOutlined />} placeholder="Verification Code" />
              </Form.Item>
            </>
          )}

          {siteInfo.turnstile_check && (
            <Form.Item>
               <Turnstile
                sitekey={siteInfo.turnstile_site_key}
                onVerify={(token) => setTurnstileToken(token)}
              />
            </Form.Item>
          )}

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              {t('menu.signup')}
            </Button>
          </Form.Item>
          
           <div style={{ textAlign: 'center' }}>
             <Link to="/login" style={{ color: '#1677ff' }}>{t('registerPage.alreadyHaveAccount')}</Link>
           </div>
        </Form>
      </Card>
    </div>
  );
}
