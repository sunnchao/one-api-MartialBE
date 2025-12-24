'use client';

import React, { useState } from 'react';
import { Layout, Typography, Button, Space, Row, Col, Card, Tabs, List, Avatar, Divider, Alert } from 'antd';
import { 
  RocketOutlined, SearchOutlined, BugOutlined, ReadOutlined, 
  CodeOutlined, ArrowRightOutlined, StarOutlined
} from '@ant-design/icons';
import { FaWindows, FaApple, FaLinux } from 'react-icons/fa';
import CodeBlock from '@/components/CodeBlock';

const { Content } = Layout;
const { Title, Paragraph, Text } = Typography;

interface GeminiCodeContentProps {
    isPanel?: boolean;
}

export default function GeminiCodeContent({ isPanel = false }: GeminiCodeContentProps) {
  const [activeTab, setActiveTab] = useState('features');
  const [osTab, setOsTab] = useState('windows');

  const features = [
    {
      icon: <RocketOutlined style={{ fontSize: 32, color: '#1677ff' }} />,
      title: '超大上下文窗口',
      description: '1M tokens 上下文，处理超大规模项目'
    },
    {
      icon: <SearchOutlined style={{ fontSize: 32, color: '#722ed1' }} />,
      title: 'Agent Mode',
      description: '自动规划任务，智能执行复杂操作'
    },
    {
      icon: <BugOutlined style={{ fontSize: 32, color: '#ff4d4f' }} />,
      title: 'Google Search',
      description: '实时联网搜索，获取最新信息'
    },
    {
      icon: <ReadOutlined style={{ fontSize: 32, color: '#52c41a' }} />,
      title: 'Git 集成',
      description: '自动生成提交信息和代码审查'
    },
    {
      icon: <CodeOutlined style={{ fontSize: 32, color: '#faad14' }} />,
      title: 'Gemini 3 Pro',
      description: 'Google AI 最新模型驱动'
    }
  ];

  const renderTutorial = (os: string) => {
      return (
          <div style={{ padding: 24, textAlign: 'center' }}>
              <Title level={4}>{os === 'windows' ? 'Windows' : os === 'macos' ? 'macOS' : 'Linux'} 安装指南</Title>
              <Paragraph>详细安装步骤请参考官方文档或后续补充。</Paragraph>
              <div style={{ background: '#f5f5f5', padding: 16, borderRadius: 8, fontFamily: 'monospace', textAlign: 'left', margin: '0 auto', maxWidth: 600 }}>
                  npm install -g @google/gemini-cli
              </div>
          </div>
      );
  };

  const renderConfigTutorial = () => (
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <Title level={isPanel ? 3 : 2} style={{ textAlign: 'center', marginBottom: 16 }}>配置 Gemini CLI</Title>
          <Alert 
            message="重要提示：请将 GEMINI_API_KEY 替换为您在控制台生成的 Gemini CLI 专用 API 密钥！" 
            type="warning" 
            showIcon 
            style={{ marginBottom: 24 }}
          />

          <Card style={{ marginBottom: 24 }}>
              <Title level={4}>步骤 1：创建 .gemini 文件夹</Title>
              <Paragraph>配置位置：%USERPROFILE%\.gemini\</Paragraph>
              <CodeBlock 
                code={`# Windows CMD
mkdir %USERPROFILE%\\.gemini

# Windows PowerShell
mkdir $env:USERPROFILE\\.gemini

# macOS/Linux
mkdir -p ~/.gemini`} 
                language="bash" 
              />
          </Card>

          <Card style={{ marginBottom: 24 }}>
              <Title level={4}>步骤 2：创建 .env 文件</Title>
              <CodeBlock 
                code={`GOOGLE_GEMINI_BASE_URL=https://api.wochirou.com/gemini
GEMINI_API_KEY=粘贴为Gemini CLI专用分组令牌key
GEMINI_MODEL=gemini-3-pro-preview`} 
                language="bash" 
              />
          </Card>
      </div>
  );

  return (
    <>
      {/* Hero Section */}
      {!isPanel && (
      <div style={{ 
          background: 'linear-gradient(135deg, rgba(22,119,255,0.05) 0%, rgba(114,46,209,0.05) 100%)',
          padding: '80px 24px',
          textAlign: 'center',
          borderBottom: '1px solid #f0f0f0'
      }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
              <Space direction="vertical" size={24}>
                  <div style={{ 
                      display: 'inline-block', 
                      padding: '4px 12px', 
                      background: '#e6f7ff', 
                      color: '#1677ff', 
                      borderRadius: 20, 
                      fontWeight: 600,
                      border: '1px solid #91caff'
                  }}>
                      <StarOutlined /> Gemini 3 Pro 强力驱动
                  </div>
                  <Title level={1} style={{ fontSize: '3.5rem', marginBottom: 0 }}>
                      Gemini Code <br/>
                      <span style={{ color: '#1677ff' }}>Google AI 编程助手</span>
                  </Title>
                  <Paragraph style={{ fontSize: '1.25rem', color: 'rgba(0,0,0,0.65)', maxWidth: 800, margin: '0 auto' }}>
                      拥有 1M tokens 超大上下文窗口，支持多模态输入。<br/>
                      内置 Agent Mode 和 Google Search，重新定义 AI 辅助编程。
                  </Paragraph>
                  <Space size="middle">
                      <Button type="primary" size="large" onClick={() => setActiveTab('install')}>
                          立即开始 <ArrowRightOutlined />
                      </Button>
                      <Button type="text" size="large" onClick={() => window.open('https://deepmind.google/technologies/gemini/', '_blank')}>
                          了解更多
                      </Button>
                  </Space>
              </Space>
          </div>
      </div>
      )}

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: isPanel ? '0' : '48px 24px', width: '100%' }}>
          <Tabs 
            activeKey={activeTab} 
            onChange={setActiveTab} 
            centered
            size="large"
            items={[
                { key: 'features', label: '功能概览' },
                { key: 'install', label: '安装 CLI' },
                { key: 'config', label: '配置密钥' },
                { key: 'usage', label: '开始编程' }
            ]}
            style={{ marginBottom: 48 }}
          />

          {activeTab === 'features' && (
              <div>
                  <Title level={isPanel ? 3 : 2} style={{ textAlign: 'center', marginBottom: 48 }}>为什么选择 Gemini Code?</Title>
                  <Row gutter={[24, 24]}>
                      {features.map((feature, i) => (
                          <Col xs={24} sm={12} md={8} key={i}>
                              <Card hoverable style={{ height: '100%' }}>
                                  <div style={{ marginBottom: 16 }}>{feature.icon}</div>
                                  <Title level={4}>{feature.title}</Title>
                                  <Paragraph type="secondary">{feature.description}</Paragraph>
                              </Card>
                          </Col>
                      ))}
                  </Row>
              </div>
          )}

          {activeTab === 'install' && (
              <div>
                  <Title level={isPanel ? 3 : 2} style={{ textAlign: 'center', marginBottom: 16 }}>安装 Gemini CLI</Title>
                  <Paragraph style={{ textAlign: 'center', marginBottom: 48, color: 'rgba(0,0,0,0.45)' }}>
                      选择您的操作系统，查看对应的安装教程
                  </Paragraph>
                  
                  <Card>
                      <Tabs 
                        activeKey={osTab}
                        onChange={setOsTab}
                        centered
                        items={[
                            { key: 'windows', label: <span><FaWindows style={{ marginRight: 8 }} />Windows</span>, children: renderTutorial('windows') },
                            { key: 'macos', label: <span><FaApple style={{ marginRight: 8 }} />macOS</span>, children: renderTutorial('macos') },
                            { key: 'linux', label: <span><FaLinux style={{ marginRight: 8 }} />Linux</span>, children: renderTutorial('linux') }
                        ]}
                      />
                  </Card>
              </div>
          )}

          {activeTab === 'config' && renderConfigTutorial()}

          {activeTab === 'usage' && (
              <div style={{ maxWidth: 800, margin: '0 auto' }}>
                  <Title level={isPanel ? 3 : 2} style={{ textAlign: 'center', marginBottom: 16 }}>启动 Gemini CLI</Title>
                  
                  <Alert 
                    message="配置完成后，运行以下命令开始使用 Gemini CLI" 
                    type="success" 
                    showIcon 
                    style={{ marginBottom: 24 }}
                  />

                  <Card>
                      <Title level={4}>启动命令</Title>
                      <CodeBlock code="gemini" language="bash" />
                  </Card>
              </div>
          )}
      </div>
    </>
  );
}
