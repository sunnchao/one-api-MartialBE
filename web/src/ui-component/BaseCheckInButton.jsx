import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Dialog, DialogContent, DialogActions, ButtonBase, Button, DialogTitle, CircularProgress, Typography, Stack } from '@mui/material';
import Turnstile from 'react-turnstile';
import { showError, showSuccess, showInfo } from '@/utils/common';
import { API } from '@/utils/api';
import { LoadingButton } from '@mui/lab';

const BaseCheckin = (props) => {
  const [open, setOpen] = useState(false);
  const siteInfo = useSelector((state) => state.siteInfo);
  const [turnstileEnabled, setTurnstileEnabled] = useState(false);
  const [turnstileLoaded, setTurnstileLoaded] = useState(false);
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

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleTurnStileOnLoad = (widgetId, bound) => {
    // before:
    // window.turnstile.execute(widgetId);
    // now:
    // bound.execute();
    setTimeout(() => {
      setTurnstileLoaded(true);
    }, 1);
  };

  // 签到
  const handleUserOperationCheckIn = async () => {
    if (turnstileEnabled && turnstileToken === '') {
      showInfo('请稍后几秒重试，Turnstile 正在检查用户环境！');
      return;
    }
    setCheckinLoading(true);
    try {
      let res = await API.post(`/api/operation/checkin?turnstile=${turnstileToken}`);
      const { success, message } = res.data;
      if (success) {
        showSuccess(message);
        handleClose();
        if (props.loadUser) {
          props.loadUser();
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
  return (
    <>
      {props.check_in ? (
        <>已签到</>
      ) : (
        <>
          <ButtonBase variant="contained" onClick={handleClickOpen}>
            立即签到
          </ButtonBase>
        </>
      )}
      <Dialog open={open} onClose={handleClose} aria-labelledby="draggable-dialog-title">
        <DialogTitle>正在检查用户环境</DialogTitle>
        <DialogContent>
          <Stack direction={'column'} spacing={2}>
            <Typography>温馨提示：每日签到获得的额度以前一日的总消耗额度为基础获得随机返赠🤓</Typography>
            {turnstileEnabled ? (
              <div style={{ width: 300, height: 65 }}>
                {!turnstileLoaded && <CircularProgress />}
                <Turnstile
                  sitekey={turnstileSiteKey}
                  onVerify={(token) => {
                    setTurnstileToken(token);
                  }}
                  onLoad={handleTurnStileOnLoad}
                />
              </div>
            ) : (
              <></>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>取消</Button>
          <LoadingButton
            variant={'contained'}
            disabled={!turnstileToken}
            loading={checkinLoading}
            autoFocus
            onClick={handleUserOperationCheckIn}
          >
            立即签到
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default BaseCheckin;
