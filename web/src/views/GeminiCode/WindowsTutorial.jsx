import React from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  Alert
} from '@mui/material';
import CodeBlock from 'ui-component/CodeBlock';

const WindowsTutorial = () => {
  return (
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom>
        Windows 完整安装教程
      </Typography>
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">选择您喜欢的安装方式，快速开始使用 Gemini CLI 工具</Typography>
      </Alert>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom color="primary">
          第 1 步：安装 Node.js
        </Typography>

        <Typography variant="subtitle1" gutterBottom sx={{ mt: 2, fontWeight: 'bold' }}>
          方法一：使用官方安装包（推荐）
        </Typography>
        <List dense>
          <ListItem>
            <ListItemText primary="1. 访问 https://nodejs.org" />
          </ListItem>
          <ListItem>
            <ListItemText primary="2. 下载 LTS 版本的 Windows Installer (.msi)" />
          </ListItem>
          <ListItem>
            <ListItemText primary="3. 运行安装程序，按默认设置完成安装" />
          </ListItem>
          <ListItem>
            <ListItemText primary="4. 安装程序会自动添加到 PATH 环境变量" />
          </ListItem>
        </List>

        <Typography variant="subtitle1" gutterBottom sx={{ mt: 3, fontWeight: 'bold' }}>
          方法二：使用包管理器
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          使用 Winget（Windows 11 或 Windows 10 自带）：
        </Typography>
        <CodeBlock
          language="powershell"
          code={`winget install OpenJS.NodeJS.LTS`}
        />

        <Typography variant="body2" sx={{ mt: 2, mb: 1 }}>
          使用 Chocolatey：
        </Typography>
        <CodeBlock
          language="powershell"
          code={`choco install nodejs-lts`}
        />

        <Typography variant="body2" sx={{ mt: 2, mb: 1 }}>
          使用 Scoop：
        </Typography>
        <CodeBlock
          language="powershell"
          code={`scoop install nodejs-lts`}
        />

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
            <strong>提示：</strong> 建议使用 LTS（长期支持）版本以获得最佳稳定性。安装完成后需重启命令行窗口。
          </Typography>
        </Alert>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom color="primary">
          第 2 步：全局安装 Gemini CLI
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          打开命令提示符或 PowerShell，执行以下命令：
        </Typography>
        <CodeBlock
          language="bash"
          code={`npm install -g @google/gemini-cli`}
        />
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
      </Paper>
    </Container>
  );
};

export default WindowsTutorial;
