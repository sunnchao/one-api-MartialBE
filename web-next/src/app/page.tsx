'use client';

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, Typography, Button, Space, Row, Col, Avatar, Tabs, Tooltip } from 'antd';
import { 
  ThunderboltOutlined, SafetyOutlined, ApiOutlined, 
  GlobalOutlined, RocketOutlined, CheckCircleFilled,
  CopyOutlined, CheckOutlined, RightOutlined
} from '@ant-design/icons';
import { useSelector } from 'react-redux';
import TopNav from '@/components/TopNav';

const { Content } = Layout;
const { Title, Paragraph } = Typography;

export default function HomePage() {
  const navigate = useNavigate();
  // @ts-ignore
  const siteInfo = useSelector((state) => state.siteInfo);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('curl');

  const models = [
    { id: 1, name: 'OpenAI', icon: 'https://registry.npmmirror.com/@lobehub/icons-static-webp/latest/files/dark/openai.webp' },
    { id: 11, name: 'Gemini', icon: 'https://registry.npmmirror.com/@lobehub/icons-static-webp/latest/files/dark/gemini.webp' },
    { id: 14, name: 'Claude', icon: 'https://registry.npmmirror.com/@lobehub/icons-static-webp/latest/files/dark/claude.webp' },
    { id: 34, name: 'Midjourney', icon: 'https://registry.npmmirror.com/@lobehub/icons-static-webp/latest/files/dark/midjourney.webp' },
    { id: 16, name: 'Meta', icon: 'https://registry.npmmirror.com/@lobehub/icons-static-webp/latest/files/dark/meta.webp' },
    { id: 28, name: 'DeepSeek', icon: 'https://registry.npmmirror.com/@lobehub/icons-static-webp/latest/files/dark/deepseek.webp' },
    { id: 17, name: 'Qwen', icon: 'https://registry.npmmirror.com/@lobehub/icons-static-webp/latest/files/dark/qwen.webp' },
  ];

  const handleCopy = () => {
    navigator.clipboard.writeText('https://api.wochirou.com');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const codeSnippets = {
    curl: `curl https://api.wochirou.com/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer sk-..." \\
  -d '{
    "model": "gpt-4-turbo",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'`,
    python: `import openai

client = openai.OpenAI(
    base_url="https://api.wochirou.com/v1",
    api_key="sk-..."
)

response = client.chat.completions.create(
    model="gpt-4-turbo",
    messages=[{"role": "user", "content": "Hello!"}]
)
print(response.choices[0].message.content)`,
    node: `import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: "https://api.wochirou.com/v1",
  apiKey: "sk-..."
});

const completion = await openai.chat.completions.create({
  messages: [{ role: "user", content: "Hello!" }],
  model: "gpt-4-turbo",
});

console.log(completion.choices[0].message);`
  };

  return (
    <div style={{ background: '#030014', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      {/* Background Ambience */}
      <div className="bg-noise" />
      <div className="blob blob-purple" style={{ top: '-10%', left: '20%', width: '500px', height: '500px' }} />
      <div className="blob blob-cyan" style={{ bottom: '10%', right: '10%', width: '600px', height: '600px' }} />
      
      <Content style={{ position: 'relative', zIndex: 1 }}>
        
        <TopNav variant="dark" />

        {/* Hero Section */}
        <div style={{ padding: '100px 20px', textAlign: 'center' }}>
          <div className="animate-fade-up" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ 
              display: 'inline-block', padding: '6px 16px', borderRadius: '50px', 
              background: 'rgba(92, 108, 255, 0.1)', border: '1px solid rgba(92, 108, 255, 0.2)',
              color: '#b8c6ff', fontSize: '14px', marginBottom: '24px', fontWeight: 500
            }}>
              ✨ 下一代 AI 接口服务平台
            </div>
            
            <Title level={1} style={{ fontSize: 'clamp(3rem, 6vw, 4.5rem)', color: '#fff', marginBottom: '24px', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
              释放 AI 模型的 <br />
              <span className="text-gradient">无限潜能</span>
            </Title>
            
            <Paragraph style={{ fontSize: '1.25rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, marginBottom: '40px', maxWidth: '600px', margin: '0 auto 40px' }}>
              通过单一、可靠且可扩展的 API 接口，无缝接入 OpenAI、Claude、Gemini 等 100+ 全球主流大模型，助力您的业务腾飞。
            </Paragraph>
            
            <Space size="middle">
              <Button type="primary" size="large" onClick={() => navigate('/panel')} 
                style={{ height: '56px', padding: '0 40px', borderRadius: '50px', fontSize: '16px', fontWeight: 600, background: '#fff', color: '#000', border: 'none' }}>
                免费开始构建
              </Button>
              <Button size="large" onClick={() => document.getElementById('api-ref')?.scrollIntoView({behavior: 'smooth'})}
                style={{ height: '56px', padding: '0 40px', borderRadius: '50px', fontSize: '16px', color: '#fff', borderColor: 'rgba(255,255,255,0.2)', background: 'transparent' }}>
                查看文档 <RightOutlined style={{ fontSize: '12px' }} />
              </Button>
            </Space>
          </div>
        </div>

        {/* Code Window Showcase (Centered) */}
        <div className="animate-fade-up delay-200" style={{ maxWidth: '900px', margin: '0 auto 120px', padding: '0 20px' }}>
          <div className="glass-card" style={{ padding: '12px', background: 'rgba(0,0,0,0.4)', borderRadius: '16px', boxShadow: '0 0 0 1px rgba(255,255,255,0.1), 0 20px 60px -10px rgba(0,0,0,0.6)' }}>
            <div style={{ background: '#0e0e0e', borderRadius: '10px', overflow: 'hidden' }}>
              {/* Window Controls */}
              <div style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', background: '#1c1c1c', borderBottom: '1px solid #2a2a2a' }}>
                 <div style={{ display: 'flex', gap: '8px', marginRight: '20px' }}>
                   <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ff5f56' }} />
                   <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ffbd2e' }} />
                   <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#27c93f' }} />
                 </div>
                 
                 <div style={{ display: 'flex', gap: '20px' }}>
                    {Object.keys(codeSnippets).map(key => (
                      <div 
                        key={key} 
                        onClick={() => setActiveTab(key)}
                        style={{ 
                          cursor: 'pointer', 
                          fontSize: '13px', 
                          color: activeTab === key ? '#fff' : 'rgba(255,255,255,0.4)',
                          fontWeight: activeTab === key ? 600 : 400
                        }}
                      >
                        {key === 'curl' ? 'cURL' : (key === 'node' ? 'Node.js' : 'Python')}
                      </div>
                    ))}
                 </div>
              </div>
              
              {/* Code Content */}
              <div style={{ padding: '24px', fontFamily: 'var(--font-mono)', fontSize: '14px', lineHeight: 1.6, color: '#a9b7c6', overflowX: 'auto' }}>
                <pre style={{ margin: 0 }}>
                  {codeSnippets[activeTab as keyof typeof codeSnippets]}
                </pre>
              </div>
            </div>
            
            {/* Quick Copy Link Bar */}
            <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
               <div style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.8)', fontSize: '13px', border: '1px solid rgba(255,255,255,0.1)' }}>
                 https://api.wochirou.com
               </div>
               <Tooltip title={copied ? '已复制' : '复制接口地址'}>
                 <Button type="text" icon={copied ? <CheckOutlined style={{ color: '#52c41a' }} /> : <CopyOutlined style={{ color: '#fff' }} />} onClick={handleCopy} style={{ color: 'rgba(255,255,255,0.6)' }} />
               </Tooltip>
            </div>
          </div>
        </div>

        {/* Marquee */}
        <div style={{ marginBottom: '120px' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px', color: 'rgba(255,255,255,0.4)', fontSize: '14px', letterSpacing: '2px', textTransform: 'uppercase' }}>
             全球领先模型支持
          </div>
          <div className="marquee-container">
            <div className="marquee-track">
              {[...models, ...models, ...models].map((model, i) => (
                <div key={i} style={{ margin: '0 50px', opacity: 0.5, filter: 'grayscale(100%)', transition: 'all 0.3s' }} className="glass-card-hover">
                   <img src={model.icon} alt={model.name} style={{ width: '40px', height: '40px' }} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Features Bento */}
        <div style={{ maxWidth: '1200px', margin: '0 auto 160px', padding: '0 24px' }}>
          <Row gutter={[24, 24]}>
            <Col xs={24} md={12}>
               <div className="glass-card glass-card-hover" style={{ height: '100%', padding: '48px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                 <div style={{ width: '64px', height: '64px', background: 'rgba(92, 108, 255, 0.2)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '32px' }}>
                   <ThunderboltOutlined style={{ fontSize: '32px', color: '#5c6cff' }} />
                 </div>
                 <Title level={3} style={{ color: '#fff', fontSize: '28px' }}>全球边缘网络</Title>
                 <Paragraph style={{ fontSize: '16px', color: 'rgba(255,255,255,0.6)' }}>
                   智能路由引擎为每一个请求选择最优路径，确保极速响应体验。
                 </Paragraph>
               </div>
            </Col>
            
            <Col xs={24} md={12}>
              <Row gutter={[24, 24]}>
                <Col span={24}>
                  <div className="glass-card glass-card-hover" style={{ padding: '32px' }}>
                    <Space size={16} align="start">
                      <SafetyOutlined style={{ fontSize: '24px', color: '#52c41a' }} />
                      <div>
                        <Title level={4} style={{ color: '#fff', marginTop: 0 }}>企业级安全保障</Title>
                        <Paragraph style={{ margin: 0, color: 'rgba(255,255,255,0.6)' }}>符合 SOC2 标准的基础设施，提供端到端数据加密保护。</Paragraph>
                      </div>
                    </Space>
                  </div>
                </Col>
                <Col span={24}>
                  <div className="glass-card glass-card-hover" style={{ padding: '32px' }}>
                    <Space size={16} align="start">
                      <GlobalOutlined style={{ fontSize: '24px', color: '#ffbd2e' }} />
                      <div>
                        <Title level={4} style={{ color: '#fff', marginTop: 0 }}>一键接入所有模型</Title>
                        <Paragraph style={{ margin: 0, color: 'rgba(255,255,255,0.6)' }}>仅需一个 API 密钥，即可畅享 GPT-5.2、Claude 4.5 和 Gemini 3 Pro 等顶级模型。</Paragraph>
                      </div>
                    </Space>
                  </div>
                </Col>
                <Col span={24}>
                  <div className="glass-card glass-card-hover" style={{ padding: '32px' }}>
                    <Space size={16} align="start">
                      <ApiOutlined style={{ fontSize: '24px', color: '#ff5f56' }} />
                      <div>
                         <Title level={4} style={{ color: '#fff', marginTop: 0 }}>99.99% 服务可用性</Title>
                         <Paragraph style={{ margin: 0, color: 'rgba(255,255,255,0.6)' }}>全冗余基础设施架构，确保您的业务永不停歇。</Paragraph>
                      </div>
                    </Space>
                  </div>
                </Col>
              </Row>
            </Col>
          </Row>
        </div>

        {/* Final CTA */}
        <div style={{ textAlign: 'center', padding: '0 20px 120px' }}>
          <div style={{ 
            background: 'linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 100%)', 
            borderRadius: '32px', 
            padding: '80px 20px', 
            maxWidth: '1000px', 
            margin: '0 auto',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <Title level={2} style={{ color: '#fff', fontSize: '36px', marginBottom: '24px' }}>准备好发布您的 AI 应用了吗？</Title>
            <Paragraph style={{ fontSize: '18px', color: 'rgba(255,255,255,0.6)', marginBottom: '40px' }}>
              立即加入AI开发者的行列，使用 Chirou API 构建未来。
            </Paragraph>
            <Button type="primary" size="large" onClick={() => navigate('/register')} 
              style={{ height: '60px', padding: '0 50px', borderRadius: '30px', fontSize: '18px', fontWeight: 600, background: '#fff', color: '#000', border: 'none' }}>
              立即开始
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '40px 0', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '14px' }}>
           © {new Date().getFullYear()} Chirou API. Powered by OneAPI.
        </div>

      </Content>
    </div>
  );
}
