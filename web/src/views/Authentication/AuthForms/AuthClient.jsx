import { Box, Button, Divider, Grid, useMediaQuery } from '@mui/material';
import AnimateButton from '@/ui-component/extended/AnimateButton';
import { onGitHubOAuthClicked, onLarkOAuthClicked, onLinuxDOAuthClicked } from '@/utils/common';
import Github from '@/assets/images/icons/github.svg';
import LinuxDo from '@/assets/images/icons/linuxdo.svg?react';
import Wechat from '@/assets/images/icons/wechat.svg';
import WechatModal from '@/views/Authentication/AuthForms/WechatModal';
import Lark from '@/assets/images/icons/lark.svg';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import useLogin from '@/hooks/useLogin';
import { useTheme } from '@mui/material/styles';

const AuthClient = () => {
  const theme = useTheme();
  const { wechatLogin } = useLogin();

  const [openWechat, setOpenWechat] = useState(false);
  const matchDownSM = useMediaQuery(theme.breakpoints.down('md'));
  const customization = useSelector((state) => state.customization);
  const siteInfo = useSelector((state) => state.siteInfo);
  // const [checked, setChecked] = useState(true);

  let tripartiteLogin = false;
  if (siteInfo.github_oauth || siteInfo.linuxdo_oauth || siteInfo.wechat_login || siteInfo.lark_client_id) {
    tripartiteLogin = true;
  }

  // 寻找 oauth 为 true 的个数
  const oauthClientCounts = [siteInfo.github_oauth, siteInfo.linuxdo_oauth, siteInfo.wechat_login, siteInfo.lark_client_id].filter(
    (item) => !!item
  ).length;

  const handleWechatOpen = () => {
    setOpenWechat(true);
  };

  const handleWechatClose = () => {
    setOpenWechat(false);
  };

  return (
    <>
      {tripartiteLogin ? (
        <Grid container direction="row" justifyContent="center" spacing={2}>
          {siteInfo.github_oauth && (
            <Grid item xs={12 / oauthClientCounts}>
              <AnimateButton>
                <Button
                  disableElevation
                  fullWidth
                  onClick={() => onGitHubOAuthClicked(siteInfo.github_client_id)}
                  size="large"
                  variant="outlined"
                  sx={{
                    ...theme.typography.LoginButton
                  }}
                >
                  <Box sx={{ mr: { xs: 1, sm: 2, width: 20 }, display: 'flex', alignItems: 'center' }}>
                    <img src={Github} alt="github" width={25} height={25} style={{ marginRight: matchDownSM ? 8 : 16 }} />
                  </Box>
                  使用 Github 登录
                </Button>
              </AnimateButton>
            </Grid>
          )}
          {siteInfo.linuxdo_oauth && (
            <Grid item xs={12 / oauthClientCounts}>
              <AnimateButton>
                <Button
                  disableElevation
                  fullWidth
                  onClick={() => onLinuxDOAuthClicked(siteInfo.linuxdo_client_id, true)}
                  size="large"
                  variant="outlined"
                  sx={{
                    ...theme.typography.LoginButton
                  }}
                >
                  <Box sx={{ mr: { xs: 1, sm: 2, width: 20 }, display: 'flex', alignItems: 'center' }}>
                    <LinuxDo style={{ width: '25px', height: '25px' }} />
                  </Box>
                  使用LinuxDO登录
                </Button>
              </AnimateButton>
            </Grid>
          )}
          {siteInfo.wechat_login && (
            <Grid item xs={12}>
              <AnimateButton>
                <Button
                  disableElevation
                  fullWidth
                  onClick={handleWechatOpen}
                  size="large"
                  variant="outlined"
                  sx={{
                    ...theme.typography.LoginButton
                  }}
                >
                  <Box sx={{ mr: { xs: 1, sm: 2, width: 20 }, display: 'flex', alignItems: 'center' }}>
                    <img src={Wechat} alt="Wechat" width={25} height={25} style={{ marginRight: matchDownSM ? 8 : 16 }} />
                  </Box>
                  使用 Wechat 登录
                </Button>
              </AnimateButton>
              <WechatModal open={openWechat} handleClose={handleWechatClose} wechatLogin={wechatLogin} qrCode={siteInfo.wechat_qrcode} />
            </Grid>
          )}
          {siteInfo.lark_client_id && (
            <Grid item xs={12}>
              <AnimateButton>
                <Button
                  disableElevation
                  fullWidth
                  onClick={() => onLarkOAuthClicked(siteInfo.lark_client_id)}
                  size="large"
                  variant="outlined"
                  sx={{
                    ...theme.typography.LoginButton
                  }}
                >
                  <Box sx={{ mr: { xs: 1, sm: 2, width: 20 }, display: 'flex', alignItems: 'center' }}>
                    <img src={Lark} alt="Lark" width={25} height={25} style={{ marginRight: matchDownSM ? 8 : 16 }} />
                  </Box>
                  使用飞书登录
                </Button>
              </AnimateButton>
            </Grid>
          )}
          <Grid item xs={12}>
            <Box
              sx={{
                alignItems: 'center',
                display: 'flex'
              }}
            >
              <Divider sx={{ flexGrow: 1 }} orientation="horizontal" />

              <Button
                variant="outlined"
                sx={{
                  cursor: 'unset',
                  m: 2,
                  py: 0.5,
                  px: 7,
                  borderColor: `${theme.palette.grey[100]} !important`,
                  color: `${theme.palette.grey[900]}!important`,
                  fontWeight: 500,
                  borderRadius: `${customization.borderRadius}px`
                }}
                disableRipple
                disabled
              >
                OR
              </Button>

              <Divider sx={{ flexGrow: 1 }} orientation="horizontal" />
            </Box>
          </Grid>
        </Grid>
      ) : (
        []
      )}
    </>
  );
};

export default AuthClient;
