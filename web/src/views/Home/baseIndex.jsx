import { useNavigate } from 'react-router';
import { Box, Typography, Button, Container, Stack } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import { GitHub, Bolt, Cloud, Security, SyncAlt, Shield, Brush } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

const BaseIndex = () => {
  const { t } = useTranslation();

  return (
    <>
      <Box
        sx={{
          minHeight: '100vh',
          backgroundImage: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
          color: 'white',
          p: 4,
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.08) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(0, 0, 0, 0.08) 1px, transparent 1px)`,
            backgroundSize: '150px 150px',
            pointerEvents: 'none'
          }
        }}
      >
        <Container maxWidth="lg">
          {/* Hero Section - Updated content */}
          <Grid
            container
            columns={12}
            wrap="nowrap"
            alignItems="center"
            sx={{
              minHeight: '80vh',
              position: 'relative'
            }}
          >
            {/* 背景装饰 */}
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '50%',
                height: '100%',
                background: 'radial-gradient(circle at 70% 30%, rgba(100,181,246,0.1) 0%, transparent 70%)',
                filter: 'blur(60px)',
                pointerEvents: 'none'
              }}
            />

            <Grid md={7} lg={6}>
              <Stack spacing={4}>
                <Typography
                  variant="h1"
                  sx={{
                    fontSize: { xs: '2.5rem', md: '3.5rem' },
                    fontWeight: 700,
                    color: '#fff',
                    lineHeight: 1.2,
                    position: 'relative',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      left: '-20px',
                      top: '15%',
                      width: '4px',
                      height: '70%',
                      background: 'linear-gradient(180deg, #64B5F6, transparent)',
                      borderRadius: '4px'
                    }
                  }}
                >
                  企业级AI接口调用平台
                </Typography>
                <Typography variant="h4" sx={{ fontSize: '1.25rem', color: '#fff', lineHeight: 1.6, opacity: 0.9 }}>
                  专业的高性能、高并发、高可用AI服务平台，支持OpenAI、Claude、Gemini等多种模型，为企业提供一站式AI解决方案
                </Typography>
                <Stack direction="row" spacing={3}>
                  <Button
                    variant="contained"
                    href="/panel"
                    sx={{
                      backgroundColor: '#fff',
                      color: '#1e3c72',
                      px: 4,
                      py: 1.5,
                      borderRadius: '8px',
                      boxShadow: '0 4px 15px rgba(255,255,255,0.1)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        backgroundColor: '#f0f0f0',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 6px 20px rgba(255,255,255,0.15)'
                      }
                    }}
                  >
                    前往控制台
                  </Button>
                  {/* <Button
                    variant="outlined"
                    href="/docs"
                    sx={{ 
                      borderColor: '#fff',
                      borderWidth: '2px',
                      color: '#fff',
                      px: 4,
                      py: 1.5,
                      borderRadius: '8px',
                      transition: 'all 0.3s ease',
                      '&:hover': { 
                        borderColor: '#f0f0f0',
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        transform: 'translateY(-2px)'
                      }
                    }}
                  >
                    API 文档
                  </Button> */}
                </Stack>
              </Stack>
            </Grid>
          </Grid>

          {/* Features Section - Expanded content */}
          <Box
            sx={{
              py: 12,
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: '50%',
                transform: 'translateX(-50%)',
                width: '100vw',
                height: '100%',
                background: 'linear-gradient(180deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.05) 100%)',
                zIndex: -1
              }
            }}
          >
            <Typography
              variant="h3"
              align="center"
              sx={{
                fontWeight: 700,
                mb: 8,
                position: 'relative',
                color: '#fff',
                '&::after': {
                  content: '""',
                  display: 'block',
                  width: '60px',
                  height: '4px',
                  background: 'linear-gradient(90deg, #64B5F6, #2196F3)',
                  margin: '20px auto 0',
                  borderRadius: '2px'
                }
              }}
            >
              核心优势
            </Typography>
            <Grid container spacing={6}>
              <Grid item xs={12} md={4}>
                <Box
                  sx={{
                    height: '100%',
                    transform: 'translateY(0)',
                    transition: 'all 0.4s ease',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 8px 30px rgba(0,0,0,0.12)'
                    }
                  }}
                >
                  <Stack
                    spacing={3}
                    alignItems="center"
                    sx={{
                      p: 4,
                      height: '100%',
                      background: 'linear-gradient(145deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
                      backdropFilter: 'blur(10px)'
                    }}
                  >
                    <Bolt sx={{ fontSize: 48, color: '#64B5F6' }} />
                    <Typography variant="h5" align="center" sx={{ fontWeight: 600, color: '#fff' }}>
                      企业级性能保障
                    </Typography>
                    <Typography align="center" sx={{ opacity: 0.9, lineHeight: 1.8, color: '#fff' }}>
                      • MySQL8.2超高并发架构
                      <br />
                      • 日承接量超100万次调用
                      <br />
                      • 智能负载均衡确保稳定
                      <br />• 已稳定运行超过1年
                    </Typography>
                  </Stack>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box
                  sx={{
                    height: '100%',
                    transform: 'translateY(0)',
                    transition: 'all 0.4s ease',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 8px 30px rgba(0,0,0,0.12)'
                    }
                  }}
                >
                  <Stack
                    spacing={3}
                    alignItems="center"
                    sx={{
                      p: 4,
                      height: '100%',
                      background: 'linear-gradient(145deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
                      backdropFilter: 'blur(10px)'
                    }}
                  >
                    <Cloud sx={{ fontSize: 48, color: '#64B5F6' }} />
                    <Typography variant="h5" align="center" sx={{ fontWeight: 600, color: '#fff' }}>
                      全球化部署
                    </Typography>
                    <Typography align="center" sx={{ opacity: 0.9, lineHeight: 1.8 }}>
                      • 多区域服务器部署
                      <br />
                      • CN2专线高速接入
                      <br />
                      • 70+全球中转节点
                      <br />• 智能路由就近接入
                    </Typography>
                  </Stack>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box
                  sx={{
                    height: '100%',
                    transform: 'translateY(0)',
                    transition: 'all 0.4s ease',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 8px 30px rgba(0,0,0,0.12)'
                    }
                  }}
                >
                  <Stack
                    spacing={3}
                    alignItems="center"
                    sx={{
                      p: 4,
                      height: '100%',
                      background: 'linear-gradient(145deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
                      backdropFilter: 'blur(10px)'
                    }}
                  >
                    <Security sx={{ fontSize: 48, color: '#64B5F6' }} />
                    <Typography variant="h5" align="center" sx={{ fontWeight: 600, color: '#fff' }}>
                      透明计费系统
                    </Typography>
                    <Typography align="center" sx={{ opacity: 0.9, lineHeight: 1.8 }}>
                      • 对标官方计费标准
                      <br />
                      • 无隐藏费用设计
                      <br />
                      • 按量计费更经济
                      <br />• 余额永不过期
                    </Typography>
                  </Stack>
                </Box>
              </Grid>

              {/* Additional Features */}
              <Grid item xs={12} md={4}>
                <Box
                  sx={{
                    height: '100%',
                    transform: 'translateY(0)',
                    transition: 'all 0.4s ease',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 8px 30px rgba(0,0,0,0.12)'
                    }
                  }}
                >
                  <Stack
                    spacing={3}
                    alignItems="center"
                    sx={{
                      p: 4,
                      height: '100%',
                      background: 'linear-gradient(145deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
                      backdropFilter: 'blur(10px)'
                    }}
                  >
                    <SyncAlt sx={{ fontSize: 48, color: '#64B5F6' }} />
                    <Typography variant="h5" align="center" sx={{ fontWeight: 600, color: '#fff' }}>
                      完美兼容性
                    </Typography>
                    <Typography align="center" sx={{ opacity: 0.9, lineHeight: 1.8 }}>
                      • 兼容OpenAI官方接口
                      <br />
                      • 支持所有主流模型
                      <br />
                      • 无缝对接第三方应用
                      <br />• 持续更新新功能
                    </Typography>
                  </Stack>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box
                  sx={{
                    height: '100%',
                    transform: 'translateY(0)',
                    transition: 'all 0.4s ease',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 8px 30px rgba(0,0,0,0.12)'
                    }
                  }}
                >
                  <Stack
                    spacing={3}
                    alignItems="center"
                    sx={{
                      p: 4,
                      height: '100%',
                      background: 'linear-gradient(145deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
                      backdropFilter: 'blur(10px)'
                    }}
                  >
                    <Shield sx={{ fontSize: 48, color: '#64B5F6' }} />
                    <Typography variant="h5" align="center" sx={{ fontWeight: 600, color: '#fff' }}>
                      服务保障
                    </Typography>
                    <Typography align="center" sx={{ opacity: 0.9, lineHeight: 1.8 }}>
                      • 7*24小时持续服务
                      <br />
                      • 自助充值系统
                      <br />
                      • 实时余额查询
                      <br />• 专业技术支持
                    </Typography>
                  </Stack>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box
                  sx={{
                    height: '100%',
                    transform: 'translateY(0)',
                    transition: 'all 0.4s ease',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 8px 30px rgba(0,0,0,0.12)'
                    }
                  }}
                >
                  <Stack
                    spacing={3}
                    alignItems="center"
                    sx={{
                      p: 4,
                      height: '100%',
                      background: 'linear-gradient(145deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
                      backdropFilter: 'blur(10px)'
                    }}
                  >
                    <Brush sx={{ fontSize: 48, color: '#64B5F6' }} />
                    <Typography variant="h5" align="center" sx={{ fontWeight: 600, color: '#fff' }}>
                      Midjourney 增强
                    </Typography>
                    <Typography align="center" sx={{ opacity: 0.9, lineHeight: 1.8 }}>
                      • 内置中文翻译接口
                      <br />
                      • 高性能反代服务
                      <br />
                      • 支持最新版本
                      <br />• 快速并发响应
                    </Typography>
                  </Stack>
                </Box>
              </Grid>
            </Grid>
          </Box>

          {/* Supported Models Section - Further enhanced */}
          {/* <Box
            sx={{
              py: 12,
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: '20%',
                left: 0,
                width: '100%',
                height: '60%',
                background: 'linear-gradient(90deg, rgba(100,181,246,0.1) 0%, transparent 100%)',
                filter: 'blur(100px)',
                transform: 'rotate(-5deg)',
                zIndex: -1
              }
            }}
          >
            <Typography
              variant="h3"
              align="center"
              sx={{
                fontWeight: 700,
                mb: 8,
                position: 'relative',
                color: '#fff',
                '&::after': {
                  content: '""',
                  display: 'block',
                  width: '60px',
                  height: '4px',
                  background: 'linear-gradient(90deg, #64B5F6, #2196F3)',
                  margin: '20px auto 0',
                  borderRadius: '2px'
                }
              }}
            >
              支持模型
            </Typography>

            <Grid container spacing={4} justifyContent="center">
              {[
                { name: 'OpenAI', desc: 'GPT-4o / o1 系列模型', tag: '热门' },
                { name: 'Claude AI', desc: 'Claude 3.5 系列模型', tag: '热门' },
                { name: 'Google Gemini', desc: 'Pro/Exp 系列模型', tag: '热门' },
                { name: 'DeepSeek', desc: 'V3 系列模型', tag: '推荐' },
                { name: 'Midjourney', desc: '支持最新版Midjourney Proxy Plus', tag: '创意' }
              ].map((platform) => (
                <Grid item xs={12} sm={6} md={4} key={platform.name}>
                  <Box
                    sx={{
                      p: 4,
                      height: '100%',
                      backgroundColor: 'rgba(255,255,255,0.08)',
                      transition: 'all 0.3s ease',
                      position: 'relative',
                      overflow: 'hidden',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: '0 8px 30px rgba(0,0,0,0.12)'
                      }
                    }}
                  >
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        px: 1.5,
                        py: 0.5,
                        backgroundColor: 'rgba(33,150,243,0.2)',
                        fontSize: '0.75rem',
                        color: '#90CAF9'
                      }}
                    >
                      {platform.tag}
                    </Box>
                    <Typography
                      variant="h5"
                      sx={{
                        mb: 2,
                        fontWeight: 600,
                        color: '#fff'
                      }}
                    >
                      {platform.name}
                    </Typography>
                    <Typography
                      sx={{
                        color: 'rgba(255,255,255,0.7)',
                        fontSize: '1rem',
                        lineHeight: 1.6
                      }}
                    >
                      {platform.desc}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box> */}

          {/* Contact Section - Further enhanced */}
          <Box
            sx={{
              py: 12,
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: '50%',
                height: '70%',
                background: 'radial-gradient(circle at 70% 80%, rgba(100,181,246,0.1) 0%, transparent 70%)',
                filter: 'blur(60px)',
                zIndex: -1
              }
            }}
          >
            <Typography
              variant="h3"
              align="center"
              sx={{
                fontWeight: 700,
                mb: 8,
                position: 'relative',
                color: '#fff',
                '&::after': {
                  content: '""',
                  display: 'block',
                  width: '60px',
                  height: '4px',
                  background: 'linear-gradient(90deg, #64B5F6, #2196F3)',
                  margin: '20px auto 0',
                  borderRadius: '2px'
                }
              }}
            >
              联系我们
            </Typography>

            <Grid container spacing={4} justifyContent="center">
              <Grid item xs={12} sm={6}>
                <Box
                  sx={{
                    p: 5,
                    backgroundColor: 'rgba(255,255,255,0.08)',
                    textAlign: 'center',
                    transition: 'all 0.3s ease',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 8px 30px rgba(0,0,0,0.12)'
                    }
                  }}
                >
                  <Typography
                    variant="h5"
                    sx={{
                      mb: 3,
                      fontWeight: 600,
                      color: '#90CAF9'
                    }}
                  >
                    邮件支持
                  </Typography>
                  <Typography
                    sx={{
                      color: 'rgba(255,255,255,0.9)',
                      fontSize: '1.1rem',
                      wordBreak: 'break-all'
                    }}
                  >
                    chirou.api@outlook.com
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box
                  sx={{
                    p: 5,
                    backgroundColor: 'rgba(255,255,255,0.08)',
                    textAlign: 'center',
                    transition: 'all 0.3s ease',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 8px 30px rgba(0,0,0,0.12)'
                    }
                  }}
                >
                  <Typography
                    variant="h5"
                    sx={{
                      mb: 3,
                      fontWeight: 600,
                      color: '#90CAF9'
                    }}
                  >
                    QQ 交流群
                  </Typography>
                  <Typography
                    sx={{
                      color: 'rgba(255,255,255,0.9)',
                      fontSize: '1.1rem'
                    }}
                  >
                    924076327
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Container>
      </Box>
    </>
  );
};

export default BaseIndex;
