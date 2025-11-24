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
} from '@mui/icons-material';
import { SiUbuntu, SiCentos, SiArchlinux } from 'react-icons/si';
import CodeBlock from 'ui-component/CodeBlock';

// Simple TabPanel component
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
      description: 'Gemini CLI 依赖 Node.js 运行环境。',
      content: (
        <Box sx={{ mt: 2 }}>
          <Alert severity="info" variant="outlined" sx={{ mb: 3, borderRadius: 0 }}>
            <Typography variant="body2">
              <strong>系统要求：</strong> Linux 内核 3.10+，glibc 2.17+
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
                <Typography variant="subtitle2" gutterBottom>使用 NVM 安装 (推荐)：</Typography>
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
      label: '全局安装 Gemini CLI',
      description: '使用 npm 全局安装 Gemini 命令行工具。',
      content: (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" paragraph>
            在终端中执行以下命令：
          </Typography>
          <CodeBlock language="bash" code={`# 可能需要 sudo 权限
sudo npm install -g @google/gemini-cli`} />
          
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" gutterBottom fontWeight="bold">
              验证安装：
            </Typography>
            <CodeBlock language="bash" code={`gemini --version`} />
          </Box>
        </Box>
      )
    },
    {
      label: '下一步',
      description: '配置密钥并开始使用。',
      content: (
        <Box sx={{ mt: 2 }}>
          <Alert severity="success" variant="outlined" sx={{ borderRadius: 0 }}>
            <Typography variant="subtitle1" fontWeight="bold">
              🎉 安装完成！
            </Typography>
            <Typography variant="body2">
              Gemini CLI 已成功安装。请切换到 <strong>"配置密钥"</strong> 标签页，完成 API 密钥配置。
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
