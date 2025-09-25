import { useState, useEffect, useCallback } from 'react';
import { showError, showSuccess, showInfo, trims } from 'utils/common';
import AdminContainer from 'ui-component/AdminContainer';

import { useTheme } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import LinearProgress from '@mui/material/LinearProgress';
import ButtonGroup from '@mui/material/ButtonGroup';
import Toolbar from '@mui/material/Toolbar';
import useMediaQuery from '@mui/material/useMediaQuery';
import Alert from '@mui/material/Alert';

import { Button, IconButton, Card, Box, Stack, Container, Typography, Divider, Tooltip, Fade, CircularProgress } from '@mui/material';
import ChannelTableRow from './component/TableRow';
import KeywordTableHead from 'ui-component/TableHead';
import { API } from 'utils/api';
import EditeModal from './component/EditModal';
import { PAGE_SIZE_OPTIONS, getPageSize, savePageSize } from 'constants';
import TableToolBar from './component/TableToolBar';
import BatchModal from './component/BatchModal';
import { useTranslation } from 'react-i18next';

import { useBoolean } from 'hooks/use-boolean';
import ConfirmDialog from 'ui-component/confirm-dialog';
import { Icon } from '@iconify/react';

// CSS 动画关键帧
const pulseAnimation = `
  @keyframes pulse {
    0% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
    100% {
      opacity: 1;
    }
  }
`;

const originalKeyword = {
  type: 0,
  status: 0,
  name: '',
  group: '',
  models: '',
  key: '',
  test_model: '',
  other: '',
  filter_tag: 0,
  tag: ''
};

export async function fetchChannelData(page, rowsPerPage, keyword, order, orderBy) {
  try {
    if (orderBy) {
      orderBy = order === 'desc' ? '-' + orderBy : orderBy;
    }
    const res = await API.get(`/api/channel/`, {
      params: {
        page: page + 1,
        size: rowsPerPage,
        order: orderBy,
        ...keyword
      }
    });
    const { success, message, data } = res.data;
    if (success) {
      return data;
    } else {
      showError(message);
    }
  } catch (error) {
    console.error(error);
  }

  return false;
}

