'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Card, Typography, Spin, Alert } from 'antd';
import { API } from '@/utils/api';
import { showError } from '@/utils/common';
import { useTranslation } from 'react-i18next';
// import ContentViewer from '@/components/ContentViewer'; // TODO: Implement ContentViewer if it has complex logic, or use simple div for now

const { Title, Paragraph, Link } = Typography;

export default function AboutPage() {
  const { t } = useTranslation();
  const [about, setAbout] = useState('');
  const [aboutLoaded, setAboutLoaded] = useState(false);

  const displayAbout = useCallback(async () => {
    // Basic local cache
    if (typeof window !== 'undefined') {
        setAbout(localStorage.getItem('about') || '');
    }
    
    try {
      const res = await API.get('/api/about');
      const { success, message, data } = res.data;
      if (success) {
        setAbout(data);
        if (typeof window !== 'undefined') {
            localStorage.setItem('about', data);
        }
      } else {
        showError(message);
        setAbout(t('about.loadingError') || 'Loading Error');
      }
    } catch (error) {
      setAbout(t('about.loadingError') || 'Loading Error');
    }

    setAboutLoaded(true);
  }, [t]);

  useEffect(() => {
    displayAbout();
  }, [displayAbout]);

  return (
    <div style={{ padding: '24px', maxWidth: 1200, margin: '0 auto' }}>
        {aboutLoaded && about === '' ? (
            <Card title={t('about.aboutTitle') || 'About'}>
                <Paragraph>
                    {t('about.aboutDescription') || 'One API is an OpenAI-compatible API management & redistribution system.'} <br />
                    {t('about.projectRepo') || 'Project Repo: '}
                    <Link href="https://github.com/MartialBE/one-hub" target="_blank">https://github.com/MartialBE/one-hub</Link>
                </Paragraph>
            </Card>
        ) : (
            <Card title={t('about.aboutTitle') || 'About'} loading={!aboutLoaded}>
                {/* Simplified Content Viewer */}
                <div 
                    style={{ fontSize: '1.1rem', minHeight: 'calc(100vh - 200px)' }}
                    dangerouslySetInnerHTML={{ __html: about }}
                />
            </Card>
        )}
    </div>
  );
}
