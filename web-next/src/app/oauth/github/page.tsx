'use client';

import React from 'react';
import OAuthCallback from '@/components/OAuthCallback';
import useLogin from '@/hooks/useLogin';
import { useTranslation } from 'react-i18next';

export default function GitHubOAuthPage() {
  const { githubLogin } = useLogin();
  const { t } = useTranslation();
  
  return (
    <OAuthCallback 
        provider="github" 
        loginFunction={githubLogin} 
        title={t('login.githubLogin') || 'GitHub Login'} 
    />
  );
}
