import React from 'react';
import PropTypes from 'prop-types';
import { Container, Typography, Box, Paper, Alert, List, ListItem, ListItemText, Tabs, Tab } from '@mui/material';
import CodeBlock from 'ui-component/CodeBlock';

// TabPanel 组件
const TabPanel = (props) => {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`linux-tabpanel-${index}`}
      aria-labelledby={`linux-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

TabPanel.propTypes = {
  children: PropTypes.node,
  value: PropTypes.number.isRequired,
  index: PropTypes.number.isRequired
};

const LinuxTutorial = () => {
  const [distroTab, setDistroTab] = React.useState(0);

  const handleDistroChange = (_, newValue) => {
    setDistroTab(newValue);
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom>
        Linux 完整安装教程
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom color="primary">
          1. 安装 Node.js
        </Typography>

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={distroTab} onChange={handleDistroChange} aria-label="Linux distributions">
            <Tab label="Ubuntu/Debian" />
            <Tab label="CentOS/RHEL" />
            <Tab label="Arch Linux" />
            <Tab label="通用方法" />
          </Tabs>
        </Box>

        <TabPanel value={distroTab} index={0}>
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
            Ubuntu/Debian 系统
          </Typography>
          <CodeBlock
            language="bash"
            code={`# 更新包列表
sudo apt update

# 安装 Node.js（推荐使用 NodeSource 仓库）
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 验证安装
node --version
npm --version`}
          />
        </TabPanel>

        <TabPanel value={distroTab} index={1}>
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
            CentOS/RHEL 系统
          </Typography>
          <CodeBlock
            language="bash"
            code={`# 安装 Node.js（使用 NodeSource 仓库）
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# 验证安装
node --version
npm --version`}
          />
        </TabPanel>

        <TabPanel value={distroTab} index={2}>
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
            Arch Linux 系统
          </Typography>
          <CodeBlock
            language="bash"
            code={`# 安装 Node.js
sudo pacman -S nodejs npm

# 验证安装
node --version
npm --version`}
          />
        </TabPanel>

        <TabPanel value={distroTab} index={3}>
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
            通用方法（适用于所有 Linux 发行版）
          </Typography>
          <CodeBlock
            language="bash"
            code={`# 使用 Node Version Manager (NVM)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# 重新加载 shell 配置
source ~/.bashrc
# 或者如果使用 zsh
# source ~/.zshrc

# 安装 Node.js
nvm install 18
nvm use 18

# 验证安装
node --version
npm --version`}
          />
        </TabPanel>

        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="body2">
            <strong>系统要求：</strong> Linux 内核 3.10+，glibc 2.17+，支持 x86_64 和 aarch64 架构
          </Typography>
        </Alert>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom color="primary">
          2. 安装 CodeX CLI
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          在终端中执行以下命令：
        </Typography>
        <CodeBlock language="bash" code={`npm install -g @openai/codex@latest`} />

        <Typography variant="subtitle1" gutterBottom sx={{ mt: 3, fontWeight: 'bold' }}>
          验证安装
        </Typography>
        <CodeBlock language="bash" code={`codex --version`} />

        <Alert severity="warning" sx={{ mt: 2 }}>
          <Typography variant="body2">
            <strong>权限问题：</strong> 如果出现权限错误，请确保 npm 全局目录有写入权限，或使用 sudo 安装
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

export default LinuxTutorial;
