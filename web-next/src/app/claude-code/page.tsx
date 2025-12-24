'use client';

import React from 'react';
import { Layout } from 'antd';
import ClaudeCodeContent from './content';

export default function ClaudeCodePage() {
  return (
    <Layout style={{ minHeight: '100vh', background: '#fff' }}>
      <ClaudeCodeContent />
    </Layout>
  );
}
