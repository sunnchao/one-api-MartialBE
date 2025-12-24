'use client';

import React from 'react';
import { Layout, Button, Avatar, Dropdown, MenuProps, Space, Tooltip } from 'antd';
import { MenuFoldOutlined, MenuUnfoldOutlined, UserOutlined, LogoutOutlined, BellOutlined, TranslationOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { SET_MENU } from '@/store/actions';
import useLogin from '@/hooks/useLogin';
import i18n from '@/i18n';

const { Header: AntHeader } = Layout;

const Header = () => {
  const dispatch = useDispatch();
  const customization = useSelector((state: any) => state.customization);
  const user = useSelector((state: any) => state.account.user);
  const { logout } = useLogin();

  const handleDrawerToggle = () => {
    dispatch({ type: SET_MENU, opened: !customization.opened });
  };

  const userItems: MenuProps['items'] = [
    {
      key: 'profile',
      label: '个人设置', // TODO: link to profile
      icon: <UserOutlined />,
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      label: '退出登录',
      icon: <LogoutOutlined />,
      onClick: logout,
    },
  ];

  const handleLanguageChange = (lang: string) => {
    localStorage.setItem('appLanguage', lang);
    i18n.changeLanguage(lang);
  };

  const languageItems: MenuProps['items'] = [
    { key: 'zh_CN', label: '中文', onClick: () => handleLanguageChange('zh_CN') },
    { key: 'en_US', label: 'English', onClick: () => handleLanguageChange('en_US') },
    { key: 'ja_JP', label: '日本語', onClick: () => handleLanguageChange('ja_JP') },
    { key: 'zh_HK', label: '繁體中文', onClick: () => handleLanguageChange('zh_HK') },
  ];

  return (
    <AntHeader style={{ padding: '0 16px', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10, width: '100%', boxShadow: '0 1px 4px rgba(0,21,41,0.08)' }}>
      <Button
        type="text"
        icon={customization.opened ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />}
        onClick={handleDrawerToggle}
        style={{
          fontSize: '16px',
          width: 64,
          height: 64,
        }}
      />
      <Space size={16}>
        <Dropdown menu={{ items: languageItems }} placement="bottomRight">
          <Tooltip title="Language">
            <Button type="text" icon={<TranslationOutlined />} />
          </Tooltip>
        </Dropdown>
        <Tooltip title="Notifications">
          <Button type="text" icon={<BellOutlined />} />
        </Tooltip>
        <Space size={8}>
          <span>{user?.username || 'User'}</span>
          <Dropdown menu={{ items: userItems }} placement="bottomRight">
            <Avatar icon={<UserOutlined />} style={{ cursor: 'pointer', backgroundColor: '#1677ff' }} />
          </Dropdown>
        </Space>
      </Space>
    </AntHeader>
  );
};

export default Header;
