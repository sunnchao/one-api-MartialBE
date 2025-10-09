import { useNavigate } from 'react-router';
import { useRef, useState, useEffect, useCallback } from 'react';
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
  Check,
  Brightness4,
  Brightness7,
  SettingsBrightness
} from '@mui/icons-material';
import { keyframes, useTheme } from '@mui/system';
import { usePackyTheme } from 'components/PackyThemeProvider';
import LoadingSpinner, { PackyPageLoader } from 'components/ui/LoadingSpinner';
import { useSelector } from 'react-redux';

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

const starTwinkle = keyframes`
  0%, 100% {
    opacity: 0.3;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.2);
  }
`;

const BaseIndex = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { toggleTheme, setTheme } = usePackyTheme();
  const advantagesRef = useRef(null);
  const [copied, setCopied] = useState(false);
  const [currentEndpointIndex, setCurrentEndpointIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    milliseconds: 0
  });
  const [showNationalDayPromo, setShowNationalDayPromo] = useState(false);
  const siteInfo = useSelector((state) => state.siteInfo);
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

  // 检查是否在国庆活动期间
  const checkNationalDayPromo = () => {
    if (!siteInfo.NationalDayPromoEnabled) return false;

    const now = new Date();

    try {
      const startDate = new Date(siteInfo.NationalDayPromoStartDate);
      const endDate = new Date(siteInfo.NationalDayPromoEndDate + 'T23:59:59');

      return now >= startDate && now <= endDate;
    } catch (e) {
      return false;
    }
  };

  // 计算倒计时
  const calculateCountdown = useCallback(() => {
    if (!siteInfo.NationalDayPromoEndDate) return null;

    try {
      const now = new Date();
      const endDate = new Date(siteInfo.NationalDayPromoEndDate + 'T23:59:59');
      const timeDiff = endDate.getTime() - now.getTime();

      if (timeDiff <= 0) {
        setShowNationalDayPromo(false);
        return { days: 0, hours: 0, minutes: 0, seconds: 0, milliseconds: 0 };
      }

      const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
      const milliseconds = Math.floor((timeDiff % 1000) / 10);

      return { days, hours, minutes, seconds, milliseconds };
    } catch (e) {
      return null;
    }
  }, [siteInfo.NationalDayPromoEndDate]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentEndpointIndex((prevIndex) => (prevIndex + 1) % endpoints.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [endpoints.length]);

  // 检查活动状态
  useEffect(() => {
    if (siteInfo.NationalDayPromoEnabled !== undefined) {
      setShowNationalDayPromo(checkNationalDayPromo());
    }
  }, [siteInfo.NationalDayPromoEnabled, siteInfo.NationalDayPromoStartDate, siteInfo.NationalDayPromoEndDate]);

  // 倒计时定时器
  useEffect(() => {
    if (!showNationalDayPromo) return;

    const timer = setInterval(() => {
      const newCountdown = calculateCountdown();
      if (newCountdown) {
        setCountdown(newCountdown);
        if (newCountdown.days === 0 && newCountdown.hours === 0 && newCountdown.minutes === 0 && newCountdown.seconds === 0) {
          setShowNationalDayPromo(false);
        }
      }
    }, 10);

    const initialCountdown = calculateCountdown();
    if (initialCountdown) {
      setCountdown(initialCountdown);
    }

    return () => clearInterval(timer);
  }, [showNationalDayPromo, calculateCountdown]);

  // 模拟页面加载
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // 强制使用深色主题 - 只在初始化时执行一次
  useEffect(() => {}, []); // 空依赖数组，只执行一次

  const handleLearnMoreClick = () => {
    advantagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCopy = () => {
    const textToCopy = `https://api.wochirou.com${endpoints[currentEndpointIndex]}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleThemeToggle = () => {
    toggleTheme();
  };

  // 如果正在加载，显示PackyCode风格的加载器
  if (isLoading) {
    return (
      <PackyPageLoader isLoading={true}>
        <div />
      </PackyPageLoader>
    );
  }

  return (
    <>
      {/* 全屏宽度活动横幅 - 只在活动期间显示 */}
      {showNationalDayPromo && (
        <Box
          sx={{
            width: '100vw',
            position: 'relative',
            left: '50%',
            right: '50%',
            marginLeft: '-50vw',
            marginRight: '-50vw',
            background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
            py: 2,
            textAlign: 'center',
            zIndex: 1000,
            boxShadow: '0 2px 8px rgba(33, 150, 243, 0.15)',
            borderBottom: '1px solid rgba(33, 150, 243, 0.1)'
          }}
        >
          <Container maxWidth={false}>
            <Typography
              variant="h6"
              sx={{
                color: '#1976d2',
                fontWeight: 600,
                fontSize: { xs: '1rem', md: '1.2rem' },
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1
              }}
            >
              <Box
                component="span"
                sx={{
                  fontSize: '1.3em'
                }}
              >
                🎊
              </Box>
              国庆盛典，充值有惊喜！
              <Box
                component="span"
                sx={{
                  ml: 2,
                  px: 2,
                  py: 0.5,
                  backgroundColor: 'rgba(25, 118, 210, 0.1)',
                  borderRadius: '16px',
                  fontSize: { xs: '12px', md: '14px' },
                  border: '1px solid rgba(25, 118, 210, 0.2)',
                  color: '#1565c0',
                  display: { xs: 'none', sm: 'inline-block' }
                }}
              >
                ⏰ 活动倒计时: {countdown.days}天 {String(countdown.hours).padStart(2, '0')}:{String(countdown.minutes).padStart(2, '0')}:
                {String(countdown.seconds).padStart(2, '0')}.{String(countdown.milliseconds).padStart(2, '0')}
              </Box>
            </Typography>
          </Container>
        </Box>
      )}
      <Box
        sx={{
          minHeight: '100vh',
          background:
            theme.palette.mode === 'dark'
              ? 'linear-gradient(135deg, #0a0a0a 0%, #0d1421 30%, #1677ff 60%, #0d47a1 100%)'
              : 'linear-gradient(135deg, #0a0a0a 0%, #0d1421 30%, #1565c0 60%, #0d47a1 100%)',
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
            backgroundImage:
              theme.palette.mode === 'dark'
                ? `radial-gradient(2px 2px at 20px 30px, #1677ff, transparent),
                 radial-gradient(2px 2px at 40px 70px, #42a5f5, transparent),
                 radial-gradient(1px 1px at 90px 40px, #90caf9, transparent),
                 radial-gradient(1px 1px at 130px 80px, #1677ff, transparent),
                 radial-gradient(2px 2px at 160px 30px, #42a5f5, transparent),
                 linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
                 linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px)`
                : `radial-gradient(2px 2px at 25px 35px, #1677ff, transparent),
                 radial-gradient(2px 2px at 45px 75px, #64b5f6, transparent),
                 radial-gradient(1px 1px at 95px 45px, #90caf9, transparent),
                 radial-gradient(1px 1px at 135px 85px, #1677ff, transparent),
                 radial-gradient(2px 2px at 165px 35px, #64b5f6, transparent),
                 linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
                 linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)`,
            backgroundSize: '200px 200px, 200px 200px, 200px 200px, 200px 200px, 200px 200px, 80px 80px, 80px 80px',
            animation: `${starTwinkle} 3s ease-in-out infinite alternate`,
            pointerEvents: 'none',
            opacity: 0.6
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `radial-gradient(circle at 20% 80%, rgba(22, 119, 255, 0.3) 0%, transparent 50%),
                        radial-gradient(circle at 80% 20%, rgba(66, 165, 245, 0.2) 0%, transparent 50%),
                        radial-gradient(circle at 40% 40%, rgba(144, 202, 249, 0.2) 0%, transparent 50%)`,
            pointerEvents: 'none',
            opacity: 0.4
          }
        }}
      >
        {/* 主题切换按钮 - 隐藏，固定使用深色主题 */}
        {false && (
          <Box
            sx={{
              position: 'fixed',
              top: 20,
              right: 20,
              zIndex: 1000
            }}
          >
            <Tooltip title={`切换到${theme.palette.mode === 'dark' ? '浅色' : '深色'}主题`}>
              <IconButton
                onClick={handleThemeToggle}
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    transform: 'scale(1.1)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                {theme.palette.mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
              </IconButton>
            </Tooltip>
          </Box>
        )}
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
                        background: 'linear-gradient(45deg, #1677ff, #42a5f5)',
                        display: 'inline-block'
                      }}
                    />
                    全时守护 · 星级可靠性
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
                  AI时代，Chirou API 为您而来
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
                      borderRadius: '12px',
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
                      borderRadius: '12px',
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
                    { count: '∞', label: '无限可能' },
                    { count: '99.99%', label: '服务可靠' },
                    { count: '24/7', label: '全时守护' }
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
                支持众多AI模型供应商
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
                color: 'rgba(255,255,255,0.8)',
                maxWidth: '650px',
                mx: 'auto',
                mb: 10,
                mt: 4,
                fontSize: '1.1rem'
              }}
            >
              我们为您的AI应用提供企业级性能保障，确保每一次调用都稳定高效
            </Typography>

            <Grid container spacing={{ xs: 5, md: 6 }}>
              {[
                {
                  icon: <Bolt sx={{ fontSize: 36, color: '#fff' }} />,
                  title: '极速响应',
                  features: ['毫秒级API响应时间', '千万级并发处理能力', '智能负载均衡系统', '超两年稳定运行验证']
                },
                {
                  icon: <Cloud sx={{ fontSize: 36, color: '#fff' }} />,
                  title: '全球网络',
                  features: ['全球多区域节点部署', 'CN2 GIA专线接入', '全球70+高速中转节点', '智能路由优化']
                },
                {
                  icon: <Security sx={{ fontSize: 36, color: '#fff' }} />,
                  title: '透明计费',
                  features: ['官方标准计费模式', '无任何隐藏费用', '按需使用成本可控', '账户余额永不过期']
                },
                {
                  icon: <SyncAlt sx={{ fontSize: 36, color: '#fff' }} />,
                  title: '全面兼容',
                  features: [
                    '完美兼容OpenAI, Claude, Gemini等官方接口',
                    '支持全球所有主流大语言模型',
                    '轻松集成现有应用工作流',
                    '模型库与功能持续更新'
                  ]
                },
                {
                  icon: <Shield sx={{ fontSize: 36, color: '#fff' }} />,
                  title: '服务保障',
                  features: ['7x24小时在线服务', '便捷的在线自助充值', '详尽的消费日志查询', '专业工程师技术支持']
                },
                {
                  icon: <Brush sx={{ fontSize: 36, color: '#fff' }} />,
                  title: 'Midjourney支持',
                  features: ['内置提示词中文优化', '高速稳定的反向代理', '同步支持最新版本', '高并发任务处理']
                }
              ].map((feature, index) => (
                <Grid item xs={12} md={4} key={index}>
                  <Box
                    sx={{
                      height: '100%',
                      transform: 'translateY(0)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        '& .feature-icon': {
                          transform: 'scale(1.05)',
                          backgroundColor: 'rgba(22,119,255,0.25)'
                        },
                        '& .feature-card': {
                          boxShadow: '0 15px 35px rgba(22,119,255,0.2)',
                          borderColor: 'rgba(100,181,246,0.4)'
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
                      p: 4,
                      background: 'linear-gradient(145deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.08) 100%)',
                      backdropFilter: 'blur(12px)',
                      borderRadius: '20px',
                      border: '1px solid rgba(100,181,246,0.2)',
                      textAlign: 'center',
                      transition: 'all 0.3s ease',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      position: 'relative',
                      overflow: 'hidden',
                      boxShadow: '0 8px 25px rgba(22,119,255,0.15)',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: '0 15px 35px rgba(22,119,255,0.2)',
                        borderColor: 'rgba(100,181,246,0.4)'
                      }
                    }}
                  >
                    <Box
                      sx={{
                        fontSize: '2.5rem',
                        mb: 3,
                        color: '#fff',
                        transition: 'transform 0.3s ease'
                      }}
                    >
                      {item.icon}
                    </Box>
                    <Typography
                      variant="h5"
                      sx={{
                        mb: 3,
                        fontWeight: 700,
                        background: '#fff',
                        backgroundClip: 'text',
                        textFillColor: 'transparent',
                        fontSize: { xs: '1.3rem', md: '1.4rem' }
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
