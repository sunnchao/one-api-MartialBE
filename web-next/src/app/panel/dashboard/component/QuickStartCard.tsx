'use client';

import React, { useState, useCallback } from 'react';
import { Card, Typography, Button, Space, Divider } from 'antd';
import { useTranslation } from 'react-i18next';
import { MessageOutlined, AppstoreOutlined } from '@ant-design/icons';
import { API } from '@/utils/api';
import { getChatLinks } from '@/utils/common'; // Assumes this util exists or needs porting
import { useUserStore } from '@/store/user'; // Assuming user store logic

const { Title, Paragraph } = Typography;

const QuickStartCard = () => {
  const { t } = useTranslation();
  const [key, setKey] = useState('');
  // const siteInfo = useUserStore((state) => state.siteInfo); // Adapt to your store
  // const chatLinks = getChatLinks(false); // Adapt
  
  // Mocking chatLinks for now if util not ready, or use what's available
  const chatLinks = [
    { name: 'ChatGPT Next', url: 'https://chat.example.com' },
    { name: 'Midjourney', url: '/mj' }
  ];

  /* 
  const getProcessedUrl = useCallback(
    (url: string, key: string) => {
      let server = siteInfo?.server_address || window.location.host;
      server = encodeURIComponent(server);
      const useKey = 'sk-' + key;
      // return replaceChatPlaceholders(url, useKey, server); // need to port this util
      return url;
    },
    [siteInfo]
  );
  */

  const handleClick = async (url: string) => {
    // Placeholder logic - adapt to match original
    window.open(url, '_blank');
  };

  return (
    <Card>
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <div>
          <Title level={3} style={{ color: '#1677ff', margin: 0 }}>
            {t('dashboard_index.quickStart')}
          </Title>
          <Paragraph type="secondary" style={{ margin: 0 }}>
            {t('dashboard_index.quickStartTip')}
          </Paragraph>
        </div>

        <Space wrap>
          {chatLinks.filter(l => l.url.startsWith('http')).map((option, index) => (
            <Button
              key={index}
              type="primary"
              icon={<MessageOutlined />}
              onClick={() => handleClick(option.url)}
              size={'middle'}
            >
              {option.name}
            </Button>
          ))}
        </Space>
        
        <Divider style={{ margin: '12px 0' }} />

        <Space wrap>
          {chatLinks.filter(l => !l.url.startsWith('http')).map((option, index) => (
            <Button
              key={index}
              style={{ backgroundColor: '#00B8D4', borderColor: '#00B8D4', color: 'white' }}
              icon={<AppstoreOutlined />}
              onClick={() => handleClick(option.url)}
              size={'middle'}
            >
              {option.name}
            </Button>
          ))}
        </Space>
      </Space>
    </Card>
  );
};

export default QuickStartCard;
