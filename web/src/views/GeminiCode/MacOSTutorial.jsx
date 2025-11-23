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
  Grid
} from '@mui/material';
import {
  Download as DownloadIcon,
  Terminal as TerminalIcon
} from '@mui/icons-material';
import CodeBlock from 'ui-component/CodeBlock';

const MacOSTutorial = () => {
  return (
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom>
        macOS 完整安装教程
      </Typography>
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">支持 Intel 和 Apple Silicon (M1/M2/M3) 芯片</Typography>
      </Alert>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom color="primary">
          第 1 步：安装 Node.js
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
                  从 Node.js 官网下载 macOS 版本
                </Typography>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<DownloadIcon />}
                  href="https://nodejs.org/en/download"
                  target="_blank"
                >
                  下载 Node.js for macOS
                </Button>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <TerminalIcon sx={{ mr: 1 }} />
                  Homebrew 安装（推荐）
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={2}>
                  使用 Homebrew 包管理器安装
                </Typography>
                <CodeBlock
                  language="bash"
                  code={`# 安装 Homebrew（如果还没有）
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 安装 Node.js
brew install node`}
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Typography variant="subtitle1" gutterBottom sx={{ mt: 3, fontWeight: 'bold' }}>
          验证安装
        </Typography>
        <CodeBlock
          language="bash"
          code={`node --version
npm --version`}
        />

        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="body2">
            <strong>系统要求：</strong> macOS 10.15 (Catalina) 或更高版本，支持 Intel 和 Apple Silicon 芯片
          </Typography>
        </Alert>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom color="primary">
          第 2 步：全局安装 Gemini CLI
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          打开终端，执行以下命令：
        </Typography>
        <CodeBlock
          language="bash"
          code={`npm install -g @google/gemini-cli`}
        />

        <Alert severity="warning" sx={{ mt: 2 }}>
          <Typography variant="body2">
            <strong>权限问题：</strong> 如果出现权限错误，可以尝试使用 sudo 或配置 npm 全局目录权限
          </Typography>
        </Alert>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom color="primary">
          第 3 步：验证安装
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          验证 Gemini CLI 是否正确安装
        </Typography>
        <CodeBlock
          language="bash"
          code={`gemini --version`}
        />

        <Alert severity="success" sx={{ mt: 2 }}>
          <Typography variant="body2">
            <strong>提示：</strong> 如果看到版本号输出，说明安装成功！接下来请前往"配置密钥"标签页完成配置。
          </Typography>
        </Alert>
      </Paper>
    </Container>
  );
};

export default MacOSTutorial;
