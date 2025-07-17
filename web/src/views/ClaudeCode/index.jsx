import React from 'react';

// 导入 Material-UI 组件
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Box,
  Stack,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Chip,
  Divider,
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

// 导入教程组件
import WindowsTutorial from './WindowsTutorial';
import MacOSTutorial from './MacOSTutorial';
import LinuxTutorial from './LinuxTutorial';

// 主要功能特性
const features = [
  {
    icon: <RocketLaunchIcon fontSize="large" color="primary" />,
    title: '🚀 智能代码生成',
    description: '快速生成高质量代码',
  },
  {
    icon: <SearchIcon fontSize="large" color="primary" />,
    title: '🔍 代码分析',
    description: '深度理解和分析代码结构',
  },
  {
    icon: <BugReportIcon fontSize="large" color="primary" />,
    title: '🛠️ 调试助手',
    description: '智能发现和修复代码问题',
  },
  {
    icon: <MenuBookIcon fontSize="large" color="primary" />,
    title: '📚 文档生成',
    description: '自动生成代码文档',
  },
  {
    icon: <TerminalIcon fontSize="large" color="primary" />,
    title: '⚡ 命令行集成',
    description: '无缝集成到开发流程',
  },
];

// 支持的平台信息
const supportedPlatforms = [
    { icon: <WindowIcon />, name: 'Windows', version: '支持 Windows 10/11' },
    { icon: <AppleIcon />, name: 'macOS', version: '支持 macOS 10.15+' },
    { icon: <SiLinux style={{ fontSize: 22 }} />, name: 'Linux', version: '支持主流 Linux 发行版' },
];

// 主组件
const ClaudeCodeTutorialPage = () => {
  const [currentView, setCurrentView] = React.useState('main');

  const handleTutorialClick = (os) => {
    setCurrentView(os.toLowerCase());
  };

  const handleBackToMain = () => {
    setCurrentView('main');
  };

  // 根据当前视图渲染不同的组件
  if (currentView === 'windows') {
    return <WindowsTutorial onBack={handleBackToMain} />;
  }
  
  if (currentView === 'mac') {
    return <MacOSTutorial onBack={handleBackToMain} />;
  }
  
  if (currentView === 'linux') {
    return <LinuxTutorial onBack={handleBackToMain} />;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
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
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', transition: '0.3s', '&:hover': { transform: 'scale(1.03)', boxShadow: 6 } }}>
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
                    <ListItemIcon sx={{ minWidth: 40, color: 'primary.main' }}>
                      {platform.icon}
                    </ListItemIcon>
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
                  选择您的操作系统，查看对应的安装和使用教程。每个教程都包含详细的安装步骤、配置方法和使用示例。
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
                    <Button variant="contained" size="large" onClick={() => handleTutorialClick('Windows')}>
                      Windows 版本教程
                    </Button>
                    <Button variant="contained" size="large" onClick={() => handleTutorialClick('Mac')}>
                      Mac 版本教程
                    </Button>
                    <Button variant="contained" size="large" onClick={() => handleTutorialClick('Linux')}>
                      Linux 版本教程
                    </Button>
                </Stack>
            </Box>
        </Grid>
      </Grid>
      
    </Container>
  );
};

export default ClaudeCodeTutorialPage;
