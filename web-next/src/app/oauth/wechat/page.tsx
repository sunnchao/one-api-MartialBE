'use client';

import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, Spin, Typography, Alert } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import useLogin from '@/hooks/useLogin';
import { useTranslation } from 'react-i18next';
import { showError } from '@/utils/common';

const { Title } = Typography;

export default function WeChatOAuthPage() {
  const { wechatLogin } = useLogin();
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const code = searchParams.get('code');
    if (code) {
      wechatLogin(code).then(({ success, message }) => {
        if (!success) {
            showError(message || 'WeChat login failed');
            setError(message || 'WeChat login failed');
            setTimeout(() => {
                navigate('/login', { replace: true });
            }, 2000);
        } else {
            setLoading(false);
        }
      });
    } else {
        setError('Missing code parameter');
        setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate, searchParams]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f0f2f5' }}>
      <Card style={{ width: 400, textAlign: 'center' }}>
        <Title level={3}>{t('login.wechatLogin') || 'WeChat Login'}</Title>
        {loading ? (
          <div style={{ padding: 40 }}>
             <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} tip="Logging in..." />
          </div>
        ) : error ? (
            <Alert message="Login Failed" description={error} type="error" showIcon />
        ) : (
             <Alert message="Success" description="Redirecting..." type="success" showIcon />
        )}
      </Card>
    </div>
  );
}
