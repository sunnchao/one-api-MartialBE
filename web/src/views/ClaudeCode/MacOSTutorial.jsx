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
  Apple as AppleIcon
} from '@mui/icons-material';
import CodeBlock from 'ui-component/CodeBlock';

const MacOSTutorial = () => {
  const theme = useTheme();

  const steps = [
    {
      label: '安装 Node.js 环境',
      description: 'Claude Code 依赖 Node.js 运行环境。',
      content: (
        <Box sx={{ mt: 2 }}>
          <Alert severity="info" variant="outlined" sx={{ mb: 3, borderRadius: 0 }}>
            <Typography variant="body2">
              <strong>系统要求：</strong> macOS 10.15 (Catalina) 或更高版本，支持 Intel 和 Apple Silicon (M1/M2/M3) 芯片
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
                    访问 Node.js 官网下载 macOS Installer (.pkg)，双击安装即可。
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
                    如果您已安装 Homebrew，这是最便捷的方式。
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
      label: '全局安装 Claude Code',
      description: '使用 npm 包管理器安装 Claude Code CLI。',
      content: (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" paragraph>
            打开终端 (Terminal) 或 iTerm2，执行以下命令：
          </Typography>
          <CodeBlock language="bash" code={`npm install -g @anthropic-ai/claude-code`} />
          
          <Alert severity="warning" variant="outlined" sx={{ mt: 2, borderRadius: 0 }}>
            <Typography variant="body2">
              <strong>权限提示：</strong> 如果遇到 <code>EACCES</code> 权限错误，请尝试在命令前加上 <code>sudo</code>，或者修复 npm 权限。
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

# 2. 使用 VS Code 编辑 (或者使用 nano/vim)
code ~/.claude/settings.json`}
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
              <AppleIcon sx={{ verticalAlign: 'middle', mr: 1, fontSize: 20 }} />
              macOS 特有功能
            </Typography>
            <List>
              <ListItem>
                <ListItemText 
                  primary="Spotlight 集成" 
                  secondary="您可以通过 Spotlight 快速搜索并打开终端" 
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="iTerm2 支持" 
                  secondary="Claude Code 在 iTerm2 中有更好的色彩表现" 
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

export default MacOSTutorial;
