import React, { useEffect, useState } from 'react';
import { showError, showNotice } from '@/utils/common';
import { API } from '@/utils/api';
import { marked } from 'marked';
import BaseIndex from './baseIndex';
import { Box } from '@mui/material';
import HomeContent from './HomeContent';

const Home = () => {
  const [homePageContentLoaded, setHomePageContentLoaded] = useState(false);
  const [homePageContent, setHomePageContent] = useState('');
  const displayNotice = async () => {
    try {
      const res = await API.get('/api/notice');
      const { success, message, data } = res.data;
      if (success) {
        let oldNotice = localStorage.getItem('notice');
        if (data !== oldNotice && data !== '') {
          const htmlNotice = marked(data);
          showNotice(htmlNotice, true);
          localStorage.setItem('notice', data);
        }
      } else {
        showError(message);
      }
    } catch (error) {
      return;
    }
  };

  const displayHomePageContent = async () => {
    setHomePageContent(localStorage.getItem('home_page_content') || '');
    try {
      const res = await API.get('/api/home_page_content');
      const { success, message, data } = res.data;
      if (success) {
        let content = data;
        if (!data.startsWith('https://')) {
          content = marked.parse(data);
        }
        setHomePageContent(content);
        localStorage.setItem('home_page_content', content);
      } else {
        showError(message);
        setHomePageContent('加载首页内容失败...');
      }
      setHomePageContentLoaded(true);
    } catch (error) {
      return;
    }
  };

  useEffect(() => {
    displayNotice().then();
    displayHomePageContent().then();
  }, []);

  return (
    <>
      <HomeContent />
    </>
  );
};

export default Home;
