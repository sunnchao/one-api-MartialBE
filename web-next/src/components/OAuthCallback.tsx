'use client';

import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, Spin, Typography, Alert } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import useLogin from '@/hooks/useLogin';
import { useTranslation } from 'react-i18next';
import { showError } from '@/utils/common';

const { Title, Text } = Typography;

interface OAuthCallbackProps {
  provider: string;
  loginFunction: (code: string, state: string) => Promise<{ success: boolean; message: string }>;
  title: string;
}

export default function OAuthCallback({ provider, loginFunction, title }: OAuthCallbackProps) {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [prompt, setPrompt] = useState('Processing...');

  const processLogin = async (code: string, state: string, count: number) => {
    try {
      const { success, message } = await loginFunction(code, state);
      if (!success) {
        if (message) {
          showError(message);
        }
        if (count === 0) {
            setPrompt(`${title} failed`);
            setTimeout(() => {
                navigate('/login', { replace: true });
            }, 2000);
            return;
        }
        count++;
        setPrompt(`Retry ${count}...`);
        setTimeout(() => {
            processLogin(code, state, count);
        }, 2000);
      } else {
          // Success handled in useLogin (redirects)
          setLoading(false);
      }
    } catch (e) {
        setError('An unexpected error occurred.');
        setLoading(false);
    }
  };

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (code) {
      processLogin(code, state || '', 0);
    } else {
      setError('Missing code parameter');
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate, searchParams]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f0f2f5' }}>
      <Card style={{ width: 400, textAlign: 'center' }}>
        <Title level={3}>{title}</Title>
        {loading ? (
          <div style={{ padding: 40 }}>
             <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} tip={prompt} />
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
