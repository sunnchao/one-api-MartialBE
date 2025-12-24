'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, Tabs, Spin, Typography, Empty } from 'antd';
import { API } from '@/utils/api';
import { getChatLinks, showError, replaceChatPlaceholders } from '@/utils/common';
import { useSelector } from 'react-redux';

export default function Playground() {
  const [token, setToken] = useState('');
  const [tabKey, setTabKey] = useState<string>('0');
  const [isLoading, setIsLoading] = useState(true);
  // @ts-ignore
  const siteInfo = useSelector((state) => state.siteInfo);
  const chatLinks = getChatLinks();
  const [iframeSrc, setIframeSrc] = useState<string | null>(null);

  const loadToken = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await API.get(`/api/token/playground`);
      const { success, message, data } = res.data;
      if (success) {
        setToken(data);
      } else {
        showError(message);
      }
    } catch (error) {
        console.error(error);
    } finally {
        setIsLoading(false);
    }
  }, []);

  const updateIframeSrc = useCallback((index: number, tokenValue: string) => {
      if (!chatLinks[index]) return;
      
      let server = '';
      if (siteInfo?.server_address) {
        server = siteInfo.server_address;
      } else if (typeof window !== 'undefined') {
        server = window.location.host;
      }
      server = encodeURIComponent(server);
      const key = 'sk-' + tokenValue;

      setIframeSrc(replaceChatPlaceholders(chatLinks[index].url, key, server));
  }, [siteInfo, chatLinks]);

  useEffect(() => {
    loadToken();
  }, [loadToken]);

  useEffect(() => {
      if (token) {
          updateIframeSrc(Number(tabKey), token);
      }
  }, [token, tabKey, updateIframeSrc]);

  const onChange = (key: string) => {
    setTabKey(key);
  };

  if (isLoading) {
      return (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
              <Spin tip="Loading..." />
          </div>
      );
  }

  if (chatLinks.length === 0 || !token) {
      return (
          <Card title="Playground">
              <Empty description="No playground available" />
          </Card>
      );
  }

  if (chatLinks.length === 1) {
      return (
          <iframe 
            title="playground" 
            src={iframeSrc || ''} 
            style={{ width: '100%', height: '85vh', border: 'none' }} 
          />
      );
  }

  const items = chatLinks.map((link: any, index: number) => ({
      key: String(index),
      label: link.name,
      children: null // We render iframe outside tabs to prevent reload on tab switch? Or inside?
      // Original code renders iframe outside tabs but updates src.
      // AntD Tabs content is inside items.
      // If we put iframe inside content, it might reload.
      // But original code:
      // <Tabs ... onChange={handleTabChange} ...> ... </Tabs>
      // <Box><iframe ... /></Box>
      // So iframe is shared.
  })).filter((item: any, index: number) => chatLinks[index].show);

  return (
    <Card styles={{ body: { padding: 0 } }}>
      <Tabs 
        activeKey={tabKey} 
        onChange={onChange}
        items={items}
        tabBarStyle={{ paddingLeft: 16, marginBottom: 0 }}
      />
      <div style={{ height: '85vh' }}>
          <iframe 
            title="playground" 
            src={iframeSrc || ''} 
            style={{ width: '100%', height: '100%', border: 'none' }} 
          />
      </div>
    </Card>
  );
}
