import React, { useState } from 'react';
import PropTypes from 'prop-types';

// 导入 Material-UI 组件
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Stack,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Chip,
  Divider,
  Tabs,
  Tab,
  Alert,
  useTheme,
  alpha
} from '@mui/material';

// 导入 Material-UI 图标
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import SearchIcon from '@mui/icons-material/Search';
import BugReportIcon from '@mui/icons-material/BugReport';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import TerminalIcon from '@mui/icons-material/Terminal';
import CodeIcon from '@mui/icons-material/Code';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

// 导入操作系统图标
import { FaWindows, FaApple, FaLinux } from 'react-icons/fa';

// 导入教程组件和API
import WindowsTutorial from './WindowsTutorial';
import MacOSTutorial from './MacOSTutorial';
import LinuxTutorial from './LinuxTutorial';
import { useNavigate } from 'react-router-dom';

// 主要功能特性
const features = [
  {
    icon: <RocketLaunchIcon fontSize="large" />,
    title: '智能代码生成',
    description: '基于 Claude 3.7 Sonnet 的强大能力，快速生成高质量、可维护的代码片段和完整模块。',
    color: '#2196f3'
  },
  {
    icon: <SearchIcon fontSize="large" />,
    title: '深度代码分析',
    description: '深入理解现有代码库结构，提供精准的重构建议和架构优化方案。',
    color: '#9c27b0'
  },
  {
    icon: <BugReportIcon fontSize="large" />,
    title: '智能调试助手',
    description: '自动定位 Bug 根源，提供修复建议，甚至直接生成修复代码。',
    color: '#f44336'
  },
  {
    icon: <MenuBookIcon fontSize="large" />,
    title: '自动化文档',
    description: '一键生成清晰、规范的代码文档和 API 说明，保持文档与代码同步。',
    color: '#4caf50'
  },
  {
    icon: <TerminalIcon fontSize="large" />,
    title: '命令行集成',
    description: '强大的 CLI 工具，让 AI 助手无缝融入您的终端开发工作流。',
    color: '#ff9800'
  }
];

// 支持的平台信息
const supportedPlatforms = [
  {
    icon: <TerminalIcon />,
    name: 'CLI 工具',
    version: 'npm 全局安装',
    desc: '轻量级命令行界面'
  },
  {
    icon: <CodeIcon />,
    name: 'Claude Sonnet 4.5',
    version: 'Anthropic 官方模型',
    desc: '最强代码模型驱动'
  },
  {
    icon: <SearchIcon />,
    name: '跨平台支持',
    version: 'Windows/macOS/Linux',
    desc: '全平台完美适配'
  }
];

// TabPanel 组件
const TabPanel = (props) => {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} id={`simple-tabpanel-${index}`} aria-labelledby={`simple-tab-${index}`} {...other}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

TabPanel.propTypes = {
  children: PropTypes.node,
  value: PropTypes.number.isRequired,
  index: PropTypes.number.isRequired
};

