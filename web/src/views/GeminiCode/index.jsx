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

// 导入各系统安装教程组件
import WindowsTutorial from './WindowsTutorial';
import MacOSTutorial from './MacOSTutorial';
import LinuxTutorial from './LinuxTutorial';
import { useNavigate } from 'react-router-dom';

// 主要功能特性
const features = [
  {
    icon: <RocketLaunchIcon fontSize="large" />,
    title: '超大上下文窗口',
    description: '1M tokens 上下文，处理超大规模项目',
    color: '#2196f3'
  },
  {
    icon: <SearchIcon fontSize="large" />,
    title: 'Agent Mode',
    description: '自动规划任务，智能执行复杂操作',
    color: '#9c27b0'
  },
  {
    icon: <BugReportIcon fontSize="large" />,
    title: 'Google Search',
    description: '实时联网搜索，获取最新信息',
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
    title: 'Gemini 3 Pro',
    description: 'Google AI 最新模型驱动',
    color: '#ff9800'
  }
];

// 支持的平台信息
const supportedPlatforms = [
  { icon: <TerminalIcon />, name: 'CLI 工具', version: 'npm 全局安装' },
  { icon: <SearchIcon />, name: 'Google AI', version: 'Gemini 3 Pro' },
  { icon: <CodeIcon />, name: '1M Context', version: '超大上下文窗口' }
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

// Gemini 安装教程组件
const GeminiInstallTutorial = () => {
  const [osTab, setOsTab] = React.useState(0);

  const handleOsTabChange = (_, newValue) => {
    setOsTab(newValue);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h3" gutterBottom fontWeight="bold">
          安装 Gemini CLI
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

// Gemini 配置教程组件
const GeminiConfigTutorial = () => (
  <Container maxWidth="lg">
    <Box sx={{ textAlign: 'center', mb: 6 }}>
      <Typography variant="h3" gutterBottom fontWeight="bold">
        配置 Gemini CLI
      </Typography>
      <Typography variant="h6" color="text.secondary">
        配置 API 密钥和环境变量
      </Typography>
    </Box>

    <Alert severity="warning" variant="outlined" sx={{ mb: 4, borderRadius: 0 }}>
      <Typography variant="body2">
        <strong>重要提示：</strong> 请将下方的 GEMINI_API_KEY 替换为您在 https://Chirou API.com/console/token 生成的 Gemini CLI 专用 API
        密钥！
      </Typography>
    </Alert>

    <Paper variant="outlined" sx={{ p: 4, mb: 4, borderRadius: 0 }}>
      <Typography variant="h6" gutterBottom color="primary" fontWeight="bold">
        步骤 1：创建 .gemini 文件夹
      </Typography>
      <Typography variant="body1" sx={{ mb: 2 }}>
        配置位置：%USERPROFILE%\.gemini\
      </Typography>
      <CodeBlock
        language="bash"
        code={`# Windows CMD
mkdir %USERPROFILE%\\.gemini

# Windows PowerShell
mkdir $env:USERPROFILE\\.gemini

# macOS/Linux
mkdir -p ~/.gemini`}
      />
    </Paper>

    <Paper variant="outlined" sx={{ p: 4, mb: 4, borderRadius: 0 }}>
      <Typography variant="h6" gutterBottom color="primary" fontWeight="bold">
        步骤 2：创建 .env 文件
      </Typography>
      <Typography variant="body1" sx={{ mb: 2 }}>
        在 .gemini 文件夹中创建 .env 文件：
      </Typography>
      <CodeBlock
        language="bash"
        code={`GOOGLE_GEMINI_BASE_URL=https://api.wochirou.com/gemini
GEMINI_API_KEY=粘贴为Gemini CLI专用分组令牌key
GEMINI_MODEL=gemini-3-pro-preview`}
      />
      <Alert severity="info" variant="outlined" sx={{ mt: 2, borderRadius: 0 }}>
        <Typography variant="body2">
          请在 Chirou API.com 控制台创建一个专门用于 Gemini CLI 的分组令牌，并将其粘贴到 GEMINI_API_KEY 中。
        </Typography>
      </Alert>
    </Paper>

    <Paper variant="outlined" sx={{ p: 4, mb: 4, borderRadius: 0 }}>
      <Typography variant="h6" gutterBottom color="primary" fontWeight="bold">
        步骤 3：创建 settings.json 文件
      </Typography>
      <Typography variant="body1" sx={{ mb: 2 }}>
        在 .gemini 文件夹中创建 settings.json 文件：
      </Typography>
      <CodeBlock
        language="json"
        code={`{
  "ide": {
    "enabled": true
  },
  "security": {
    "auth": {
      "selectedType": "gemini-api-key"
    }
  }
}`}
      />
      <Alert severity="warning" variant="outlined" sx={{ mt: 2, borderRadius: 0 }}>
        <Typography variant="body2">
          <strong>注意：</strong> 配置文件更加安全且便于管理，需要重启 Gemini CLI 才生效。
        </Typography>
      </Alert>
    </Paper>
  </Container>
);

// Gemini 使用示例组件
const GeminiUsageTutorial = () => (
  <Container maxWidth="lg">
    <Box sx={{ textAlign: 'center', mb: 6 }}>
      <Typography variant="h3" gutterBottom fontWeight="bold">
        启动 Gemini CLI
      </Typography>
      <Typography variant="h6" color="text.secondary">
        开始体验下一代 AI 编程
      </Typography>
    </Box>

    <Alert severity="success" variant="outlined" sx={{ mb: 4, borderRadius: 0 }}>
      <Typography variant="body2">配置完成后，运行以下命令开始使用 Gemini CLI</Typography>
    </Alert>

    <Paper variant="outlined" sx={{ p: 4, mb: 4, borderRadius: 0 }}>
      <Typography variant="h6" gutterBottom color="primary" fontWeight="bold">
        启动命令
      </Typography>
      <CodeBlock language="bash" code={`gemini`} />
      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
        在项目目录中运行此命令即可启动 Gemini CLI
      </Typography>
    </Paper>

    <Paper variant="outlined" sx={{ p: 4, mb: 4, borderRadius: 0 }}>
      <Typography variant="h6" gutterBottom color="primary" fontWeight="bold">
        核心特性
      </Typography>
      <List>
        <ListItem>
          <ListItemIcon>
            <RocketLaunchIcon color="primary" />
          </ListItemIcon>
          <ListItemText primary="超大上下文窗口" secondary="1M tokens 上下文，处理超大规模项目" />
        </ListItem>
        <ListItem>
          <ListItemIcon>
            <SearchIcon color="primary" />
          </ListItemIcon>
          <ListItemText primary="Agent Mode" secondary="自动规划任务，智能执行复杂操作" />
        </ListItem>
        <ListItem>
          <ListItemIcon>
            <BugReportIcon color="primary" />
          </ListItemIcon>
          <ListItemText primary="Google Search" secondary="实时联网搜索，获取最新信息" />
        </ListItem>
      </List>
    </Paper>

    <Paper variant="outlined" sx={{ p: 4, mb: 4, borderRadius: 0 }}>
      <Typography variant="h6" gutterBottom color="primary" fontWeight="bold">
        基础命令
      </Typography>
      <CodeBlock
        language="bash"
        code={`# 启动 Gemini CLI
gemini

# 查看帮助信息
gemini help

# 查看版本信息
gemini --version`}
      />
    </Paper>

    <Paper variant="outlined" sx={{ p: 4, mb: 4, borderRadius: 0 }}>
      <Typography variant="h6" gutterBottom color="primary" fontWeight="bold">
        代码编辑
      </Typography>
      <Typography variant="body1" sx={{ mb: 2 }}>
        使用 Gemini CLI 编辑和修改代码文件
      </Typography>
      <CodeBlock
        language="bash"
        code={`# 编辑指定文件
gemini edit src/components/Button.tsx

# 分析代码目录
gemini analyze --files src/`}
      />
    </Paper>

    <Paper variant="outlined" sx={{ p: 4, mb: 4, borderRadius: 0 }}>
      <Typography variant="h6" gutterBottom color="primary" fontWeight="bold">
        Git 集成
      </Typography>
      <Typography variant="body1" sx={{ mb: 2 }}>
        自动生成提交信息和代码审查
      </Typography>
      <CodeBlock
        language="bash"
        code={`# 自动生成提交信息
gemini commit

# 代码审查
gemini review`}
      />
    </Paper>

    <Paper variant="outlined" sx={{ p: 4, mb: 4, borderRadius: 0 }}>
      <Typography variant="h6" gutterBottom color="primary" fontWeight="bold">
        高级用法
      </Typography>
      <Typography variant="body1" sx={{ mb: 2 }}>
        利用 Gemini 的多模态能力和 Agent Mode
      </Typography>
      <CodeBlock
        language="bash"
        code={`# 使用 Agent Mode 自动规划任务
gemini agent --task "重构用户认证模块"

# 生成文档
gemini docs --output docs/

# 代码质量检查
gemini quality --check-all

# 图像识别辅助开发
gemini analyze-ui --screenshot design.png

# 使用 Google Search 联网搜索
gemini search "最新的 React 19 特性"`}
      />
      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
        提示：使用 gemini help [command] 查看具体命令的详细帮助信息
      </Typography>
    </Paper>

    <Alert severity="success" variant="outlined" sx={{ mt: 3, borderRadius: 0 }}>
      <Typography variant="body2">
        <strong>开始使用 Gemini CLI！</strong>
        <br />
        • 超大上下文窗口：1M tokens
        <br />
        • Agent Mode 自动规划任务
        <br />• Google Search 实时联网
      </Typography>
    </Alert>
  </Container>
);

// 主组件
const GeminiCodeTutorialPage = () => {
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
                label="Gemini 3 Pro 强力驱动"
                color="primary"
                variant="outlined"
                sx={{ mb: 2, fontWeight: 'bold', borderRadius: 0 }}
              />
              <Typography variant="h1" component="h1" gutterBottom fontWeight="800" sx={{ fontSize: { xs: '2.5rem', md: '3.5rem' } }}>
                Gemini Code <br />
                <Box component="span" sx={{ color: 'primary.main' }}>
                  Google AI 编程助手
                </Box>
              </Typography>
              <Typography variant="h5" color="text.secondary" paragraph sx={{ mb: 4, lineHeight: 1.6 }}>
                拥有 1M tokens 超大上下文窗口，支持多模态输入。
                <br />
                内置 Agent Mode 和 Google Search，重新定义 AI 辅助编程。
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
                  onClick={() => window.open('https://developers.google.com/gemini-code-assist', '_blank')}
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
                  $ gemini agent --task "Analyze this image"
                </Typography>
                <Typography variant="body2" sx={{ color: '#fff', mb: 2 }}>
                  Analyzing image content...
                  <br />I see a UI design for a login page. It contains email/password fields and a "Sign In" button.
                </Typography>
                <Typography variant="body2" sx={{ color: '#a9a9a9' }}>
                  {'>'} Generate React code for this UI
                </Typography>
                <Typography variant="body2" sx={{ color: '#fff', mt: 1 }}>
                  Generating React component...
                  <br />
                  Done! Created `LoginPage.tsx`.
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
            <Tab label="安装 CLI" />
            <Tab label="配置密钥" />
            <Tab label="开始编程" />
          </Tabs>
          <Divider />
        </Box>

        <TabPanel value={value} index={0}>
          {/* 功能特性网格 */}
          <Box sx={{ mb: 8 }}>
            <Typography variant="h4" component="h2" align="center" gutterBottom fontWeight="bold" sx={{ mb: 6 }}>
              为什么选择 Gemini Code?
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
                  只需三个步骤，即可开始使用 Gemini CLI 进行 AI 编程
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
                        安装 CLI
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        安装 Gemini 命令行工具
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
                        配置密钥
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        配置 API 密钥和环境变量
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
                        开始编程
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        启动 Gemini CLI
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
          <GeminiInstallTutorial />
        </TabPanel>

        <TabPanel value={value} index={2}>
          <GeminiConfigTutorial />
        </TabPanel>

        <TabPanel value={value} index={3}>
          <GeminiUsageTutorial />
        </TabPanel>
      </Container>
    </Box>
  );
};

export default GeminiCodeTutorialPage;
