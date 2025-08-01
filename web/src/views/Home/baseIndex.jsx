import { useNavigate } from 'react-router';
import { useRef, useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Box, Typography, Button, Container, Stack, Tooltip, IconButton } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import {
  Bolt,
  Cloud,
  Security,
  SyncAlt,
  Shield,
  Brush,
  ArrowRightAlt,
  MailOutline,
  Forum,
  Telegram,
  ContentCopy,
  Check
} from '@mui/icons-material';
import { keyframes } from '@mui/system';

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const textAnimation = keyframes`
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  20% {
    opacity: 1;
    transform: translateY(0);
  }
  80% {
    opacity: 1;
    transform: translateY(0);
  }
  100% {
    opacity: 0;
    transform: translateY(-20px);
  }
`;

const BaseIndex = () => {
  const navigate = useNavigate();
  const advantagesRef = useRef(null);
  const [copied, setCopied] = useState(false);
  const [currentEndpointIndex, setCurrentEndpointIndex] = useState(0);
  const [models] = useState([
    { id: 1, name: 'OpenAI', icon: 'https://registry.npmmirror.com/@lobehub/icons-static-webp/latest/files/dark/openai.webp' },
    { id: 11, name: 'Google Gemini', icon: 'https://registry.npmmirror.com/@lobehub/icons-static-webp/latest/files/dark/gemini.webp' },
    { id: 14, name: 'Anthropic', icon: 'https://registry.npmmirror.com/@lobehub/icons-static-webp/latest/files/dark/claude.webp' },
    { id: 15, name: 'Baidu', icon: 'https://registry.npmmirror.com/@lobehub/icons-static-webp/latest/files/dark/wenxin.webp' },
    { id: 16, name: 'Zhipu', icon: 'https://registry.npmmirror.com/@lobehub/icons-static-webp/latest/files/dark/zhipu.webp' },
    { id: 17, name: 'Qwen', icon: 'https://registry.npmmirror.com/@lobehub/icons-static-webp/latest/files/dark/qwen.webp' },
    { id: 18, name: 'Spark', icon: 'https://registry.npmmirror.com/@lobehub/icons-static-webp/latest/files/dark/spark.webp' },
    // { id: 19, name: '360', icon: 'https://registry.npmmirror.com/@lobehub/icons-static-webp/latest/files/dark/ai360.webp' },
    // { id: 20, name: 'OpenRouter', icon: 'https://registry.npmmirror.com/@lobehub/icons-static-webp/latest/files/dark/openrouter.webp' },
    { id: 23, name: 'Tencent', icon: 'https://registry.npmmirror.com/@lobehub/icons-static-webp/latest/files/dark/hunyuan.webp' },
    // { id: 25, name: 'Google Gemini', icon: 'https://registry.npmmirror.com/@lobehub/icons-static-webp/latest/files/dark/gemini.webp' },
    // { id: 26, name: 'Baichuan', icon: 'https://registry.npmmirror.com/@lobehub/icons-static-webp/latest/files/dark/baichuan.webp' },
    { id: 27, name: 'MiniMax', icon: 'https://registry.npmmirror.com/@lobehub/icons-static-webp/latest/files/dark/minimax.webp' },
    { id: 28, name: 'Deepseek', icon: 'https://registry.npmmirror.com/@lobehub/icons-static-webp/latest/files/dark/deepseek.webp' },
    { id: 29, name: 'Moonshot', icon: 'https://registry.npmmirror.com/@lobehub/icons-static-webp/latest/files/dark/moonshot.webp' },
    // { id: 30, name: 'Mistral', icon: 'https://registry.npmmirror.com/@lobehub/icons-static-webp/latest/files/dark/mistral.webp' },
    { id: 31, name: 'Groq', icon: 'https://registry.npmmirror.com/@lobehub/icons-static-webp/latest/files/dark/groq.webp' },
    { id: 33, name: 'Yi', icon: 'https://registry.npmmirror.com/@lobehub/icons-static-webp/latest/files/dark/yi.webp' },
    { id: 34, name: 'Midjourney', icon: 'https://registry.npmmirror.com/@lobehub/icons-static-webp/latest/files/dark/midjourney.webp' },
    // { id: 35, name: 'Cloudflare AI', icon: 'https://registry.npmmirror.com/@lobehub/icons-static-webp/latest/files/dark/cloudflare.webp' },
    { id: 36, name: 'Cohere', icon: 'https://registry.npmmirror.com/@lobehub/icons-static-webp/latest/files/dark/cohere.webp' },
    // { id: 37, name: 'Stability AI', icon: 'https://registry.npmmirror.com/@lobehub/icons-static-webp/latest/files/dark/stability.webp' },
    { id: 38, name: 'Coze', icon: 'https://registry.npmmirror.com/@lobehub/icons-static-webp/latest/files/dark/coze.webp' },
    // { id: 39, name: 'Ollama', icon: 'https://registry.npmmirror.com/@lobehub/icons-static-webp/latest/files/dark/ollama.webp' },
    { id: 40, name: 'Hunyuan', icon: 'https://registry.npmmirror.com/@lobehub/icons-static-webp/latest/files/dark/hunyuan.webp' },
    // { id: 41, name: 'Suno', icon: 'https://registry.npmmirror.com/@lobehub/icons-static-webp/latest/files/dark/suno.webp' },
    // { id: 43, name: 'Meta', icon: 'https://registry.npmmirror.com/@lobehub/icons-static-webp/latest/files/dark/meta.webp' },
    // { id: 44, name: 'Ideogram', icon: 'https://registry.npmmirror.com/@lobehub/icons-static-webp/latest/files/dark/ideogram.webp' },
    // { id: 45, name: 'Siliconflow', icon: 'https://registry.npmmirror.com/@lobehub/icons-static-webp/latest/files/dark/siliconcloud.webp' },
    // { id: 46, name: 'Flux', icon: 'https://registry.npmmirror.com/@lobehub/icons-static-webp/latest/files/dark/flux.webp' },
    // { id: 47, name: 'Jina', icon: 'https://registry.npmmirror.com/@lobehub/icons-static-webp/latest/files/dark/jina.webp' },
    // { id: 51, name: 'RecraftAI', icon: 'https://registry.npmmirror.com/@lobehub/icons-static-webp/latest/files/dark/recraft.webp' },
    // { id: 53, name: 'Kling', icon: 'https://registry.npmmirror.com/@lobehub/icons-static-webp/latest/files/dark/kling.webp' },
    { id: 1001, name: 'Doubao', icon: 'https://registry.npmmirror.com/@lobehub/icons-static-webp/latest/files/dark/doubao.webp' },
    { id: 1002, name: 'Grok', icon: 'https://registry.npmmirror.com/@lobehub/icons-static-webp/latest/files/dark/grok.webp' },
    { id: 1003, name: '智谱清言', icon: 'https://registry.npmmirror.com/@lobehub/icons-static-webp/latest/files/dark/chatglm.webp' }
    // { id: 1004, name: 'Cursor', icon: 'https://registry.npmmirror.com/@lobehub/icons-static-webp/latest/files/dark/cursor.webp' },
    // { id: 1005, name: 'Kolors', icon: 'https://registry.npmmirror.com/@lobehub/icons-static-webp/latest/files/dark/kolors.webp' },
    // { id: 1006, name: 'OpenRouter', icon: 'https://registry.npmmirror.com/@lobehub/icons-static-webp/latest/files/dark/openrouter.webp' }
  ]);

  const endpoints = [
    '/v1/chat/completions',
    '/v1/responses',
    '/v1/images/generations',
    '/v1/embeddings',
    '/v1/audio/speech',
    '/mj/submit/imagine',
    '/claude/v1/messages',
    '/gemini/v1beta/models'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentEndpointIndex((prevIndex) => (prevIndex + 1) % endpoints.length);
    }, 3000); // Change endpoint every 3 seconds
    return () => clearInterval(interval);
  }, [endpoints.length]);

  const handleLearnMoreClick = () => {
    advantagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCopy = () => {
    const textToCopy = `https://api.wochirou.com${endpoints[currentEndpointIndex]}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <Helmet>
        <title>Chirou API - 企业级AI接口调用平台</title>
        <meta
          name="description"
          content="Chirou API，企业级AI接口调用平台，专为企业级需求打造，提供高性能、高并发、高可用的服务，一站式处理大规模数据和复杂任务。我们的稳定高并发处理能力和高可用性保证您的业务流畅运行，结合OpenAI, ClaudeAI, GeminiAI, Meta LLama, API等AI接口和专业的技术支持，为您的企业快速部署和实现AI接口应用，释放商业价值"
        />
        <meta name="keywords" content="Chirou API,OpenAI,Claude,Midjourney,Claude Code,高并发,高可用,高性能,企业级AI接口调用平台" />
        <script type="application/ld+json">
          {`
            {
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Chirou API",
              "url": "https://www.wochirou.com",
              "logo": "https://www.wochirou.com/logo.png",
              "description": "企业级AI接口调用平台，提供高性能、高并发、高可用的AI接口服务。"
            }
          `}
        </script>
      </Helmet>
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #1677ff 0%, #0d47a1 60%, #0d47a1 100%)',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)`,
            backgroundSize: '80px 80px',
            pointerEvents: 'none',
            opacity: 0.4
          }
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid
            container
            columns={12}
            alignItems="center"
            sx={{
              minHeight: '90vh',
              pt: { xs: 8, md: 0 }
            }}
          >
            <Grid xs={12} md={10} lg={8}>
              <Stack
                spacing={5}
                sx={{
                  animation: `${fadeIn} 1.2s ease-out`,
                  '& > *': {
                    animation: `${fadeIn} 1.2s ease-out`,
                    animationFillMode: 'both'
                  }
                }}
              >
                <Box
                  sx={{
                    display: 'inline-flex',
                    px: 2.5,
                    py: 1,
                    borderRadius: '50px',
                    background: 'rgba(255,255,255,0.08)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    width: 'fit-content',
                    animationDelay: '0.1s',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      color: '#90caf9',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}
                  >
                    <Box
                      component="span"
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: '#4fc3f7',
                        display: 'inline-block'
                      }}
                    />
                    全天候稳定运行 · 企业级可靠性
                  </Typography>
                </Box>

                <Typography
                  variant="h1"
                  sx={{
                    fontSize: { xs: '2.7rem', sm: '3.5rem', md: '4.2rem' },
                    fontWeight: 800,
                    background: 'linear-gradient(45deg, #fff 20%, #bbdefb 70%, #90caf9 100%)',
                    backgroundSize: '200% auto',
                    backgroundClip: 'text',
                    textFillColor: 'transparent',
                    letterSpacing: '-0.02em',
                    position: 'relative',
                    marginBottom: 1,
                    textShadow: '0 10px 30px rgba(0,0,0,0.2)',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      left: '-20px',
                      top: '15%',
                      width: '8px',
                      height: '70%',
                      background: 'linear-gradient(180deg, #64b5f6, transparent)',
                      borderRadius: '8px'
                    }
                  }}
                >
                  专业的AI大模型接口调用服务平台
                </Typography>
                <Typography
                  variant="h4"
                  sx={{
                    fontSize: { xs: '1.15rem', sm: '1.3rem' },
                    color: 'rgba(255, 255, 255, 0.9)',
                    lineHeight: 1.8,
                    maxWidth: '800px',
                    animationDelay: '0.3s',
                    letterSpacing: '0.01em',
                    fontWeight: 400
                  }}
                >
                  致力于提供高性能、高并发、高可用AI大模型接口调用服务平台，为个人和企业提供一站式AI解决方案
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(0, 0, 0, 0.2)',
                    borderRadius: '12px',
                    p: '8px 16px',
                    width: { xs: '100%', sm: 'auto' },
                    minWidth: { xs: 'auto', sm: '450px' },
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    backdropFilter: 'blur(10px)',
                    position: 'relative',
                    height: 'auto',
                    minHeight: '40px'
                  }}
                >
                  <Typography variant="body1" sx={{ fontFamily: 'monospace', color: '#fff', mr: 2 }}>
                    https://api.wochirou.com
                  </Typography>
                  <Box sx={{ position: 'relative', width: { xs: '200px', sm: '250px' }, height: '21px', overflow: 'hidden' }}>
                    {endpoints.map((endpoint, index) => (
                      <Typography
                        key={index}
                        variant="body1"
                        sx={{
                          fontFamily: 'monospace',
                          color: '#90caf9',
                          position: 'absolute',
                          width: '100%',
                          textAlign: 'center',
                          opacity: 0,
                          animation: currentEndpointIndex === index ? `${textAnimation} 3s ease-in-out` : 'none',
                          fontWeight: 'bold'
                        }}
                      >
                        {endpoint}
                      </Typography>
                    ))}
                  </Box>
                  <Tooltip title={copied ? '已复制!' : '复制'} placement="top">
                    <IconButton onClick={handleCopy} size="small" sx={{ color: '#fff', ml: 2 }}>
                      {copied ? <Check sx={{ color: 'lightgreen' }} /> : <ContentCopy />}
                    </IconButton>
                  </Tooltip>
                </Box>
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={3}
                  sx={{
                    animationDelay: '0.5s',
                    '& > *': { width: { xs: '100%', sm: 'auto' } }
                  }}
                >
                  <Button
                    variant="contained"
                    onClick={() => navigate('/panel')}
                    sx={{
                      backgroundColor: '#fff',
                      color: '#1a237e',
                      px: 4,
                      py: 2,
                      borderRadius: '14px',
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      boxShadow: '0 10px 30px rgba(144,202,249,0.3)',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        backgroundColor: '#e3f2fd',
                        transform: 'translateY(-5px)',
                        boxShadow: '0 20px 40px rgba(144,202,249,0.4)'
                      },
                      '&:active': {
                        transform: 'translateY(0)',
                        boxShadow: '0 5px 15px rgba(144,202,249,0.2)'
                      }
                    }}
                    endIcon={<ArrowRightAlt />}
                  >
                    前往控制台
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={handleLearnMoreClick}
                    sx={{
                      color: '#fff',
                      borderColor: 'rgba(255,255,255,0.3)',
                      px: 4,
                      py: 2,
                      borderRadius: '14px',
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      backdropFilter: 'blur(10px)',
                      background: 'rgba(255,255,255,0.05)',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        borderColor: '#90caf9',
                        background: 'rgba(255,255,255,0.1)',
                        transform: 'translateY(-5px)'
                      }
                    }}
                    endIcon={<ArrowRightAlt />}
                  >
                    了解更多
                  </Button>
                </Stack>

                <Box
                  sx={{
                    mt: 6,
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: { xs: 4, md: 6 },
                    animationDelay: '0.7s'
                  }}
                >
                  {[
                    // { count: '100万+', label: '日调用次数' },
                    { count: '99.99%', label: '服务可用性' },
                    { count: '24/7', label: '全天候稳定运行' }
                  ].map((stat, index) => (
                    <Box key={index} sx={{ textAlign: 'center' }}>
                      <Typography
                        variant="h3"
                        sx={{
                          fontWeight: 700,
                          fontSize: { xs: '1.8rem', md: '2.2rem' },
                          color: '#90caf9',
                          textShadow: '0 2px 10px rgba(0,0,0,0.2)'
                        }}
                      >
                        {stat.count}
                      </Typography>
                      <Typography
                        sx={{
                          color: 'rgba(255,255,255,0.7)',
                          fontSize: '0.9rem'
                        }}
                      >
                        {stat.label}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Stack>
            </Grid>
          </Grid>
          <Box
            sx={{
              background: 'rgba(0, 0, 0, 0.1)',
              backdropFilter: 'blur(15px)',
              py: { xs: 8, md: 12 },
              borderTop: '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            <Container maxWidth="lg">
              <Typography
                variant="h4"
                align="center"
                sx={{
                  fontWeight: 700,
                  color: '#bbdefb',
                  mb: 6,
                  textShadow: '0 2px 10px rgba(0,0,0,0.2)'
                }}
              >
                支持众多的大模型供应商
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: { xs: 4, md: 6 },
                  px: 2
                }}
              >
                {models.map(
                  (model) =>
                    model.icon && (
                      <Tooltip title={model.name} key={model.id}>
                        <Box
                          component="img"
                          src={model.icon}
                          alt={model.name}
                          sx={{
                            width: { xs: 40, md: 48 },
                            height: { xs: 40, md: 48 },
                            objectFit: 'contain',
                            filter: 'grayscale(30%)',
                            opacity: 0.7,
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              filter: 'grayscale(0%)',
                              opacity: 1,
                              transform: 'scale(1.2)'
                            }
                          }}
                        />
                      </Tooltip>
                    )
                )}
              </Box>
            </Container>
          </Box>
          <Box
            ref={advantagesRef}
            sx={{
              py: { xs: 10, md: 16 },
              position: 'relative'
            }}
          >
            <Typography
              variant="h3"
              align="center"
              sx={{
                fontWeight: 800,
                mb: 2,
                fontSize: { xs: '2.2rem', md: '2.7rem' },
                background: 'linear-gradient(45deg, #fff 30%, #90caf9 90%)',
                backgroundClip: 'text',
                textFillColor: 'transparent',
                position: 'relative',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: '-15px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '80px',
                  height: '4px',
                  background: 'linear-gradient(90deg, #64b5f6, transparent)',
                  borderRadius: '2px'
                }
              }}
            >
              核心优势
            </Typography>

            <Typography
              variant="body1"
              align="center"
              sx={{
                color: 'rgba(255,255,255,0.7)',
                maxWidth: '650px',
                mx: 'auto',
                mb: 10,
                mt: 4,
                fontSize: '1.1rem'
              }}
            >
              我们提供企业级性能保障，确保您的AI应用高效稳定地运行
            </Typography>

            <Grid container spacing={{ xs: 5, md: 6 }}>
              {[
                {
                  icon: <Bolt sx={{ fontSize: 36, color: '#90caf9' }} />,
                  title: '企业级卓越性能',
                  features: ['高并发架构，稳定可靠', '千万级每日调用处理能力', '智能负载均衡，确保服务稳定', '超一年稳定运行验证']
                },
                {
                  icon: <Cloud sx={{ fontSize: 36, color: '#90caf9' }} />,
                  title: '全球高速网络',
                  features: ['全球多区域节点部署', 'CN2 GIA 专线接入，延迟更低', '全球70+高速中转节点', '智能路由，自动选择最优线路']
                },
                {
                  icon: <Security sx={{ fontSize: 36, color: '#90caf9' }} />,
                  title: '透明化计费',
                  features: ['官方标准计费，公开透明', '无任何隐藏费用', '按需使用，成本可控', '账户余额，永不过期']
                },
                {
                  icon: <SyncAlt sx={{ fontSize: 36, color: '#90caf9' }} />,
                  title: '全面的模型支持',
                  features: [
                    '完美兼容 OpenAI, Claude, Gemini 等官方接口',
                    '支持全球所有主流大语言模型',
                    '轻松集成至现有应用与工作流',
                    '模型库与功能持续更新'
                  ]
                },
                {
                  icon: <Shield sx={{ fontSize: 36, color: '#90caf9' }} />,
                  title: '全方位服务保障',
                  features: ['7x24 小时全天候在线服务', '便捷的在线自助充值', '详尽的消费日志与余额查询', '专业工程师团队在线支持']
                },
                {
                  icon: <Brush sx={{ fontSize: 36, color: '#90caf9' }} />,
                  title: '强大的 Midjourney 功能',
                  features: ['内置提示词中文优化', '高速稳定的反向代理', '同步支持 Midjourney 最新版本', '高并发任务处理，无需等待']
                }
              ].map((feature, index) => (
                <Grid item xs={12} md={4} key={index}>
                  <Box
                    sx={{
                      height: '100%',
                      transform: 'translateY(0)',
                      transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        transform: 'translateY(-10px)',
                        '& .feature-icon': {
                          transform: 'scale(1.1)',
                          background: 'rgba(25,118,210,0.2)'
                        },
                        '& .feature-card': {
                          boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                          background: 'linear-gradient(145deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.08) 100%)',
                          borderColor: 'rgba(144,202,249,0.3)'
                        }
                      }
                    }}
                  >
                    <Stack
                      className="feature-card"
                      spacing={4}
                      sx={{
                        p: 4,
                        height: '100%',
                        background: 'linear-gradient(145deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.06) 100%)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '24px',
                        position: 'relative',
                        overflow: 'hidden',
                        border: '1px solid rgba(255,255,255,0.1)',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                        transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          background: 'radial-gradient(circle at top right, rgba(144,202,249,0.1), transparent 70%)',
                          zIndex: -1
                        }
                      }}
                    >
                      <Box
                        className="feature-icon"
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: 'rgba(25,118,210,0.1)',
                          width: 60,
                          height: 60,
                          borderRadius: '20px',
                          mx: 'auto',
                          transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                          boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
                        }}
                      >
                        {feature.icon}
                      </Box>
                      <Typography
                        variant="h5"
                        align="center"
                        sx={{
                          fontWeight: 700,
                          color: '#fff',
                          fontSize: { xs: '1.35rem', md: '1.5rem' }
                        }}
                      >
                        {feature.title}
                      </Typography>
                      <Stack spacing={2.5}>
                        {feature.features.map((item, i) => (
                          <Typography
                            key={i}
                            align="center"
                            sx={{
                              color: 'rgba(255,255,255,0.8)',
                              fontSize: '14px',
                              lineHeight: 1.6,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: 1.5
                            }}
                          >
                            <Box
                              component="span"
                              sx={{
                                width: 6,
                                height: 6,
                                borderRadius: '50%',
                                backgroundColor: '#64b5f6',
                                display: 'inline-block',
                                flexShrink: 0
                              }}
                            />
                            {item}
                          </Typography>
                        ))}
                      </Stack>
                    </Stack>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>

          <Box
            sx={{
              py: { xs: 10, md: 16 },
              position: 'relative'
            }}
          >
            <Typography
              variant="h3"
              align="center"
              sx={{
                fontWeight: 800,
                mb: 2,
                fontSize: { xs: '2.2rem', md: '2.7rem' },
                background: 'linear-gradient(45deg, #fff 30%, #90caf9 90%)',
                backgroundClip: 'text',
                textFillColor: 'transparent',
                position: 'relative',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: '-15px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '80px',
                  height: '4px',
                  background: 'linear-gradient(90deg, #64b5f6, transparent)',
                  borderRadius: '2px'
                }
              }}
            >
              联系我们
            </Typography>

            <Typography
              variant="body1"
              align="center"
              sx={{
                color: 'rgba(255,255,255,0.7)',
                maxWidth: '650px',
                mx: 'auto',
                mb: 10,
                mt: 4,
                fontSize: '1.1rem'
              }}
            >
              我们的团队随时为您提供支持和帮助，解决您在使用过程中遇到的任何问题
            </Typography>

            <Grid container spacing={4} justifyContent="center">
              {[
                {
                  type: 'email',
                  label: '邮件支持',
                  content: (
                    <a href="mailto:chirou.api@outlook.com" style={{ color: 'inherit', textDecoration: 'none' }}>
                      chirou.api@outlook.com
                    </a>
                  ),
                  icon: <MailOutline />
                },
                {
                  type: 'qq',
                  label: 'QQ 交流群',
                  content: '924076327',
                  icon: <Forum />
                },
                {
                  type: 'telegram',
                  label: 'Telegram',
                  content: (
                    <a
                      href="https://t.me/chirou_api"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: 'inherit', textDecoration: 'none' }}
                    >
                      @chirou_api
                    </a>
                  ),
                  icon: <Telegram />
                }
              ].map((item, index) => (
                <Grid item xs={12} sm={4} key={index}>
                  <Box
                    sx={{
                      p: 5,
                      background: 'linear-gradient(145deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.06) 100%)',
                      backdropFilter: 'blur(10px)',
                      borderRadius: '24px',
                      border: '1px solid rgba(255,255,255,0.08)',
                      textAlign: 'center',
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      position: 'relative',
                      overflow: 'hidden',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                      '&:hover': {
                        transform: 'translateY(-10px)',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                        background: 'linear-gradient(145deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.08) 100%)',
                        borderColor: 'rgba(144,202,249,0.3)',
                        '& .contact-icon': {
                          transform: 'scale(1.2) rotate(10deg)'
                        }
                      },
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        background: 'radial-gradient(circle at top right, rgba(144,202,249,0.1), transparent 70%)',
                        zIndex: -1
                      }
                    }}
                  >
                    <Box
                      className="contact-icon"
                      sx={{
                        fontSize: '3rem',
                        mb: 3,
                        transition: 'transform 0.5s ease',
                        filter: 'drop-shadow(0 5px 15px rgba(0,0,0,0.2))',
                        color: '#90caf9'
                      }}
                    >
                      {item.icon}
                    </Box>
                    <Typography
                      variant="h5"
                      sx={{
                        mb: 3,
                        fontWeight: 700,
                        color: '#90caf9',
                        fontSize: { xs: '1.35rem', md: '1.5rem' }
                      }}
                    >
                      {item.label}
                    </Typography>
                    <Typography
                      sx={{
                        color: 'rgba(255,255,255,0.9)',
                        fontSize: '1.1rem',
                        wordBreak: 'break-all',
                        px: 2,
                        py: 1.5,
                        backgroundColor: 'rgba(25,118,210,0.1)',
                        borderRadius: '12px',
                        display: 'inline-block'
                      }}
                    >
                      {item.content}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Container>
      </Box>
    </>
  );
};

export default BaseIndex;