// 主组件
const ClaudeCodeTutorialPage = () => {
  const theme = useTheme();
  const [value, setValue] = useState(0);
  const [osTab, setOsTab] = useState(0);
  const navigate = useNavigate();

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleOsTabChange = (_, newValue) => {
    setOsTab(newValue);
  };

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
          pt: 8,
          pb: 6,
          mb: 4,
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={7}>
              <Chip
                icon={<AutoAwesomeIcon fontSize="small" />}
                label="Claude 4.5 Sonnet 强力驱动"
                color="primary"
                variant="outlined"
                sx={{ mb: 2, fontWeight: 'bold', borderRadius: 0 }}
              />
              <Typography variant="h1" component="h1" gutterBottom fontWeight="800" sx={{ fontSize: { xs: '2.5rem', md: '3.5rem' } }}>
                Claude Code <br />
                <Box component="span" sx={{ color: 'primary.main' }}>
                  下一代 AI 编程助手
                </Box>
              </Typography>
              <Typography variant="h5" color="text.secondary" paragraph sx={{ mb: 4, lineHeight: 1.6 }}>
                不仅仅是代码补全，而是真正的结对编程伙伴。
                <br />
                在您的终端中直接运行，深度理解项目上下文，自动化处理繁琐任务。
              </Typography>
              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate('/panel/claude-code/subscription')}
                  endIcon={<ArrowForwardIcon />}
                  sx={{ borderRadius: 0, px: 4, py: 1.5, fontSize: '1.1rem', boxShadow: 'none' }}
                >
                  订阅管理
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => setValue(1)}
                  sx={{ borderRadius: 0, px: 4, py: 1.5, fontSize: '1.1rem' }}
                >
                  立即开始
                </Button>
                <Button
                  variant="text"
                  size="large"
                  onClick={() => window.open('https://docs.anthropic.com/claude/docs', '_blank')}
                  sx={{ borderRadius: 0, px: 4, py: 1.5, fontSize: '1.1rem' }}
                >
                  查看文档
                </Button>
              </Stack>
            </Grid>
            <Grid item xs={12} md={5} sx={{ display: { xs: 'none', md: 'block' } }}>
              <Paper
                elevation={0}
                variant="outlined"
                sx={{
                  p: 3,
                  borderRadius: 0,
                  background: '#1e1e1e',
                  color: '#fff',
                  fontFamily: 'monospace',
                  minHeight: 300,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center'
                }}
              >
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#ff5f56' }} />
                  <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#ffbd2e' }} />
                  <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#27c93f' }} />
                </Box>
                <Typography variant="body2" sx={{ color: '#a9a9a9' }}>
                  $ claude
                </Typography>
                <Typography variant="body2" sx={{ color: '#fff', mb: 2 }}>
                  Hello! I&apos;m Claude Code. How can I help you with your project today?
                </Typography>
                <Typography variant="body2" sx={{ color: '#a9a9a9' }}>
                  {'>'} Refactor the user authentication module
                </Typography>
                <Typography variant="body2" sx={{ color: '#fff', mt: 1 }}>
                  I&apos;ll help you refactor the auth module. First, let me analyze the current implementation in{' '}
                  <Box component="span" sx={{ fontFamily: 'monospace' }}>
                    src/auth
                  </Box>
                  ...
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Container maxWidth="lg">
        <Box sx={{ mb: 4 }}>
          <Tabs
            value={value}
            onChange={handleChange}
            centered
            sx={{
              '& .MuiTabs-indicator': {
                height: 2
              },
              '& .MuiTab-root': {
                fontSize: '1rem',
                fontWeight: 600,
                textTransform: 'none',
                minWidth: 120,
                width: 120,
                mx: 1
              }
            }}
          >
            <Tab label="功能概览" />
            <Tab label="安装指南" />
            <Tab label="配置密钥" />
            <Tab label="使用教程" />
          </Tabs>
          <Divider />
        </Box>

        <TabPanel value={value} index={0}>
          {/* 功能特性网格 */}
          <Box sx={{ mb: 8 }}>
            <Typography variant="h4" component="h2" align="center" gutterBottom fontWeight="bold" sx={{ mb: 6 }}>
              为什么选择 Claude Code?
            </Typography>
            <Grid container spacing={4}>
              {features.map((feature, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card
                    variant="outlined"
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: 0,
                      border: '1px solid',
                      borderColor: 'divider',
                      '&:hover': {
                        bgcolor: alpha(theme.palette.action.hover, 0.1)
                      }
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1, p: 4 }}>
                      <Box sx={{ color: feature.color, mb: 2 }}>{feature.icon}</Box>
                      <Typography variant="h6" component="h3" gutterBottom fontWeight="bold">
                        {feature.title}
                      </Typography>
                      <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                        {feature.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* 核心优势 & 快速开始 */}
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Paper
                elevation={0}
                variant="outlined"
                sx={{
                  p: 4,
                  borderRadius: 0,
                  bgcolor: alpha(theme.palette.primary.main, 0.03),
                  borderColor: alpha(theme.palette.primary.main, 0.1)
                }}
              >
                <Typography variant="h5" component="h2" gutterBottom fontWeight="bold">
                  技术规格
                </Typography>
                <List sx={{ mt: 2 }}>
                  {supportedPlatforms.map((platform, index) => (
                    <ListItem key={index} sx={{ px: 0, py: 2 }}>
                      <ListItemIcon sx={{ minWidth: 40, color: 'primary.main' }}>{platform.icon}</ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography variant="subtitle1" fontWeight="600">
                            {platform.name}
                          </Typography>
                        }
                        secondary={
                          <React.Fragment>
                            <Typography variant="body2" component="span" color="text.primary">
                              {platform.version}
                            </Typography>
                            {' — ' + platform.desc}
                          </React.Fragment>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h4" component="h2" gutterBottom fontWeight="bold">
                  准备好开始了吗？
                </Typography>
                <Typography color="text.secondary" paragraph sx={{ mb: 4, fontSize: '1.1rem' }}>
                  只需简单三步，即可将您的开发效率提升到一个新的高度。
                </Typography>

                <Stack spacing={2}>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      display: 'flex',
                      alignItems: 'center',
                      cursor: 'pointer',
                      borderRadius: 0,
                      transition: '0.2s',
                      '&:hover': { bgcolor: 'action.hover' }
                    }}
                    onClick={() => setValue(1)}
                  >
                    <Typography variant="h6" sx={{ color: 'primary.main', mr: 2, width: 24, fontWeight: 'bold' }}>
                      1
                    </Typography>
                    <Box sx={{ textAlign: 'left' }}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        安装 CLI 工具
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        支持 Windows, macOS, Linux
                      </Typography>
                    </Box>
                    <ArrowForwardIcon sx={{ ml: 'auto', color: 'text.disabled' }} />
                  </Paper>

                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      display: 'flex',
                      alignItems: 'center',
                      cursor: 'pointer',
                      borderRadius: 0,
                      transition: '0.2s',
                      '&:hover': { bgcolor: 'action.hover' }
                    }}
                    onClick={() => setValue(2)}
                  >
                    <Typography variant="h6" sx={{ color: 'secondary.main', mr: 2, width: 24, fontWeight: 'bold' }}>
                      2
                    </Typography>
                    <Box sx={{ textAlign: 'left' }}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        配置 API 密钥
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        连接到 Chirou API 服务
                      </Typography>
                    </Box>
                    <ArrowForwardIcon sx={{ ml: 'auto', color: 'text.disabled' }} />
                  </Paper>

                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      display: 'flex',
                      alignItems: 'center',
                      cursor: 'pointer',
                      borderRadius: 0,
                      transition: '0.2s',
                      '&:hover': { bgcolor: 'action.hover' }
                    }}
                    onClick={() => setValue(3)}
                  >
                    <Typography variant="h6" sx={{ color: 'success.main', mr: 2, width: 24, fontWeight: 'bold' }}>
                      3
                    </Typography>
                    <Box sx={{ textAlign: 'left' }}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        启动 Claude Code
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        开始您的 AI 结对编程之旅
                      </Typography>
                    </Box>
                    <ArrowForwardIcon sx={{ ml: 'auto', color: 'text.disabled' }} />
                  </Paper>
                </Stack>
              </Box>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={value} index={1}>
          <Container maxWidth="lg">
            <Box sx={{ textAlign: 'center', mb: 6 }}>
              <Typography variant="h3" gutterBottom fontWeight="bold">
                安装 Claude Code
              </Typography>
              <Typography variant="h6" color="text.secondary">
                选择您的操作系统以获取详细的安装指南
              </Typography>
            </Box>

            <Paper variant="outlined" sx={{ borderRadius: 0, overflow: 'hidden' }}>
              <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.default' }}>
                <Tabs
                  value={osTab}
                  onChange={handleOsTabChange}
                  centered
                  variant="fullWidth"
                  sx={{
                    '& .MuiTab-root': { py: 3, fontSize: '1rem' }
                  }}
                >
                  <Tab icon={<FaWindows style={{ marginRight: 8, fontSize: 20 }} />} label="Windows" iconPosition="start" />
                  <Tab icon={<FaApple style={{ marginRight: 8, fontSize: 20 }} />} label="macOS" iconPosition="start" />
                  <Tab icon={<FaLinux style={{ marginRight: 8, fontSize: 20 }} />} label="Linux" iconPosition="start" />
                </Tabs>
              </Box>

              <Box sx={{ p: 0 }}>
                {osTab === 0 && <WindowsTutorial />}
                {osTab === 1 && <MacOSTutorial />}
                {osTab === 2 && <LinuxTutorial />}
              </Box>
            </Paper>
          </Container>
        </TabPanel>

        <TabPanel value={value} index={2}>
          <Container maxWidth="lg">
            <Box sx={{ textAlign: 'center', mb: 6 }}>
              <Typography variant="h3" gutterBottom fontWeight="bold">
                配置密钥
              </Typography>
              <Typography variant="h6" color="text.secondary">
                连接 Chirou API 以解锁完整功能
              </Typography>
            </Box>

            <Alert severity="info" variant="outlined" sx={{ mb: 4, borderRadius: 0 }}>
              <Typography variant="body1">请确保您已经完成了第一步的 CLI 工具安装。</Typography>
            </Alert>

            <Paper variant="outlined" sx={{ p: 4, borderRadius: 0 }}>
              <Typography variant="h6" gutterBottom>
                配置说明
              </Typography>
              <Typography variant="body1" paragraph>
                密钥配置步骤已包含在各平台的安装指南中。请返回 <strong>&quot;安装指南&quot;</strong> 标签页，选择您的操作系统，查看详细的{' '}
                <strong>&quot;配置 Chirou API&quot;</strong> 部分。
              </Typography>
              <Button variant="outlined" onClick={() => setValue(1)}>
                前往安装指南
              </Button>
            </Paper>
          </Container>
        </TabPanel>

        <TabPanel value={value} index={3}>
          <Container maxWidth="lg">
            <Box sx={{ textAlign: 'center', mb: 6 }}>
              <Typography variant="h3" gutterBottom fontWeight="bold">
                开始编程
              </Typography>
              <Typography variant="h6" color="text.secondary">
                启动您的 AI 助手
              </Typography>
            </Box>

            <Alert severity="success" variant="outlined" sx={{ mb: 4, borderRadius: 0 }}>
              <Typography variant="body1">准备就绪！现在您可以开始体验下一代 AI 编程了。</Typography>
            </Alert>

            <Paper variant="outlined" sx={{ p: 4, borderRadius: 0 }}>
              <Typography variant="h6" gutterBottom>
                启动说明
              </Typography>
              <Typography variant="body1" paragraph>
                启动步骤已包含在各平台的安装指南中。请返回 <strong>&quot;安装指南&quot;</strong> 标签页，选择您的操作系统，查看详细的{' '}
                <strong>&quot;启动 Claude Code&quot;</strong> 部分。
              </Typography>
              <Button variant="contained" onClick={() => setValue(1)} sx={{ boxShadow: 'none' }}>
                查看启动命令
              </Button>
            </Paper>
          </Container>
        </TabPanel>
      </Container>
    </Box>
  );
};

export default ClaudeCodeTutorialPage;
