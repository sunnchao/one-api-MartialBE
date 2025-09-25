import React from 'react';
import { Button, Input, Card, Space, Typography, message } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { AntdConfigProvider } from '../config/antdConfig';

const { Title, Text } = Typography;

/**
 * Ant Design 组件使用示例
 * 展示如何在项目中正确使用 Ant Design 组件
 */
const AntdExample = () => {
  const handleClick = () => {
    message.success('Ant Design 配置成功！');
  };

  return (
    <AntdConfigProvider>
      <div style={{ padding: 24 }}>
        <Card title="Ant Design 组件示例" style={{ marginBottom: 16 }}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div>
              <Title level={4}>按钮示例</Title>
              <Space>
                <Button type="primary" onClick={handleClick}>
                  主要按钮
                </Button>
                <Button>默认按钮</Button>
                <Button type="dashed">虚线按钮</Button>
                <Button type="link">链接按钮</Button>
              </Space>
            </div>

            <div>
              <Title level={4}>输入框示例</Title>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Input placeholder="请输入内容" />
                <Input placeholder="搜索" prefix={<SearchOutlined />} style={{ width: 300 }} />
              </Space>
            </div>

            <div>
              <Title level={4}>文字示例</Title>
              <Space direction="vertical">
                <Text>普通文字</Text>
                <Text type="secondary">次要文字</Text>
                <Text type="success">成功文字</Text>
                <Text type="warning">警告文字</Text>
                <Text type="danger">危险文字</Text>
              </Space>
            </div>
          </Space>
        </Card>
      </div>
    </AntdConfigProvider>
  );
};

export default AntdExample;
