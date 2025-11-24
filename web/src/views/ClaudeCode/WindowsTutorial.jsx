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

const WindowsTutorial = () => {
  const theme = useTheme();

  const steps = [
    {
      label: '安装 Node.js 环境',
      description: 'Claude Code 依赖 Node.js 运行环境，我们需要先安装它。',
      content: (
        <Box sx={{ mt: 2 }}>
          <Alert severity="info" variant="outlined" sx={{ mb: 3, borderRadius: 0 }}>
            <Typography variant="body2">
              <strong>系统要求：</strong> Windows 10 或 Windows 11，Node.js 版本需 {'>='} 18.0.0
            </Typography>
          </Alert>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card variant="outlined" sx={{ height: '100%', borderRadius: 0, borderColor: alpha(theme.palette.primary.main, 0.2) }}>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                    <DownloadIcon color="primary" />
                    <Typography variant="h6" fontWeight="bold">
                      官方安装包 (推荐)
                    </Typography>
                  </Stack>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    访问 Node.js 官网下载 LTS (长期支持) 版本，这是最稳定的选择。
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
                      包管理器安装
                    </Typography>
                  </Stack>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    如果您习惯使用命令行，可以使用 Winget 快速安装。
                  </Typography>
                  <CodeBlock language="powershell" code={`winget install OpenJS.NodeJS.LTS`} />
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" gutterBottom fontWeight="bold">
              验证安装：
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={1}>
              安装完成后，打开 PowerShell 或命令提示符，输入以下命令检查版本：
            </Typography>
            <CodeBlock
              language="bash"
              code={`node --version
npm --version`}
            />
          </Box>
        </Box>
      )
    },
    {
      label: '全局安装 Claude Code',
      description: '使用 npm 包管理器将 Claude Code 安装到您的系统中。',
      content: (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" paragraph>
            请以<strong>管理员身份</strong>运行 PowerShell 或命令提示符，然后执行以下命令：
          </Typography>
          <CodeBlock language="bash" code={`npm install -g @anthropic-ai/claude-code`} />
          
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" gutterBottom fontWeight="bold">
              验证安装：
            </Typography>
            <CodeBlock language="bash" code={`claude --version`} />
            <Alert severity="success" variant="outlined" icon={<CheckCircleIcon />} sx={{ mt: 2, borderRadius: 0 }}>
              <Typography variant="body2">
                如果看到版本号输出（例如 <code>Claude Code 0.2.9</code>），说明安装成功！
              </Typography>
            </Alert>
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
              为了永久生效，我们建议创建配置文件。请在 PowerShell 中执行以下命令：
            </Typography>
            
            <CodeBlock
              language="powershell"
              code={`# 1. 创建配置目录
mkdir $env:USERPROFILE\\.claude

# 2. 创建配置文件 (使用记事本打开)
notepad $env:USERPROFILE\\.claude\\settings.json`}
            />

            <Typography variant="body2" paragraph sx={{ mt: 2 }}>
              在打开的记事本中，粘贴以下内容（<strong>请替换您的密钥</strong>）：
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
            打开终端，进入您的项目目录，然后运行：
          </Typography>
          <CodeBlock language="bash" code={`cd your-project-folder
claude`} />

          <Paper variant="outlined" sx={{ mt: 3, p: 3, borderRadius: 0 }}>
            <Typography variant="subtitle1" gutterBottom fontWeight="bold">
              <TerminalIcon sx={{ verticalAlign: 'middle', mr: 1, fontSize: 20 }} />
              首次启动向导
            </Typography>
            <List>
              <ListItem>
                <ListItemText 
                  primary="1. 选择主题" 
                  secondary="按回车选择默认 Dark 主题" 
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="2. 确认安全须知" 
                  secondary="阅读并按回车确认" 
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="3. 信任工作目录" 
                  secondary="按回车确认信任当前目录" 
                />
              </ListItem>
            </List>
          </Paper>
          
          <Alert severity="success" variant="outlined" sx={{ mt: 3, borderRadius: 0 }}>
            <Typography variant="subtitle1" fontWeight="bold">
              🎉 恭喜！您已成功配置 Claude Code。
            </Typography>
            <Typography variant="body2">
              试着输入 "explain this project" 让它为您讲解项目结构吧！
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

export default WindowsTutorial;
