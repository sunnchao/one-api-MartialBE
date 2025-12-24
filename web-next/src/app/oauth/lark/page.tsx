'use client';

import React from 'react';
import OAuthCallback from '@/components/OAuthCallback';
import useLogin from '@/hooks/useLogin';
import { useTranslation } from 'react-i18next';

export default function LarkOAuthPage() {
  const { larkLogin } = useLogin();
  const { t } = useTranslation();
  
  return (
    <OAuthCallback 
        provider="lark" 
        loginFunction={larkLogin} 
        title={t('login.larkLogin') || 'Lark Login'} 
    />
  );
}
