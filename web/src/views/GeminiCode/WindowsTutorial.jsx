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
      description: 'Gemini CLI 依赖 Node.js 运行环境。',
      content: (
        <Box sx={{ mt: 2 }}>
          <Alert severity="info" variant="outlined" sx={{ mb: 3, borderRadius: 0 }}>
            <Typography variant="body2">
              <strong>系统要求：</strong> Windows 10 或 Windows 11，建议使用 LTS 版本
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
                    访问 Node.js 官网下载 LTS 版本 Windows Installer (.msi)。
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
                    使用 Winget 快速安装：
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
      label: '全局安装 Gemini CLI',
      description: '使用 npm 全局安装 Gemini 命令行工具。',
      content: (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" paragraph>
            请以<strong>管理员身份</strong>运行 PowerShell 或命令提示符，然后执行：
          </Typography>
          <CodeBlock language="bash" code={`npm install -g @google/gemini-cli`} />
          
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" gutterBottom fontWeight="bold">
              验证安装：
            </Typography>
            <CodeBlock language="bash" code={`gemini --version`} />
          </Box>
        </Box>
      )
    },
    {
      label: '下一步',
      description: '配置密钥并开始使用。',
      content: (
        <Box sx={{ mt: 2 }}>
          <Alert severity="success" variant="outlined" sx={{ borderRadius: 2 }}>
            <Typography variant="subtitle1" fontWeight="bold">
              🎉 安装完成！
            </Typography>
            <Typography variant="body2">
              Gemini CLI 已成功安装。请切换到 <strong>"配置密钥"</strong> 标签页，完成 API 密钥配置。
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
