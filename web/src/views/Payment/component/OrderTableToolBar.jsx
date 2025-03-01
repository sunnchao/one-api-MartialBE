import PropTypes from 'prop-types';
import { OutlinedInput, Stack, FormControl, InputLabel, Select, MenuItem, Grid, Box, Divider } from '@mui/material';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { StatusType } from './OrderTableRow';
import { useTranslation } from 'react-i18next';
import 'dayjs/locale/zh-cn';
// ----------------------------------------------------------------------

export default function OrderTableToolBar({ filterName, handleFilterName }) {
  const { t } = useTranslation();

  return (
    <>
      <Box sx={{ padding: '24px', paddingBottom: '12px' }}>
        <Grid container spacing={2}>
          {/* First row - 4 text inputs */}
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel htmlFor="channel-gateway_id-label">{t('orderlogPage.gatewayIdLabel')}</InputLabel>
              <OutlinedInput
                id="gateway_id"
                name="gateway_id"
                label={t('orderlogPage.gatewayIdLabel')}
                value={filterName.gateway_id}
                onChange={handleFilterName}
                placeholder={t('orderlogPage.placeholder.gatewayId')}
              />
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel htmlFor="channel-user_id-label">{t('orderlogPage.userIdLabel')}</InputLabel>
              <OutlinedInput
                id="user_id"
                name="user_id"
                label={t('orderlogPage.userIdLabel')}
                value={filterName.user_id}
                onChange={handleFilterName}
                placeholder={t('orderlogPage.placeholder.userId')}
              />
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel htmlFor="channel-trade_no-label">{t('orderlogPage.tradeNoLabel')}</InputLabel>
              <OutlinedInput
                id="trade_no"
                name="trade_no"
                label={t('orderlogPage.tradeNoLabel')}
                value={filterName.trade_no}
                onChange={handleFilterName}
                placeholder={t('orderlogPage.placeholder.tradeNo')}
              />
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel htmlFor="channel-gateway_no-label">{t('orderlogPage.gatewayNoLabel')}</InputLabel>
              <OutlinedInput
                id="gateway_no"
                name="gateway_no"
                label={t('orderlogPage.gatewayNoLabel')}
                value={filterName.gateway_no}
                onChange={handleFilterName}
                placeholder={t('orderlogPage.placeholder.gatewayNo')}
              />
            </FormControl>
          </Grid>

          {/* Second row - Date pickers and status */}
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth size="small">
              <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={'zh-cn'}>
                <DateTimePicker
                  label={t('orderlogPage.startTimeLabel')}
                  ampm={false}
                  name="start_timestamp"
                  value={filterName.start_timestamp === 0 ? null : dayjs.unix(filterName.start_timestamp)}
                  onChange={(value) => {
                    if (value === null) {
                      handleFilterName({ target: { name: 'start_timestamp', value: 0 } });
                      return;
                    }
                    handleFilterName({ target: { name: 'start_timestamp', value: value.unix() } });
                  }}
                  slotProps={{
                    actionBar: {
                      actions: ['clear', 'today', 'accept']
                    },
                    textField: {
                      size: 'small',
                      fullWidth: true
                    }
                  }}
                />
              </LocalizationProvider>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth size="small">
              <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={'zh-cn'}>
                <DateTimePicker
                  label={t('orderlogPage.endTimeLabel')}
                  name="end_timestamp"
                  ampm={false}
                  value={filterName.end_timestamp === 0 ? null : dayjs.unix(filterName.end_timestamp)}
                  onChange={(value) => {
                    if (value === null) {
                      handleFilterName({ target: { name: 'end_timestamp', value: 0 } });
                      return;
                    }
                    handleFilterName({ target: { name: 'end_timestamp', value: value.unix() } });
                  }}
                  slotProps={{
                    actionBar: {
                      actions: ['clear', 'today', 'accept']
                    },
                    textField: {
                      size: 'small',
                      fullWidth: true
                    }
                  }}
                />
              </LocalizationProvider>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel htmlFor="channel-status-label">{t('orderlogPage.statusLabel')}</InputLabel>
              <Select
                id="channel-type-label"
                label={t('orderlogPage.statusLabel')}
                value={filterName.status}
                name="status"
                onChange={handleFilterName}
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: 200
                    }
                  }
                }}
              >
                {Object.values(StatusType).map((option) => {
                  return (
                    <MenuItem key={option.value} value={option.value}>
                      {option.name}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Box>
      <Divider sx={{ mt: 1 }} />
    </>
  );
}

OrderTableToolBar.propTypes = {
  filterName: PropTypes.object,
  handleFilterName: PropTypes.func
};
