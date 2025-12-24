'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Card, Tabs } from 'antd';
import { useTranslation } from 'react-i18next';
import { SettingOutlined, SafetyCertificateOutlined, ToolOutlined } from '@ant-design/icons';
import OperationSetting from './components/OperationSetting';
import SystemSetting from './components/SystemSetting';
import OtherSetting from './components/OtherSetting';
import { useLocation, useNavigate } from 'react-router-dom';

export default function SettingPage() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const tabKeys = useMemo(() => ['operation', 'system', 'other'] as const, []);
  const hashKey = location.hash.replace('#', '');
  const [activeKey, setActiveKey] = useState<string>(tabKeys.includes(hashKey as any) ? hashKey : 'operation');

  useEffect(() => {
    const next = location.hash.replace('#', '');
    if (tabKeys.includes(next as any)) setActiveKey(next);
  }, [location.hash, tabKeys]);

  const items = [
    {
      key: 'operation',
      label: (
        <span>
          <ToolOutlined />
          {t('setting_index.operationSettings.title')}
        </span>
      ),
      children: <OperationSetting />,
    },
    {
      key: 'system',
      label: (
        <span>
          <SafetyCertificateOutlined />
          {t('setting_index.systemSettings.title')}
        </span>
      ),
      children: <SystemSetting />,
    },
    {
      key: 'other',
      label: (
        <span>
          <SettingOutlined />
          {t('setting_index.otherSettings.title')}
        </span>
      ),
      children: <OtherSetting />,
    },
  ];

  return (
    <Card>
      <Tabs
        activeKey={activeKey}
        onChange={(key) => {
          setActiveKey(key);
          navigate(`#${key}`);
        }}
        items={items}
        destroyOnHidden
      />
    </Card>
  );
}
