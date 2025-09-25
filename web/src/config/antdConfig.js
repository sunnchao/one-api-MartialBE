import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import enUS from 'antd/locale/en_US';

/**
 * Ant Design 全局配置
 */
export const antdConfig = {
  // 默认语言
  locale: zhCN,

  // 主题配置
  theme: {
    token: {
      // 主色
      colorPrimary: '#1976d2',
      // 圆角
      borderRadius: 6,
      // 字体
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif'
    },
    components: {
      // 可以在这里配置具体组件的样式
      Button: {
        borderRadius: 6
      },
      Input: {
        borderRadius: 6
      },
      Card: {
        borderRadius: 8
      }
    }
  },

  // 组件大小配置
  componentSize: 'middle'
};

/**
 * 获取 Ant Design 语言配置
 * @param {string} language - 语言代码
 * @returns {Object} Ant Design 语言配置
 */
export const getAntdLocale = (language) => {
  switch (language) {
    case 'en':
    case 'en_US':
      return enUS;
    case 'zh':
    case 'zh_CN':
    default:
      return zhCN;
  }
};

/**
 * Ant Design ConfigProvider 包装器组件
 */
export const AntdConfigProvider = ({ children, language = 'zh_CN' }) => {
  return (
    <ConfigProvider locale={getAntdLocale(language)} theme={antdConfig.theme} componentSize={antdConfig.componentSize}>
      {children}
    </ConfigProvider>
  );
};

export default antdConfig;
