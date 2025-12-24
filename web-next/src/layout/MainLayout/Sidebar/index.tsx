'use client';

import React, { useEffect, useState } from 'react';
import { Layout, Menu, type MenuProps } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { SET_MENU } from '@/store/actions';
import menuItems from '@/menu-items';
import useIsAdmin from '@/hooks/useIsAdmin';
import './sidebar.css';

type ItemType = NonNullable<MenuProps['items']>[number];

const { Sider } = Layout;

const SIDER_WIDTH = 260;
const SIDER_COLLAPSED_WIDTH = 80;

const Sidebar = () => {
  const dispatch = useDispatch();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const customization = useSelector((state: any) => state.customization);
  const siteInfo = useSelector((state: any) => state.siteInfo);
  const isAdmin = useIsAdmin();
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [openKeys, setOpenKeys] = useState<string[]>([]);

  const systemName: string = siteInfo?.system_name || siteInfo?.systemName || 'One API';
  const logoUrl: string | undefined = siteInfo?.logo || siteInfo?.Logo;

  const isSelectedMatch = (menuUrl: string, currentPath: string) =>
    currentPath === menuUrl || currentPath.startsWith(`${menuUrl}/`);

  const collectLeafRoutes = (items: any[], ancestors: string[] = []) => {
    const out: Array<{ url: string; ancestors: string[] }> = [];
    for (const item of items) {
      if (item?.isAdmin && !isAdmin) continue;
      if (item?.type === 'collapse' && Array.isArray(item.children)) {
        out.push(...collectLeafRoutes(item.children, [...ancestors, item.id]));
        continue;
      }
      if (Array.isArray(item?.children)) {
        out.push(...collectLeafRoutes(item.children, ancestors));
        continue;
      }
      if (item?.type === 'item' && item?.url) {
        out.push({ url: item.url, ancestors });
      }
    }
    return out;
  };

  const leafRoutes = collectLeafRoutes(menuItems.items || []);

  // Convert menu-items to Ant Design Menu items
  const getMenuItems = (items: any[]): ItemType[] => {
    return items.map((item) => {
      if (item.isAdmin && !isAdmin) return null;

      if (item.type === 'group') {
        // Ant Design Menu group
        const children = item.children ? getMenuItems(item.children) : [];
        if (children.length === 0) return null;
        
        // Flatten groups for main menu if desired, or use type: 'group'
        // Here we just return children directly if we want a flat look or wrap in group
        // For sidebar, usually we want sections.
        return {
           type: 'group',
           label: item.title,
           children: children
        } as ItemType;
      }

      if (item.type === 'collapse') {
         const children = item.children ? getMenuItems(item.children) : [];
         if (children.length === 0) return null;
         
         return {
           key: item.id,
           label: item.title,
           icon: item.icon ? <item.icon /> : null,
           children: children
         } as ItemType;
      }

      if (item.type === 'item') {
        return {
          key: item.url || item.id, // Use URL as key for easier routing
          label: item.title,
          icon: item.icon ? <item.icon /> : null,
          onClick: () => {
             if (item.url) navigate(item.url);
          }
        } as ItemType;
      }

      return null;
    }).filter(Boolean) as ItemType[];
  };

  const menuData = getMenuItems(menuItems.items);

  useEffect(() => {
    const match = leafRoutes
      .filter((r) => isSelectedMatch(r.url, pathname))
      .sort((a, b) => b.url.length - a.url.length)[0];

    setSelectedKeys([match?.url || pathname]);
    if (match?.ancestors?.length) {
      setOpenKeys((prev) => Array.from(new Set([...prev, ...match.ancestors])));
    }
  }, [pathname]);

  return (
    <Sider
      className="oneapi-sider"
      trigger={null}
      collapsible
      collapsed={!customization.opened}
      width={SIDER_WIDTH}
      collapsedWidth={SIDER_COLLAPSED_WIDTH}
      theme="light"
      style={{
        overflow: 'auto',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 1000,
        boxShadow: '0 2px 10px rgba(0,0,0,0.06)'
      }}
    >
      <div
        className="oneapi-sider__logo"
        onClick={() => navigate('/panel/dashboard')}
        title={systemName}
        role="button"
        tabIndex={0}
      >
        <div className="oneapi-sider__logoMark" aria-hidden>
          {logoUrl ? <img src={logoUrl} alt="logo" /> : 'AI'}
        </div>
        <div className="oneapi-sider__logoText">
          <div className="oneapi-sider__logoTitle">{systemName}</div>
          <div className="oneapi-sider__logoSub">Dashboard</div>
        </div>
      </div>

      <div className="oneapi-sider__menu">
        <Menu
          theme="light"
          mode="inline"
          selectedKeys={selectedKeys}
          openKeys={openKeys}
          onOpenChange={(keys) => setOpenKeys(keys as string[])}
          items={menuData}
        />
      </div>
    </Sider>
  );
};

export default Sidebar;
