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
  Tooltip,
  Stack
} from '@mui/material';

import Label from '@/ui-component/Label';
import TableSwitch from '@/ui-component/Switch';
import { renderQuota, renderNumber, timestamp2string } from '@/utils/common';
import { IconDotsVertical, IconEdit, IconTrash, IconUser, IconBrandWechat, IconBrandGithub, IconMail } from '@tabler/icons-react';
import { useTheme } from '@mui/material/styles';
import LinuxDoIcon from '@/assets/images/icons/linuxdo.svg?react';
import { useTranslation } from 'react-i18next';
import { Modal, Form, Input, Checkbox, Switch, Flex, Button, Divider, Tag } from 'antd';

function renderRole(t, role) {
  switch (role) {
    case 1:
      return <Tag type="default">{t('userPage.cUserRole')}</Tag>;
    case 10:
      return <Tag type="orange">{t('userPage.adminUserRole')}</Tag>;
    case 100:
      return <Tag type="success">{t('userPage.superAdminRole')}</Tag>;
    default:
      return <Tag type="error">{t('userPage.uUserRole')}</Tag>;
  }
}

export default function UsersTableRow({ item, manageUser, handleOpenModal, setModalUserId }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const [open, setOpen] = useState(null);
  const [openDelete, setOpenDelete] = useState(false);
  const [statusSwitch, setStatusSwitch] = useState(item.status);

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
            {/*  邀请人 inviter_id*/}
            <Tooltip title={'邀请人'} placement="top">
              <Label color={'primary'} variant="outlined">
                {item.inviter_id}
              </Label>
            </Tooltip>
          </Stack>
        </TableCell>
        <TableCell>{renderRole(t, item.role)}</TableCell>
        <TableCell>
          <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="center">
            <Tooltip title={item.wechat_id ? item.wechat_id : t('profilePage.notBound')} placement="top">
              <IconBrandWechat color={item.wechat_id ? theme.palette.success.dark : theme.palette.grey[400]} />
            </Tooltip>
            <Tooltip title={item.github_id ? item.github_id : t('profilePage.notBound')} placement="top">
              <IconBrandGithub color={item.github_id ? theme.palette.grey[900] : theme.palette.grey[400]} />
            </Tooltip>
            <Tooltip title={item.email ? item.email : t('profilePage.notBound')} placement="top">
              <IconMail color={item.email ? theme.palette.grey[900] : theme.palette.grey[400]} />
            </Tooltip>
            <Tooltip title={item.linuxdo_id ? item.linuxdo_id : '未绑定'} placement="top">
              <LinuxDoIcon style={{ width: 24, height: 24, color: item.linuxdo_id ? theme.palette.grey[900] : theme.palette.grey[400] }} />
            </Tooltip>
          </Stack>
        </TableCell>
        <TableCell>{item.created_time === 0 ? t('common.unknown') : timestamp2string(item.created_time)}</TableCell>
        <TableCell>
          {' '}
          <TableSwitch id={`switch-${item.id}`} checked={statusSwitch === 1} onChange={handleStatus} />
        </TableCell>
        <TableCell>
          <IconButton onClick={handleOpenMenu} sx={{ color: 'rgb(99, 115, 129)' }}>
            <IconDotsVertical />
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
          <>
            <MenuItem
              onClick={() => {
                handleCloseMenu();
                manageUser(item.username, 'role', item.role === 1 ? true : false);
              }}
            >
              <IconEdit style={{ marginRight: '16px' }} />
              {item.role === 1 ? t('userPage.setAdmin') : t('userPage.cancelAdmin')}
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleCloseMenu();
                handleOpenModal('Reissue');
                setModalUserId(item.id);
              }}
            >
              <IconUser style={{ marginRight: '16px' }} />
              补发额度
            </MenuItem>
          </>
        )}

        <MenuItem
          onClick={() => {
            handleCloseMenu();
            handleOpenModal();
            setModalUserId(item.id);
          }}
        >
          <IconEdit style={{ marginRight: '16px' }} />
          {t('common.edit')}
        </MenuItem>
        <MenuItem onClick={handleDeleteOpen} sx={{ color: 'error.main' }}>
          <IconTrash style={{ marginRight: '16px' }} />
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
    </>
  );
}

UsersTableRow.propTypes = {
  item: PropTypes.object,
  manageUser: PropTypes.func,
  handleOpenModal: PropTypes.func,
  setModalUserId: PropTypes.func
};

