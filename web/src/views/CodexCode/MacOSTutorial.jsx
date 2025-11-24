import React from 'react';
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
  Stack
} from '@mui/material';
import {
  Download as DownloadIcon,
  Terminal as TerminalIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import CodeBlock from 'ui-component/CodeBlock';

const MacOSTutorial = () => {
  const theme = useTheme();

  const steps = [
    {
      label: '安装 Node.js 环境',
      description: 'CodeX 依赖 Node.js 运行环境。',
      content: (
        <Box sx={{ mt: 2 }}>
          <Alert severity="info" variant="outlined" sx={{ mb: 3, borderRadius: 0 }}>
            <Typography variant="body2">
              <strong>系统要求：</strong> macOS 10.15 (Catalina) 或更高版本
            </Typography>
          </Alert>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card variant="outlined" sx={{ height: '100%', borderRadius: 0, borderColor: alpha(theme.palette.primary.main, 0.2) }}>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                    <DownloadIcon color="primary" />
                    <Typography variant="h6" fontWeight="bold">
                      官方安装包
                    </Typography>
                  </Stack>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    访问 Node.js 官网下载 macOS Installer (.pkg)。
                  </Typography>
                  <Button 
                    variant="contained" 
                    fullWidth 
                    startIcon={<DownloadIcon />} 
                    href="https://nodejs.org/en/download" 
                    target="_blank"
                    sx={{ borderRadius: 0, boxShadow: 'none' }}
                  >
                    前往下载 Node.js
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card variant="outlined" sx={{ height: '100%', borderRadius: 0, borderColor: alpha(theme.palette.secondary.main, 0.2) }}>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                    <TerminalIcon color="secondary" />
                    <Typography variant="h6" fontWeight="bold">
                      Homebrew 安装 (推荐)
                    </Typography>
                  </Stack>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    使用 Homebrew 快速安装：
                  </Typography>
                  <CodeBlock language="bash" code={`brew install node`} />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )
    },
    {
      label: '安装 CodeX CLI',
      description: '使用 npm 全局安装 CodeX 命令行工具。',
      content: (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" paragraph>
            打开终端，执行以下命令：
          </Typography>
          <CodeBlock language="bash" code={`npm install -g @openai/codex@latest`} />
          
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" gutterBottom fontWeight="bold">
              验证安装：
            </Typography>
            <CodeBlock language="bash" code={`codex --version`} />
          </Box>
        </Box>
      )
    },
    {
      label: '配置 Chirou API API',
      description: '配置 CodeX 专用 API 密钥。',
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
                  primary={<Typography variant="body2" fontWeight="bold">添加令牌，分组必须选择：CodeX 专用</Typography>} 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircleIcon color="success" fontSize="small" /></ListItemIcon>
                <ListItemText primary="复制生成的令牌" />
              </ListItem>
            </List>
          </Paper>

          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              2. 创建配置文件
            </Typography>
            <Typography variant="body2" paragraph color="text.secondary">
              创建配置目录和文件：
            </Typography>
            
            <CodeBlock
              language="bash"
              code={`mkdir -p ~/.codex
touch ~/.codex/auth.json
touch ~/.codex/config.toml`}
            />

            <Typography variant="body2" paragraph sx={{ mt: 2 }}>
              编辑 auth.json（<strong>请替换您的密钥</strong>）：
            </Typography>

            <CodeBlock
              language="json"
              code={`{
  "OPENAI_API_KEY": "粘贴为CodeX专用分组令牌key"
}`}
            />
            
            <Typography variant="body2" paragraph sx={{ mt: 2 }}>
              编辑 config.toml：
            </Typography>
            <CodeBlock
              language="toml"
              code={`model_provider = "wochirou"
model = "gpt-5.1-codex"

[model_providers.wochirou]
name = "wochirou"
base_url = "https://api.wochirou.com/v1"
wire_api = "responses"
requires_openai_auth = true`}
            />
          </Box>
        </Box>
      )
    },
    {
      label: '启动 CodeX',
      description: '开始使用 CodeX CLI。',
      content: (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body1" paragraph>
            进入您的项目目录，运行：
          </Typography>
          <CodeBlock language="bash" code={`cd my-project
codex`} />
          
          <Alert severity="success" variant="outlined" sx={{ mt: 3, borderRadius: 0 }}>
            <Typography variant="subtitle1" fontWeight="bold">
              🎉 配置完成！
            </Typography>
            <Typography variant="body2">
              现在您可以开始使用 CodeX 进行 AI 辅助编程了。
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

export default MacOSTutorial;
