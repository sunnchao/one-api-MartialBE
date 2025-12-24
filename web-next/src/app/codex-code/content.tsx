'use client';

import React, { useState } from 'react';
import { Layout, Typography, Button, Space, Row, Col, Card, Tabs, List, Avatar, Divider, Alert } from 'antd';
import { 
  RocketOutlined, SearchOutlined, BugOutlined, ReadOutlined, 
  CodeOutlined, ArrowRightOutlined, StarOutlined
} from '@ant-design/icons';
import { FaWindows, FaApple, FaLinux } from 'react-icons/fa';

const { Content } = Layout;
const { Title, Paragraph, Text } = Typography;

interface CodexCodeContentProps {
    isPanel?: boolean;
}

export default function CodexCodeContent({ isPanel = false }: CodexCodeContentProps) {
  const [activeTab, setActiveTab] = useState('features');
  const [osTab, setOsTab] = useState('windows');

  const features = [
    {
      icon: <RocketOutlined style={{ fontSize: 32, color: '#1677ff' }} />,
      title: '智能代码生成',
      description: '基于 GPT-5.1 的高质量代码生成和智能补全'
    },
    {
      icon: <SearchOutlined style={{ fontSize: 32, color: '#722ed1' }} />,
      title: '深度分析',
      description: '深度分析和理解整个代码库结构'
    },
    {
      icon: <BugOutlined style={{ fontSize: 32, color: '#ff4d4f' }} />,
      title: '智能重构',
      description: '智能重构代码，应用最佳设计模式'
    },
    {
      icon: <ReadOutlined style={{ fontSize: 32, color: '#52c41a' }} />,
      title: 'Git 集成',
      description: '自动生成提交信息和代码审查'
    },
    {
      icon: <CodeOutlined style={{ fontSize: 32, color: '#faad14' }} />,
      title: 'GPT-5 驱动',
      description: '企业级 AI 编程助手，强大的推理能力'
    }
  ];

  const renderTutorial = (os: string) => {
      return (
          <div style={{ padding: 24, textAlign: 'center' }}>
              <Title level={4}>{os === 'windows' ? 'Windows' : os === 'macos' ? 'macOS' : 'Linux'} 安装指南</Title>
              <Paragraph>详细安装步骤请参考官方文档或后续补充。</Paragraph>
              <div style={{ background: '#f5f5f5', padding: 16, borderRadius: 8, fontFamily: 'monospace', textAlign: 'left', margin: '0 auto', maxWidth: 600 }}>
                  npm install -g @openai/codex-cli
              </div>
          </div>
      );
  };

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
                      <StarOutlined /> GPT-5.1 强力驱动
                  </div>
                  <Title level={1} style={{ fontSize: '3.5rem', marginBottom: 0 }}>
                      CodeX <br/>
                      <span style={{ color: '#1677ff' }}>企业级 AI 编程助手</span>
                  </Title>
                  <Paragraph style={{ fontSize: '1.25rem', color: 'rgba(0,0,0,0.65)', maxWidth: 800, margin: '0 auto' }}>
                      不仅仅是代码补全，而是真正的结对编程伙伴。<br/>
                      基于 GPT-5.1 模型，提供深度代码分析和智能重构能力。
                  </Paragraph>
                  <Space size="middle">
                      <Button type="primary" size="large" onClick={() => setActiveTab('install')}>
                          立即开始 <ArrowRightOutlined />
                      </Button>
                      <Button type="text" size="large" onClick={() => window.open('https://openai.com/blog/openai-codex', '_blank')}>
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
                { key: 'install', label: '环境准备' },
                { key: 'vscode', label: 'VSCode 配置' }
            ]}
            style={{ marginBottom: 48 }}
          />

          {activeTab === 'features' && (
              <div>
                  <Title level={isPanel ? 3 : 2} style={{ textAlign: 'center', marginBottom: 48 }}>为什么选择 CodeX?</Title>
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
                  <Title level={isPanel ? 3 : 2} style={{ textAlign: 'center', marginBottom: 16 }}>CodeX 安装步骤</Title>
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

          {activeTab === 'vscode' && (
              <div style={{ maxWidth: 800, margin: '0 auto' }}>
                  <Title level={isPanel ? 3 : 2} style={{ textAlign: 'center', marginBottom: 16 }}>VSCode 配置</Title>
                  <Card>
                      <Title level={4}>插件安装</Title>
                      <Paragraph>
                          在 VSCode 扩展市场搜索 "CodeX" 并安装官方插件。
                      </Paragraph>
                      <Button onClick={() => window.open('vscode:extension/openai.codex', '_blank')}>打开 VSCode 安装</Button>
                  </Card>
              </div>
          )}
      </div>
    </>
  );
}
