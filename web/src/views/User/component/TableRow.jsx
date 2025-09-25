import PropTypes from 'prop-types';
import { useState } from 'react';

import {
  Popover,
  TableRow,
  MenuItem,
  TableCell,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  Tooltip,
  Stack,
  TextField,
  InputAdornment,
  Table,
  TableHead,
  TableRow as TableRowMui
} from '@mui/material';

import Label from 'ui-component/Label';
import TableSwitch from 'ui-component/Switch';
import { renderQuota, renderNumber, timestamp2string, renderQuotaByMoney, showError } from 'utils/common';
import { Icon } from '@iconify/react';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import ConfirmDialog from 'ui-component/confirm-dialog';
import { API } from 'utils/api';

function renderRole(t, role) {
  switch (role) {
    case 1:
      return <Label color="default">{t('userPage.cUserRole')}</Label>;
    case 10:
      return <Label color="orange">{t('userPage.adminUserRole')}</Label>;
    case 100:
      return <Label color="success">{t('userPage.superAdminRole')}</Label>;
    default:
      return <Label color="error">{t('userPage.uUserRole')}</Label>;
  }
}

export default function UsersTableRow({ item, manageUser, handleOpenModal, setModalUserId }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const [open, setOpen] = useState(null);
  const [openDelete, setOpenDelete] = useState(false);
  const [openChangeQuota, setOpenChangeQuota] = useState(false);
  const [statusSwitch, setStatusSwitch] = useState(item.status);
  const [money, setMoney] = useState(0);
  const [remark, setRemark] = useState('');
  const [openTokenInfo, setOpenTokenInfo] = useState(false);
  const [tokenList, setTokenList] = useState([]);
  const [tokenListLoading, setTokenListLoading] = useState(false);
  const handleDeleteOpen = () => {
    handleCloseMenu();
    setOpenDelete(true);
  };

  const handleDeleteClose = () => {
    setOpenDelete(false);
  };

  const handleOpenMenu = (event) => {
    setOpen(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setOpen(null);
  };

  const handleChangeQuota = async () => {
    if (money === 0) {
      showError(t('userPage.changeQuotaNotEmpty'));
    }

    const quota = Number(renderQuotaByMoney(money));

    if (money < 0 && Math.abs(quota) > item.quota) {
      showError(t('userPage.changeQuotaNotEnough'));
      return;
    }
    const ok = await manageUser(item.id, 'quota', { quota: Number(quota), remark });
    if (ok) {
      setOpenChangeQuota(false);
    }
  };

  const handleStatus = async () => {
    const switchVlue = statusSwitch === 1 ? 2 : 1;
    const { success } = await manageUser(item.username, 'status', switchVlue);
    if (success) {
      setStatusSwitch(switchVlue);
    }
  };

  const handleDelete = async () => {
    handleCloseMenu();
    await manageUser(item.username, 'delete', '');
  };

  const handleTokenInfoOpen = () => {
    setTokenListLoading(true);
    API.get(`/api/user/token/${item.id}`)
      .then((res) => {
        const { success, message, data } = res.data;
        if (success) {
          setTokenList(data);
        } else {
          showError(message);
        }
        setOpenTokenInfo(true);
      })
      .catch((err) => {
        showError(err.response.data.message);
      })
      .finally(() => {
        setTokenListLoading(false);
      });
  };

  const handleTokenInfoClose = () => {
    setOpenTokenInfo(false);
  };

  return (
    <>
      <TableRow tabIndex={item.id}>
        <TableCell>{item.id}</TableCell>

        <TableCell>{item.username}</TableCell>

        <TableCell>
          <Label>{item.group}</Label>
        </TableCell>

        <TableCell>
          <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="center">
            <Tooltip title={t('token_index.remainingQuota')} placement="top">
              <Label color={'primary'} variant="outlined">
                {' '}
                {renderQuota(item.quota, 6)}{' '}
              </Label>
            </Tooltip>
            <Tooltip title={t('token_index.usedQuota')} placement="top">
              <Label color={'primary'} variant="outlined">
                {' '}
                {renderQuota(item.used_quota, 6)}{' '}
              </Label>
            </Tooltip>
            <Tooltip title={t('userPage.useQuota')} placement="top">
              <Label color={'primary'} variant="outlined">
                {' '}
                {renderNumber(item.request_count)}{' '}
              </Label>
            </Tooltip>
          </Stack>
        </TableCell>
        <TableCell>{renderRole(t, item.role)}</TableCell>
        <TableCell>
          <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="center">
            {item.wechat_id && (
              <Tooltip title={item.wechat_id ? item.wechat_id : t('profilePage.notBound')} placement="top">
                <Icon icon="ri:wechat-fill" color={item.wechat_id ? theme.palette.primary.dark : theme.palette.grey[400]} />
              </Tooltip>
            )}
            {item.github_id && (
              <Tooltip title={item.github_id ? item.github_id : t('profilePage.notBound')} placement="top">
                <Icon icon="ri:github-fill" color={item.github_id ? theme.palette.primary.dark : theme.palette.grey[400]} />
              </Tooltip>
            )}
            {item.email && (
              <Tooltip title={item.email ? item.email : t('profilePage.notBound')} placement="top">
                <Icon icon="ri:mail-fill" color={item.email ? theme.palette.primary.dark : theme.palette.grey[400]} />
              </Tooltip>
            )}
            {item.linuxdo_id && (
              <Tooltip title={item.linuxdo_id ? item.linuxdo_id : t('profilePage.notBound')} placement="top">
                <Icon icon="uil:linux" color={item.linuxdo_id ? theme.palette.primary.dark : theme.palette.grey[400]} />
              </Tooltip>
            )}
          </Stack>
        </TableCell>
        <TableCell>{item.created_time === 0 ? t('common.unknown') : timestamp2string(item.created_time)}</TableCell>
        <TableCell>
          {' '}
          <TableSwitch id={`switch-${item.id}`} checked={statusSwitch === 1} onChange={handleStatus} />
        </TableCell>
        <TableCell>
          <IconButton onClick={handleOpenMenu} sx={{ color: 'rgb(99, 115, 129)' }}>
            <Icon icon="solar:menu-dots-circle-bold-duotone" />
          </IconButton>
        </TableCell>
      </TableRow>

      <Popover
        open={!!open}
        anchorEl={open}
        onClose={handleCloseMenu}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: { minWidth: 140 }
        }}
      >
        {item.role !== 100 && (
          <MenuItem
            onClick={() => {
              handleCloseMenu();
              manageUser(item.username, 'role', item.role === 1 ? true : false);
            }}
          >
            <Icon icon="solar:user-bold-duotone" style={{ marginRight: '16px' }} />
            {item.role === 1 ? t('userPage.setAdmin') : t('userPage.cancelAdmin')}
          </MenuItem>
        )}

        <MenuItem
          onClick={() => {
            handleCloseMenu();
            handleOpenModal();
            setModalUserId(item.id);
          }}
        >
          <Icon icon="solar:pen-bold-duotone" style={{ marginRight: '16px' }} />
          {t('common.edit')}
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleCloseMenu();
            setOpenChangeQuota(true);
          }}
        >
          <Icon icon="solar:wallet-money-bold-duotone" style={{ marginRight: '16px' }} />
          {t('userPage.changeQuota')}
        </MenuItem>

        {/*  查看令牌信息 */}
        <MenuItem onClick={handleTokenInfoOpen} sx={{ color: 'primary.main' }}>
          <Icon icon="solar:key-bold-duotone" style={{ marginRight: '16px' }} />
          {t('userPage.tokenInfo')}
        </MenuItem>
        <MenuItem onClick={handleDeleteOpen} sx={{ color: 'error.main' }}>
          <Icon icon="solar:trash-bin-trash-bold-duotone" style={{ marginRight: '16px' }} />
          {t('common.delete')}
        </MenuItem>
      </Popover>

      <Dialog open={openDelete} onClose={handleDeleteClose}>
        <DialogTitle>{t('userPage.del')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t('userPage.delTip')} {item.name}？
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteClose}>{t('common.close')}</Button>
          <Button onClick={handleDelete} sx={{ color: 'error.main' }} autoFocus>
            {t('common.delete')}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={openChangeQuota}
        onClose={() => setOpenChangeQuota(false)}
        title={t('userPage.changeQuota')}
        content={
          <>
            <TextField
              fullWidth
              id="quota-label"
              label={t('userPage.changeQuota')}
              type="number"
              value={money}
              onChange={(e) => setMoney(e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
                endAdornment: <InputAdornment position="end">{renderQuotaByMoney(money)}</InputAdornment>
              }}
              helperText={t('userPage.changeQuotaHelperText', { quota: renderQuota(item.quota, 6) })}
              sx={{ mt: 2 }}
            />
            <TextField
              fullWidth
              id="quota-remark-label"
              label={t('userPage.quotaRemark')}
              type="text"
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              sx={{ mt: 2 }}
            />
          </>
        }
        action={
          <Button variant="contained" color="primary" onClick={handleChangeQuota}>
            {t('common.submit')}
          </Button>
        }
      />

      <Dialog open={openTokenInfo} onClose={handleTokenInfoClose}>
        <DialogTitle>{t('userPage.tokenInfo')}</DialogTitle>
        <DialogContent>
          {/* 令牌列表 */}
          {/* 名称 分组 状态 计费类型 已用额度 剩余额度 创建时间 操作 */}
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('userPage.tokenTable.name')}</TableCell>
                <TableCell>{t('userPage.tokenTable.group')}</TableCell>
                <TableCell>{t('userPage.tokenTable.status')}</TableCell>
                <TableCell>{t('userPage.tokenTable.billingType')}</TableCell>
                <TableCell>{t('userPage.tokenTable.usedQuota')}</TableCell>
                <TableCell>{t('userPage.tokenTable.remainingQuota')}</TableCell>
                <TableCell>{t('userPage.tokenTable.createdTime')}</TableCell>
                <TableCell>{t('key')}</TableCell>
              </TableRow>
            </TableHead>
            {tokenList.map((token) => (
              <TableRow key={token.id}>
                <TableCell>{token.name}</TableCell>
                <TableCell>{token.group}</TableCell>
                <TableCell>{token.status === 1 ? t('common.enable') : t('common.disable')}</TableCell>
                <TableCell>
                  {token.billing_type === 'tokens'
                    ? // 按量计费
                      t('token_index.billingType.tokens')
                    : // 按次数计费
                      t('token_index.billingType.times')}
                </TableCell>
                <TableCell>{renderQuota(token.used_quota, 6)}</TableCell>
                <TableCell>{renderQuota(token.remain_quota, 6)}</TableCell>
                <TableCell>{timestamp2string(token.created_time)}</TableCell>
                <TableCell>{token.key}</TableCell>
              </TableRow>
            ))}
          </Table>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleTokenInfoClose}>{t('common.close')}</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

UsersTableRow.propTypes = {
  item: PropTypes.object,
  manageUser: PropTypes.func,
  handleOpenModal: PropTypes.func,
  setModalUserId: PropTypes.func
};
