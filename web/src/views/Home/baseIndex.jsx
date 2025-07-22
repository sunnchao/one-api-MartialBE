import { useNavigate } from 'react-router';
import { Box, Typography, Button, Container, Stack } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import { Bolt, Cloud, Security, SyncAlt, Shield, Brush, ArrowRightAlt, MailOutline, Forum, Telegram } from '@mui/icons-material';
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

const float = keyframes`
  0% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-15px) rotate(2deg); }
  100% { transform: translateY(0px) rotate(0deg); }
`;

const pulse = keyframes`
  0% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.05); opacity: 1; }
  100% { transform: scale(1); opacity: 0.8; }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const BaseIndex = () => {
  const navigate = useNavigate();

  return (
    <>
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
        <Box
          sx={{
            position: 'absolute',
            top: '5%',
            right: '8%',
            width: { xs: '250px', md: '500px' },
            height: { xs: '250px', md: '500px' },
            background: 'radial-gradient(circle, rgba(63,81,181,0.3) 0%, transparent 70%)',
            filter: 'blur(80px)',
            animation: `${float} 12s ease-in-out infinite`,
            zIndex: 0,
            opacity: 0.8
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: '10%',
            left: '5%',
            width: { xs: '200px', md: '400px' },
            height: { xs: '200px', md: '400px' },
            background: 'radial-gradient(circle, rgba(25,118,210,0.25) 0%, transparent 70%)',
            filter: 'blur(70px)',
            animation: `${float} 14s ease-in-out infinite`,
            animationDelay: '-4s',
            zIndex: 0,
            opacity: 0.7
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            top: '40%',
            left: '20%',
            width: { xs: '150px', md: '300px' },
            height: { xs: '150px', md: '300px' },
            background: 'radial-gradient(circle, rgba(100,181,246,0.2) 0%, transparent 70%)',
            filter: 'blur(60px)',
            animation: `${pulse} 8s ease-in-out infinite`,
            zIndex: 0,
            opacity: 0.5
          }}
        />

        {[...Array(8)].map((_, i) => (
          <Box
            key={i}
            sx={{
              position: 'absolute',
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 40 + 10}px`,
              height: `${Math.random() * 40 + 10}px`,
              borderRadius: Math.random() > 0.5 ? '50%' : '6px',
              background: 'rgba(255,255,255,0.05)',
              backdropFilter: 'blur(5px)',
              transform: `rotate(${Math.random() * 45}deg)`,
              animation: `${float} ${Math.random() * 10 + 10}s ease-in-out infinite`,
              animationDelay: `-${Math.random() * 10}s`,
              zIndex: 0
            }}
          />
        ))}

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
            <Grid xs={12} md={12} lg={8}>
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
                        display: 'inline-block',
                        animation: `${pulse} 2s infinite`
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
                    animation: `${shimmer} 5s linear infinite`,
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
                  专业的
                  <br />
                  AI大模型接口调用服务平台
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
                  致力于提供高性能、高并发、高可用AI大模型接口调用服务平台，支持OpenAI、Claude、Deepseek、Gemini、Midjourney等多种模型，为个人和企业提供一站式AI解决方案
                </Typography>
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
                  {/* <Button
                    variant="outlined"
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
                  </Button> */}
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
                  title: '企业级性能保障',
                  features: ['MySQL8.2超高并发架构', '日承接量超100万次调用', '智能负载均衡确保稳定', '已稳定运行超过1年']
                },
                {
                  icon: <Cloud sx={{ fontSize: 36, color: '#90caf9' }} />,
                  title: '全球化部署',
                  features: ['多区域服务器部署', 'CN2专线高速接入', '70+全球中转节点', '智能路由就近接入']
                },
                {
                  icon: <Security sx={{ fontSize: 36, color: '#90caf9' }} />,
                  title: '透明计费系统',
                  features: ['对标官方计费标准', '无隐藏费用设计', '按量计费更经济', '余额永不过期']
                },
                {
                  icon: <SyncAlt sx={{ fontSize: 36, color: '#90caf9' }} />,
                  title: '完美兼容性',
                  features: ['兼容OpenAI、Claude、Gemini官方接口', '支持所有主流模型', '无缝对接第三方应用', '持续更新新功能']
                },
                {
                  icon: <Shield sx={{ fontSize: 36, color: '#90caf9' }} />,
                  title: '服务保障',
                  features: ['7*24小时持续服务', '自助充值系统', '实时余额查询', '专业技术支持']
                },
                {
                  icon: <Brush sx={{ fontSize: 36, color: '#90caf9' }} />,
                  title: 'Midjourney 增强',
                  features: ['内置中文翻译接口', '高性能反代服务', '支持最新版本', '快速并发响应']
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
