import { useState, useEffect, useCallback, useContext } from 'react';
import { showError, trims } from 'utils/common';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import PerfectScrollbar from 'react-perfect-scrollbar';
import TablePagination from '@mui/material/TablePagination';
import LinearProgress from '@mui/material/LinearProgress';
import ButtonGroup from '@mui/material/ButtonGroup';
import Button from '@mui/material/Button';
import Toolbar from '@mui/material/Toolbar';
import { Grid, Card, Stack, Container, Typography, Box } from '@mui/material';
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
import { renderQuota } from 'utils/common';
import { minWidth } from '@mui/system';

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
    channel_id: ''
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

  const [logs, setLogs] = useState([]);
  const userIsAdmin = isAdmin();

  const [stats, setStats] = useState({
    rpm: 0,
    tpm: 0,
    quota: 0
  });

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
                  p: 1.5,
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
                  p: 1.5,
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
                  p: 1.5,
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
            <ButtonGroup variant="outlined" aria-label="outlined small primary button group">
              <Button onClick={handleRefresh} startIcon={<Icon icon="solar:refresh-bold-duotone" width={18} />}>
                {t('logPage.refreshButton')}
              </Button>

              <Button onClick={searchLogs} startIcon={<Icon icon="solar:minimalistic-magnifer-line-duotone" width={18} />}>
                {t('logPage.searchButton')}
              </Button>
            </ButtonGroup>
          </Container>
        </Toolbar>
        {searching && <LinearProgress />}
        <PerfectScrollbar component="div">
          <TableContainer sx={{ overflow: 'unset' }}>
            <Table sx={{ minWidth: 1366 }}>
              <KeywordTableHead
                order={order}
                orderBy={orderBy}
                onRequestSort={handleSort}
                headLabel={[
                  {
                    id: 'created_at',
                    label: t('logPage.timeLabel'),
                    disableSort: false,
                    width: 100,
                    minWidth: 100
                  },
                  {
                    id: 'channel_id',
                    label: t('logPage.channelLabel'),
                    disableSort: false,
                    hide: !userIsAdmin,
                    width: 100,
                    minWidth: 100
                  },
                  {
                    id: 'user_id',
                    label: t('logPage.userLabel'),
                    disableSort: false,
                    hide: !userIsAdmin,
                    width: 100,
                    minWidth: 100
                  },
                  {
                    id: 'group',
                    label: t('logPage.groupLabel'),
                    disableSort: false,
                    width: 100,
                    minWidth: 100
                  },
                  {
                    id: 'token_name',
                    label: t('logPage.tokenLabel'),
                    disableSort: false,
                    width: 100,
                    minWidth: 100
                  },
                  {
                    id: 'type',
                    label: t('logPage.typeLabel'),
                    disableSort: false,
                    width: 100,
                    minWidth: 100
                  },
                  {
                    id: 'model_name',
                    label: t('logPage.modelLabel'),
                    disableSort: false,
                    width: 100,
                    minWidth: 100
                  },
                  {
                    id: 'duration',
                    label: t('logPage.durationLabel'),
                    tooltip: t('logPage.durationTooltip'),
                    disableSort: true,
                    width: 100,
                    minWidth: 100
                  },
                  {
                    id: 'message',
                    label: t('logPage.inputLabel'),
                    disableSort: true,
                    width: 100,
                    minWidth: 100
                  },
                  {
                    id: 'completion',
                    label: t('logPage.outputLabel'),
                    disableSort: true,
                    width: 100,
                    minWidth: 100
                  },
                  {
                    id: 'quota',
                    label: t('logPage.quotaLabel'),
                    disableSort: true,
                    width: 100,
                    minWidth: 100
                  },
                  {
                    id: 'request ip',
                    label: t('logPage.requestIPLabel'),
                    disableSort: false,
                    hide: !userIsAdmin,
                    width: 100,
                    maxWidth: 100
                  },
                  {
                    id: 'detail',
                    label: t('logPage.detailLabel'),
                    disableSort: true,
                    minWidth: '200px'
                  }
                ]}
              />
              <TableBody>
                {logs.map((row, index) => (
                  <LogTableRow item={row} key={`${row.id}_${index}`} userIsAdmin={userIsAdmin} userGroup={userGroup} />
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
