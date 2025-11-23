import React from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Alert,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import CodeBlock from 'ui-component/CodeBlock';

const WindowsTutorial = () => {
  return (
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom>
        Windows 完整安装教程
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom color="primary">
          1. 安装 Node.js
        </Typography>

        <Typography variant="subtitle1" gutterBottom sx={{ mt: 2, fontWeight: 'bold' }}>
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
          2. 安装 CodeX CLI
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          打开命令提示符（以管理员身份运行）或 PowerShell，执行以下命令：
        </Typography>
        <CodeBlock language="bash" code={`npm install -g @openai/codex@latest`} />

        <Typography variant="subtitle1" gutterBottom sx={{ mt: 3, fontWeight: 'bold' }}>
          验证安装
        </Typography>
        <CodeBlock language="bash" code={`codex --version`} />

        <Alert severity="warning" sx={{ mt: 2 }}>
          <Typography variant="body2">
            <strong>注意：</strong> 如果遇到权限问题，请确保以管理员身份运行命令提示符。
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
          code={`mkdir %USERPROFILE%\\.codex
cd %USERPROFILE%\\.codex`}
        />

        <Typography variant="subtitle1" gutterBottom sx={{ mt: 3, fontWeight: 'bold' }}>
          3.3 创建配置文件
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          1. 创建 config.toml 文件：
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          使用记事本或您喜欢的文本编辑器创建 config.toml 文件：
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
        <Typography variant="body2" sx={{ mb: 1 }}>
          在同一目录下创建 auth.json 文件：
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

export default WindowsTutorial;
