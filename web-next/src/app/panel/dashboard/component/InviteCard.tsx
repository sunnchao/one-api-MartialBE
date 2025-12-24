'use client';

import React, { useState } from 'react';
import { Card, Typography, Button, Input, Space, theme } from 'antd';
import { useTranslation } from 'react-i18next';
import { API } from '@/utils/api';
import { showError, copy } from '@/utils/common';
import { GiftTwoTone, CopyOutlined, LinkOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const InviteCard = () => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const [inviteUrl, setInviteUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInviteUrl = async () => {
    if (inviteUrl) {
      await copy(inviteUrl, t('inviteCard.inviteUrlLabel'));
      return;
    }

    setLoading(true);
    try {
      const res = await API.get('/api/user/aff');
      const { success, message: msg, data } = res.data;
      if (success) {
        let link = `${window.location.origin}/register?aff=${data}`;
        setInviteUrl(link);
        await copy(link, t('inviteCard.inviteUrlLabel'));
      } else {
        showError(msg);
      }
    } catch (error) {
      console.error(error);
      showError('Failed to generate invite link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      styles={{ 
        body: { 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          padding: '24px'
        } 
      }}
      style={{ height: '100%' }}
    >
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        
        {/* Ant Design Style Illustration Area */}
        <div style={{
          position: 'relative',
          width: 120,
          height: 120,
          marginBottom: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            background: token.colorPrimaryBg,
            borderRadius: '50%',
            opacity: 0.6,
          }} />
          <div style={{
            position: 'absolute',
            width: '70%',
            height: '70%',
            background: token.colorPrimaryBgHover,
            borderRadius: '50%',
            opacity: 0.4,
          }} />
          <GiftTwoTone twoToneColor={token.colorPrimary} style={{ fontSize: 48, zIndex: 1 }} />
        </div>

        <div style={{ textAlign: 'center', maxWidth: 280 }}>
          <Title level={3} style={{ marginBottom: 8 }}>
            {t('inviteCard.inviteReward')}
          </Title>
          <Paragraph type="secondary" style={{ marginBottom: 24 }}>
            {t('inviteCard.inviteDescription')}
          </Paragraph>
        </div>

        <Space.Compact style={{ width: '100%', maxWidth: 320 }}>
          <Input 
            value={inviteUrl} 
            placeholder={t('inviteCard.generateInvite')} 
            readOnly 
            prefix={<LinkOutlined style={{ color: token.colorTextDescription }} />}
            size={'middle'}
          />
          <Button 
            type="primary" 
            onClick={handleInviteUrl} 
            loading={loading}
            icon={inviteUrl ? <CopyOutlined /> : null}
            size={'middle'}
          >
            {inviteUrl ? t('inviteCard.copyButton.copy') : t('inviteCard.copyButton.generate')}
          </Button>
        </Space.Compact>
      </div>
    </Card>
  );
};

export default InviteCard;
