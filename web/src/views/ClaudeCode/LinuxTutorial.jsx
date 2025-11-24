import React, { useState } from 'react';
import {
  Typography,
  Box,
  Paper,
  Button,
  Card,
  CardContent,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Grid,
  Step,
  StepLabel,
  Stepper,
  StepContent,
  useTheme,
  alpha,
  Tabs,
  Tab,
  Stack
} from '@mui/material';
import {
  Download as DownloadIcon,
  Terminal as TerminalIcon,
  CheckCircle as CheckCircleIcon,
  Storage as StorageIcon
} from '@mui/icons-material';
import { SiUbuntu, SiCentos, SiArchlinux } from 'react-icons/si';
import CodeBlock from 'ui-component/CodeBlock';

// 简单的 TabPanel 组件实现
const TabPanel = ({ children, value, index, ...other }) => {
  return (
    <div role="tabpanel" hidden={value !== index} id={`simple-tabpanel-${index}`} aria-labelledby={`simple-tab-${index}`} {...other}>
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
};

const LinuxTutorial = () => {
  const theme = useTheme();
  const [distroTab, setDistroTab] = useState(0);

  const handleDistroChange = (event, newValue) => {
    setDistroTab(newValue);
  };

  const steps = [
    {
      label: '安装 Node.js 环境',
      description: 'Claude Code 依赖 Node.js (>= 18.0.0)。',
      content: (
        <Box sx={{ mt: 2 }}>
          <Alert severity="info" variant="outlined" sx={{ mb: 3, borderRadius: 0 }}>
            <Typography variant="body2">
              <strong>系统要求：</strong> Linux 内核 3.10+，glibc 2.17+，支持 x86_64 和 aarch64 架构
            </Typography>
          </Alert>
          
          <Paper variant="outlined" sx={{ borderRadius: 0, overflow: 'hidden' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.default' }}>
              <Tabs 
                value={distroTab} 
                onChange={handleDistroChange} 
                aria-label="Linux distributions"
                variant="scrollable"
                scrollButtons="auto"
              >
                <Tab label="Ubuntu/Debian" icon={<SiUbuntu />} iconPosition="start" />
                <Tab label="CentOS/RHEL" icon={<SiCentos />} iconPosition="start" />
                <Tab label="Arch Linux" icon={<SiArchlinux />} iconPosition="start" />
                <Tab label="通用 (NVM)" icon={<TerminalIcon />} iconPosition="start" />
              </Tabs>
            </Box>

            <Box sx={{ p: 3 }}>
              <TabPanel value={distroTab} index={0}>
                <Typography variant="subtitle2" gutterBottom>Ubuntu/Debian 安装命令：</Typography>
                <CodeBlock
                  language="bash"
                  code={`# 1. 更新包列表
sudo apt update

# 2. 安装 Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs`}
                />
              </TabPanel>

              <TabPanel value={distroTab} index={1}>
                <Typography variant="subtitle2" gutterBottom>CentOS/RHEL 安装命令：</Typography>
                <CodeBlock
                  language="bash"
                  code={`# 安装 Node.js 18.x
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs`}
                />
              </TabPanel>

              <TabPanel value={distroTab} index={2}>
                <Typography variant="subtitle2" gutterBottom>Arch Linux 安装命令：</Typography>
                <CodeBlock
                  language="bash"
                  code={`sudo pacman -S nodejs npm`}
                />
              </TabPanel>

              <TabPanel value={distroTab} index={3}>
                <Typography variant="subtitle2" gutterBottom>使用 NVM 安装 (推荐，适用于所有发行版)：</Typography>
                <CodeBlock
                  language="bash"
                  code={`# 1. 安装 NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc

# 2. 安装并使用 Node.js 18
nvm install 18
nvm use 18`}
                />
              </TabPanel>
            </Box>
          </Paper>
        </Box>
      )
    },
    {
      label: '全局安装 Claude Code',
      description: '使用 npm 包管理器安装 Claude Code CLI。',
      content: (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" paragraph>
            在终端中执行以下命令：
          </Typography>
          <CodeBlock language="bash" code={`# 可能需要 sudo 权限
sudo npm install -g @anthropic-ai/claude-code`} />
          
          <Alert severity="warning" variant="outlined" sx={{ mt: 2, borderRadius: 0 }}>
            <Typography variant="body2">
              <strong>权限提示：</strong> 如果不想使用 sudo，建议使用 NVM 管理 Node.js 版本，这样可以避免全局安装时的权限问题。
            </Typography>
          </Alert>

          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" gutterBottom fontWeight="bold">
              验证安装：
            </Typography>
            <CodeBlock language="bash" code={`claude --version`} />
          </Box>
        </Box>
      )
    },
    {
      label: '配置 Chirou API 密钥',
      description: '连接到 Chirou API 服务以使用 Claude 模型。',
      content: (
        <Box sx={{ mt: 2 }}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 0, bgcolor: alpha(theme.palette.warning.main, 0.05), borderColor: alpha(theme.palette.warning.main, 0.3) }}>
            <Typography variant="h6" gutterBottom color="warning.main" fontWeight="bold">
              1. 获取 API 密钥
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon><CheckCircleIcon color="success" fontSize="small" /></ListItemIcon>
                <ListItemText primary="访问 Chirou API 控制台 -> 令牌" />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircleIcon color="success" fontSize="small" /></ListItemIcon>
                <ListItemText 
                  primary={<Typography variant="body2" fontWeight="bold">添加令牌，分组必须选择：Claude Code专用</Typography>} 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircleIcon color="success" fontSize="small" /></ListItemIcon>
                <ListItemText primary="复制生成的令牌 (sk-xxxx)" />
              </ListItem>
            </List>
          </Paper>

          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              2. 配置环境变量 (推荐)
            </Typography>
            <Typography variant="body2" paragraph color="text.secondary">
              创建全局配置文件，使配置永久生效：
            </Typography>
            
            <CodeBlock
              language="bash"
              code={`# 1. 创建配置目录和文件
mkdir -p ~/.claude
touch ~/.claude/settings.json

# 2. 编辑配置文件 (使用 vi/nano)
nano ~/.claude/settings.json`}
            />

            <Typography variant="body2" paragraph sx={{ mt: 2 }}>
              在配置文件中粘贴以下内容（<strong>请替换您的密钥</strong>）：
            </Typography>

            <CodeBlock
              language="json"
              code={`{
  "env": {
    "ANTHROPIC_AUTH_TOKEN": "sk-您的Claude-Code专用令牌",
    "ANTHROPIC_BASE_URL": "https://api.wochirou.com/claude"
  }
}`}
            />
          </Box>
        </Box>
      )
    },
    {
      label: '启动与使用',
      description: '一切就绪，开始您的 AI 编程之旅！',
      content: (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body1" paragraph>
            在终端中进入您的项目目录，然后运行：
          </Typography>
          <CodeBlock language="bash" code={`cd ~/your-project-folder
claude`} />

          <Paper variant="outlined" sx={{ mt: 3, p: 3, borderRadius: 0 }}>
            <Typography variant="subtitle1" gutterBottom fontWeight="bold">
              <StorageIcon sx={{ verticalAlign: 'middle', mr: 1, fontSize: 20 }} />
              Linux 特有功能
            </Typography>
            <List>
              <ListItem>
                <ListItemText 
                  primary="Shell 集成" 
                  secondary="完美支持 bash, zsh, fish 等主流 Shell" 
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="容器化支持" 
                  secondary="在 Docker 或 Podman 容器中也能流畅运行" 
                />
              </ListItem>
            </List>
          </Paper>
          
          <Alert severity="success" variant="outlined" sx={{ mt: 3, borderRadius: 0 }}>
            <Typography variant="subtitle1" fontWeight="bold">
              🎉 恭喜！您已成功配置 Claude Code。
            </Typography>
            <Typography variant="body2">
              现在，您可以体验真正的 AI 结对编程了！
            </Typography>
          </Alert>
        </Box>
      )
    }
  ];

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', py: 4 }}>
      <Stepper orientation="vertical">
        {steps.map((step, index) => (
          <Step key={step.label} active={true}>
            <StepLabel>
              <Typography variant="h6" fontWeight="bold">
                {step.label}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {step.description}
              </Typography>
            </StepLabel>
            <StepContent>
              <Box sx={{ mb: 4, ml: 1, mt: 1 }}>
                {step.content}
              </Box>
            </StepContent>
          </Step>
        ))}
      </Stepper>
    </Box>
  );
};

export default LinuxTutorial;
