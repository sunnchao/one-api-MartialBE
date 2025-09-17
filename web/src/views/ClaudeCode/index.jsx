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
import WindowIcon from '@mui/icons-material/Window';
import AppleIcon from '@mui/icons-material/Apple';
import { SiLinux } from 'react-icons/si'; // 使用 react-icons 补充一个更形象的 Linux 图标

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
  { icon: <WindowIcon />, name: 'Windows', version: '支持 Windows 10/11' },
  { icon: <AppleIcon />, name: 'macOS', version: '支持 macOS 10.15+' },
  { icon: <SiLinux style={{ fontSize: 22 }} />, name: 'Linux', version: '支持主流 Linux 发行版' }
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
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const handleChange = (event, newValue) => {
    setValue(newValue);
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
          <Tab label="Windows 教程" />
          <Tab label="macOS 教程" />
          <Tab label="Linux 教程" />
        </Tabs>
      </Box>

      <TabPanel value={value} index={0}>
        {/* 顶部标题和介绍 */}
        <Box textAlign="center" mb={6}>
          <Typography variant="h2" component="h1" gutterBottom fontWeight="bold">
            欢迎使用 Claude Code
          </Typography>
          <Typography variant="h5" color="text.secondary">
            您的下一代AI编程伙伴
          </Typography>
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
          <Chip label="平台与安装" />
        </Divider>

        {/* 支持平台 & 开始使用 */}
        <Grid container spacing={4} alignItems="center">
          {/* 支持平台列表 */}
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h5" component="h2" gutterBottom>
                支持平台
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>
                Claude Code 支持多个主流操作系统：
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
                开始使用
              </Typography>
              <Typography color="text.secondary" mb={3}>
                请在上方标签页中选择您的操作系统，或通过下方按钮快速跳转。
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
                <Button variant="contained" size="large" onClick={() => setValue(1)}>
                  Windows 教程
                </Button>
                <Button variant="contained" size="large" onClick={() => setValue(2)}>
                  macOS 教程
                </Button>
                <Button variant="contained" size="large" onClick={() => setValue(3)}>
                  Linux 教程
                </Button>
              </Stack>
            </Box>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={value} index={1}>
        <WindowsTutorial />
      </TabPanel>

      <TabPanel value={value} index={2}>
        <MacOSTutorial />
      </TabPanel>

      <TabPanel value={value} index={3}>
        <LinuxTutorial />
      </TabPanel>
    </Container>
  );
};

export default ClaudeCodeTutorialPage;
