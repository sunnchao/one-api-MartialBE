import { Typography, Stack, OutlinedInput, InputAdornment, Button, InputLabel, FormControl } from '@mui/material';
import { IconBuildingBank } from '@tabler/icons-react';
import { useTheme } from '@mui/material/styles';
import SubCard from '@/ui-component/cards/SubCard';
import UserCard from '@/ui-component/cards/UserCard';

import { API } from '@/utils/api';
import React, { useEffect, useState } from 'react';
import { showError, showInfo, showSuccess, renderQuota, trims } from '@/utils/common';

const TopupCard = (props) => {
  const theme = useTheme();
  const [redemptionCode, setRedemptionCode] = useState('');
  const [topUpLink, setTopUpLink] = useState('');
  const [userQuota, setUserQuota] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const topUp = async () => {
    if (redemptionCode === '') {
      showInfo('请输入充值码！');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await API.post('/api/user/topup', {
        key: trims(redemptionCode)
      });
      const { success, message, data } = res.data;
      if (success) {
        showSuccess('充值成功！');
        setUserQuota((quota) => {
          return quota + data;
        });
        setRedemptionCode('');
      } else {
        showError(message);
      }
    } catch (err) {
      showError('请求失败');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openTopUpLink = () => {
    if (!topUpLink) {
      showError('超级管理员未设置充值链接！');
      return;
    }
    window.open(topUpLink, '_blank');
  };

  const openTopUpLink2 = () => {
    if (!topUpLink) {
      showError('超级管理员未设置充值链接！');
      return;
    }
    window.open('https://www.zaofaka.com/links/F8373848', '_blank');
  };

  useEffect(() => {
    let status = localStorage.getItem('siteInfo');
    if (status) {
      status = JSON.parse(status);
      if (status.top_up_link) {
        setTopUpLink(status.top_up_link);
      }
    }
  }, []);

  useEffect(() => {
    if (props.user?.quota) {
      setUserQuota(props.user.quota);
    }
  }, [props.user]);

  return (
    <UserCard>
      <Stack direction="row" alignItems="center" justifyContent="center" spacing={2} paddingTop={'20px'}>
        <IconBuildingBank color={theme.palette.primary.main} />
        <Typography variant="h4">当前额度:</Typography>
        <Typography variant="h4">{renderQuota(userQuota)}</Typography>
      </Stack>
      <SubCard
        sx={{
          marginTop: '40px'
        }}
      >
        <FormControl fullWidth>
          <InputLabel htmlFor="key">兑换码</InputLabel>
          <OutlinedInput
            id="key"
            label="兑换码"
            type="text"
            value={redemptionCode}
            onChange={(e) => {
              setRedemptionCode(e.target.value);
            }}
            name="key"
            placeholder="请输入兑换码"
            endAdornment={
              <InputAdornment position="end">
                <Button variant="contained" onClick={topUp} disabled={isSubmitting}>
                  {isSubmitting ? '兑换中...' : '兑换'}
                </Button>
              </InputAdornment>
            }
            aria-describedby="helper-text-channel-quota-label"
          />
        </FormControl>

        <Stack justifyContent="center" alignItems={'center'} spacing={3} paddingTop={'20px'}>
          <Typography variant={'h4'} color={theme.palette.grey[700]}>
            还没有兑换码？ 点击购买兑换码：
          </Typography>
          <Stack direction={'row'} spacing={3}>
            <Button variant="contained" onClick={openTopUpLink}>
              立即购买
            </Button>
            <Button onClick={openTopUpLink2}>备用地址</Button>
          </Stack>
        </Stack>
      </SubCard>
    </UserCard>
  );
};

export default TopupCard;
