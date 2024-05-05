import { Button, Dialog, DialogContent, DialogContentText, DialogActions, Box } from '@mui/material';
import { useState } from 'react';
import QQGroupQCode from '@/assets/images/qq-group.jpg?url';
import { copy } from '@/utils/common';

export default function ContactButton() {
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleCopyQQGroupNumber = () => {
    copy('924076327');
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Button color="inherit" onClick={handleClickOpen}>
        联系方式
      </Button>
      <Dialog open={open} keepMounted onClose={handleClose} aria-describedby="alert-dialog-slide-description">
        <DialogContent>
          <DialogContentText id="alert-dialog-slide-description">
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'center' }}>
              {/*  QQ群*/}
              <img
                src={QQGroupQCode}
                style={{
                  maxHeight: '50vh'
                }}
              />
            </Box>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCopyQQGroupNumber}>复制QQ群号</Button>
          <Button onClick={handleClose}>知道了</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
