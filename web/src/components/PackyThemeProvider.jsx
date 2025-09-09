import React, { createContext, useContext, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { SET_THEME } from 'store/actions';

const PackyThemeContext = createContext();

export const usePackyTheme = () => {
  const context = useContext(PackyThemeContext);
  if (!context) {
    throw new Error('usePackyTheme must be used within a PackyThemeProvider');
  }
  return context;
};

const PackyThemeProvider = ({ children }) => {
  const dispatch = useDispatch();
  const customization = useSelector((state) => state.customization);
  const [systemTheme, setSystemTheme] = useState('light');

  // 检测系统主题偏好
  const detectSystemTheme = () => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      return isDark ? 'dark' : 'light';
    }
    return 'light';
  };

  // 监听系统主题变化
  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

      const handleChange = (e) => {
        const newSystemTheme = e.matches ? 'dark' : 'light';
        setSystemTheme(newSystemTheme);

        // 如果用户选择了跟随系统主题，则自动切换
        const storedTheme = localStorage.getItem('theme');
        if (!storedTheme || storedTheme === 'system') {
          dispatch({ type: SET_THEME, theme: newSystemTheme });
          localStorage.setItem('theme', 'system');
        }
      };

      // 初始检测
      setSystemTheme(detectSystemTheme());

      // 监听变化
      mediaQuery.addEventListener('change', handleChange);

      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [dispatch]);

  // 初始化主题
  useEffect(() => {
    const storedTheme = localStorage.getItem('theme');

    if (!storedTheme || storedTheme === 'system') {
      // 如果没有存储的主题或者是系统主题，使用系统检测的主题
      const currentSystemTheme = detectSystemTheme();
      dispatch({ type: SET_THEME, theme: currentSystemTheme });
      localStorage.setItem('theme', 'system');
    } else {
      // 使用存储的主题
      dispatch({ type: SET_THEME, theme: storedTheme });
    }
  }, [dispatch]);

  // 切换主题的函数
  const toggleTheme = () => {
    const currentTheme = customization.theme;
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    dispatch({ type: SET_THEME, theme: newTheme });
    localStorage.setItem('theme', newTheme);
  };

  // 设置特定主题
  const setTheme = (theme) => {
    if (theme === 'system') {
      const currentSystemTheme = detectSystemTheme();
      dispatch({ type: SET_THEME, theme: currentSystemTheme });
      localStorage.setItem('theme', 'system');
    } else {
      dispatch({ type: SET_THEME, theme: theme });
      localStorage.setItem('theme', theme);
    }
  };

  const contextValue = {
    theme: customization.theme,
    systemTheme,
    toggleTheme,
    setTheme,
    isSystemTheme: localStorage.getItem('theme') === 'system'
  };

  return <PackyThemeContext.Provider value={contextValue}>{children}</PackyThemeContext.Provider>;
};

export default PackyThemeProvider;
