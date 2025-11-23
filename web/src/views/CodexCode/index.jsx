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
  Alert
} from '@mui/material';

// 导入 Material-UI 图标
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import SearchIcon from '@mui/icons-material/Search';
import BugReportIcon from '@mui/icons-material/BugReport';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import TerminalIcon from '@mui/icons-material/Terminal';
import CodeIcon from '@mui/icons-material/Code';

// 导入 CodeBlock 组件
import CodeBlock from 'ui-component/CodeBlock';

// 导入各系统教程组件
import WindowsTutorial from './WindowsTutorial';
import MacOSTutorial from './MacOSTutorial';
import LinuxTutorial from './LinuxTutorial';
import VSCodeTutorial from './VSCodeTutorial';

// 主要功能特性
const features = [
  {
    icon: <RocketLaunchIcon fontSize="large" color="primary" />,
    title: '🚀 智能代码生成',
    description: '基于 GPT-5 的高质量代码生成和智能补全'
  },
  {
    icon: <SearchIcon fontSize="large" color="primary" />,
    title: '🔍 深度分析',
    description: '深度分析和理解整个代码库结构'
  },
  {
    icon: <BugReportIcon fontSize="large" color="primary" />,
    title: '🛠️ 智能重构',
    description: '智能重构代码，应用最佳设计模式'
  },
  {
    icon: <MenuBookIcon fontSize="large" color="primary" />,
    title: '📚 Git 集成',
    description: '自动生成提交信息和代码审查'
  },
  {
    icon: <TerminalIcon fontSize="large" color="primary" />,
    title: '⚡ GPT-5 驱动',
    description: '企业级 AI 编程助手，强大的推理能力'
  }
];

// 支持的平台信息
const supportedPlatforms = [
  { icon: <TerminalIcon style={{ fontSize: 22 }} />, name: 'CLI 工具', version: 'npm 全局安装' },
  { icon: <CodeIcon style={{ fontSize: 22 }} />, name: 'GPT-5 模型', version: '企业级 AI 助手' },
  { icon: <SearchIcon style={{ fontSize: 22 }} />, name: '网络访问', version: '实时联网能力' }
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
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom>
        CodeX 安装步骤
      </Typography>
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">选择您的操作系统，查看对应的安装教程</Typography>
      </Alert>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={osTab} onChange={handleOsTabChange} aria-label="Operating System Tabs" centered>
          <Tab label="Windows" />
          <Tab label="macOS" />
          <Tab label="Linux" />
        </Tabs>
      </Box>

      <TabPanel value={osTab} index={0}>
        <WindowsTutorial />
      </TabPanel>
      <TabPanel value={osTab} index={1}>
        <MacOSTutorial />
      </TabPanel>
      <TabPanel value={osTab} index={2}>
        <LinuxTutorial />
      </TabPanel>
    </Container>
  );
};

// VSCode 配置教程组件（引用独立组件）
const CodexVSCodeTutorial = () => <VSCodeTutorial />;

// 主组件
const CodexCodeTutorialPage = () => {
  const [value, setValue] = useState(0);

  const handleChange = (_, newValue) => {
    setValue(newValue);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange} aria-label="CodeX Tabs" centered>
          <Tab label="功能介绍" />
          <Tab label="环境准备" />
          <Tab label="VSCode 配置" />
        </Tabs>
      </Box>

      <TabPanel value={value} index={0}>
        {/* 顶部标题和介绍 */}
        <Box textAlign="center" mb={6}>
          <Typography variant="h2" component="h1" gutterBottom fontWeight="bold">
            🚀 CodeX 快速开始
          </Typography>
          <Typography variant="h5" color="text.secondary">
            企业级 AI 编程助手，GPT-5 驱动
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 3 }}>
            <Chip label="1. 环境准备" color="primary" />
            <Chip label="2. VSCode 配置" color="primary" />
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
                CodeX CLI 提供强大的 AI 编程辅助功能：
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
                两步快速开始
              </Typography>
              <Typography color="text.secondary" mb={3}>
                只需两个步骤，即可开始使用 CodeX CLI 进行 AI 编程
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
                <Button variant="contained" size="large" onClick={() => setValue(1)} startIcon={<span>1️⃣</span>}>
                  环境准备
                </Button>
                <Button variant="contained" size="large" onClick={() => setValue(2)} startIcon={<span>2️⃣</span>}>
                  VSCode 配置
                </Button>
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
  );
};

export default CodexCodeTutorialPage;