export const tableColumns = ({ t, manageUser, handleSearch }) => {
  return [
    {
      id: 'id',
      label: t('userPage.id'),
      disableSort: false,
      onCell() {
        return {
          style: {
            minWidth: '50px'
          }
        };
      }
    },
    {
      id: 'username',
      label: t('userPage.username'),
      disableSort: false,
      onCell() {
        return {
          style: {
            minWidth: '100px'
          }
        };
      }
    },
    {
      id: 'group',
      label: t('userPage.group'),
      disableSort: true,
      onCell() {
        return {
          style: {
            minWidth: '100px'
          }
        };
      }
    },
    {
      id: 'stats',
      label: t('userPage.statistics'),
      disableSort: true,
      render(col, item, index) {
        return (
          <>
            <Tag type={'default'}>{renderQuota(item.quota, 6)}</Tag>
            <Divider type="vertical" />
            <Tag type={'default'}>{renderQuota(item.used_quota, 6)}</Tag>
            <Divider type="vertical" />
            <Tag type={'default'}>{renderNumber(item.request_count)} </Tag>
            <Divider type="vertical" />
            <Tooltip title={'邀请人'} placement="top">
              <Tag type={'default'}>{item.inviter_id}</Tag>
            </Tooltip>
          </>
        );
      },
      onCell() {
        return {
          style: {
            minWidth: '250px'
          }
        };
      }
    },
    {
      id: 'role',
      label: t('userPage.userRole'),
      disableSort: false,
      render(col, item, index) {
        return renderRole(t, item.role);
      }
    },
    {
      id: 'bind',
      label: t('userPage.bind'),
      disableSort: true,
      render(col, item, index) {
        return (
          <>
            <Flex gap={'middle'}>
              <Tooltip title={item.wechat_id ? item.wechat_id : t('profilePage.notBound')} placement="top">
                <IconBrandWechat />
              </Tooltip>
              <Tooltip title={item.github_id ? item.github_id : t('profilePage.notBound')} placement="top">
                <IconBrandGithub />
              </Tooltip>
              <Tooltip title={item.email ? item.email : t('profilePage.notBound')} placement="top">
                <IconMail />
              </Tooltip>
              <Tooltip title={item.linuxdo_id ? item.linuxdo_id : '未绑定'} placement="top">
                <LinuxDoIcon style={{ width: 24, height: 24 }} />
              </Tooltip>
            </Flex>
          </>
        );
      },
      onCell() {
        return {
          style: {
            minWidth: '160px'
          }
        };
      }
    },
    {
      id: 'created_time',
      label: t('userPage.creationTime'),
      disableSort: false,
      render(col, item, index) {
        return <>{item.created_time === 0 ? t('common.unknown') : timestamp2string(item.created_time)}</>;
      },
      onCell() {
        return {
          style: {
            minWidth: '160px'
          }
        };
      }
    },
    {
      id: 'status',
      label: t('userPage.status'),
      disableSort: false,
      render(col, item, index) {
        async function handleChange(checked, event) {
          const { success } = await manageUser(item.username, 'status', Number(checked));
          if (success) {
            handleSearch();
          }
        }

        return <Switch checked={item.status == 1} size="small" onChange={handleChange}></Switch>;
      }
    },
    {
      id: 'action',
      label: t('userPage.action'),
      disableSort: true,
      render(col, item, index) {
        //

        return <TableActionColumn col={col} item={item} index={index} />;
      },
      onCell() {
        return {
          style: {
            minWidth: '160px'
          }
        };
      }
    }
  ].map((c) => {
    return {
      ...c,
      title: c.label,
      dataIndex: c.id
    };
  });
};

// 操作列
function TableActionColumn({ col, item, index }) {
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [form] = Form.useForm();

  return (
    <>
      <Modal
        open={editModalOpen}
        destroyOnClose={true}
        onClose={() => setEditModalOpen(false)}
        onCancel={() => setEditModalOpen(false)}
      ></Modal>

      <Flex gap={'middle'}>
        <Button type="link" size="small" onClick={() => setEditModalOpen(true)}>
          编辑
        </Button>
        <Button type="link" size="small">
          修改额度
        </Button>
        <Button type="text" danger size="small">
          删除
        </Button>
      </Flex>
    </>
  );
}