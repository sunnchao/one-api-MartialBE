import React from 'react';
import {
  Container,
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
  Grid
} from '@mui/material';
import {
  Download as DownloadIcon,
  Terminal as TerminalIcon,
  Code as CodeIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon
} from '@mui/icons-material';

const WindowsTutorial = () => {
  const steps = [
    {
      label: '安装 Node.js',
      content: (
        <Box>
          <Typography variant="h6" gutterBottom>
            安装 Node.js（需要版本 {'>='} 18.0.0）
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    <DownloadIcon sx={{ mr: 1 }} />
                    官方下载
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={2}>
                    从 Node.js 官网下载最新版本
                  </Typography>
                  <Button variant="contained" fullWidth startIcon={<DownloadIcon />} href="https://nodejs.org/en/download" target="_blank">
                    访问 Node.js 官网
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    <TerminalIcon sx={{ mr: 1 }} />
                    验证安装
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={2}>
                    安装完成后验证版本
                  </Typography>
                  <Paper sx={{ p: 2, bgcolor: 'grey.100' }}>
                    <Typography variant="body2" fontFamily="monospace">
                      # 检查 Node.js 版本
                      <br />
                      node --version
                      <br />
                      <br />
                      # 检查 npm 版本
                      <br />
                      npm --version
                    </Typography>
                  </Paper>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>系统要求：</strong> Windows 10 版本 1903 或更高版本，Node.js 版本需要 {'>='} 18.0.0
            </Typography>
          </Alert>
        </Box>
      )
    },
    {
      label: '全局安装 Claude Code',
      content: (
        <Box>
          <Typography variant="h6" gutterBottom>
            使用 npm 全局安装 Claude Code
          </Typography>
          <Paper sx={{ p: 2, bgcolor: 'grey.100', mb: 2 }}>
            <Typography variant="body2" fontFamily="monospace">
              # 全局安装 Claude Code
              <br />
              npm install -g @anthropic-ai/claude-code
            </Typography>
          </Paper>
          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            验证安装
          </Typography>
          <Paper sx={{ p: 2, bgcolor: 'grey.100', mb: 2 }}>
            <Typography variant="body2" fontFamily="monospace">
              # 查看是否安装成功
              <br />
              claude --version
            </Typography>
          </Paper>
          <Typography variant="body2" color="text.secondary" mb={2}>
            如果安装成功，应该看到类似以下输出：
          </Typography>
          <Paper sx={{ p: 2, bgcolor: 'success.50', border: '1px solid', borderColor: 'success.main' }}>
            <Typography variant="body2" fontFamily="monospace" color="success.main">
              Claude Code v1.0.0
            </Typography>
          </Paper>
          <Alert severity="warning" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>注意：</strong> 如果出现权限错误，请以管理员身份运行命令提示符
            </Typography>
          </Alert>
        </Box>
      )
    },
    {
      label: '项目配置',
      content: (
        <Box>
          <Typography variant="h6" gutterBottom>
            在项目中配置 Claude Code
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon>
                <CheckCircleIcon color="success" />
              </ListItemIcon>
              <ListItemText primary="创建 .claude 目录" secondary="在项目根目录下创建 .claude 文件夹" />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircleIcon color="success" />
              </ListItemIcon>
              <ListItemText primary="创建配置文件" secondary="在 .claude 目录下创建 settings.json 文件" />
            </ListItem>
          </List>
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            配置文件内容
          </Typography>
          <Paper sx={{ p: 2, bgcolor: 'grey.100', mb: 2 }}>
            <Typography variant="body2" component="pre" fontFamily="monospace" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
              {`{
 "env": {
   "ANTHROPIC_BASE_URL": "https://api.wochirou.com/claude",
   "ANTHROPIC_AUTH_TOKEN": "sk-xxxxx",
   "ANTHROPIC_MODEL": "claude-3-7-sonnet-20250219"
 }
}`}
            </Typography>
          </Paper>
          <Alert severity="warning" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>重要：</strong> 请将 ANTHROPIC_AUTH_TOKEN 替换为您的实际 API 密钥，ANTHROPIC_MODEL 替换为您需要的模型。模型只能使用
              claude 模型或本站的 claude 模型别名。
            </Typography>
          </Alert>
        </Box>
      )
    },
    {
      label: '全局配置（可选）',
      content: (
        <Box>
          <Typography variant="h6" gutterBottom>
            Windows 全局配置方法
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>
            如果不想每个项目都配置 .claude 目录，可以进行全局配置：
          </Typography>
          <Paper sx={{ p: 2, bgcolor: 'grey.100', mb: 2 }}>
            <Typography variant="body2" fontFamily="monospace">
              # 进入用户目录下的 .claude 文件夹
              <br />
              cd C:\Users\%username%\.claude
              <br />
              <br />
              # 如果目录不存在，先创建
              <br />
              mkdir C:\Users\%username%\.claude
            </Typography>
          </Paper>
          <Typography variant="body2" mb={2}>
            然后在该目录下创建 settings.json 文件，内容与项目配置相同。可以使用以下方式编辑：
          </Typography>
          <List dense>
            <ListItem>
              <ListItemIcon>
                <CheckCircleIcon color="success" />
              </ListItemIcon>
              <ListItemText primary="使用 VS Code" secondary="code C:\Users\%username%\.claude\settings.json" />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircleIcon color="success" />
              </ListItemIcon>
              <ListItemText primary="使用记事本" secondary="notepad C:\Users\%username%\.claude\settings.json" />
            </ListItem>
          </List>
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>提示：</strong> 全局配置完成后，所有项目都可以直接使用 Claude Code
            </Typography>
          </Alert>
        </Box>
      )
    },
    {
      label: '开始使用',
      content: (
        <Box>
          <Typography variant="h6" gutterBottom>
            启动 Claude Code
          </Typography>
          <Paper sx={{ p: 2, bgcolor: 'grey.100', mb: 2 }}>
            <Typography variant="body2" fontFamily="monospace">
              # 在项目根目录下执行
              <br />
              claude
            </Typography>
          </Paper>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    <CodeIcon sx={{ mr: 1 }} />
                    使用提示
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <InfoIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText primary="重新加载配置" secondary="每次修改配置后，需要重新打开终端窗口" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <InfoIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText primary="模型限制" secondary="只支持 Claude 模型及其别名" />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    <TerminalIcon sx={{ mr: 1 }} />
                    常用功能
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircleIcon color="success" />
                      </ListItemIcon>
                      <ListItemText primary="智能对话" secondary="与 AI 助手进行编程对话" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircleIcon color="success" />
                      </ListItemIcon>
                      <ListItemText primary="代码生成" secondary="根据需求生成代码片段" />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          <Alert severity="success" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>恭喜！</strong> Claude Code 已成功配置完成。现在您可以在项目中使用 AI 助手了。
            </Typography>
          </Alert>
        </Box>
      )
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box mb={4}>
        <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
          Windows 版本教程
        </Typography>
        <Typography variant="h6" color="text.secondary">
          在 Windows 10/11 上安装和使用 Claude Code
        </Typography>
      </Box>

      {steps.map((step, index) => (
        <Paper key={index} sx={{ p: 3, mb: 3, borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
          <Typography variant="h5" component="h2" gutterBottom>
            {`步骤 ${index + 1}: ${step.label}`}
          </Typography>
          <Divider sx={{ mb: 2 }} />
          {step.content}
        </Paper>
      ))}
    </Container>
  );
};

export default WindowsTutorial;
