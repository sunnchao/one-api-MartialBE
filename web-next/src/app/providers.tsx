'use client';

import { Provider } from 'react-redux';
import { store } from '@/store';
import { ConfigProvider, theme, App } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import StyledComponentsRegistry from '@/lib/AntdRegistry';
import UserProvider from '@/contexts/UserContext';
import StatusProvider from '@/contexts/StatusContext';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <StyledComponentsRegistry>
        <ConfigProvider
          locale={zhCN}
          componentSize="middle"
          theme={{
            token: {
              colorPrimary: '#1677ff',
              borderRadius: 12,
              colorLink: '#1677ff',
              colorLinkActive: '#0062A3',
              colorLinkHover: '#60B8FF',
            },
            algorithm: [theme.defaultAlgorithm, theme.compactAlgorithm],
          }}
        >
          <App>
            <StatusProvider>
              <UserProvider>{children}</UserProvider>
            </StatusProvider>
          </App>
        </ConfigProvider>
      </StyledComponentsRegistry>
    </Provider>
  );
}
