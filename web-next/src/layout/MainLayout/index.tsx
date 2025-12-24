'use client';

import React, { useEffect } from 'react';
import { Layout } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import Header from './Header';
import Sidebar from './Sidebar';
import AuthGuard from '@/components/AuthGuard';
import { SET_MENU } from '@/store/actions';
import { useMediaQuery } from 'react-responsive';

const { Content } = Layout;

const SIDER_WIDTH = 260;
const SIDER_COLLAPSED_WIDTH = 80;

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const customization = useSelector((state: any) => state.customization);
  const dispatch = useDispatch();
  const isMobile = useMediaQuery({ maxWidth: 768 });

  useEffect(() => {
     // Auto collapse on mobile
     if (isMobile && customization.opened) {
         dispatch({ type: SET_MENU, opened: false });
     }
  }, [isMobile]);

  return (
    <AuthGuard>
      <Layout style={{ minHeight: '100vh' }}>
        <Sidebar />
        <Layout 
           style={{ 
             marginLeft: customization.opened ? SIDER_WIDTH : SIDER_COLLAPSED_WIDTH, // fixed Sider offset
             // Actually Antd Sider logic handles layout adjustment if we put Sider inside Layout
             // But here we used fixed Sider.
             transition: 'margin-left 0.2s',
             height: '100vh',
             overflow: 'hidden',
             display: 'flex',
             flexDirection: 'column',
           }}
        >
          <Header />
          <Content
            style={{
              margin: '24px 16px',
              padding: 24,
              minHeight: 280,
              background: '#fff',
              borderRadius: 12, // Match theme
              flex: 1,
              overflow: 'auto',
              minWidth: 0,
              minHeight: 0,
            }}
          >
            {children}
          </Content>
        </Layout>
      </Layout>
    </AuthGuard>
  );
};

export default MainLayout;
