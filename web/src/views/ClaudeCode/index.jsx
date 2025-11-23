import React, { useState, useEffect } from 'react';

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
  Alert
} from '@mui/material';

// 导入 Material-UI 图标
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import SearchIcon from '@mui/icons-material/Search';
import BugReportIcon from '@mui/icons-material/BugReport';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import TerminalIcon from '@mui/icons-material/Terminal';
import CodeIcon from '@mui/icons-material/Code';

// 导入教程组件和API
import WindowsTutorial from './WindowsTutorial';
import MacOSTutorial from './MacOSTutorial';
import LinuxTutorial from './LinuxTutorial';
import { API } from 'utils/api';
import { useNavigate } from 'react-router-dom';

// 主要功能特性
const features = [
  {
    icon: <RocketLaunchIcon fontSize="large" color="primary" />,
    title: '🚀 智能代码生成',
    description: '快速生成高质量代码'
  },
  {
    icon: <SearchIcon fontSize="large" color="primary" />,
    title: '🔍 代码分析',
    description: '深度理解和分析代码结构'
  },
  {
    icon: <BugReportIcon fontSize="large" color="primary" />,
    title: '🛠️ 调试助手',
    description: '智能发现和修复代码问题'
  },
  {
    icon: <MenuBookIcon fontSize="large" color="primary" />,
    title: '📚 文档生成',
    description: '自动生成代码文档'
  },
  {
    icon: <TerminalIcon fontSize="large" color="primary" />,
    title: '⚡ 命令行集成',
    description: '无缝集成到开发流程'
  }
];

// 支持的平台信息
const supportedPlatforms = [
  { icon: <TerminalIcon style={{ fontSize: 22 }} />, name: 'CLI 工具', version: 'npm 全局安装' },
  { icon: <CodeIcon style={{ fontSize: 22 }} />, name: 'Claude Sonnet 4.5', version: 'Anthropic 官方模型' },
  { icon: <SearchIcon style={{ fontSize: 22 }} />, name: '跨平台支持', version: 'Windows/macOS/Linux' }
];

// TabPanel 组件
const TabPanel = (props) => {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} id={`simple-tabpanel-${index}`} aria-labelledby={`simple-tab-${index}`} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

