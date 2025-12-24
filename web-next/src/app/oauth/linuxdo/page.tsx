'use client';

import React from 'react';
import OAuthCallback from '@/components/OAuthCallback';
import useLogin from '@/hooks/useLogin';
import { useTranslation } from 'react-i18next';

export default function LinuxDoOAuthPage() {
  const { linuxDoLogin } = useLogin();
  const { t } = useTranslation();
  
  return (
    <OAuthCallback 
        provider="linuxdo" 
        loginFunction={linuxDoLogin} 
        title={t('login.linuxDoLogin') || 'LinuxDO Login'} 
    />
  );
}
