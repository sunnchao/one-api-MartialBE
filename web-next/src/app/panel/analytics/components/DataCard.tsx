'use client';

import React from 'react';
import { Card, Typography, Skeleton } from 'antd';

const { Title, Text } = Typography;

interface DataCardProps {
  isLoading: boolean;
  title: string;
  content: string | number;
  subContent: React.ReactNode;
}

export default function DataCard({ isLoading, title, content, subContent }: DataCardProps) {
  return (
    <Card 
        variant="borderless"
        style={{ 
            height: '100%', 
            borderRadius: 8,
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)'
        }}
    >
        <Skeleton loading={isLoading} active>
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Text type="secondary" style={{ fontSize: 14, marginBottom: 8 }}>{title}</Text>
                <Title level={3} style={{ margin: '0 0 16px 0' }}>{content}</Title>
                <div style={{ marginTop: 'auto' }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>{subContent}</Text>
                </div>
            </div>
        </Skeleton>
    </Card>
  );
}
