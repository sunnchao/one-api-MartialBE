'use client';

import React from 'react';
import { Row, Col } from 'antd';
import SystemLogs from './components/SystemLogs';

export default function SystemInfoPage() {
  return (
    <div style={{ padding: 0 }}>
      <Row gutter={[0, 0]}>
        <Col span={24}>
          <SystemLogs />
        </Col>
      </Row>
    </div>
  );
}
