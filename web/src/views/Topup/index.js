import { useEffect, useState } from 'react';
import { showError } from '@/utils/common';
import { Stack, Alert } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import TopupCard from './component/TopupCard';
import InviteCard from './component/InviteCard';
import { API } from '@/utils/api';
import { useTranslation } from 'react-i18next';

const Topup = () => {
  const { t } = useTranslation();
  const [user, setUser] = useState({});

  const loadUserSelf = async () => {
    try {
      const res = await API.get('/api/user/self');
      const { success, message, data } = res.data;
      if (success) {
        setUser(data);
      } else {
        showError(message);
      }
    } catch (error) {
      return;
    }
  };

  useEffect(() => {
    loadUserSelf().then();
  }, []);

  return (
    <Grid container spacing={2}>
      <Grid xs={12}>
        <Alert severity="warning">{t('topupPage.alertMessage')}</Alert>
      </Grid>
      <Grid xs={12} md={6} lg={6}>
        <Stack spacing={2}>
          <TopupCard user={user} />
        </Stack>
      </Grid>
      <Grid xs={12} md={6} lg={6}>
        <InviteCard user={user} />
      </Grid>
    </Grid>
  );
};

export default Topup;
