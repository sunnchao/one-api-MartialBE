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
import { SiGithub } from 'react-icons/si';

// 主要功能特性
const features = [
  {
    icon: <RocketLaunchIcon fontSize="large" color="primary" />,
    title: '🚀 智能代码生成',
    description: '基于 GPT-5 的高质量代码生成和智能补全'
  },
  {
    icon: <SearchIcon fontSize="large" color="primary" />,
    title: '🔍 代码分析',
    description: '深度分析和理解整个代码库结构'
  },
  {
    icon: <BugReportIcon fontSize="large" color="primary" />,
    title: '🛠️ 代码重构',
    description: '智能重构代码，应用最佳设计模式'
  },
  {
    icon: <MenuBookIcon fontSize="large" color="primary" />,
    title: '📚 Git 集成',
    description: '自动生成提交信息和代码审查'
  },
  {
    icon: <TerminalIcon fontSize="large" color="primary" />,
    title: '⚡ 命令行工具',
    description: 'Chirou API 驱动的强大命令行界面'
  }
];

// 支持的平台信息
const supportedPlatforms = [
  { icon: <TerminalIcon style={{ fontSize: 22 }} />, name: 'CLI 工具', version: 'npm/brew 安装' },
  { icon: <SiGithub style={{ fontSize: 22 }} />, name: 'Git 集成', version: '提交信息生成' },
  { icon: <CodeIcon style={{ fontSize: 22 }} />, name: 'Chirou API', version: 'GPT-5 模型' }
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

// Codex 安装教程组件
const CodexInstallTutorial = () => (
  <Container maxWidth="md">
    <Typography variant="h4" gutterBottom>
      Codex CLI 安装指南
    </Typography>
    <Alert severity="info" sx={{ mb: 3 }}>
      <Typography variant="body2">选择您喜止的安装方式，快速开始使用 Codex CLI 工具</Typography>
    </Alert>

    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom color="primary">
        第 1 步：获取 API Key
      </Typography>
      <Typography variant="body1" sx={{ mb: 2 }}>
        在开始使用 Codex 之前，您需要先获取 Chirou API Key
      </Typography>
      <Box sx={{ backgroundColor: 'grey.100', p: 2, borderRadius: 1, fontFamily: 'monospace' }}>
        <Typography variant="body2">
          1. 前往 Chirou 仪表盘
          <br />
          2. 注册或登录您的账户
          <br />
          3. 在 API 管理中生成新的 API Key
          <br />
          4. 复制并保存您的 API Key
        </Typography>
      </Box>
    </Paper>

    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom color="primary">
        第 2 步：安装 Codex
      </Typography>
      <Typography variant="body1" sx={{ mb: 2 }}>
        使用 npm 或 brew 安装 Codex CLI 工具
      </Typography>
      <Box sx={{ backgroundColor: 'grey.100', p: 2, borderRadius: 1, fontFamily: 'monospace' }}>
        <Typography variant="body2">
          # 使用 npm 安装
          <br />
          npm install -g @openai/codex
          <br />
          <br />
          # 或者使用 brew 安装
          <br />
          brew install codex
        </Typography>
      </Box>
    </Paper>

    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom color="primary">
        第 3 步：验证安装
      </Typography>
      <Typography variant="body1" sx={{ mb: 2 }}>
        验证 Codex 是否正确安装
      </Typography>
      <Box sx={{ backgroundColor: 'grey.100', p: 2, borderRadius: 1, fontFamily: 'monospace' }}>
        <Typography variant="body2">
          # 检查版本
          <br />
          codex --version
          <br />
          <br />
          # 查看帮助信息
          <br />
          codex --help
        </Typography>
      </Box>
    </Paper>
  </Container>
);

// Codex 配置教程组件
const CodexConfigTutorial = () => (
  <Container maxWidth="md">
    <Typography variant="h4" gutterBottom>
      Codex 配置设置
    </Typography>
    <Alert severity="warning" sx={{ mb: 3 }}>
      <Typography variant="body2">在使用 Codex 之前，需要创建配置文件并设置环境变量</Typography>
    </Alert>

    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom color="primary">
        步骤 1：创建配置文件夹
      </Typography>
      <Typography variant="body1" sx={{ mb: 2 }}>
        在系统根目录创建 .codex 文件夹
      </Typography>
      <Box sx={{ backgroundColor: 'grey.100', p: 2, borderRadius: 1, fontFamily: 'monospace' }}>
        <Typography variant="body2">
          # macOS/Linux
          <br />
          mkdir ~/.codex
          <br />
          <br />
          # Windows
          <br />
          mkdir %USERPROFILE%\.codex
        </Typography>
      </Box>
    </Paper>

    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom color="primary">
        步骤 2：配置 config.toml
      </Typography>
      <Typography variant="body1" sx={{ mb: 2 }}>
        在 ~/.codex/ 目录下创建 config.toml 文件
      </Typography>
      <Box sx={{ backgroundColor: 'grey.100', p: 2, borderRadius: 1, fontFamily: 'monospace' }}>
        <Typography variant="body2">
          {`model_provider = "maijik"
model = "gpt-5"
model_reasoning_effort = "high"
disable_response_storage = true

[model_providers.maijik]
name = "maijik"
base_url = "https://api.maijik.com/v1"
wire_api = "responses"`}
        </Typography>
      </Box>
    </Paper>

    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom color="primary">
        步骤 3：配置 auth.json
      </Typography>
      <Typography variant="body1" sx={{ mb: 2 }}>
        在 ~/.codex/ 目录下创建 auth.json 文件
      </Typography>
      <Box sx={{ backgroundColor: 'grey.100', p: 2, borderRadius: 1, fontFamily: 'monospace' }}>
        <Typography variant="body2">
          {`{
  "OPENAI_API_KEY": "your-api-key-here"
}`}
        </Typography>
      </Box>
    </Paper>

    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom color="primary">
        步骤 4：设置环境变量
      </Typography>
      <Typography variant="body1" sx={{ mb: 2 }}>
        设置 Chirou API Key 环境变量
      </Typography>
      <Box sx={{ backgroundColor: 'grey.100', p: 2, borderRadius: 1, fontFamily: 'monospace' }}>
        <Typography variant="body2">
          # 临时设置
          <br />
          export maijik="your-api-key-here"
          <br />
          <br />
          # 永久设置（添加到 ~/.bashrc 或 ~/.zshrc）
          <br />
          echo 'export maijik="your-api-key-here"' &gt;&gt; ~/.bashrc
          <br />
          source ~/.bashrc
        </Typography>
      </Box>
    </Paper>
  </Container>
);

// Codex 使用示例组件
const CodexUsageTutorial = () => (
  <Container maxWidth="md">
    <Typography variant="h4" gutterBottom>
      Codex 使用示例
    </Typography>
    <Alert severity="success" sx={{ mb: 3 }}>
      <Typography variant="body2">在项目目录中运行 Codex 命令，享受 AI 编程助手的强大功能</Typography>
    </Alert>

    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom color="primary">
        基础命令
      </Typography>
      <Typography variant="body1" sx={{ mb: 2 }}>
        常用的 Codex CLI 命令
      </Typography>
      <Box sx={{ backgroundColor: 'grey.100', p: 2, borderRadius: 1, fontFamily: 'monospace' }}>
        <Typography variant="body2">
          # 在项目目录中启动 Codex
          <br />
          codex
          <br />
          <br />
          # 查看帮助信息
          <br />
          codex help
          <br />
          <br />
          # 查看版本信息
          <br />
          codex --version
        </Typography>
      </Box>
    </Paper>

    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom color="primary">
        代码编辑
      </Typography>
      <Typography variant="body1" sx={{ mb: 2 }}>
        使用 Codex 编辑和修改代码文件
      </Typography>
      <Box sx={{ backgroundColor: 'grey.100', p: 2, borderRadius: 1, fontFamily: 'monospace' }}>
        <Typography variant="body2">
          # 编辑指定文件
          <br />
          codex edit src/components/Button.tsx
          <br />
          <br />
          # 分析代码目录
          <br />
          codex analyze --files src/
        </Typography>
      </Box>
    </Paper>

    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom color="primary">
        Git 集成
      </Typography>
      <Typography variant="body1" sx={{ mb: 2 }}>
        自动生成提交信息和代码审查
      </Typography>
      <Box sx={{ backgroundColor: 'grey.100', p: 2, borderRadius: 1, fontFamily: 'monospace' }}>
        <Typography variant="body2">
          # 自动生成提交信息
          <br />
          codex commit
          <br />
          <br />
          # 代码审查
          <br />
          codex review
        </Typography>
      </Box>
    </Paper>

    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom color="primary">
        高级用法
      </Typography>
      <Typography variant="body1" sx={{ mb: 2 }}>
        使用设计模式进行代码重构
      </Typography>
      <Box sx={{ backgroundColor: 'grey.100', p: 2, borderRadius: 1, fontFamily: 'monospace' }}>
        <Typography variant="body2">
          # 使用观察者模式重构
          <br />
          codex refactor --pattern observer src/stores/
          <br />
          <br />
          # 生成文档
          <br />
          codex docs --output docs/
          <br />
          <br />
          # 代码质量检查
          <br />
          codex quality --check-all
        </Typography>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
        提示：使用 codex help [command] 查看具体命令的详细帮助信息
      </Typography>
    </Paper>
  </Container>
);

// 主组件
const CodexCodeTutorialPage = () => {
  const [value, setValue] = useState(0);

  const handleChange = (_, newValue) => {
    setValue(newValue);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange} aria-label="Codex Tabs" centered>
          <Tab label="功能介绍" />
          <Tab label="安装指南" />
          <Tab label="配置设置" />
          <Tab label="使用示例" />
        </Tabs>
      </Box>

      <TabPanel value={value} index={0}>
        {/* 顶部标题和介绍 */}
        <Box textAlign="center" mb={6}>
          <Typography variant="h2" component="h1" gutterBottom fontWeight="bold">
            欢迎使用 Codex CLI
          </Typography>
          <Typography variant="h5" color="text.secondary">
            基于 Chirou API 的强大 AI 编程助手
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
          <Chip label="支持平台" />
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
                Codex CLI 支持多种开发环境和集成方式：
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
                请在上方标签页中选择您想要的集成方式，或通过下方按钮快速跳转。
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
                <Button variant="contained" size="large" onClick={() => setValue(1)}>
                  安装指南
                </Button>
                <Button variant="contained" size="large" onClick={() => setValue(2)}>
                  配置设置
                </Button>
                <Button variant="contained" size="large" onClick={() => setValue(3)}>
                  使用示例
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
        <CodexConfigTutorial />
      </TabPanel>

      <TabPanel value={value} index={3}>
        <CodexUsageTutorial />
      </TabPanel>
    </Container>
  );
};

export default CodexCodeTutorialPage;
