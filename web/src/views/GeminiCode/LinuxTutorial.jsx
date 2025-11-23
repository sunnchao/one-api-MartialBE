import React from 'react';
import PropTypes from 'prop-types';
import {
  Container,
  Typography,
  Box,
  Paper,
  Alert,
  Tabs,
  Tab
} from '@mui/material';
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
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">支持各种 Linux 发行版，包括 Ubuntu、CentOS、Arch Linux 等</Typography>
      </Alert>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom color="primary">
          第 1 步：安装 Node.js
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
          第 2 步：全局安装 Gemini CLI
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          在终端中执行以下命令：
        </Typography>
        <CodeBlock
          language="bash"
          code={`npm install -g @google/gemini-cli`}
        />

        <Alert severity="warning" sx={{ mt: 2 }}>
          <Typography variant="body2">
            <strong>权限问题：</strong> 如果出现权限错误，请确保 npm 全局目录有写入权限，或使用 sudo 安装
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

export default LinuxTutorial;
