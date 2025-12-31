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

// 导入 CodeBlock 组件
import CodeBlock from 'ui-component/CodeBlock';

// 导入各系统教程组件
import WindowsTutorial from './WindowsTutorial';
import MacOSTutorial from './MacOSTutorial';
import LinuxTutorial from './LinuxTutorial';
import VSCodeTutorial from './VSCodeTutorial';
import { useNavigate } from 'react-router-dom';

// 主要功能特性
const features = [
  {
    icon: <RocketLaunchIcon fontSize="large" />,
    title: '智能代码生成',
    description: '基于 GPT-5.2 的高质量代码生成和智能补全',
    color: '#2196f3'
  },
  {
    icon: <SearchIcon fontSize="large" />,
    title: '深度分析',
    description: '深度分析和理解整个代码库结构',
    color: '#9c27b0'
  },
  {
    icon: <BugReportIcon fontSize="large" />,
    title: '智能重构',
    description: '智能重构代码，应用最佳设计模式',
    color: '#f44336'
  },
  {
    icon: <MenuBookIcon fontSize="large" />,
    title: 'Git 集成',
    description: '自动生成提交信息和代码审查',
    color: '#4caf50'
  },
  {
    icon: <TerminalIcon fontSize="large" />,
    title: 'GPT 5.2 驱动',
    description: '企业级 AI 编程助手，强大的推理能力',
    color: '#ff9800'
  }
];

// 支持的平台信息
const supportedPlatforms = [
  { icon: <TerminalIcon />, name: 'CLI 工具', version: 'npm 全局安装' },
  { icon: <CodeIcon />, name: 'GPT-5.2 模型', version: '企业级 AI 助手' },
  { icon: <SearchIcon />, name: '网络访问', version: '实时联网能力' }
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

// CodeX 安装教程组件
const CodexInstallTutorial = () => {
  const [osTab, setOsTab] = React.useState(0);

  const handleOsTabChange = (_, newValue) => {
    setOsTab(newValue);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h3" gutterBottom fontWeight="bold">
          CodeX 安装步骤
        </Typography>
        <Typography variant="h6" color="text.secondary">
          选择您的操作系统，查看对应的安装教程
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
          <TabPanel value={osTab} index={0}>
            <WindowsTutorial />
          </TabPanel>
          <TabPanel value={osTab} index={1}>
            <MacOSTutorial />
          </TabPanel>
          <TabPanel value={osTab} index={2}>
            <LinuxTutorial />
          </TabPanel>
        </Box>
      </Paper>
    </Container>
  );
};

// VSCode 配置教程组件（引用独立组件）
const CodexVSCodeTutorial = () => <VSCodeTutorial />;

// 主组件
const CodexCodeTutorialPage = () => {
  const theme = useTheme();
  const [value, setValue] = useState(0);
  const navigate = useNavigate();

  const handleChange = (_, newValue) => {
    setValue(newValue);
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
                label="GPT-5.2 强力驱动"
                color="primary"
                variant="outlined"
                sx={{ mb: 2, fontWeight: 'bold', borderRadius: 0 }}
              />
              <Typography variant="h1" component="h1" gutterBottom fontWeight="800" sx={{ fontSize: { xs: '2.5rem', md: '3.5rem' } }}>
                CodeX <br />
                <Box component="span" sx={{ color: 'primary.main' }}>
                  企业级 AI 编程助手
                </Box>
              </Typography>
              <Typography variant="h5" color="text.secondary" paragraph sx={{ mb: 4, lineHeight: 1.6 }}>
                不仅仅是代码补全，而是真正的结对编程伙伴。
                <br />
                基于 GPT-5.2 模型，提供深度代码分析和智能重构能力。
              </Typography>
              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate('/panel/subscriptions')}
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
                  onClick={() => window.open('https://openai.com/index/introducing-codex/', '_blank')}
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
                  $ codex
                </Typography>
                <Typography variant="body2" sx={{ color: '#fff', mb: 2 }}>
                  CodeX CLI v2.0.0 - Powered by GPT-5
                </Typography>
                <Typography variant="body2" sx={{ color: '#a9a9a9' }}>
                  {'>'} Analyze the current project structure
                </Typography>
                <Typography variant="body2" sx={{ color: '#fff', mt: 1 }}>
                  Scanning project files... Found 124 files.
                  <br />
                  Project structure analysis complete. Detected React + Vite configuration.
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
            <Tab label="环境准备" />
            <Tab label="VSCode 配置" />
          </Tabs>
          <Divider />
        </Box>

        <TabPanel value={value} index={0}>
          {/* 功能特性网格 */}
          <Box sx={{ mb: 8 }}>
            <Typography variant="h4" component="h2" align="center" gutterBottom fontWeight="bold" sx={{ mb: 6 }}>
              为什么选择 CodeX?
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
                        secondary={platform.version}
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
                  只需简单两步，即可将您的开发效率提升到一个新的高度。
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
                        环境准备
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        安装 CLI 工具和依赖
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
                        VSCode 配置
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        配置 IDE 插件和快捷键
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
          <CodexInstallTutorial />
        </TabPanel>

        <TabPanel value={value} index={2}>
          <CodexVSCodeTutorial />
        </TabPanel>
      </Container>
    </Box>
  );
};

export default CodexCodeTutorialPage;
