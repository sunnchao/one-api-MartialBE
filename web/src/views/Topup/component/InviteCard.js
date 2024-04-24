import { Stack, Typography, Container, Box, OutlinedInput, InputAdornment, Button, FormControl, InputLabel } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import SubCard from '@/ui-component/cards/SubCard';
import inviteImage from '@/assets/images/invite/cwok_casual_19.webp';
import React, { useEffect, useState } from 'react';
import { API } from '@/utils/api';
import { showError, copy } from '@/utils/common';

const InviteCard = (props) => {
  const theme = useTheme();
  const [inviteUl, setInviteUrl] = useState('');

  useEffect(() => {
    if (props.user?.aff_code) {
      let link = `${window.location.origin}/register?aff=${props.user?.aff_code}`;
      setInviteUrl(link);
    }
  }, [props.user]);

  const handleInviteUrl = async () => {
    if (inviteUl) {
      copy(inviteUl, '邀请链接');
      return;
    }

    // try {
    //   const res = await API.get('/api/user/aff');
    //   const { success, message, data } = res.data;
    //   if (success) {
    //     let link = `${window.location.origin}/register?aff=${data}`;
    //     setInviteUrl(link);
    //     copy(link, '邀请链接');
    //   } else {
    //     showError(message);
    //   }
    // } catch (error) {
    //   return;
    // }
  };

  return (
    <Box component="div">
      <SubCard
        sx={{
          background: theme.palette.primary.dark
        }}
      >
        <Stack justifyContent="center" alignItems={'flex-start'} padding={'40px 24px 0px'} spacing={3}>
          <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <img src={inviteImage} alt="invite" width={'250px'} />
          </Container>
        </Stack>
      </SubCard>
      <SubCard
        sx={{
          marginTop: '-20px'
        }}
      >
        <Stack justifyContent="center" alignItems={'center'} spacing={3}>
          <Typography variant="h3" sx={{ color: theme.palette.primary.dark }}>
            邀请奖励
          </Typography>
          <Typography variant="body" sx={{ color: theme.palette.primary.dark }}>
            分享您的邀请链接，邀请好友注册，即可获得奖励!
          </Typography>

          <FormControl fullWidth>
            <InputLabel htmlFor="invite-url">邀请链接</InputLabel>
            <OutlinedInput
              id="invite-url"
              label="邀请链接"
              type="text"
              value={inviteUl}
              name="invite-url"
              placeholder="点击生成邀请链接"
              endAdornment={
                <InputAdornment position="end">
                  <Button variant="contained" onClick={handleInviteUrl}>
                    {inviteUl ? '复制' : '生成'}
                  </Button>
                </InputAdornment>
              }
              aria-describedby="helper-text-channel-quota-label"
              disabled={true}
            />
          </FormControl>
        </Stack>
      </SubCard>
    </Box>
  );
};

export default InviteCard;
