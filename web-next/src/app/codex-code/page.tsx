'use client';

import React from 'react';
import { Layout } from 'antd';
import CodexCodeContent from './content';

export default function CodexCodePage() {
  return (
    <Layout style={{ minHeight: '100vh', background: '#fff' }}>
      <CodexCodeContent />
    </Layout>
  );
}
