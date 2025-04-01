import { useState, useEffect, useCallback, useContext } from 'react';
import { renderQuota, showError, trims } from 'utils/common';

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
import { Grid, Card, Stack, Container, Typography, Box, Menu, MenuItem, Checkbox, ListItemText } from '@mui/material';
import LogTableRow from './component/TableRow';
import KeywordTableHead from 'ui-component/TableHead';
import TableToolBar from './component/TableToolBar';
import { API } from 'utils/api';
import { isAdmin } from 'utils/common';
import { ITEMS_PER_PAGE, PAGE_SIZE_OPTIONS } from 'constants';
import { Icon } from '@iconify/react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { UserContext } from 'contexts/UserContext';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

export default function Log() {
  const { t } = useTranslation();
  const originalKeyword = {
    p: 0,
    username: '',
    token_name: '',
    model_name: '',
    start_timestamp: dayjs().startOf('day').unix(), // 开始时间 当日 0 点
    end_timestamp: dayjs().endOf('day').unix(), // 结束时间 当日 23:59:59
    log_type: 0,
    channel_id: '',
    source_ip: '',
    request_ip: ''
  };

  const [page, setPage] = useState(0);
  const [order, setOrder] = useState('desc');
  const [orderBy, setOrderBy] = useState('created_at');
  const [rowsPerPage, setRowsPerPage] = useState(ITEMS_PER_PAGE);
  const [listCount, setListCount] = useState(0);
  const [searching, setSearching] = useState(false);
  const [toolBarValue, setToolBarValue] = useState(originalKeyword);
  const [searchKeyword, setSearchKeyword] = useState(originalKeyword);
  const [refreshFlag, setRefreshFlag] = useState(false);
  const { userGroup } = useContext(UserContext);
  const theme = useTheme();
  const matchUpMd = useMediaQuery(theme.breakpoints.up('sm'));

  const [logs, setLogs] = useState([]);
  const userIsAdmin = isAdmin();

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
    setPage(0);
    setRowsPerPage(parseInt(event.target.value, 10));
  };

  const searchLogs = async () => {
    setPage(0);
    setSearchKeyword(toolBarValue);
  };

  const handleToolBarValue = (event) => {
    setToolBarValue({ ...toolBarValue, [event.target.name]: event.target.value });
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
  const handleRefresh = async () => {
    setOrderBy('created_at');
    setOrder('desc');
    setToolBarValue(originalKeyword);
    setSearchKeyword(originalKeyword);
    setRefreshFlag(!refreshFlag);
  };

  useEffect(() => {
    fetchData(page, rowsPerPage, searchKeyword, order, orderBy);
  }, [page, rowsPerPage, searchKeyword, order, orderBy, fetchData, refreshFlag]);

  return (
    <>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h4">{t('logPage.title')}</Typography>
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
        <Box component="form" noValidate>
          <TableToolBar filterName={toolBarValue} handleFilterName={handleToolBarValue} userIsAdmin={userIsAdmin} />
        </Box>
        <Toolbar
          sx={{
            textAlign: 'right',
            height: 50,
            display: 'flex',
            justifyContent: 'space-between',
            p: (theme) => theme.spacing(0, 1, 0, 3)
          }}
        >
          <Container>
            {matchUpMd ? (
              <ButtonGroup variant="outlined" aria-label="outlined small primary button group">
                <Button onClick={handleRefresh} size="small" startIcon={<Icon icon="solar:refresh-bold-duotone" width={18} />}>
                  {t('logPage.refreshButton')}
                </Button>

                <Button onClick={searchLogs} size="small" startIcon={<Icon icon="solar:minimalistic-magnifer-line-duotone" width={18} />}>
                  {t('logPage.searchButton')}
                </Button>

                <Button onClick={handleColumnMenuOpen} size="small" startIcon={<Icon icon="solar:settings-bold-duotone" width={18} />}>
                  {t('logPage.columnSettings')}
                </Button>
              </ButtonGroup>
            ) : (
              <Stack
                direction="row"
                spacing={1}
                divider={<Divider orientation="vertical" flexItem />}
                justifyContent="space-around"
                alignItems="center"
              >
                <IconButton onClick={handleRefresh} size="small">
                  <Icon icon="solar:refresh-bold-duotone" width={18} />
                </IconButton>
                <IconButton onClick={searchLogs} size="small">
                  <Icon icon="solar:minimalistic-magnifer-line-duotone" width={18} />
                </IconButton>
                <IconButton onClick={handleColumnMenuOpen} size="small">
                  <Icon icon="solar:settings-bold-duotone" width={18} />
                </IconButton>
              </Stack>
            )}

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
