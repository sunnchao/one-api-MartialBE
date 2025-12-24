'use client';

import React, { useEffect, useState } from 'react';
import { Form, Button, Card, Typography, message, Alert } from 'antd';
import { useTranslation } from 'react-i18next';
import { Link, useSearchParams } from 'react-router-dom';
import Logo from '@/ui-component/Logo';
import { API } from '@/utils/api';
import { copy } from '@/utils/common';

const { Title, Text } = Typography;

export default function ResetPasswordConfirmPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  const email = searchParams.get('email');
  const token = searchParams.get('token');

  const onSubmit = async () => {
    if (!email || !token) {
        setErrorMsg(t('auth.invalidLink'));
        return;
    }
    
    setLoading(true);
    try {
      const res = await API.post(`/api/user/reset`, { email, token });
      const { success, message: msg, data } = res.data;
      if (success) {
        setNewPassword(data);
        copy(data, t('auth.newPassword'));
      } else {
        setErrorMsg(msg);
      }
    } catch (err) {
      setErrorMsg(t('common.serverError'));
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
        </div>

        {(!email || !token) ? (
            <Alert
                message={t('auth.invalidLink')}
                type="error"
                showIcon
                style={{ marginBottom: 24 }}
            />
        ) : newPassword ? (
             <Alert
                message={
                    <>
                    {t('auth.newPasswordInfo')} <Text strong copyable>{newPassword}</Text> <br />
                    {t('auth.newPasswordEdit')}
                    </>
                }
                type="error" // The original used error severity for visibility? Let's check. Yes, severity="error".
                showIcon
                style={{ marginBottom: 24 }}
             />
        ) : errorMsg ? (
            <Alert
                message={errorMsg}
                type="error"
                showIcon
                style={{ marginBottom: 24 }}
            />
        ) : (
            <Button type="primary" size="large" block onClick={onSubmit} loading={loading}>
                {t('auth.restPasswordClick')}
            </Button>
        )}
        
        <div style={{ textAlign: 'center', marginTop: 16 }}>
             <Link to="/login" style={{ color: '#1677ff' }}>{t('menu.login')}</Link>
        </div>
      </Card>
    </div>
  );
}
