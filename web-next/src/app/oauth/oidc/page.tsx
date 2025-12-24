'use client';

import React from 'react';
import OAuthCallback from '@/components/OAuthCallback';
import useLogin from '@/hooks/useLogin';
import { useTranslation } from 'react-i18next';

export default function OIDCOAuthPage() {
  const { oidcLogin } = useLogin();
  const { t } = useTranslation();
  
  return (
    <OAuthCallback 
        provider="oidc" 
        loginFunction={oidcLogin} 
        title={t('login.oidcLogin') || 'OIDC Login'} 
    />
  );
}
