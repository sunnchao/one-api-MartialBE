import React from 'react';
import { Container, Typography, Box, Paper, Alert, List, ListItem, ListItemText, Card, CardContent, Grid } from '@mui/material';
import { Code as CodeIcon, Keyboard as KeyboardIcon, Settings as SettingsIcon } from '@mui/icons-material';
import CodeBlock from 'ui-component/CodeBlock';

const VSCodeTutorial = () => {
  return (
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom>
        VSCode 配置教程
      </Typography>
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">适用于所有平台的 Visual Studio Code 配置</Typography>
      </Alert>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom color="primary">
          配置步骤
        </Typography>

        <Alert severity="warning" sx={{ mb: 2 }}>
          <Typography variant="body2">
            <strong>注意：</strong> 确保您已经安装了 ChatGPT/CodeX 相关的 VSCode 扩展插件
          </Typography>
        </Alert>

        <Typography variant="body1" sx={{ mb: 2 }}>
          打开 VSCode 的 settings.json 文件，添加以下配置：
        </Typography>

        <CodeBlock
          language="json"
          code={`"chatgpt.apiBase": "https://api.wochirou.com/v1",
"chatgpt.config": {
  "preferred_auth_method": "apikey"
}`}
        />
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom color="primary">
          快捷键说明
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <KeyboardIcon sx={{ mr: 1 }} />
                  Windows
                </Typography>
                <Typography variant="body2">
                  Ctrl+Shift+P → "Preferences: Open Settings (JSON)"
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <KeyboardIcon sx={{ mr: 1 }} />
                  macOS
                </Typography>
                <Typography variant="body2">
                  Cmd+Shift+P → "Preferences: Open Settings (JSON)"
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <KeyboardIcon sx={{ mr: 1 }} />
                  Linux
                </Typography>
                <Typography variant="body2">
                  Ctrl+Shift+P → "Preferences: Open Settings (JSON)"
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom color="primary">
          配置说明
        </Typography>

        <List>
          <ListItem>
            <ListItemText
              primary="• 请确保您的 API Token 已经在扩展设置中正确配置"
              secondary="在 VSCode 扩展设置中找到 ChatGPT 扩展的 API Key 配置项"
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="• 配置完成后重启 VSCode 以确保设置生效"
              secondary="关闭并重新打开 VSCode，或使用命令面板中的 'Developer: Reload Window'"
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="• 使用 CodeX 专用 Token 以获得最佳体验"
              secondary="确保使用的是从 Chirou API 控制台创建的 CodeX 专用分组令牌"
            />
          </ListItem>
        </List>

        <Alert severity="success" sx={{ mt: 2 }}>
          <Typography variant="body2">
            <strong>提示：</strong> 配置完成后，您可以在 VSCode 中直接使用 CodeX 的强大功能，享受 GPT-5 驱动的智能代码辅助！
          </Typography>
        </Alert>
      </Paper>
    </Container>
  );
};

export default VSCodeTutorial;
