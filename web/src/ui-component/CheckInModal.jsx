import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import Turnstile from 'react-turnstile';
import { API } from 'utils/api';
import { Typography, Dialog, Button, Stack, CircularProgress, DialogContent, DialogTitle, DialogActions } from '@mui/material';

import { showError, showSuccess, showInfo } from 'utils/common';
import LoadingButton from '@mui/lab/LoadingButton';

export default function CheckInModal(props) {
  const siteInfo = useSelector((state) => state.siteInfo);

  const [turnstileEnabled, setTurnstileEnabled] = useState(false);
  const [turnstileSiteKey, setTurnstileSiteKey] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const [checkinLoading, setCheckinLoading] = useState(false);

  useEffect(() => {
    if (siteInfo.turnstile_check) {
      setTurnstileEnabled(true);
      setTurnstileSiteKey(siteInfo.turnstile_site_key);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteInfo]);

  const handleTurnStileOnLoad = (widgetId, bound) => {
    // before:
    window.turnstile.execute(widgetId);
    // now:
    bound.execute();
  };

  // 签到
  const handleUserOperationCheckIn = async () => {
    if (turnstileEnabled && turnstileToken === '') {
      showInfo('请稍后几秒重试，Turnstile 正在检查用户环境！');
      return;
    }
    // TODO
    // showInfo('签到系统正在维护中！');
    // return;
    setCheckinLoading(true);
    try {
      let res = await API.post(`/api/user/checkin?turnstile=${turnstileToken}`);
      const { success, message } = res.data;
      if (success) {
        showSuccess(message);
        handleClose();
        if (props.loadUser) {
          props.loadUser();
        }
        // 刷新优惠券列表
        if (props.refreshCoupons) {
          props.refreshCoupons();
        }
        if (props.refreshCheckins) {
          props.refreshCheckins();
        }
      } else {
        showError(message);
      }
      setCheckinLoading(false);
    } catch (error) {
      setCheckinLoading(false);
      return;
    }
  };

  function handleClose() {
    props?.onClose?.();
  }

  return (
    <Dialog open={props.visible} onClose={handleClose}>
      <DialogTitle>
        <Typography heading={4}>正在检查用户环境</Typography>
      </DialogTitle>
      <DialogContent>
        <Stack flexDirection={'column'} size={16}>
          <Typography>温馨提示：每日签到获得的额度以前一日的总消耗额度为基础获得随机返赠🤓</Typography>

          {turnstileEnabled ? (
            <div style={{ width: '100%', height: 65 }}>
              <Turnstile
                sitekey={turnstileSiteKey}
                onVerify={(token) => {
                  setTurnstileToken(token);
                }}
                onLoad={handleTurnStileOnLoad}
                executution="execute"
              />
            </div>
          ) : (
            <div style={{ width: '100%', height: 65, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <CircularProgress />
            </div>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => handleClose()}>取消</Button>
        <LoadingButton
          loading={checkinLoading}
          disabled={!turnstileToken}
          onClick={() => handleUserOperationCheckIn()}
          type="primary"
          variant="contained"
        >
          立即签到
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}

CheckInModal.propTypes = {
  visible: PropTypes.bool,
  onClose: PropTypes.func,
  refreshCoupons: PropTypes.func,
  refreshCheckins: PropTypes.func,
  loadUser: PropTypes.func
};