// 主组件
const ClaudeCodeTutorialPage = () => {
  const [value, setValue] = useState(0);
  const [osTab, setOsTab] = useState(0);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleOsTabChange = (_, newValue) => {
    setOsTab(newValue);
  };

  // 检查订阅状态
  const checkSubscription = async () => {
    try {
      const res = await API.get('/api/user/claude-code/subscription');
      if (res.data.success) {
        setSubscription(res.data.data);
      }
    } catch (error) {
      console.error('检查订阅状态失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // checkSubscription();
  }, []);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* 订阅状态提醒 */}
      {/* {!loading && (
        <Box sx={{ mb: 3 }}>
          {subscription && subscription.status === 'active' ? (
            <Alert
              severity="success"
              action={
                <Button color="inherit" size="small" onClick={() => navigate('/panel/claude-code/subscription')}>
                  管理订阅
                </Button>
              }
            >
              <Typography variant="body2">
                您的 <strong>{subscription.plan_type}</strong> 订阅正在正常运行， 本月已使用 {subscription.used_requests_this_month}/
                {subscription.max_requests_per_month} 次请求
              </Typography>
            </Alert>
          ) : (
            <Alert
              severity="info"
              action={
                <Button color="inherit" size="small" disabled>
                  敬请期待
                </Button>
              }
            >
              <Typography variant="body2">Claude Code AI 编程助手功能即将上线，敬请期待！</Typography>
            </Alert>
          )}
        </Box>
      )} */}

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange} aria-label="Claude Code Tabs" centered>
          <Tab label="功能介绍" />
          <Tab label="安装 CLI" />
          <Tab label="配置密钥" />
          <Tab label="开始编程" />
        </Tabs>
      </Box>

      <TabPanel value={value} index={0}>
        {/* 顶部标题和介绍 */}
        <Box textAlign="center" mb={6}>
          <Typography variant="h2" component="h1" gutterBottom fontWeight="bold">
            🚀 Claude Code 快速开始
          </Typography>
          <Typography variant="h5" color="text.secondary">
            Anthropic 官方 CLI 工具，Claude Sonnet 4.5 驱动
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 3 }}>
            <Chip label="1. 安装 CLI" color="primary" />
            <Chip label="2. 配置密钥" color="primary" />
            <Chip label="3. 开始编程" color="primary" />
          </Stack>
        </Box>

        {/* 功能特性网格 */}
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: '0.3s',
                  borderRadius: '16px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
                  }
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box display="flex" alignItems="center" mb={2}>
                    {feature.icon}
                    <Typography variant="h6" component="h3" sx={{ ml: 1.5 }}>
                      {feature.title}
                    </Typography>
                  </Box>
                  <Typography variant="body1" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* 分割线 */}
        <Divider sx={{ my: 6 }}>
          <Chip label="快速开始" />
        </Divider>

        {/* 支持平台 & 开始使用 */}
        <Grid container spacing={4} alignItems="center">
          {/* 支持平台列表 */}
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h5" component="h2" gutterBottom>
                核心特性
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>
                Claude Code 提供强大的 AI 编程辅助功能：
              </Typography>
              <List>
                {supportedPlatforms.map((platform, index) => (
                  <ListItem key={index}>
                    <ListItemIcon sx={{ minWidth: 40, color: 'primary.main' }}>{platform.icon}</ListItemIcon>
                    <ListItemText primary={platform.name} secondary={platform.version} />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>

          {/* 开始使用 */}
          <Grid item xs={12} md={6}>
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h5" component="h2" gutterBottom>
                三步快速开始
              </Typography>
              <Typography color="text.secondary" mb={3}>
                只需三个步骤，即可开始使用 Claude Code 进行 AI 编程
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
                <Button variant="contained" size="large" onClick={() => setValue(1)} startIcon={<span>1️⃣</span>}>
                  安装 CLI
                </Button>
                <Button variant="contained" size="large" onClick={() => setValue(2)} startIcon={<span>2️⃣</span>}>
                  配置密钥
                </Button>
                <Button variant="contained" size="large" onClick={() => setValue(3)} startIcon={<span>3️⃣</span>}>
                  开始编程
                </Button>
              </Stack>
            </Box>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={value} index={1}>
        <Container maxWidth="md">
          <Typography variant="h4" gutterBottom>
            Claude Code 安装步骤
          </Typography>
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">详细的分平台安装指南</Typography>
          </Alert>

          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs value={osTab} onChange={handleOsTabChange} aria-label="OS Tabs" centered>
              <Tab label="Windows" />
              <Tab label="macOS" />
              <Tab label="Linux" />
            </Tabs>
          </Box>

          {osTab === 0 && <WindowsTutorial />}
          {osTab === 1 && <MacOSTutorial />}
          {osTab === 2 && <LinuxTutorial />}
        </Container>
      </TabPanel>

      <TabPanel value={value} index={2}>
        <Container maxWidth="md">
          <Typography variant="h4" gutterBottom>
            配置密钥
          </Typography>
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">配置 Chirou API API 密钥以使用 Claude Code</Typography>
          </Alert>
          <Paper sx={{ p: 3 }}>
            <Typography variant="body1">
              请参考"安装 CLI"标签页中对应操作系统的配置步骤完成密钥配置。
            </Typography>
          </Paper>
        </Container>
      </TabPanel>

      <TabPanel value={value} index={3}>
        <Container maxWidth="md">
          <Typography variant="h4" gutterBottom>
            开始编程
          </Typography>
          <Alert severity="success" sx={{ mb: 3 }}>
            <Typography variant="body2">启动 Claude Code 并开始您的 AI 编程之旅</Typography>
          </Alert>
          <Paper sx={{ p: 3 }}>
            <Typography variant="body1">
              请参考"安装 CLI"标签页中对应操作系统的启动步骤完成首次配置。
            </Typography>
          </Paper>
        </Container>
      </TabPanel>
    </Container>
  );
};

export default ClaudeCodeTutorialPage;
