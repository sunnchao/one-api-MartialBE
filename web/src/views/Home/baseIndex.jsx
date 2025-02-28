import { useNavigate } from 'react-router';
import { Box, Typography, Button, Container, Stack, useTheme, useMediaQuery } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import { GitHub, Bolt, Cloud, Security, SyncAlt, Shield, Brush } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { keyframes } from '@mui/system';

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

const BaseIndex = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <>
      <Box
        sx={{
          minHeight: '100vh',
          backgroundImage: 'linear-gradient(135deg, #2a5298 0%, #0d47a1 100%)',
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
            backgroundSize: '100px 100px',
            pointerEvents: 'none'
          }
        }}
      >
        {/* 背景装饰元素 */}
        <Box
          sx={{
            position: 'absolute',
            top: '10%',
            right: '5%',
            width: '400px',
            height: '400px',
            background: 'radial-gradient(circle, rgba(63,81,181,0.2) 0%, transparent 70%)',
            filter: 'blur(60px)',
            animation: `${float} 6s ease-in-out infinite`,
            zIndex: 0
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: '15%',
            left: '10%',
            width: '300px',
            height: '300px',
            background: 'radial-gradient(circle, rgba(25,118,210,0.15) 0%, transparent 70%)',
            filter: 'blur(50px)',
            animation: `${float} 8s ease-in-out infinite`,
            animationDelay: '-3s',
            zIndex: 0
          }}
        />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          {/* Hero Section */}
          <Grid
            container
            columns={12}
            alignItems="center"
            sx={{
              minHeight: '90vh',
              pt: { xs: 8, md: 0 }
            }}
          >
            <Grid xs={12} md={12} lg={8}>
              <Stack
                spacing={4}
                sx={{
                  animation: `${fadeIn} 1s ease-out`,
                  '& > *': {
                    animation: `${fadeIn} 1s ease-out`,
                    animationFillMode: 'both'
                  }
                }}
              >
                <Typography
                  variant="h1"
                  sx={{
                    fontSize: { xs: '2.5rem', sm: '3rem', md: '3.5rem' },
                    fontWeight: 800,
                    background: 'linear-gradient(45deg, #fff 30%, #90caf9 90%)',
                    backgroundClip: 'text',
                    textFillColor: 'transparent',
                    letterSpacing: '-0.02em',
                    position: 'relative',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      left: '-20px',
                      top: '15%',
                      width: '6px',
                      height: '70%',
                      background: 'linear-gradient(180deg, #90caf9, transparent)',
                      borderRadius: '8px'
                    }
                  }}
                >
                  提供稳定可靠的AI接口调用平台
                </Typography>
                <Typography
                  variant="h4"
                  sx={{
                    fontSize: { xs: '1.1rem', sm: '1.25rem' },
                    color: 'rgba(255, 255, 255, 0.9)',
                    lineHeight: 1.8,
                    maxWidth: '800px',
                    animationDelay: '0.2s'
                  }}
                >
                  专业的高性能、高并发、高可用AI服务平台，支持OpenAI、Claude、Deepseek、Gemini等多种模型，为个人和企业提供一站式AI解决方案
                </Typography>
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={3}
                  sx={{
                    animationDelay: '0.4s',
                    '& > *': { width: { xs: '100%', sm: 'auto' } }
                  }}
                >
                  <Button
                    variant="contained"
                    href="/panel"
                    sx={{
                      backgroundColor: '#fff',
                      color: '#1a237e',
                      px: 4,
                      py: 1.8,
                      borderRadius: '12px',
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      boxShadow: '0 8px 25px rgba(255,255,255,0.15)',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        backgroundColor: '#f0f0f0',
                        transform: 'translateY(-3px)',
                        boxShadow: '0 12px 30px rgba(255,255,255,0.2)'
                      }
                    }}
                  >
                    前往控制台
                  </Button>
                </Stack>
              </Stack>
            </Grid>
          </Grid>

          {/* Features Section */}
          <Box
            sx={{
              py: { xs: 8, md: 12 },
              position: 'relative'
            }}
          >
            <Typography
              variant="h3"
              align="center"
              sx={{
                fontWeight: 800,
                mb: 8,
                fontSize: { xs: '2rem', md: '2.5rem' },
                background: 'linear-gradient(45deg, #fff 30%, #90caf9 90%)',
                backgroundClip: 'text',
                textFillColor: 'transparent',
                position: 'relative',
                '&::after': {
                  content: '""',
                  display: 'block',
                  width: '80px',
                  height: '4px',
                  background: 'linear-gradient(90deg, #90caf9, #2196F3)',
                  margin: '20px auto 0',
                  borderRadius: '4px'
                }
              }}
            >
              核心优势
            </Typography>
            <Grid container spacing={{ xs: 4, md: 6 }}>
              {[
                {
                  icon: <Bolt sx={{ fontSize: 48, color: '#90caf9' }} />,
                  title: '企业级性能保障',
                  features: ['MySQL8.2超高并发架构', '日承接量超100万次调用', '智能负载均衡确保稳定', '已稳定运行超过1年']
                },
                {
                  icon: <Cloud sx={{ fontSize: 48, color: '#90caf9' }} />,
                  title: '全球化部署',
                  features: ['多区域服务器部署', 'CN2专线高速接入', '70+全球中转节点', '智能路由就近接入']
                },
                {
                  icon: <Security sx={{ fontSize: 48, color: '#90caf9' }} />,
                  title: '透明计费系统',
                  features: ['对标官方计费标准', '无隐藏费用设计', '按量计费更经济', '余额永不过期']
                },
                {
                  icon: <SyncAlt sx={{ fontSize: 48, color: '#90caf9' }} />,
                  title: '完美兼容性',
                  features: ['兼容OpenAI、Claude、Gemini官方接口', '支持所有主流模型', '无缝对接第三方应用', '持续更新新功能']
                },
                {
                  icon: <Shield sx={{ fontSize: 48, color: '#90caf9' }} />,
                  title: '服务保障',
                  features: ['7*24小时持续服务', '自助充值系统', '实时余额查询', '专业技术支持']
                },
                {
                  icon: <Brush sx={{ fontSize: 48, color: '#90caf9' }} />,
                  title: 'Midjourney 增强',
                  features: ['内置中文翻译接口', '高性能反代服务', '支持最新版本', '快速并发响应']
                }
              ].map((feature, index) => (
                <Grid item xs={12} md={4} key={index}>
                  <Box
                    sx={{
                      height: '100%',
                      transform: 'translateY(0)',
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        '& .feature-icon': {
                          transform: 'scale(1.1)'
                        }
                      }
                    }}
                  >
                    <Stack
                      spacing={3}
                      sx={{
                        p: 4,
                        height: '100%',
                        background: 'linear-gradient(145deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '16px',
                        border: '1px solid rgba(255,255,255,0.1)'
                      }}
                    >
                      <Box
                        className="feature-icon"
                        sx={{
                          transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
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
                          fontSize: { xs: '1.25rem', md: '1.5rem' }
                        }}
                      >
                        {feature.title}
                      </Typography>
                      <Stack spacing={1.5}>
                        {feature.features.map((item, i) => (
                          <Typography
                            key={i}
                            align="center"
                            sx={{
                              color: 'rgba(255,255,255,0.8)',
                              fontSize: '1rem',
                              lineHeight: 1.6
                            }}
                          >
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

          {/* Contact Section */}
          <Box
            sx={{
              py: { xs: 8, md: 12 },
              position: 'relative'
            }}
          >
            <Typography
              variant="h3"
              align="center"
              sx={{
                fontWeight: 800,
                mb: 8,
                fontSize: { xs: '2rem', md: '2.5rem' },
                background: 'linear-gradient(45deg, #fff 30%, #90caf9 90%)',
                backgroundClip: 'text',
                textFillColor: 'transparent',
                position: 'relative',
                '&::after': {
                  content: '""',
                  display: 'block',
                  width: '80px',
                  height: '4px',
                  background: 'linear-gradient(90deg, #90caf9, #2196F3)',
                  margin: '20px auto 0',
                  borderRadius: '4px'
                }
              }}
            >
              联系我们
            </Typography>

            <Grid container spacing={4} justifyContent="center">
              {[
                {
                  type: 'email',
                  label: '邮件支持',
                  content: 'chirou.api@outlook.com'
                },
                {
                  type: 'qq',
                  label: 'QQ 交流群',
                  content: '924076327'
                },
                {
                  type: 'telegram',
                  label: 'Telegram',
                  content: '@chirou_api'
                }
              ].map((item, index) => (
                <Grid item xs={12} sm={4} key={index}>
                  <Box
                    sx={{
                      p: 5,
                      background: 'linear-gradient(145deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                      backdropFilter: 'blur(10px)',
                      borderRadius: '16px',
                      border: '1px solid rgba(255,255,255,0.1)',
                      textAlign: 'center',
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: '0 12px 30px rgba(0,0,0,0.2)'
                      }
                    }}
                  >
                    <Typography
                      variant="h5"
                      sx={{
                        mb: 3,
                        fontWeight: 700,
                        color: '#90caf9',
                        fontSize: { xs: '1.25rem', md: '1.5rem' }
                      }}
                    >
                      {item.label}
                    </Typography>
                    <Typography
                      sx={{
                        color: 'rgba(255,255,255,0.9)',
                        fontSize: '1.1rem',
                        wordBreak: 'break-all'
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
