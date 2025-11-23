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

// 导入各系统安装教程组件
import WindowsTutorial from './WindowsTutorial';
import MacOSTutorial from './MacOSTutorial';
import LinuxTutorial from './LinuxTutorial';

// 主要功能特性
const features = [
  {
    icon: <RocketLaunchIcon fontSize="large" color="primary" />,
    title: '🚀 超大上下文窗口',
    description: '1M tokens 上下文，处理超大规模项目'
  },
  {
    icon: <SearchIcon fontSize="large" color="primary" />,
    title: '🔍 Agent Mode',
    description: '自动规划任务，智能执行复杂操作'
  },
  {
    icon: <BugReportIcon fontSize="large" color="primary" />,
    title: '🌐 Google Search',
    description: '实时联网搜索，获取最新信息'
  },
  {
    icon: <MenuBookIcon fontSize="large" color="primary" />,
    title: '📚 Git 集成',
    description: '自动生成提交信息和代码审查'
  },
  {
    icon: <TerminalIcon fontSize="large" color="primary" />,
    title: '⚡ Gemini 2.5 Pro',
    description: 'Google AI 最新模型驱动'
  }
];

// 支持的平台信息
const supportedPlatforms = [
  { icon: <TerminalIcon style={{ fontSize: 22 }} />, name: 'CLI 工具', version: 'npm 全局安装' },
  { icon: <SearchIcon style={{ fontSize: 22 }} />, name: 'Google AI', version: 'Gemini 2.5 Pro' },
  { icon: <CodeIcon style={{ fontSize: 22 }} />, name: '1M Context', version: '超大上下文窗口' }
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

// Gemini 安装教程组件
const GeminiInstallTutorial = () => {
  const [osTab, setOsTab] = React.useState(0);

  const handleOsTabChange = (_, newValue) => {
    setOsTab(newValue);
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom>
        安装 Gemini CLI
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

// Gemini 配置教程组件
const GeminiConfigTutorial = () => (
  <Container maxWidth="md">
    <Typography variant="h4" gutterBottom>
      配置 Gemini CLI
    </Typography>
    <Alert severity="warning" sx={{ mb: 3 }}>
      <Typography variant="body2">
        <strong>重要提示：</strong> 请将下方的 GEMINI_API_KEY 替换为您在 https://Chirou API.com/console/token 生成的 Gemini CLI
        专用 API 密钥！
      </Typography>
    </Alert>

    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom color="primary">
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

    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom color="primary">
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
      <Alert severity="info" sx={{ mt: 2 }}>
        <Typography variant="body2">
          请在 Chirou API.com 控制台创建一个专门用于 Gemini CLI 的分组令牌，并将其粘贴到 GEMINI_API_KEY 中。
        </Typography>
      </Alert>
    </Paper>

    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom color="primary">
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
      <Alert severity="warning" sx={{ mt: 2 }}>
        <Typography variant="body2">
          <strong>注意：</strong> 配置文件更加安全且便于管理，需要重启 Gemini CLI 才生效。
        </Typography>
      </Alert>
    </Paper>
  </Container>
);

// Gemini 使用示例组件
const GeminiUsageTutorial = () => (
  <Container maxWidth="md">
    <Typography variant="h4" gutterBottom>
      启动 Gemini CLI
    </Typography>
    <Alert severity="success" sx={{ mb: 3 }}>
      <Typography variant="body2">配置完成后，运行以下命令开始使用 Gemini CLI</Typography>
    </Alert>

    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom color="primary">
        启动命令
      </Typography>
      <CodeBlock language="bash" code={`gemini`} />
      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
        在项目目录中运行此命令即可启动 Gemini CLI
      </Typography>
    </Paper>

    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom color="primary">
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

    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom color="primary">
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

    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom color="primary">
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

    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom color="primary">
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

    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom color="primary">
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

    <Alert severity="success" sx={{ mt: 3 }}>
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
  const [value, setValue] = useState(0);

  const handleChange = (_, newValue) => {
    setValue(newValue);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange} aria-label="Gemini CLI Tabs" centered>
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
            🚀 Gemini CLI 快速开始
          </Typography>
          <Typography variant="h5" color="text.secondary">
            Google AI 编程助手，Gemini 2.5 Pro 驱动
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
                Gemini CLI 提供强大的 AI 编程辅助功能：
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
                只需三个步骤，即可开始使用 Gemini CLI 进行 AI 编程
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
        <GeminiInstallTutorial />
      </TabPanel>

      <TabPanel value={value} index={2}>
        <GeminiConfigTutorial />
      </TabPanel>

      <TabPanel value={value} index={3}>
        <GeminiUsageTutorial />
      </TabPanel>
    </Container>
  );
};

export default GeminiCodeTutorialPage;
