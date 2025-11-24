import React from 'react';
import { Container, Typography, Box, Paper, Alert, List, ListItem, ListItemText, Card, CardContent, Grid, alpha, useTheme } from '@mui/material';
import { Code as CodeIcon, Keyboard as KeyboardIcon, Settings as SettingsIcon } from '@mui/icons-material';
import CodeBlock from 'ui-component/CodeBlock';

const VSCodeTutorial = () => {
  const theme = useTheme();

  return (
    <Container maxWidth="lg">
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h3" gutterBottom fontWeight="bold">
          VSCode 配置教程
        </Typography>
        <Typography variant="h6" color="text.secondary">
          适用于所有平台的 Visual Studio Code 配置
        </Typography>
      </Box>

      <Paper variant="outlined" sx={{ p: 4, mb: 4, borderRadius: 0 }}>
        <Typography variant="h6" gutterBottom color="primary" fontWeight="bold">
          配置步骤
        </Typography>

        <Alert severity="warning" variant="outlined" sx={{ mb: 3, borderRadius: 0 }}>
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

      <Paper variant="outlined" sx={{ p: 4, mb: 4, borderRadius: 0 }}>
        <Typography variant="h6" gutterBottom color="primary" fontWeight="bold">
          快捷键说明
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card variant="outlined" sx={{ height: '100%', borderRadius: 0, borderColor: alpha(theme.palette.divider, 0.1) }}>
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  <KeyboardIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Windows
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Ctrl+Shift+P → "Preferences: Open Settings (JSON)"
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card variant="outlined" sx={{ height: '100%', borderRadius: 0, borderColor: alpha(theme.palette.divider, 0.1) }}>
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  <KeyboardIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  macOS
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Cmd+Shift+P → "Preferences: Open Settings (JSON)"
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card variant="outlined" sx={{ height: '100%', borderRadius: 0, borderColor: alpha(theme.palette.divider, 0.1) }}>
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  <KeyboardIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Linux
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Ctrl+Shift+P → "Preferences: Open Settings (JSON)"
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      <Paper variant="outlined" sx={{ p: 4, borderRadius: 0 }}>
        <Typography variant="h6" gutterBottom color="primary" fontWeight="bold">
          配置说明
        </Typography>

        <List>
          <ListItem>
            <ListItemText
              primary={<Typography variant="subtitle1" fontWeight="bold">• 检查 API Token</Typography>}
              secondary="请确保您的 API Token 已经在扩展设置中正确配置"
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary={<Typography variant="subtitle1" fontWeight="bold">• 重启生效</Typography>}
              secondary="配置完成后重启 VSCode 以确保设置生效"
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary={<Typography variant="subtitle1" fontWeight="bold">• 使用专用 Token</Typography>}
              secondary="确保使用的是从 Chirou API 控制台创建的 CodeX 专用分组令牌"
            />
          </ListItem>
        </List>

        <Alert severity="success" variant="outlined" sx={{ mt: 2, borderRadius: 0 }}>
          <Typography variant="body2">
            <strong>提示：</strong> 配置完成后，您可以在 VSCode 中直接使用 CodeX 的强大功能，享受 GPT-5 驱动的智能代码辅助！
          </Typography>
        </Alert>
      </Paper>
    </Container>
  );
};

export default VSCodeTutorial;
