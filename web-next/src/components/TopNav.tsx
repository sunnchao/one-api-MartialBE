'use client';

import React, { useMemo } from 'react';
import { Button, Dropdown, Space } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

type Variant = 'dark' | 'light';

export default function TopNav({
  variant = 'light',
  maxWidth = 1200,
}: {
  variant?: Variant;
  maxWidth?: number;
}) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const user = useSelector((state: any) => state.account?.user);
  const siteInfo = useSelector((state: any) => state.siteInfo);

  const isDark = variant === 'dark';
  const textColor = isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.75)';
  const brandColor = isDark ? '#fff' : '#111';
  const activeColor = isDark ? '#fff' : '#1677ff';

  const systemName: string = siteInfo?.system_name || siteInfo?.systemName || 'ChirouAPI';

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  const aiCodeItems = useMemo(
    () => [
      { key: 'claude', label: 'Claude Code', onClick: () => navigate('/claude-code') },
      { key: 'gemini', label: 'Gemini Code', onClick: () => navigate('/gemini-code') },
      { key: 'codex', label: 'OpenAI Codex', onClick: () => navigate('/codex-code') },
    ],
    [navigate],
  );

  return (
    <div
      style={{
        maxWidth,
        margin: '0 auto',
        padding: '20px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 16,
      }}
    >
      <div
        onClick={() => navigate('/')}
        role="button"
        tabIndex={0}
        title={systemName}
        style={{
          fontSize: 22,
          fontWeight: 800,
          color: brandColor,
          cursor: 'pointer',
          userSelect: 'none',
          letterSpacing: '-0.02em',
          whiteSpace: 'nowrap',
        }}
      >
        {systemName}
      </div>

      <Space size="middle" style={{ flex: '0 0 auto' }}>
        <Button
          type="text"
          style={{ color: isActive('/price') ? activeColor : textColor, fontWeight: 600 }}
          onClick={() => navigate('/price')}
        >
          模型价格
        </Button>

        <Dropdown menu={{ items: aiCodeItems }} trigger={['click']}>
          <Button
            type="text"
            style={{
              color: ['/claude-code', '/gemini-code', '/codex-code'].some((p) => isActive(p)) ? activeColor : textColor,
              fontWeight: 600,
            }}
          >
            AI Code <DownOutlined style={{ fontSize: 12 }} />
          </Button>
        </Dropdown>

        {user ? (
          <Button size={'middle'} type={isDark ? 'default' : 'primary'} onClick={() => navigate('/panel/dashboard')}>
            控制台
          </Button>
        ) : (
          <Space size="small">
            <Button type="text" style={{ color: textColor }} onClick={() => navigate('/login')}>
              登录
            </Button>
            <Button
              type={isDark ? 'default' : 'primary'}
              shape="round"
              style={isDark ? { background: '#fff', color: '#000', border: 'none', fontWeight: 700 } : { fontWeight: 700 }}
              onClick={() => navigate('/register')}
            >
              注册
            </Button>
          </Space>
        )}
      </Space>
    </div>
  );
}

