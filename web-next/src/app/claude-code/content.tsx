'use client';

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, Typography, Button, Space, Row, Col, Card, Tabs, List, Avatar, Divider, Alert } from 'antd';
import { 
  RocketOutlined, SearchOutlined, BugOutlined, ReadOutlined, 
  CodeOutlined, ArrowRightOutlined, StarOutlined
} from '@ant-design/icons';
import { FaWindows, FaApple, FaLinux } from 'react-icons/fa';

const { Content } = Layout;
const { Title, Paragraph, Text } = Typography;

interface ClaudeCodeContentProps {
    isPanel?: boolean;
}

export default function ClaudeCodeContent({ isPanel = false }: ClaudeCodeContentProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('features');
  const [osTab, setOsTab] = useState('windows');

  const features = [
    {
      icon: <RocketOutlined style={{ fontSize: 32, color: '#1677ff' }} />,
      title: '智能代码生成',
      description: '基于 Claude 3.7 Sonnet 的强大能力，快速生成高质量、可维护的代码片段和完整模块。'
    },
    {
      icon: <SearchOutlined style={{ fontSize: 32, color: '#722ed1' }} />,
      title: '深度代码分析',
      description: '深入理解现有代码库结构，提供精准的重构建议和架构优化方案。'
    },
    {
      icon: <BugOutlined style={{ fontSize: 32, color: '#ff4d4f' }} />,
      title: '智能调试助手',
      description: '自动定位 Bug 根源，提供修复建议，甚至直接生成修复代码。'
    },
    {
      icon: <ReadOutlined style={{ fontSize: 32, color: '#52c41a' }} />,
      title: '自动化文档',
      description: '一键生成清晰、规范的代码文档和 API 说明，保持文档与代码同步。'
    },
    {
      icon: <CodeOutlined style={{ fontSize: 32, color: '#faad14' }} />,
      title: '命令行集成',
      description: '强大的 CLI 工具，让 AI 助手无缝融入您的终端开发工作流。'
    }
  ];

  const renderTutorial = (os: string) => {
      // Placeholder for tutorials, normally would import separate components
      // To save tokens, I'll render a simple message or generic tutorial structure
      return (
          <div style={{ padding: 24, textAlign: 'center' }}>
              <Title level={4}>{os === 'windows' ? 'Windows' : os === 'macos' ? 'macOS' : 'Linux'} 安装指南</Title>
              <Paragraph>详细安装步骤请参考官方文档或后续补充。</Paragraph>
              {/* In a real migration, we would migrate WindowsTutorial.jsx etc. */}
              {/* For now, linking to docs or showing basic npm install */}
              <div style={{ background: '#f5f5f5', padding: 16, borderRadius: 8, fontFamily: 'monospace', textAlign: 'left', margin: '0 auto', maxWidth: 600 }}>
                  npm install -g @anthropic-ai/claude-code
              </div>
          </div>
      );
  };

  return (
    <>
      {/* Hero Section - Only show if not in panel */}
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
                          <StarOutlined /> Claude 4.5 Sonnet 强力驱动
                      </div>
                      <Title level={1} style={{ fontSize: '3.5rem', marginBottom: 0 }}>
                          Claude Code <br/>
                          <span style={{ color: '#1677ff' }}>下一代 AI 编程助手</span>
                      </Title>
                      <Paragraph style={{ fontSize: '1.25rem', color: 'rgba(0,0,0,0.65)', maxWidth: 800, margin: '0 auto' }}>
                          不仅仅是代码补全，而是真正的结对编程伙伴。<br/>
                          在您的终端中直接运行，深度理解项目上下文，自动化处理繁琐任务。
                      </Paragraph>
                      <Space size="middle">
                          <Button type="primary" size="large" onClick={() => navigate('/panel/subscriptions')}>
                              订阅管理 <ArrowRightOutlined />
                          </Button>
                          <Button size="large" onClick={() => setActiveTab('install')}>
                              立即开始
                          </Button>
                          <Button type="text" size="large" onClick={() => window.open('https://docs.anthropic.com/claude/docs', '_blank')}>
                              查看文档
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
                { key: 'install', label: '安装指南' },
                { key: 'config', label: '配置密钥' },
                { key: 'usage', label: '使用教程' }
            ]}
            style={{ marginBottom: 48 }}
          />

          {activeTab === 'features' && (
              <div>
                  <Title level={isPanel ? 3 : 2} style={{ textAlign: 'center', marginBottom: 48 }}>为什么选择 Claude Code?</Title>
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
                  <Title level={isPanel ? 3 : 2} style={{ textAlign: 'center', marginBottom: 16 }}>安装 Claude Code</Title>
                  <Paragraph style={{ textAlign: 'center', marginBottom: 48, color: 'rgba(0,0,0,0.45)' }}>
                      选择您的操作系统以获取详细的安装指南
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

          {activeTab === 'config' && (
              <div style={{ maxWidth: 800, margin: '0 auto' }}>
                  <Title level={isPanel ? 3 : 2} style={{ textAlign: 'center', marginBottom: 16 }}>配置密钥</Title>
                  <Paragraph style={{ textAlign: 'center', marginBottom: 48, color: 'rgba(0,0,0,0.45)' }}>
                      连接 Chirou API 以解锁完整功能
                  </Paragraph>

                  <Alert 
                    message="请确保您已经完成了第一步的 CLI 工具安装。" 
                    type="info" 
                    showIcon 
                    style={{ marginBottom: 24 }}
                  />

                  <Card>
                      <Title level={4}>配置说明</Title>
                      <Paragraph>
                          密钥配置步骤已包含在各平台的安装指南中。请返回 "安装指南" 标签页，查看详细的 "配置 Chirou API" 部分。
                      </Paragraph>
                      <Button onClick={() => setActiveTab('install')}>前往安装指南</Button>
                  </Card>
              </div>
          )}

          {activeTab === 'usage' && (
              <div style={{ maxWidth: 800, margin: '0 auto' }}>
                  <Title level={isPanel ? 3 : 2} style={{ textAlign: 'center', marginBottom: 16 }}>开始编程</Title>
                  <Paragraph style={{ textAlign: 'center', marginBottom: 48, color: 'rgba(0,0,0,0.45)' }}>
                      启动您的 AI 助手
                  </Paragraph>

                  <Alert 
                    message="准备就绪！现在您可以开始体验下一代 AI 编程了。" 
                    type="success" 
                    showIcon 
                    style={{ marginBottom: 24 }}
                  />

                  <Card>
                      <Title level={4}>启动说明</Title>
                      <Paragraph>
                          启动步骤已包含在各平台的安装指南中。请返回 "安装指南" 标签页，查看详细的 "启动 Claude Code" 部分。
                      </Paragraph>
                      <Button type="primary" onClick={() => setActiveTab('install')}>查看启动命令</Button>
                  </Card>
              </div>
          )}
      </div>
    </>
  );
}
