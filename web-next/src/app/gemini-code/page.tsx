'use client';

import React from 'react';
import { Layout } from 'antd';
import GeminiCodeContent from './content';

export default function GeminiCodePage() {
  return (
    <Layout style={{ minHeight: '100vh', background: '#fff' }}>
      <GeminiCodeContent />
    </Layout>
  );
}