// ----------------------------------------------------------------------
// CHANNEL_OPTIONS,
export default function ChannelList() {
  const { t } = useTranslation();
  const [page, setPage] = useState(0);
  const [order, setOrder] = useState('desc');
  const [orderBy, setOrderBy] = useState('id');
  const [rowsPerPage, setRowsPerPage] = useState(() => getPageSize('channel'));
  const [listCount, setListCount] = useState(0);
  const [searching, setSearching] = useState(false);
  const [channels, setChannels] = useState([]);
  const [refreshFlag, setRefreshFlag] = useState(false);
  const [tags, setTags] = useState([]);
  const [modelOptions, setModelOptions] = useState([]);

  const confirm = useBoolean();
  const [confirmTitle, setConfirmTitle] = useState('');
  const [confirmConfirm, setConfirmConfirm] = useState(() => {});

  const [groupOptions, setGroupOptions] = useState([]);
  const [toolBarValue, setToolBarValue] = useState(originalKeyword);
  const [searchKeyword, setSearchKeyword] = useState(originalKeyword);
  const [hasSearchChanges, setHasSearchChanges] = useState(false);

  const theme = useTheme();
  const matchUpMd = useMediaQuery(theme.breakpoints.up('sm'));
  const [openModal, setOpenModal] = useState(false);
  const [editChannelId, setEditChannelId] = useState(0);
  const [openBatchModal, setOpenBatchModal] = useState(false);
  const [prices, setPrices] = useState([]);

  const handleSort = (event, id) => {
    const isAsc = orderBy === id && order === 'asc';
    if (id !== '') {
      setOrder(isAsc ? 'desc' : 'asc');
      setOrderBy(id);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setPage(0);
    setRowsPerPage(newRowsPerPage);
    savePageSize('channel', newRowsPerPage);
  };

  const fetchPrices = useCallback(async () => {
    try {
      const res = await API.get('/api/prices');
      const { success, message, data } = res.data;
      if (success) {
        setPrices(data);
      } else {
        showError(message);
      }
    } catch (error) {
      console.error(error);
    }
  }, []);

  const searchChannels = async () => {
    // 检查是否首次搜索或有变化
    const isFirstSearch = deepEqual(searchKeyword, originalKeyword);
    const hasChanged = !deepEqual(toolBarValue, searchKeyword);

    // 开发环境调试信息
    if (process.env.NODE_ENV === 'development') {
      console.log('搜索状态:', {
        isFirstSearch,
        hasChanged,
        toolBarValue,
        searchKeyword,
        originalKeyword
      });
    }

    setPage(0);

    if (hasChanged) {
      // 如果搜索条件有变化，更新搜索关键字
      setSearchKeyword(toolBarValue);
      setHasSearchChanges(false);
      showInfo('搜索条件已更新，正在查询...');
    } else {
      // 如果搜索条件没有变化，强制刷新数据
      setRefreshFlag(!refreshFlag);
      showInfo('正在刷新最新数据...');
    }
  };

  // 深度比较两个对象是否相等
  const deepEqual = (obj1, obj2) => {
    if (obj1 === obj2) return true;

    if (obj1 == null || obj2 == null) return false;

    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    if (keys1.length !== keys2.length) return false;

    for (let key of keys1) {
      if (!keys2.includes(key)) return false;

      // 统一转换为字符串进行比较，处理数字和字符串的差异
      const val1 = String(obj1[key] ?? '');
      const val2 = String(obj2[key] ?? '');

      if (val1 !== val2) return false;
    }

    return true;
  };

  // 测试深度比较函数（开发环境使用）
  const testDeepEqual = () => {
    console.log('测试深度比较:');
    console.log('相同对象:', deepEqual({ a: 1, b: 2 }, { a: 1, b: 2 })); // 应该是 true
    console.log('不同值:', deepEqual({ a: 1, b: 2 }, { a: 1, b: 3 })); // 应该是 false
    console.log('数字vs字符串:', deepEqual({ a: 1 }, { a: '1' })); // 应该是 true
    console.log('顺序不同:', deepEqual({ a: 1, b: 2 }, { b: 2, a: 1 })); // 应该是 true
    console.log('空值处理:', deepEqual({ a: '' }, { a: 0 })); // 应该是 false
  };

  const handleToolBarValue = (event) => {
    const newValue = { ...toolBarValue, [event.target.name]: event.target.value };
    setToolBarValue(newValue);

    // 检查是否有变化
    const hasChanged = !deepEqual(newValue, searchKeyword);
    setHasSearchChanges(hasChanged);
  };

  const manageChannel = async (id, action, value, tag = false) => {
    let url = '/api/channel/';
    if (tag) {
      url = '/api/channel_tag/';
    }

    let data = { id };
    let res;

    try {
      switch (action) {
        case 'copy': {
          let oldRes = await API.get(`/api/channel/${id}`);
          const { success, message, data } = oldRes.data;
          if (!success) {
            showError(message);
            return { success: false, message };
          }
          // 删除 data.id
          delete data.id;
          delete data.test_time;
          delete data.balance_updated_time;
          delete data.used_quota;
          delete data.response_time;
          data.name = data.name + '_copy';
          res = await API.post(`/api/channel/`, { ...data });
          break;
        }
        case 'delete':
          if (tag) {
            res = await API.delete(url + encodeURIComponent(id));
          } else {
            res = await API.delete(`${url}${id}`);
          }
          break;
        case 'delete_tag':
          res = await API.delete(url + id + '/tag');
          break;
        case 'status':
          res = await API.put(url, {
            ...data,
            status: value
          });
          break;
        case 'priority':
        case 'weight':
          if (value === '') {
            return { success: false, message: '值不能为空' };
          }

          if (!tag) {
            res = await API.put(url, {
              ...data,
              [action]: Number(value)
            });
          } else {
            res = await API.put(`${url + encodeURIComponent(id)}/priority`, {
              type: 'priority',
              value
            });
          }
          break;
        case 'test':
          res = await API.get(url + `test/${id}`, {
            params: { model: value }
          });
          break;
        case 'batch_delete':
          res = await API.delete('/api/channel/batch', {
            data: {
              value: 'batch_delete',
              ids: value
            }
          });
          break;
        case 'tag_change_status':
          res = await API.put(`/api/channel_tag/${id}/status/${value}`);
          break;
        default:
          showError('无效操作');
          return { success: false, message: '无效操作' };
      }
      const { success, message } = res.data;
      if (success) {
        showSuccess(t('userPage.operationSuccess'));
        if (action === 'delete' || action === 'copy' || action == 'delete_tag') {
          await handleRefresh(false);
        }
      } else {
        showError(message);
      }

      return res.data;
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  // 处理刷新
  const handleRefresh = async (reset) => {
    if (reset) {
      setOrderBy('id');
      setOrder('desc');
      setToolBarValue(originalKeyword);
      setSearchKeyword(originalKeyword);
      setHasSearchChanges(false); // 重置变化标记
      setPage(0); // 重置页码
      showInfo('已重置所有筛选条件');
    }
    setRefreshFlag(!refreshFlag);
  };

  const handlePopoverOpen = useCallback(
    (title, onConfirm) => {
      setConfirmTitle(title);
      setConfirmConfirm(() => onConfirm);
      confirm.onTrue();
    },
    [confirm]
  );

  // 处理测试所有启用渠道
  const testAllChannels = async () => {
    try {
      const res = await API.get(`/api/channel/test`);
      const { success, message } = res.data;
      if (success) {
        showInfo(t('channel_row.testAllChannel'));
      } else {
        showError(message);
      }
    } catch (error) {
      return;
    }
  };

  // 处理删除所有禁用渠道
  const deleteAllDisabledChannels = async () => {
    try {
      const res = await API.delete(`/api/channel/disabled`);
      const { success, message, data } = res.data;
      if (success) {
        showSuccess(t('channel_row.delChannelCount', { count: data }));
        await handleRefresh();
      } else {
        showError(message);
      }
    } catch (error) {
      return;
    }
  };

  // 处理更新所有启用渠道余额
  const updateAllChannelsBalance = async () => {
    setSearching(true);
    try {
      const res = await API.get(`/api/channel/update_balance`);
      const { success, message } = res.data;
      if (success) {
        showInfo(t('channel_row.updateChannelBalance'));
      } else {
        showError(message);
      }
    } catch (error) {
      console.log(error);
    }

    setSearching(false);
  };

  const handleOpenModal = (channelId) => {
    setEditChannelId(channelId);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setEditChannelId(0);
  };

  const handleOkModal = (status) => {
    if (status === true) {
      handleCloseModal();
      handleRefresh(false);
    }
  };

  const fetchData = async (page, rowsPerPage, keyword, order, orderBy) => {
    setSearching(true);
    keyword = trims(keyword);
    const data = await fetchChannelData(page, rowsPerPage, keyword, order, orderBy);

    if (data) {
      setListCount(data.total_count);
      setChannels(data.data);
    }
    setSearching(false);
  };

  const fetchGroups = async () => {
    try {
      let res = await API.get(`/api/group/`);
      setGroupOptions(res.data.data);
    } catch (error) {
      showError(error.message);
    }
  };

  const fetchTags = async () => {
    try {
      let res = await API.get(`/api/channel_tag/_all`);
      const { success, data } = res.data;
      if (success) {
        setTags(data);
      }
    } catch (error) {
      showError(error.message);
    }
  };

  const fetchModels = async () => {
    try {
      let res = await API.get(`/api/channel/models`);
      const { data } = res.data;
      // 先对data排序
      data.sort((a, b) => {
        const ownedByComparison = a.owned_by.localeCompare(b.owned_by);
        if (ownedByComparison === 0) {
          return a.id.localeCompare(b.id);
        }
        return ownedByComparison;
      });
      setModelOptions(
        data.map((model) => {
          return {
            id: model.id,
            group: model.owned_by
          };
        })
      );
    } catch (error) {
      showError(error.message);
    }
  };

  useEffect(() => {
    fetchData(page, rowsPerPage, searchKeyword, order, orderBy);
  }, [page, rowsPerPage, searchKeyword, order, orderBy, refreshFlag]);

  // 初始化时检查是否有变化
  useEffect(() => {
    const hasChanged = !deepEqual(toolBarValue, searchKeyword);
    setHasSearchChanges(hasChanged);
  }, [toolBarValue, searchKeyword]);

  useEffect(() => {
    fetchGroups().then();
    fetchTags().then();
    fetchModels().then();
    fetchPrices().then();

    // 开发环境测试深度比较函数
    if (process.env.NODE_ENV === 'development') {
      testDeepEqual();
    }
  }, [fetchPrices]);

  return (
    <AdminContainer>
      {/* 添加CSS动画 */}
      <style>{pulseAnimation}</style>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
        <Stack direction="column" spacing={1}>
          <Typography variant="h2">{t('channel_index.channel')}</Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Channel
          </Typography>
        </Stack>

        <ButtonGroup variant="contained" aria-label="outlined small primary button group">
          <Button color="primary" startIcon={<Icon icon="solar:add-circle-line-duotone" />} onClick={() => handleOpenModal(0)}>
            {t('channel_index.newChannel')}
          </Button>
          <Button color="primary" startIcon={<Icon icon="solar:menu-dots-bold-duotone" />} onClick={() => setOpenBatchModal(true)}>
            {t('channel_index.batchProcessing')}
          </Button>
        </ButtonGroup>
      </Stack>
      <Stack mb={5}>
        <Alert severity="info">
          {t('channel_index.priorityWeightExplanation')}
          <br />
          {t('channel_index.description1')}
          <br />
          {t('channel_index.description2')}
          <br />
          {t('channel_index.description3')}
          <br />
          {t('channel_index.description4')}
        </Alert>
      </Stack>
      <Card>
        <Box component="form" noValidate>
          <TableToolBar filterName={toolBarValue} handleFilterName={handleToolBarValue} groupOptions={groupOptions} tags={tags} />
        </Box>

        {/* 查询操作栏 */}
        <Box
          sx={{
            p: 2,
            borderBottom: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.neutral'
          }}
        >
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={2}
            justifyContent="space-between"
            alignItems={{ xs: 'stretch', md: 'center' }}
          >
            {/* 左侧：搜索和重置按钮 */}
            <Stack direction="row" spacing={1} alignItems="center">
              <Tooltip title={hasSearchChanges ? '执行搜索以应用新的筛选条件' : '刷新数据获取最新信息'} placement="top">
                <Button
                  variant={hasSearchChanges ? 'contained' : 'outlined'}
                  color={hasSearchChanges ? 'primary' : 'primary'}
                  onClick={searchChannels}
                  disabled={searching}
                  startIcon={
                    searching ? (
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CircularProgress size={16} color="inherit" />
                      </Box>
                    ) : (
                      <Icon icon="solar:magnifer-bold-duotone" width={18} />
                    )
                  }
                  sx={{
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                    position: 'relative',
                    minWidth: 120, // 固定最小宽度，防止文字变化时按钮跳动
                    ...(hasSearchChanges &&
                      !searching && {
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          top: -2,
                          right: -2,
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          bgcolor: 'warning.main',
                          animation: 'pulse 2s infinite'
                        }
                      })
                  }}
                >
                  {searching ? '查询中...' : hasSearchChanges ? '执行搜索' : '搜索/刷新'}
                </Button>
              </Tooltip>
              <Tooltip title="清空所有筛选条件并重新加载数据" placement="top">
                <Button
                  variant="outlined"
                  onClick={() => handleRefresh(true)}
                  startIcon={<Icon icon="solar:refresh-circle-bold-duotone" width={18} />}
                  sx={{ borderRadius: 2, textTransform: 'none' }}
                >
                  重置条件
                </Button>
              </Tooltip>
              {hasSearchChanges && (
                <Fade in={hasSearchChanges}>
                  <Typography variant="caption" color="warning.main" sx={{ fontWeight: 600 }}>
                    • 筛选条件已修改，点击搜索应用
                  </Typography>
                </Fade>
              )}
            </Stack>

            {/* 右侧：管理操作按钮 */}
            <Stack direction="row" spacing={1} sx={{ justifyContent: { xs: 'center', md: 'flex-end' } }}>
              {matchUpMd ? (
                <>
                  <Button
                    variant="outlined"
                    color="info"
                    onClick={() => handlePopoverOpen(t('channel_index.testAllChannels'), testAllChannels)}
                    startIcon={<Icon icon="solar:test-tube-bold-duotone" width={18} />}
                    sx={{ borderRadius: 2, textTransform: 'none' }}
                  >
                    {t('channel_index.testAllChannels')}
                  </Button>
                  <Button
                    variant="outlined"
                    color="success"
                    onClick={() => handlePopoverOpen(t('channel_index.updateEnabledBalance'), updateAllChannelsBalance)}
                    startIcon={<Icon icon="solar:dollar-minimalistic-bold-duotone" width={18} />}
                    sx={{ borderRadius: 2, textTransform: 'none' }}
                    disabled={searching}
                  >
                    {t('channel_index.updateEnabledBalance')}
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => handlePopoverOpen(t('channel_index.deleteDisabledChannels'), deleteAllDisabledChannels)}
                    startIcon={<Icon icon="solar:trash-bin-trash-bold-duotone" width={18} />}
                    sx={{ borderRadius: 2, textTransform: 'none' }}
                  >
                    {t('channel_index.deleteDisabledChannels')}
                  </Button>
                </>
              ) : (
                <>
                  <IconButton
                    onClick={() => handlePopoverOpen(t('channel_index.testAllChannels'), testAllChannels)}
                    sx={{
                      bgcolor: 'info.lighter',
                      color: 'info.main',
                      '&:hover': { bgcolor: 'info.main', color: 'info.contrastText' }
                    }}
                  >
                    <Icon width={20} icon="solar:test-tube-bold-duotone" />
                  </IconButton>
                  <IconButton
                    onClick={() => handlePopoverOpen(t('channel_index.updateEnabledBalance'), updateAllChannelsBalance)}
                    disabled={searching}
                    sx={{
                      bgcolor: 'success.lighter',
                      color: 'success.main',
                      '&:hover': { bgcolor: 'success.main', color: 'success.contrastText' }
                    }}
                  >
                    <Icon width={20} icon="solar:dollar-minimalistic-bold-duotone" />
                  </IconButton>
                  <IconButton
                    onClick={() => handlePopoverOpen(t('channel_index.deleteDisabledChannels'), deleteAllDisabledChannels)}
                    sx={{
                      bgcolor: 'error.lighter',
                      color: 'error.main',
                      '&:hover': { bgcolor: 'error.main', color: 'error.contrastText' }
                    }}
                  >
                    <Icon width={20} icon="solar:trash-bin-trash-bold-duotone" />
                  </IconButton>
                </>
              )}
            </Stack>
          </Stack>
        </Box>
        {searching && <LinearProgress />}
        <TableContainer>
          <Table sx={{ minWidth: 800 }}>
            <KeywordTableHead
              order={order}
              orderBy={orderBy}
              onRequestSort={handleSort}
              headLabel={[
                // { id: 'collapse', label: '', disableSort: true, width: '50px' },
                { id: 'id', label: 'ID', disableSort: false, width: '80px' },
                { id: 'name', label: t('channel_index.name'), disableSort: false, maxWidth: '300px' },
                { id: 'group', label: t('channel_index.group'), disableSort: true },
                { id: 'type', label: t('channel_index.type'), disableSort: false },
                { id: 'status', label: t('channel_index.status'), disableSort: false },
                { id: 'auto_ban', label: '自动禁用', disableSort: false, width: '100px' },
                { id: 'response_time', label: t('channel_index.responseTime'), disableSort: false },
                // { id: 'balance', label: '余额', disableSort: false },
                { id: 'used', label: t('channel_index.usedBalance'), disableSort: true },
                { id: 'priority', label: t('channel_index.priority'), disableSort: false, width: '80px' },
                { id: 'weight', label: t('channel_index.weight'), disableSort: false, width: '80px' },
                { id: 'action', label: t('channel_index.actions'), disableSort: true }
              ]}
            />
            <TableBody>
              {channels.map((row) => (
                <ChannelTableRow
                  item={row}
                  manageChannel={manageChannel}
                  key={row.id}
                  // handleOpenModal={handleOpenModal}
                  // setModalChannelId={setEditChannelId}
                  groupOptions={groupOptions}
                  onRefresh={handleRefresh}
                  modelOptions={modelOptions}
                  prices={prices}
                />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          page={page}
          component="div"
          count={listCount}
          rowsPerPage={rowsPerPage}
          onPageChange={handleChangePage}
          rowsPerPageOptions={PAGE_SIZE_OPTIONS}
          onRowsPerPageChange={handleChangeRowsPerPage}
          showFirstButton
          showLastButton
        />
      </Card>
      <EditeModal
        open={openModal}
        onCancel={handleCloseModal}
        onOk={handleOkModal}
        channelId={editChannelId}
        groupOptions={groupOptions}
        modelOptions={modelOptions}
        prices={prices}
      />
      <BatchModal open={openBatchModal} setOpen={setOpenBatchModal} />

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title={confirmTitle}
        content={t('common.execute', { title: confirmTitle })}
        action={
          <Button
            variant="contained"
            onClick={() => {
              confirmConfirm();
              confirm.onFalse();
            }}
          >
            {t('common.executeConfirm')}
          </Button>
        }
      />
    </AdminContainer>
  );
}
