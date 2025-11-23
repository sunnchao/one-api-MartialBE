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
import CodeBlock from 'ui-component/CodeBlock';

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
                  <CodeBlock
                    language="bash"
                    code={`# 检查 Node.js 版本
node --version

# 检查 npm 版本
npm --version`}
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Typography variant="subtitle1" gutterBottom sx={{ mt: 3, fontWeight: 'bold' }}>
            方法一：使用官方安装包（推荐）
          </Typography>
          <List dense>
            <ListItem>
              <ListItemText primary="访问 https://nodejs.org" />
            </ListItem>
            <ListItem>
              <ListItemText primary="下载 LTS 版本的 Windows Installer (.msi)" />
            </ListItem>
            <ListItem>
              <ListItemText primary="运行安装程序，按默认设置完成安装" />
            </ListItem>
            <ListItem>
              <ListItemText primary="安装程序会自动添加到 PATH 环境变量" />
            </ListItem>
          </List>

          <Typography variant="subtitle1" gutterBottom sx={{ mt: 3, fontWeight: 'bold' }}>
            方法二：使用包管理器
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            使用 Winget（Windows 11 或 Windows 10 自带）：
          </Typography>
          <CodeBlock language="powershell" code={`winget install OpenJS.NodeJS.LTS`} />

          <Typography variant="body2" sx={{ mt: 2, mb: 1 }}>
            使用 Chocolatey：
          </Typography>
          <CodeBlock language="powershell" code={`choco install nodejs-lts`} />

          <Typography variant="body2" sx={{ mt: 2, mb: 1 }}>
            使用 Scoop：
          </Typography>
          <CodeBlock language="powershell" code={`scoop install nodejs-lts`} />

          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>提示：</strong> 建议使用 LTS（长期支持）版本以获得最佳稳定性。安装完成后需重启命令行窗口。
            </Typography>
          </Alert>
        </Box>
      )
    },
    {
      label: '安装 Claude Code CLI',
      content: (
        <Box>
          <Typography variant="h6" gutterBottom>
            使用 npm 全局安装 Claude Code
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            打开命令提示符（以管理员身份运行）或 PowerShell，执行以下命令：
          </Typography>
          <CodeBlock language="bash" code={`npm install -g @anthropic-ai/claude-code`} />
          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            验证安装
          </Typography>
          <CodeBlock language="bash" code={`claude --version`} />

          <Alert severity="warning" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>注意：</strong> 如果遇到权限问题，请确保以管理员身份运行命令提示符。
            </Typography>
          </Alert>
        </Box>
      )
    },
    {
      label: '配置 Chirou API',
      content: (
        <Box>
          <Typography variant="h6" gutterBottom color="primary">
            3.1 获取 Auth Token
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            访问 Chirou API 控制台 进行以下操作：
          </Typography>
          <List dense>
            <ListItem>
              <ListItemIcon>
                <CheckCircleIcon color="success" />
              </ListItemIcon>
              <ListItemText primary="点击「添加令牌」" />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircleIcon color="success" />
              </ListItemIcon>
              <ListItemText
                primary="令牌分组请选择：Claude Code专用"
                secondary="务必选择此分组，否则无法使用"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircleIcon color="success" />
              </ListItemIcon>
              <ListItemText primary="令牌名称：随意填写" />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircleIcon color="success" />
              </ListItemIcon>
              <ListItemText primary="额度建议：设置为无限额度" />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircleIcon color="success" />
              </ListItemIcon>
              <ListItemText primary="其他选项保持默认" />
            </ListItem>
          </List>

          <Typography variant="h6" gutterBottom color="primary" sx={{ mt: 3 }}>
            3.2 配置环境变量
          </Typography>
          <Alert severity="error" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>重要提示：</strong> 请将下方的 ANTHROPIC_AUTH_TOKEN 替换为您在 https://api.wochirou.com/panel/token
              生成的Claude Code专用 API 密钥！
            </Typography>
          </Alert>

          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
            settings.json 配置（推荐，永久生效）
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            配置位置：%USERPROFILE%\.claude\settings.json
          </Typography>
          <CodeBlock
            language="json"
            code={`{
  "env": {
    "ANTHROPIC_AUTH_TOKEN": "粘贴为Claude Code专用分组令牌key",
    "ANTHROPIC_BASE_URL": "https://api.wochirou.com.com/claude"
  }
}`}
          />

          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>注意：</strong> 配置文件更加安全且便于管理，需要重启 Claude Code 才生效。
            </Typography>
          </Alert>
        </Box>
      )
    },
    {
      label: '启动 Claude Code',
      content: (
        <Box>
          <Typography variant="h6" gutterBottom>
            启动 Claude Code
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            配置完成后，先进入到工程目录：
          </Typography>
          <CodeBlock language="bash" code={`cd your-project-folder`} />

          <Typography variant="body1" sx={{ mb: 2, mt: 2 }}>
            然后，运行以下命令启动：
          </Typography>
          <CodeBlock language="bash" code={`claude`} />

          <Typography variant="subtitle1" gutterBottom sx={{ mt: 3, fontWeight: 'bold' }}>
            首次启动后需要先进行主题的选择等操作：
          </Typography>
          <List dense>
            <ListItem>
              <ListItemIcon>
                <CheckCircleIcon color="success" />
              </ListItemIcon>
              <ListItemText primary="选择喜欢的主题（回车）" />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircleIcon color="success" />
              </ListItemIcon>
              <ListItemText primary="确认安全须知（回车）" />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircleIcon color="success" />
              </ListItemIcon>
              <ListItemText primary="使用默认 Terminal 配置（回车）" />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircleIcon color="success" />
              </ListItemIcon>
              <ListItemText primary="信任工作目录（回车）" />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircleIcon color="success" />
              </ListItemIcon>
              <ListItemText primary="开始编程！🚀" />
            </ListItem>
          </List>

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
        <Typography variant="h6" color="text.secondary" mb={2}>
          系统要求
        </Typography>
        <List dense>
          <ListItem>
            <ListItemIcon>
              <InfoIcon color="primary" />
            </ListItemIcon>
            <ListItemText primary="• Windows 10 或 Windows 11" />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <InfoIcon color="primary" />
            </ListItemIcon>
            <ListItemText primary="• Node.js 18+" />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <InfoIcon color="primary" />
            </ListItemIcon>
            <ListItemText primary="• 网络连接" />
          </ListItem>
        </List>
      </Box>

      {steps.map((step, index) => (
        <Paper key={index} sx={{ p: 3, mb: 3, borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
          <Typography variant="h5" component="h2" gutterBottom>
            {`${index + 1}. ${step.label}`}
          </Typography>
          <Divider sx={{ mb: 2 }} />
          {step.content}
        </Paper>
      ))}
    </Container>
  );
};

export default WindowsTutorial;
