'use client';

import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Form, Input, Button, Card, Divider, Space, Typography, message } from 'antd';
import { UserOutlined, LockOutlined, GithubOutlined, WechatOutlined, ApiOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import useLogin from '@/hooks/useLogin';
import Logo from '@/ui-component/Logo';
import Turnstile from 'react-turnstile';
import { onGitHubOAuthClicked, onLinuxDoOAuthClicked, onLarkOAuthClicked, onOIDCAuthClicked, onWebAuthnClicked } from '@/utils/common';
import WechatModal from '@/components/WechatModal';

const { Title, Text } = Typography;

export default function LoginPage() {
  const { t } = useTranslation();
  const { login, wechatLogin } = useLogin();
  const siteInfo = useSelector((state: any) => state.siteInfo);
  const [loading, setLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState('');
  const [openWechat, setOpenWechat] = useState(false);
  const [linuxDoLoading, setLinuxDoLoading] = useState(false);
  
  const [form] = Form.useForm();

  const onFinish = async (values: any) => {
    if (siteInfo.turnstile_check && !turnstileToken) {
      message.error(t('registerForm.turnstileError'));
      return;
    }

    setLoading(true);
    const { success, message: msg } = await login(values.username, values.password, turnstileToken);
    setLoading(false);
    if (success) {
      message.success(t('common.loginOk'));
    } else {
      message.error(msg || t('login.error'));
    }
  };

  const showThirdParty =
    siteInfo.github_oauth ||
    siteInfo.wechat_login ||
    siteInfo.lark_login ||
    siteInfo.oidc_auth ||
    siteInfo.linux_do_oauth;

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
          <Title level={3} style={{ color: '#1677ff', margin: 0 }}>{t('menu.login')}</Title>
          <Text type="secondary">Welcome back, please login to your account.</Text>
        </div>

        {showThirdParty && (
          <>
            <Space direction="vertical" style={{ width: '100%' }}>
              {siteInfo.github_oauth && (
                <Button block icon={<GithubOutlined />} size="large" onClick={() => onGitHubOAuthClicked(siteInfo.github_client_id)}>
                  {t('login.useGithubLogin')}
                </Button>
              )}
              {siteInfo.linux_do_oauth && (
                <Button
                  block
                  size="large"
                  loading={linuxDoLoading}
                  onClick={() => onLinuxDoOAuthClicked(siteInfo.linux_do_client_id, false, linuxDoLoading, setLinuxDoLoading)}
                >
                  {t('login.useLinuxDoLogin')}
                </Button>
              )}
              {siteInfo.wechat_login && (
                <Button block icon={<WechatOutlined />} size="large" onClick={() => setOpenWechat(true)}>
                  {t('login.useWechatLogin')}
                </Button>
              )}
              {siteInfo.lark_login && (
                <Button block size="large" onClick={() => onLarkOAuthClicked(siteInfo.lark_client_id)}>
                  {t('login.useLarkLogin')}
                </Button>
              )}
              {siteInfo.oidc_auth && (
                <Button block icon={<ApiOutlined />} size="large" onClick={() => onOIDCAuthClicked()}>
                  {t('login.useOIDCLogin')}
                </Button>
              )}
            </Space>
            
            <Divider>OR</Divider>
          </>
        )}

        <Form
          form={form}
          name="login"
          onFinish={onFinish}
          layout="vertical"
          size="large"
          initialValues={{ username: '', password: '' }}
        >
          <Form.Item
            name="username"
            label={t('login.usernameOrEmail')}
            rules={[{ required: true, message: t('login.usernameRequired') }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Username" />
          </Form.Item>

          <Form.Item
            name="password"
            label={t('login.password')}
            rules={[{ required: true, message: t('login.passwordRequired') }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Password" />
          </Form.Item>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
             <Link to="/reset" style={{ color: '#1677ff' }}>{t('login.forgetPassword')}</Link>
          </div>

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
              {t('menu.login')}
            </Button>
          </Form.Item>
          
           <div style={{ textAlign: 'center' }}>
             <Link to="/register" style={{ color: '#1677ff' }}>{t('registerPage.noAccount')}</Link>
           </div>
        </Form>
        
        <div style={{ marginTop: 16 }}>
             <Button block onClick={() => onWebAuthnClicked(form.getFieldValue('username'), message.error, message.success, () => {})}>
                 WebAuthn Login
             </Button>
        </div>
      </Card>

      <WechatModal
        open={openWechat}
        onClose={() => setOpenWechat(false)}
        wechatLogin={wechatLogin}
        qrCode={siteInfo.wechat_qrcode}
      />
    </div>
  );
}
