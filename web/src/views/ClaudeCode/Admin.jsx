import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Card,
  Box,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Search as SearchIcon,
  PersonAdd as PersonAddIcon,
  Cancel as CancelIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { showError, showSuccess, showWarning, timestamp2string } from 'utils/common';
import { API } from 'utils/api';

const ClaudeCodeAdmin = () => {
  const [tabValue, setTabValue] = useState(0);
  const [subscriptions, setSubscriptions] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  
  // 分页状态
  const [subscriptionPage, setSubscriptionPage] = useState(0);
  const [subscriptionRowsPerPage, setSubscriptionRowsPerPage] = useState(10);
  const [subscriptionTotal, setSubscriptionTotal] = useState(0);
  
  const [userPage, setUserPage] = useState(0);
  const [userRowsPerPage, setUserRowsPerPage] = useState(10);
  const [userTotal, setUserTotal] = useState(0);
  
  // 搜索和发放对话框状态
  const [searchKeyword, setSearchKeyword] = useState('');
  const [grantDialogOpen, setGrantDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [grantForm, setGrantForm] = useState({
    planType: 'basic',
    duration: 1,
    reason: ''
  });
  
  const [plans, setPlans] = useState([]);

  // 获取套餐列表
  const fetchPlans = async () => {
    try {
      const res = await API.get('/api/user/claude-code/plans');
      if (res.data.success) {
        setPlans(res.data.data);
      }
    } catch (error) {
      console.error('获取套餐列表失败:', error);
    }
  };

  // 获取订阅列表
  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      const res = await API.get('/api/claude-code-admin/subscriptions', {
        params: {
          page: subscriptionPage + 1,
          page_size: subscriptionRowsPerPage
        }
      });
      if (res.data.success) {
        setSubscriptions(res.data.data.subscriptions || []);
        setSubscriptionTotal(res.data.data.total || 0);
      } else {
        showError('获取订阅列表失败: ' + res.data.message);
      }
    } catch (error) {
      showError('获取订阅列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 搜索用户
  const searchUsers = async () => {
    if (!searchKeyword.trim()) {
      showWarning('请输入搜索关键词');
      return;
    }
    
    setSearchLoading(true);
    try {
      const res = await API.get('/api/claude-code-admin/users/search', {
        params: {
          keyword: searchKeyword,
          page: userPage + 1,
          page_size: userRowsPerPage
        }
      });
      if (res.data.success) {
        setUsers(res.data.data.users || []);
        setUserTotal(res.data.data.total || 0);
      } else {
        showError('搜索用户失败: ' + res.data.message);
      }
    } catch (error) {
      showError('搜索用户失败');
    } finally {
      setSearchLoading(false);
    }
  };

  // 手动发放套餐
  const grantSubscription = async () => {
    if (!selectedUser) {
      showError('请选择用户');
      return;
    }

    try {
      const res = await API.post('/api/claude-code-admin/grant-subscription', {
        user_id: selectedUser.id,
        plan_type: grantForm.planType,
        duration: grantForm.duration,
        reason: grantForm.reason
      });

      if (res.data.success) {
        showSuccess('套餐发放成功');
        setGrantDialogOpen(false);
        setSelectedUser(null);
        setGrantForm({ planType: 'basic', duration: 1, reason: '' });
        fetchSubscriptions(); // 刷新订阅列表
      } else {
        showError('发放失败: ' + res.data.message);
      }
    } catch (error) {
      showError('发放失败');
    }
  };

  // 取消订阅
  const cancelSubscription = async (subscriptionId) => {
    if (!window.confirm('确定要取消这个订阅吗？')) {
      return;
    }

    try {
      const res = await API.delete(`/api/claude-code-admin/subscriptions/${subscriptionId}`);
      if (res.data.success) {
        showSuccess('订阅已取消');
        fetchSubscriptions();
      } else {
        showError('取消订阅失败: ' + res.data.message);
      }
    } catch (error) {
      showError('取消订阅失败');
    }
  };

  // 获取状态颜色
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'expired': return 'error';
      case 'cancelled': return 'warning';
      case 'pending': return 'info';
      default: return 'default';
    }
  };

  // 获取状态文本
  const getStatusText = (status) => {
    switch (status) {
      case 'active': return '活跃';
      case 'expired': return '已过期';
      case 'cancelled': return '已取消';
      case 'pending': return '待付款';
      default: return status;
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  useEffect(() => {
    if (tabValue === 0) {
      fetchSubscriptions();
    }
  }, [tabValue, subscriptionPage, subscriptionRowsPerPage]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleGrantDialogOpen = (user) => {
    setSelectedUser(user);
    setGrantDialogOpen(true);
  };

  const handleGrantDialogClose = () => {
    setGrantDialogOpen(false);
    setSelectedUser(null);
    setGrantForm({ planType: 'basic', duration: 1, reason: '' });
  };

  return (
    <Container maxWidth="xl">
      <Typography variant="h2" sx={{ mb: 3 }}>
        Claude Code 管理面板
      </Typography>

      <Card sx={{ mb: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="订阅管理" />
            <Tab label="用户搜索 & 发放套餐" />
          </Tabs>
        </Box>

        {/* 订阅管理标签页 */}
        {tabValue === 0 && (
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h4">订阅列表</Typography>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={fetchSubscriptions}
                disabled={loading}
              >
                刷新
              </Button>
            </Box>

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>用户ID</TableCell>
                    <TableCell>套餐类型</TableCell>
                    <TableCell>状态</TableCell>
                    <TableCell>开始时间</TableCell>
                    <TableCell>结束时间</TableCell>
                    <TableCell>月度额度</TableCell>
                    <TableCell>已用额度</TableCell>
                    <TableCell>支付方式</TableCell>
                    <TableCell>操作</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={9} sx={{ textAlign: 'center', py: 3 }}>
                        <CircularProgress />
                      </TableCell>
                    </TableRow>
                  ) : subscriptions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} sx={{ textAlign: 'center', py: 3 }}>
                        暂无数据
                      </TableCell>
                    </TableRow>
                  ) : (
                    subscriptions.map((subscription) => (
                      <TableRow key={subscription.id}>
                        <TableCell>{subscription.user_id}</TableCell>
                        <TableCell>{subscription.plan_type}</TableCell>
                        <TableCell>
                          <Chip
                            label={getStatusText(subscription.status)}
                            color={getStatusColor(subscription.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{timestamp2string(subscription.start_time)}</TableCell>
                        <TableCell>{timestamp2string(subscription.end_time)}</TableCell>
                        <TableCell>{subscription.max_requests_per_month}</TableCell>
                        <TableCell>{subscription.used_requests_this_month}</TableCell>
                        <TableCell>{subscription.payment_method}</TableCell>
                        <TableCell>
                          {subscription.status === 'active' && (
                            <Tooltip title="取消订阅">
                              <IconButton
                                color="error"
                                size="small"
                                onClick={() => cancelSubscription(subscription.id)}
                              >
                                <CancelIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              component="div"
              count={subscriptionTotal}
              page={subscriptionPage}
              onPageChange={(event, newPage) => setSubscriptionPage(newPage)}
              rowsPerPage={subscriptionRowsPerPage}
              onRowsPerPageChange={(event) => {
                setSubscriptionRowsPerPage(parseInt(event.target.value, 10));
                setSubscriptionPage(0);
              }}
              labelRowsPerPage="每页行数："
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`}
            />
          </Box>
        )}

        {/* 用户搜索 & 发放套餐标签页 */}
        {tabValue === 1 && (
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <TextField
                label="搜索用户"
                placeholder="输入用户ID、用户名或邮箱"
                variant="outlined"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchUsers()}
                sx={{ flexGrow: 1 }}
              />
              <Button
                variant="contained"
                startIcon={<SearchIcon />}
                onClick={searchUsers}
                disabled={searchLoading}
              >
                搜索
              </Button>
            </Box>

            {users.length > 0 && (
              <>
                <Typography variant="h5" sx={{ mb: 2 }}>搜索结果</Typography>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>用户ID</TableCell>
                        <TableCell>用户名</TableCell>
                        <TableCell>邮箱</TableCell>
                        <TableCell>余额</TableCell>
                        <TableCell>注册时间</TableCell>
                        <TableCell>操作</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {searchLoading ? (
                        <TableRow>
                          <TableCell colSpan={6} sx={{ textAlign: 'center', py: 3 }}>
                            <CircularProgress />
                          </TableCell>
                        </TableRow>
                      ) : (
                        users.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell>{user.id}</TableCell>
                            <TableCell>{user.username}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>${(user.quota / 500000).toFixed(2)}</TableCell>
                            <TableCell>{timestamp2string(user.created_time)}</TableCell>
                            <TableCell>
                              <Button
                                variant="contained"
                                color="primary"
                                size="small"
                                startIcon={<PersonAddIcon />}
                                onClick={() => handleGrantDialogOpen(user)}
                              >
                                发放套餐
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>

                <TablePagination
                  component="div"
                  count={userTotal}
                  page={userPage}
                  onPageChange={(event, newPage) => setUserPage(newPage)}
                  rowsPerPage={userRowsPerPage}
                  onRowsPerPageChange={(event) => {
                    setUserRowsPerPage(parseInt(event.target.value, 10));
                    setUserPage(0);
                  }}
                  labelRowsPerPage="每页行数："
                  labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`}
                />
              </>
            )}
          </Box>
        )}
      </Card>

      {/* 发放套餐对话框 */}
      <Dialog open={grantDialogOpen} onClose={handleGrantDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          为用户 "{selectedUser?.username}" 发放 Claude Code 套餐
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Alert severity="info" sx={{ mb: 3 }}>
              用户信息：ID={selectedUser?.id}, 邮箱={selectedUser?.email}
            </Alert>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>套餐类型</InputLabel>
              <Select
                value={grantForm.planType}
                label="套餐类型"
                onChange={(e) => setGrantForm({ ...grantForm, planType: e.target.value })}
              >
                {plans.map((plan) => (
                  <MenuItem key={plan.type} value={plan.type}>
                    {plan.name} - ${plan.price}/月 ({plan.max_requests_per_month} 次/月)
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="订阅时长（月）"
              type="number"
              value={grantForm.duration}
              onChange={(e) => setGrantForm({ ...grantForm, duration: parseInt(e.target.value) || 1 })}
              inputProps={{ min: 1, max: 12 }}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="发放原因"
              multiline
              rows={3}
              value={grantForm.reason}
              onChange={(e) => setGrantForm({ ...grantForm, reason: e.target.value })}
              placeholder="请输入发放套餐的原因（选填）"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleGrantDialogClose}>取消</Button>
          <Button variant="contained" onClick={grantSubscription}>
            确认发放
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ClaudeCodeAdmin;
