import { useState, useEffect, useCallback } from 'react';
import { renderQuota, showError, showInfo, trims } from 'utils/common';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import PerfectScrollbar from 'react-perfect-scrollbar';
import TablePagination from '@mui/material/TablePagination';
import LinearProgress from '@mui/material/LinearProgress';
import ButtonGroup from '@mui/material/ButtonGroup';
import Button from '@mui/material/Button';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import {
  Grid,
  Card,
  Stack,
  Container,
  Typography,
  Box,
  Menu,
  MenuItem,
  Checkbox,
  ListItemText,
  Tabs,
  Tab,
  Tooltip,
  Fade,
  CircularProgress
} from '@mui/material';
import LogTableRow from './component/TableRow';
import KeywordTableHead from 'ui-component/TableHead';
import TableToolBar from './component/TableToolBar';
import { API } from 'utils/api';
import { useIsAdmin } from 'utils/common';
import { PAGE_SIZE_OPTIONS, getPageSize, savePageSize } from 'constants';
import { Icon } from '@iconify/react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { useSelector } from 'react-redux';
import { useLogType } from './type/LogType';

export default function Log() {
  const { t } = useTranslation();
  const LogType = useLogType();
  const originalKeyword = {
    p: 0,
    username: '',
    token_name: '',
    model_name: '',
    start_timestamp: dayjs().startOf('day').unix(), // 开始时间 当日 0 点
    end_timestamp: dayjs().endOf('day').unix(), // 结束时间 当日 23:59:59
    log_type: '0',
    channel_id: '',
    source_ip: '',
    request_ip: ''
  };

  const [page, setPage] = useState(0);
  const [order, setOrder] = useState('desc');
  const [orderBy, setOrderBy] = useState('created_at');
  const [rowsPerPage, setRowsPerPage] = useState(() => getPageSize('log'));
  const [listCount, setListCount] = useState(0);
  const [searching, setSearching] = useState(false);
  const [toolBarValue, setToolBarValue] = useState(originalKeyword);
  const [searchKeyword, setSearchKeyword] = useState(originalKeyword);
  const [refreshFlag, setRefreshFlag] = useState(false);
  const [hasSearchChanges, setHasSearchChanges] = useState(false);
  const { userGroup } = useSelector((state) => state.account);
  const theme = useTheme();
  const matchUpMd = useMediaQuery(theme.breakpoints.up('sm'));

  const [logs, setLogs] = useState([]);
  const userIsAdmin = useIsAdmin();

  const [stats, setStats] = useState({
    rpm: 0,
    tpm: 0,
    quota: 0
  });

  // 添加列显示设置相关状态
  const [columnVisibility, setColumnVisibility] = useState({
    created_at: true,
    channel_id: true,
    user_id: true,
    group: true,
    token_name: true,
    type: true,
    model_name: true,
    duration: true,
    message: true,
    completion: true,
    quota: true,
    source_ip: true,
    request_ip: true,
    detail: true
  });
  const [columnMenuAnchor, setColumnMenuAnchor] = useState(null);

  // 处理列显示菜单打开和关闭
  const handleColumnMenuOpen = (event) => {
    setColumnMenuAnchor(event.currentTarget);
  };

  const handleColumnMenuClose = () => {
    setColumnMenuAnchor(null);
  };

  // 处理列显示状态变更
  const handleColumnVisibilityChange = (columnId) => {
    setColumnVisibility({
      ...columnVisibility,
      [columnId]: !columnVisibility[columnId]
    });
  };

  // 处理全选/取消全选列显示
  const handleSelectAllColumns = () => {
    const allColumns = Object.keys(columnVisibility);
    const areAllVisible = allColumns.every((column) => columnVisibility[column]);

    const newColumnVisibility = {};
    allColumns.forEach((column) => {
      newColumnVisibility[column] = !areAllVisible;
    });

    setColumnVisibility(newColumnVisibility);
  };

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
    savePageSize('log', newRowsPerPage);
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
      const val1 = String(obj1[key] ?? '');
      const val2 = String(obj2[key] ?? '');
      if (val1 !== val2) return false;
    }
    return true;
  };

  const searchLogs = async () => {
    // 检查是否首次搜索或有变化
    const isFirstSearch = deepEqual(searchKeyword, originalKeyword);
    const hasChanged = !deepEqual(toolBarValue, searchKeyword);

    // 开发环境调试信息
    if (process.env.NODE_ENV === 'development') {
      console.log('日志搜索状态:', {
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
      showInfo('正在刷新最新日志数据...');
    }
  };

  const handleToolBarValue = (event) => {
    const newValue = { ...toolBarValue, [event.target.name]: event.target.value };
    setToolBarValue(newValue);

    // 检查搜索条件是否有变化
    const hasChanged = !deepEqual(newValue, searchKeyword);
    setHasSearchChanges(hasChanged);
  };

  const handleTabsChange = async (event, newValue) => {
    const updatedToolBarValue = { ...toolBarValue, log_type: newValue };
    setToolBarValue(updatedToolBarValue);
    setPage(0);
    setSearchKeyword(updatedToolBarValue);
    setHasSearchChanges(false); // Tab切换时立即应用，重置变化标记
  };

  const fetchData = useCallback(
    async (page, rowsPerPage, keyword, order, orderBy) => {
      setSearching(true);
      keyword = trims(keyword);
      try {
        if (orderBy) {
          orderBy = order === 'desc' ? '-' + orderBy : orderBy;
        }
        const url = userIsAdmin ? '/api/log/' : '/api/log/self/';
        if (!userIsAdmin) {
          delete keyword.username;
          delete keyword.channel_id;
        }

        const res = await API.get(url, {
          params: {
            page: page + 1,
            size: rowsPerPage,
            order: orderBy,
            ...keyword
          }
        });
        const { success, message, data, stat } = res.data;
        if (success) {
          setListCount(data.total_count);
          setLogs(data.data);
          setStats(stat);
        } else {
          showError(message);
        }
      } catch (error) {
        console.error(error);
      }
      setSearching(false);
    },
    [userIsAdmin]
  );

  const fetchStats = useCallback(async () => {
    try {
      const res = await API.get('/api/stats');
      const { success, message, data } = res.data;
      if (success) {
        setStats({
          rpm: data.rpm || 0,
          tpm: data.tpm || 0,
          quota: data.quota || 0
        });
      } else {
        showError(message);
      }
    } catch (error) {
      console.error(error);
    }
  }, []);

  // 处理刷新
  const handleRefresh = async (reset = true) => {
    if (reset) {
      setOrderBy('created_at');
      setOrder('desc');
      setToolBarValue(originalKeyword);
      setSearchKeyword(originalKeyword);
      setPage(0);
      setHasSearchChanges(false); // 重置变化标记
    }
    setRefreshFlag(!refreshFlag);
  };

  // 监听搜索条件变化
  useEffect(() => {
    const hasChanged = !deepEqual(toolBarValue, searchKeyword);
    setHasSearchChanges(hasChanged);

    // 开发环境调试
    if (process.env.NODE_ENV === 'development') {
      console.log('日志搜索条件变化检测:', {
        hasChanged,
        toolBarValue,
        searchKeyword
      });
    }
  }, [toolBarValue, searchKeyword]);

  useEffect(() => {
    fetchData(page, rowsPerPage, searchKeyword, order, orderBy);
  }, [page, rowsPerPage, searchKeyword, order, orderBy, fetchData, refreshFlag]);

  return (
    <>
      <style>
        {`
          @keyframes pulse {
            0% {
              transform: scale(1);
              opacity: 1;
            }
            50% {
              transform: scale(1.1);
              opacity: 0.7;
            }
            100% {
              transform: scale(1);
              opacity: 1;
            }
          }
        `}
      </style>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
        <Stack direction="column" spacing={1}>
          <Typography variant="h2">{t('logPage.title')}</Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Log
          </Typography>
        </Stack>
      </Stack>

      {/* 添加统计面板 */}
      <Grid container spacing={2} mb={2}>
        <Grid item xs={12} sm={4}>
          <Card
            sx={{
              p: 3,
              background: 'linear-gradient(135deg, rgba(91, 228, 155, 0.1), rgba(0, 167, 111, 0.1))',
              border: '1px solid rgba(0, 167, 111, 0.2)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <Box sx={{ position: 'absolute', right: -10, top: -10, opacity: 0.1 }}>
              <Icon icon="solar:dollar-minimalistic-bold-duotone" width={100} />
            </Box>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Box
                sx={{
                  p: 1,
                  borderRadius: 1,
                  bgcolor: 'rgba(0, 167, 111, 0.2)',
                  display: 'flex'
                }}
              >
                <Icon icon="solar:dollar-minimalistic-bold-duotone" width={24} color="#00a76f" />
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  {t('logPage.quota')}
                </Typography>
                <Typography variant="h4" sx={{ color: '#00a76f' }}>
                  {renderQuota(stats.quota, 6)}
                </Typography>
              </Box>
            </Stack>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card
            sx={{
              p: 3,
              background: 'linear-gradient(135deg, rgba(84, 214, 244, 0.1), rgba(0, 108, 156, 0.1))',
              border: '1px solid rgba(0, 108, 156, 0.2)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <Box sx={{ position: 'absolute', right: -10, top: -10, opacity: 0.1 }}>
              <Icon icon="solar:graph-new-bold-duotone" width={100} />
            </Box>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Box
                sx={{
                  p: 1,
                  borderRadius: 1,
                  bgcolor: 'rgba(0, 108, 156, 0.2)',
                  display: 'flex'
                }}
              >
                <Icon icon="solar:graph-new-bold-duotone" width={24} color="#006c9c" />
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  {t('logPage.rpm')}
                </Typography>
                <Typography variant="h4" sx={{ color: '#006c9c' }}>
                  {stats.rpm}{' '}
                  <Typography component="span" variant="body2">
                    req/min
                  </Typography>
                </Typography>
              </Box>
            </Stack>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card
            sx={{
              p: 3,
              background: 'linear-gradient(135deg, rgba(255, 171, 0, 0.1), rgba(255, 139, 0, 0.1))',
              border: '1px solid rgba(255, 139, 0, 0.2)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <Box sx={{ position: 'absolute', right: -10, top: -10, opacity: 0.1 }}>
              <Icon icon="solar:clock-circle-bold-duotone" width={100} />
            </Box>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Box
                sx={{
                  p: 1,
                  borderRadius: 1,
                  bgcolor: 'rgba(255, 139, 0, 0.2)',
                  display: 'flex'
                }}
              >
                <Icon icon="solar:clock-circle-bold-duotone" width={24} color="#ff8b00" />
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  {t('logPage.tpm')}
                </Typography>
                <Typography variant="h4" sx={{ color: '#ff8b00' }}>
                  {stats.tpm}{' '}
                  <Typography component="span" variant="body2">
                    token/min
                  </Typography>
                </Typography>
              </Box>
            </Stack>
          </Card>
        </Grid>
      </Grid>

      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={toolBarValue.log_type}
            onChange={handleTabsChange}
            aria-label="basic tabs example"
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={{
              '& .MuiTabs-indicator': {
                display: 'none'
              }
            }}
          >
            {Object.values(LogType).map((option) => {
              return <Tab key={option.value} label={option.text} value={option.value} />;
            })}
          </Tabs>
        </Box>
        <Box component="form" noValidate>
          <TableToolBar filterName={toolBarValue} handleFilterName={handleToolBarValue} userIsAdmin={userIsAdmin} />
        </Box>
        <Toolbar
          sx={{
            textAlign: 'right',
            height: 'auto',
            minHeight: 64,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: (theme) => theme.spacing(2, 3),
            flexDirection: { xs: 'column', md: 'row' },
            gap: 2
          }}
        >
          <Container maxWidth="xl">
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={2}
              justifyContent="space-between"
              alignItems={{ xs: 'stretch', md: 'center' }}
            >
              {/* 左侧：搜索和重置按钮 */}
              <Stack direction="row" spacing={1} alignItems="center">
                <Tooltip title={hasSearchChanges ? '执行搜索以应用新的筛选条件' : '刷新数据获取最新日志'} placement="top">
                  <Button
                    variant={hasSearchChanges ? 'contained' : 'outlined'}
                    color={hasSearchChanges ? 'primary' : 'primary'}
                    onClick={searchLogs}
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
                <Tooltip title="列显示设置" placement="top">
                  <Button
                    variant="outlined"
                    onClick={handleColumnMenuOpen}
                    startIcon={<Icon icon="solar:settings-bold-duotone" width={18} />}
                    sx={{ borderRadius: 2, textTransform: 'none' }}
                  >
                    列设置
                  </Button>
                </Tooltip>
              </Stack>
            </Stack>

            <Menu
              anchorEl={columnMenuAnchor}
              open={Boolean(columnMenuAnchor)}
              onClose={handleColumnMenuClose}
              PaperProps={{
                style: {
                  maxHeight: 300,
                  width: 200
                }
              }}
            >
              <MenuItem disabled>
                <Typography variant="subtitle2">{t('logPage.selectColumns')}</Typography>
              </MenuItem>
              <MenuItem onClick={handleSelectAllColumns} dense>
                <Checkbox
                  checked={Object.values(columnVisibility).every((visible) => visible)}
                  indeterminate={
                    !Object.values(columnVisibility).every((visible) => visible) &&
                    Object.values(columnVisibility).some((visible) => visible)
                  }
                  size="small"
                />
                <ListItemText primary={t('logPage.columnSelectAll')} />
              </MenuItem>
              {[
                { id: 'created_at', label: t('logPage.timeLabel') },
                { id: 'channel_id', label: t('logPage.channelLabel'), adminOnly: true },
                { id: 'user_id', label: t('logPage.userLabel'), adminOnly: true },
                { id: 'group', label: t('logPage.groupLabel') },
                { id: 'token_name', label: t('logPage.tokenLabel') },
                { id: 'type', label: t('logPage.typeLabel') },
                { id: 'model_name', label: t('logPage.modelLabel') },
                { id: 'duration', label: t('logPage.durationLabel') },
                { id: 'message', label: t('logPage.inputLabel') },
                { id: 'completion', label: t('logPage.outputLabel') },
                { id: 'quota', label: t('logPage.quotaLabel') },
                // { id: 'source_ip', label: t('logPage.sourceIp') },
                { id: 'request_ip', label: t('logPage.requestIPLabel') },
                { id: 'detail', label: t('logPage.detailLabel') }
              ].map(
                (column) =>
                  (!column.adminOnly || userIsAdmin) && (
                    <MenuItem key={column.id} onClick={() => handleColumnVisibilityChange(column.id)} dense>
                      <Checkbox checked={columnVisibility[column.id] || false} size="small" />
                      <ListItemText primary={column.label} />
                    </MenuItem>
                  )
              )}
            </Menu>
          </Container>
        </Toolbar>
        {searching && <LinearProgress />}
        <PerfectScrollbar component="div">
          <TableContainer sx={{ overflow: 'unset' }}>
            <Table sx={{ minWidth: 1024 }}>
              <KeywordTableHead
                order={order}
                orderBy={orderBy}
                onRequestSort={handleSort}
                headLabel={[
                  {
                    id: 'created_at',
                    label: t('logPage.timeLabel'),
                    disableSort: true,
                    hide: !columnVisibility.created_at,
                    width: 150,
                    minWidth: 150,
                    maxWidth: 150
                  },
                  {
                    id: 'channel_id',
                    label: t('logPage.channelLabel'),
                    disableSort: true,
                    hide: !columnVisibility.channel_id || !userIsAdmin,
                    width: 150,
                    minWidth: 150,
                    maxWidth: 150
                  },
                  {
                    id: 'user_id',
                    label: t('logPage.userLabel'),
                    disableSort: true,
                    hide: !columnVisibility.user_id || !userIsAdmin
                  },
                  {
                    id: 'group',
                    label: t('logPage.groupLabel'),
                    disableSort: true,
                    hide: !columnVisibility.group
                  },
                  {
                    id: 'token_name',
                    label: t('logPage.tokenLabel'),
                    disableSort: true,
                    hide: !columnVisibility.token_name
                  },
                  {
                    id: 'type',
                    label: t('logPage.typeLabel'),
                    disableSort: true,
                    hide: !columnVisibility.type
                  },
                  {
                    id: 'model_name',
                    label: t('logPage.modelLabel'),
                    disableSort: true,
                    hide: !columnVisibility.model_name
                  },
                  {
                    id: 'duration',
                    label: t('logPage.durationLabel'),
                    tooltip: t('logPage.durationTooltip'),
                    disableSort: true,
                    hide: !columnVisibility.duration
                  },
                  {
                    id: 'message',
                    label: t('logPage.inputLabel'),
                    disableSort: true,
                    hide: !columnVisibility.message
                  },
                  {
                    id: 'completion',
                    label: t('logPage.outputLabel'),
                    disableSort: true,
                    hide: !columnVisibility.completion
                  },
                  {
                    id: 'quota',
                    label: t('logPage.quotaLabel'),
                    disableSort: true,
                    hide: !columnVisibility.quota
                  },
                  {
                    id: 'request_ip',
                    label: t('logPage.requestIPLabel'),
                    disableSort: true,
                    hide: !columnVisibility.request_ip,
                    width: 150,
                    minWidth: 150,
                    maxWidth: 150
                  },
                  // {
                  //   id: 'source_ip',
                  //   label: t('logPage.sourceIp'),
                  //   disableSort: true
                  //   hide: !columnVisibility.source_ip
                  // },
                  {
                    id: 'detail',
                    label: t('logPage.detailLabel'),
                    disableSort: true,
                    hide: !columnVisibility.detail,
                    width: 150,
                    minWidth: 150,
                    maxWidth: 150
                  }
                ]}
              />
              <TableBody>
                {logs.map((row, index) => (
                  <LogTableRow
                    item={row}
                    key={`${row.id}_${index}`}
                    userIsAdmin={userIsAdmin}
                    userGroup={userGroup}
                    columnVisibility={columnVisibility}
                  />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </PerfectScrollbar>
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
    </>
  );
}
