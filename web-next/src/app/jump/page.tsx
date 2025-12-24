'use client';

import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, Result } from 'antd';

export default function JumpPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const jump = searchParams.get('url');
    const allowedUrls = ['opencat://', 'ama://'];
    
    if (jump && allowedUrls.some((url) => jump.startsWith(url))) {
      window.location.href = jump;
    }
  }, [searchParams]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Card>
            <Result
                title={t('jump') || 'Redirecting...'}
                status="info"
            />
        </Card>
    </div>
  );
}
