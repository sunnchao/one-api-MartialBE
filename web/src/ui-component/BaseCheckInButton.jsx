import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Dialog, DialogContent, DialogActions, ButtonBase, Button, DialogTitle } from '@mui/material';
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

  const handleTurnStileOnLoad = () => {
    console.log('handleTurnStileOnLoad');
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
          {turnstileEnabled ? (
            <div style={{ width: 300, height: 65 }}>
              <Turnstile
                sitekey={turnstileSiteKey}
                onVerify={(token) => {
                  setTurnstileToken(token);
                }}
              />
            </div>
          ) : (
            <></>
          )}
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
