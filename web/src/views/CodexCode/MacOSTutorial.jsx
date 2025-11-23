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
  ListItemText,
  Grid
} from '@mui/material';
import { Download as DownloadIcon, Terminal as TerminalIcon } from '@mui/icons-material';
import CodeBlock from 'ui-component/CodeBlock';

const MacOSTutorial = () => {
  return (
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom>
        macOS 完整安装教程
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom color="primary">
          1. 安装 Node.js
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
                <Button variant="contained" fullWidth startIcon={<DownloadIcon />} href="https://nodejs.org/en/download" target="_blank">
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
          2. 安装 CodeX CLI
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          打开终端，执行以下命令：
        </Typography>
        <CodeBlock language="bash" code={`npm install -g @openai/codex@latest`} />

        <Typography variant="subtitle1" gutterBottom sx={{ mt: 3, fontWeight: 'bold' }}>
          验证安装
        </Typography>
        <CodeBlock language="bash" code={`codex --version`} />

        <Alert severity="warning" sx={{ mt: 2 }}>
          <Typography variant="body2">
            <strong>权限问题：</strong> 如果出现权限错误，可以尝试使用 sudo 或配置 npm 全局目录权限
          </Typography>
        </Alert>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom color="primary">
          3. 配置 Chirou API API
        </Typography>

        <Typography variant="subtitle1" gutterBottom sx={{ mt: 2, fontWeight: 'bold' }}>
          3.1 获取 CodeX 专用 API Token
        </Typography>
        <List dense>
          <ListItem>
            <ListItemText primary="• 访问 Chirou API 控制台" />
          </ListItem>
          <ListItem>
            <ListItemText primary="• 注册账户或登录现有账户" />
          </ListItem>
          <ListItem>
            <ListItemText primary='• 进入 "API 密钥" 页面' />
          </ListItem>
          <ListItem>
            <ListItemText primary='• 点击 "创建新密钥"，选择 CodeX 专用分组' />
          </ListItem>
          <ListItem>
            <ListItemText primary="• 复制生成的 API Key" />
          </ListItem>
        </List>

        <Alert severity="error" sx={{ mt: 2 }}>
          <Typography variant="body2">
            <strong>重要：</strong> CodeX 需要使用专门的分组令牌，与 Claude Code 的令牌不同！
          </Typography>
        </Alert>

        <Typography variant="subtitle1" gutterBottom sx={{ mt: 3, fontWeight: 'bold' }}>
          3.2 创建配置文件夹
        </Typography>
        <CodeBlock
          language="bash"
          code={`mkdir -p ~/.codex
cd ~/.codex`}
        />

        <Typography variant="subtitle1" gutterBottom sx={{ mt: 3, fontWeight: 'bold' }}>
          3.3 创建配置文件
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          1. 创建 config.toml 文件：
        </Typography>
        <CodeBlock
          language="toml"
          code={`model_provider = "wochirou"
model = "gpt-5.1-codex"
model_reasoning_effort = "high"
network_access = "enabled"
disable_response_storage = true

[model_providers.wochirou]
name = "wochirou"
base_url = "https://api.wochirou.com/v1"
wire_api = "responses"
requires_openai_auth = true`}
        />

        <Typography variant="body2" sx={{ mt: 2, mb: 1 }}>
          2. 创建 auth.json 文件：
        </Typography>
        <CodeBlock
          language="json"
          code={`{
  "OPENAI_API_KEY": "粘贴为CodeX专用分组令牌key"
}`}
        />
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom color="primary">
          4. 启动 CodeX
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          配置完成后，先进入到工程目录：
        </Typography>
        <CodeBlock
          language="bash"
          code={`mkdir my-codex-project
cd my-codex-project`}
        />

        <Typography variant="body1" sx={{ mb: 2, mt: 2 }}>
          然后，运行以下命令启动：
        </Typography>
        <CodeBlock language="bash" code={`codex`} />

        <Typography variant="subtitle1" gutterBottom sx={{ mt: 3, fontWeight: 'bold' }}>
          首次运行配置：
        </Typography>
        <List dense>
          <ListItem>
            <ListItemText primary="• 选择您的开发环境配置" />
          </ListItem>
          <ListItem>
            <ListItemText primary="• 配置代码生成偏好" />
          </ListItem>
          <ListItem>
            <ListItemText primary="• 设置 GPT-5 推理等级" />
          </ListItem>
          <ListItem>
            <ListItemText primary="• 开始 AI 辅助编程！🚀" />
          </ListItem>
        </List>
      </Paper>
    </Container>
  );
};

export default MacOSTutorial;
