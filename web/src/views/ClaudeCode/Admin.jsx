import React, { useState, useEffect, useMemo } from 'react';
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
  FormControlLabel,
  FormHelperText,
  InputLabel,
  Chip,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  Grid,
  Switch
} from '@mui/material';
import {
  Search as SearchIcon,
  PersonAdd as PersonAddIcon,
  Cancel as CancelIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { renderQuota, showError, showSuccess, showWarning, timestamp2string } from 'utils/common';
import { API } from 'utils/api';
import { useTranslation } from 'react-i18next';

const durationUnitOptions = [
  { value: 'day', label: '按日', suffix: '天', short: '日' },
  { value: 'week', label: '按周', suffix: '周', short: '周' },
  { value: 'month', label: '按月', suffix: '个月', short: '月' },
  { value: 'quarter', label: '按季度', suffix: '个季度', short: '季度' }
];

const quotaUnit = 500000;

const getDurationSuffix = (unit) => {
  const option = durationUnitOptions.find((item) => item.value === unit);
  return option ? option.suffix : '个月';
};

const getDurationShortLabel = (unit) => {
  const option = durationUnitOptions.find((item) => item.value === unit);
  return option ? option.short : '月';
};

const getDurationLabel = (unit = 'month', value = 1) => {
  const safeValue = value > 0 ? value : 1;
  return `${safeValue}${getDurationSuffix(unit)}`;
};

const quotaToDisplay = (value) => (value || 0) / quotaUnit;
const displayToQuota = (value) => {
  const parsed = parseFloat(value);
  if (!parsed || parsed <= 0) {
    return 0;
  }
  return Math.round(parsed * quotaUnit);
};

const ClaudeCodeAdmin = () => {
  const { t } = useTranslation();
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
    durationUnit: 'month',
    reason: ''
  });

  const [plans, setPlans] = useState([]);
  const [userGroupMap, setUserGroupMap] = useState({});
  const [userGroupOptions, setUserGroupOptions] = useState([]);

  const planNameMap = useMemo(() => {
    const map = {};
    plans.forEach((plan) => {
      if (plan?.type) {
        map[plan.type] = plan.name || plan.type;
      }
    });
    return map;
  }, [plans]);

  // 套餐管理状态
  const [planDialogOpen, setPlanDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [planForm, setPlanForm] = useState({
    name: '',
    type: '',
    service_type: '',
    description: '',
    price: 0,
    currency: 'USD',
    total_quota: 500000,
    max_client_count: 1,
    is_unlimited_time: false,
    duration_months: 1,
    duration_unit: 'month',
    duration_value: 1,
    is_active: true,
    sort_order: 0,
    show_in_portal: true,
    daily_quota_per_plan: 0,
    weekly_quota_per_plan: 0,
    monthly_quota_per_plan: 0,
    deduction_group: ''
  });

  // 获取套餐列表
  const fetchPlans = async () => {
    try {
      const res = await API.get('/api/packages-admin/plans', {
        params: {
          include_hidden: true
        }
      });
      if (res.data.success) {
        setPlans(res.data.data || []);
      }
    } catch (error) {
      console.error('获取套餐列表失败:', error);
      setPlans([]);
    }
  };

  const fetchUserGroups = async () => {
    try {
      const res = await API.get('/api/user_group_map_by_admin');
      if (res.data.success) {
        const data = res.data.data || {};
        const groups = Object.keys(data);
        groups.sort((a, b) => {
          if (a === 'default') return -1;
          if (b === 'default') return 1;
          return a.localeCompare(b);
        });
        setUserGroupMap(data);
        setUserGroupOptions(groups);
      }
    } catch (error) {
      console.error('获取用户分组失败:', error);
      setUserGroupMap({});
      setUserGroupOptions([]);
    }
  };

  // 获取订阅列表
  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      const res = await API.get('/api/packages-admin/subscriptions', {
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
      const res = await API.get('/api/packages-admin/users/search', {
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
      const res = await API.post('/api/packages-admin/grant-subscription', {
        user_id: selectedUser.id,
        plan_type: grantForm.planType,
        reason: grantForm.reason
      });

      if (res.data.success) {
        showSuccess('套餐发放成功');
        setGrantDialogOpen(false);
        setSelectedUser(null);
        setGrantForm({ planType: 'basic', duration: 1, durationUnit: 'month', reason: '' });
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
      const res = await API.delete(`/api/packages-admin/subscriptions/${subscriptionId}`);
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
      case 'active':
        return 'success';
      case 'expired':
        return 'error';
      case 'cancelled':
        return 'default';
      case 'pending':
        return 'info';
      case 'exhausted':
        return 'warning';
      default:
        return 'default';
    }
  };

  // 获取状态文本
  const getStatusText = (status) => {
    switch (status) {
      case 'active':
        return '活跃';
      case 'expired':
        return '已过期';
      case 'cancelled':
        return '已取消';
      case 'pending':
        return '待付款';
      case 'exhausted':
        return '额度已用尽';
      default:
        return status;
    }
  };

  // 套餐管理函数
  const handleCreatePlan = () => {
    setEditingPlan(null);
    setPlanForm({
      name: '',
      type: '',
      service_type: 'claude_code',
      description: '',
      price: 0,
      currency: 'USD',
      total_quota: quotaUnit,
      max_client_count: 1,
      is_unlimited_time: false,
      duration_months: 1,
      duration_unit: 'month',
      duration_value: 1,
      is_active: true,
      sort_order: 0,
      show_in_portal: true,
      daily_quota_per_plan: 0,
      weekly_quota_per_plan: 0,
      monthly_quota_per_plan: 0,
      deduction_group: ''
    });
    setPlanDialogOpen(true);
  };

  const handleEditPlan = (plan) => {
    const durationUnit = plan.duration_unit || 'month';
    const durationValue = plan.duration_value || plan.duration_months || 1;
    setEditingPlan(plan);
    setPlanForm({
      name: plan.name,
      type: plan.type,
      service_type: plan.service_type,
      description: plan.description,
      price: plan.price,
      currency: plan.currency,
      total_quota: plan.total_quota || quotaUnit,
      max_client_count: plan.max_client_count,
      is_unlimited_time: plan.is_unlimited_time || false,
      duration_months: plan.duration_months || 1,
      duration_unit: durationUnit,
      duration_value: durationValue,
      is_active: plan.is_active,
      sort_order: plan.sort_order,
      show_in_portal: plan.show_in_portal ?? true,
      daily_quota_per_plan: plan.daily_quota_per_plan || 0,
      weekly_quota_per_plan: plan.weekly_quota_per_plan || 0,
      monthly_quota_per_plan: plan.monthly_quota_per_plan || 0,
      deduction_group: plan.deduction_group || ''
    });
    setPlanDialogOpen(true);
  };

  const handleSavePlan = async () => {
    try {
      const url = editingPlan ? `/api/packages-admin/plans/${editingPlan.id}` : '/api/packages-admin/plans';
      const method = editingPlan ? 'put' : 'post';

      const res = await API[method](url, planForm);

      if (res.data.success) {
        showSuccess(editingPlan ? '套餐更新成功' : '套餐创建成功');
        setPlanDialogOpen(false);
        fetchPlans();
      } else {
        showError(res.data.message);
      }
    } catch (error) {
      showError(editingPlan ? '更新套餐失败' : '创建套餐失败');
    }
  };

  const handleDeletePlan = async (planId) => {
    if (!window.confirm('确定要删除这个套餐吗？')) {
      return;
    }

    try {
      const res = await API.delete(`/api/packages-admin/plans/${planId}`);
      if (res.data.success) {
        showSuccess('套餐删除成功');
        fetchPlans();
      } else {
        showError(res.data.message);
      }
    } catch (error) {
      showError('删除套餐失败');
    }
  };

  useEffect(() => {
    fetchPlans();
    fetchUserGroups();
  }, []);

  useEffect(() => {
    if (tabValue === 0) {
      fetchSubscriptions();
    } else if (tabValue === 2) {
      fetchPlans();
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
    setGrantForm({ planType: 'basic', duration: 1, durationUnit: 'month', reason: '' });
  };

  return (
    <Container maxWidth="xl">
      <Typography variant="h2" sx={{ mb: 3 }}>
        订阅管理面板
      </Typography>

      <Card sx={{ mb: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="订阅列表" />
            <Tab label="用户搜索 & 发放套餐" />
            <Tab label="套餐管理" />
          </Tabs>
        </Box>

        {/* 订阅管理标签页 */}
        {tabValue === 0 && (
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h4">订阅列表</Typography>
              <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchSubscriptions} disabled={loading}>
                刷新
              </Button>
            </Box>

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>用户ID</TableCell>
                    <TableCell>{t('packages.subscription.serviceType')}</TableCell>
                    <TableCell>{t('packages.subscription.packageName')}</TableCell>
                    <TableCell>状态</TableCell>
                    <TableCell>开始时间</TableCell>
                    <TableCell>结束时间</TableCell>
                    <TableCell>总额度</TableCell>
                    <TableCell>剩余额度</TableCell>
                    <TableCell>已用额度</TableCell>
                    <TableCell>支付方式</TableCell>
                    <TableCell>操作</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={11} sx={{ textAlign: 'center', py: 3 }}>
                        <CircularProgress />
                      </TableCell>
                    </TableRow>
                  ) : subscriptions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={11} sx={{ textAlign: 'center', py: 3 }}>
                        暂无数据
                      </TableCell>
                    </TableRow>
                  ) : (
                    subscriptions.map((subscription) => (
                      <TableRow key={subscription.id}>
                        <TableCell>{subscription.user_id}</TableCell>
                        <TableCell>
                          <Chip
                            label={
                              subscription.service_type === 'claude_code'
                                ? 'Claude Code'
                                : subscription.service_type === 'codex_code'
                                  ? 'Codex Code'
                                  : subscription.service_type === 'gemini_code'
                                    ? 'Gemini Code'
                                    : subscription.service_type
                            }
                            color={
                              subscription.service_type === 'claude_code'
                                ? 'primary'
                                : subscription.service_type === 'codex_code'
                                  ? 'secondary'
                                  : subscription.service_type === 'gemini_code'
                                    ? 'warning'
                                    : 'default'
                            }
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{planNameMap[subscription.plan_type] || subscription.plan_type || '-'}</TableCell>
                        <TableCell>
                          <Chip
                            label={getStatusText(subscription.status)}
                            color={getStatusColor(subscription.status)}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>{timestamp2string(subscription.start_time)}</TableCell>
                        <TableCell>{timestamp2string(subscription.end_time)}</TableCell>
                        <TableCell>{renderQuota(subscription.total_quota, 6)}</TableCell>
                        <TableCell>{renderQuota(subscription.remain_quota, 6)}</TableCell>
                        <TableCell>{renderQuota(subscription.used_quota, 6)}</TableCell>
                        <TableCell>{subscription.payment_method}</TableCell>
                        <TableCell>
                          {subscription.status === 'active' && (
                            <Tooltip title="取消订阅">
                              <IconButton color="error" size="small" onClick={() => cancelSubscription(subscription.id)}>
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
              <Button variant="contained" startIcon={<SearchIcon />} onClick={searchUsers} disabled={searchLoading}>
                搜索
              </Button>
            </Box>

            {users.length > 0 && (
              <>
                <Typography variant="h5" sx={{ mb: 2 }}>
                  搜索结果
                </Typography>
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

        {/* 套餐管理标签页 */}
        {tabValue === 2 && (
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h4">套餐管理</Typography>
              <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleCreatePlan}>
                创建套餐
              </Button>
            </Box>

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>{t('packages.subscription.serviceType')}</TableCell>
                    <TableCell>{t('packages.subscription.packageName')}</TableCell>
                    <TableCell>套餐类型</TableCell>
                    <TableCell>价格</TableCell>
                    <TableCell>时间限制</TableCell>
                    <TableCell>总额度</TableCell>
                    <TableCell>抵扣分组</TableCell>
                    <TableCell>设备数</TableCell>
                    <TableCell>状态</TableCell>
                    <TableCell>前台展示</TableCell>
                    <TableCell>排序</TableCell>
                    <TableCell>操作</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                      <TableRow>
                      <TableCell colSpan={13} sx={{ textAlign: 'center', py: 3 }}>
                        <CircularProgress />
                      </TableCell>
                    </TableRow>
                  ) : (
                    plans.map((plan) => (
                      <TableRow key={plan.id}>
                        <TableCell>{plan.id}</TableCell>
                        <TableCell>
                          <Chip
                            label={
                              plan.service_type === 'claude_code'
                                ? 'Claude Code'
                                : plan.service_type === 'codex_code'
                                  ? 'Codex Code'
                                  : plan.service_type === 'gemini_code'
                                    ? 'Gemini Code'
                                    : plan.service_type || 'Claude Code'
                            }
                            color={
                              plan.service_type === 'claude_code' || !plan.service_type
                                ? 'primary'
                                : plan.service_type === 'codex_code'
                                  ? 'secondary'
                                  : plan.service_type === 'gemini_code'
                                    ? 'warning'
                                    : 'default'
                            }
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{plan.name}</TableCell>
                        <TableCell>
                          <Chip label={plan.type} color="primary" variant="outlined" size="small" />
                        </TableCell>
                        <TableCell>
                          ${plan.price} {plan.currency}
                        </TableCell>
                        <TableCell>
                          {plan.is_unlimited_time ? (
                            <Chip label="无时间限制" color="success" size="small" variant="outlined" />
                          ) : (
                            <Chip
                              label={getDurationLabel(plan.duration_unit || 'month', plan.duration_value || plan.duration_months || 1)}
                              color="info"
                              size="small"
                              variant="outlined"
                            />
                          )}
                        </TableCell>
                        <TableCell>${quotaToDisplay(plan.total_quota).toFixed(2)}</TableCell>
                        <TableCell>{plan.deduction_group || '不限'}</TableCell>
                        <TableCell>{plan.max_client_count}</TableCell>
                        <TableCell>
                          <Chip
                            label={plan.is_active ? '启用' : '禁用'}
                            color={plan.is_active ? 'success' : 'default'}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={plan.show_in_portal ? '展示' : '隐藏'}
                            color={plan.show_in_portal ? 'primary' : 'default'}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>{plan.sort_order}</TableCell>
                        <TableCell>
                          <Tooltip title="编辑">
                            <IconButton size="small" color="primary" onClick={() => handleEditPlan(plan)}>
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="删除">
                            <IconButton size="small" color="error" onClick={() => handleDeletePlan(plan.id)}>
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                  {!loading && plans.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={13} align="center">
                        <Typography color="text.secondary">暂无套餐，点击上方按钮创建</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </Card>

      {/* 发放套餐对话框 */}
      <Dialog open={grantDialogOpen} onClose={handleGrantDialogClose} maxWidth="sm" fullWidth>
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
                {plans.map((plan) => {
                  const unit = plan.duration_unit || 'month';
                  const value = plan.duration_value || plan.duration_months || 1;
                  return (
                    <MenuItem key={plan.type} value={plan.type}>
                      {plan.name} - ${plan.price}/{plan.currency}/{plan.is_unlimited_time ? '永久' : getDurationShortLabel(unit)}({' '}
                      {plan.is_unlimited_time ? '无时间限制' : getDurationLabel(unit, value)}){!plan.show_in_portal && '（前台隐藏）'}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>

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

      {/* 套餐创建/编辑对话框 */}
      <Dialog open={planDialogOpen} onClose={() => setPlanDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editingPlan ? '编辑套餐' : '创建新套餐'}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t('packages.subscription.packageName')}
                  value={planForm.name}
                  onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>{t('packages.subscription.serviceType')}</InputLabel>
                  <Select
                    value={planForm.service_type}
                    onChange={(e) => setPlanForm({ ...planForm, service_type: e.target.value })}
                    label={t('packages.subscription.serviceType')}
                  >
                    <MenuItem value="claude_code">Claude Code</MenuItem>
                    <MenuItem value="codex_code">Codex Code</MenuItem>
                    <MenuItem value="gemini_code">Gemini Code</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="套餐类型"
                  value={planForm.type}
                  onChange={(e) => setPlanForm({ ...planForm, type: e.target.value })}
                  required
                  disabled={!!editingPlan}
                  helperText={editingPlan ? '类型不可修改' : '唯一标识符，如 basic, pro'}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="套餐描述"
                  multiline
                  rows={2}
                  value={planForm.description}
                  onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="价格"
                  type="number"
                  value={planForm.price}
                  onChange={(e) => setPlanForm({ ...planForm, price: parseFloat(e.target.value) || 0 })}
                  required
                  inputProps={{ min: 0, step: 0.01 }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>货币</InputLabel>
                  <Select value={planForm.currency} onChange={(e) => setPlanForm({ ...planForm, currency: e.target.value })} label="货币">
                    <MenuItem value="USD">USD</MenuItem>
                    <MenuItem value="EUR">EUR</MenuItem>
                    <MenuItem value="CNY">CNY</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="排序权重"
                  type="number"
                  value={planForm.sort_order}
                  onChange={(e) => setPlanForm({ ...planForm, sort_order: parseInt(e.target.value) || 0 })}
                  inputProps={{ min: 0 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="总额度（USD）"
                  type="number"
                  value={quotaToDisplay(planForm.total_quota)}
                  onChange={(e) => setPlanForm({ ...planForm, total_quota: displayToQuota(e.target.value) || quotaUnit })}
                  required
                  inputProps={{ min: 0, step: 0.01 }}
                  helperText="显示金额，实际额度 = 金额 × 500000"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="最大设备数"
                  type="number"
                  value={planForm.max_client_count}
                  onChange={(e) => setPlanForm({ ...planForm, max_client_count: parseInt(e.target.value) || 1 })}
                  required
                  inputProps={{ min: 1 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>抵扣分组</InputLabel>
                  <Select
                    value={planForm.deduction_group}
                    onChange={(e) => setPlanForm({ ...planForm, deduction_group: e.target.value })}
                    label="抵扣分组"
                  >
                    <MenuItem value="">不限分组</MenuItem>
                    {userGroupOptions.map((group) => (
                      <MenuItem key={group} value={group}>
                        {userGroupMap[group]?.name || group}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>仅该用户分组扣费</FormHelperText>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2">周期限额（USD）</Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="订阅日限额"
                  type="number"
                  value={quotaToDisplay(planForm.daily_quota_per_plan)}
                  onChange={(e) => setPlanForm({ ...planForm, daily_quota_per_plan: displayToQuota(e.target.value) })}
                  inputProps={{ min: 0, step: 0.01 }}
                  helperText="0 表示不限"
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="订阅周限额"
                  type="number"
                  value={quotaToDisplay(planForm.weekly_quota_per_plan)}
                  onChange={(e) => setPlanForm({ ...planForm, weekly_quota_per_plan: displayToQuota(e.target.value) })}
                  inputProps={{ min: 0, step: 0.01 }}
                  helperText="0 表示不限"
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="订阅月限额"
                  type="number"
                  value={quotaToDisplay(planForm.monthly_quota_per_plan)}
                  onChange={(e) => setPlanForm({ ...planForm, monthly_quota_per_plan: displayToQuota(e.target.value) })}
                  inputProps={{ min: 0, step: 0.01 }}
                  helperText="0 表示不限"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>时间限制类型</InputLabel>
                  <Select
                    value={planForm.is_unlimited_time}
                    onChange={(e) => setPlanForm({ ...planForm, is_unlimited_time: e.target.value })}
                    label="时间限制类型"
                  >
                    <MenuItem value={false}>限制时间</MenuItem>
                    <MenuItem value={true}>无时间限制</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              {!planForm.is_unlimited_time && (
                <>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>时长单位</InputLabel>
                      <Select
                        value={planForm.duration_unit}
                        label="时长单位"
                        onChange={(e) => {
                          const unit = e.target.value;
                          setPlanForm((prev) => ({
                            ...prev,
                            duration_unit: unit,
                            duration_months:
                              unit === 'month'
                                ? prev.duration_value
                                : unit === 'quarter'
                                  ? prev.duration_value * 3
                                  : prev.duration_months || prev.duration_value
                          }));
                        }}
                      >
                        {durationUnitOptions.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="订阅时长数值"
                      type="number"
                      value={planForm.duration_value}
                      onChange={(e) => {
                        const value = parseInt(e.target.value, 10) || 1;
                        setPlanForm((prev) => ({
                          ...prev,
                          duration_value: value,
                          duration_months: prev.duration_unit === 'month' ? value : prev.duration_unit === 'quarter' ? value * 3 : value
                        }));
                      }}
                      inputProps={{ min: 1, max: 120 }}
                      helperText="与选择的单位组合成完整时长"
                    />
                  </Grid>
                </>
              )}
              <Grid item xs={12} sm={planForm.is_unlimited_time ? 12 : 6}>
                <FormControl fullWidth>
                  <InputLabel>状态</InputLabel>
                  <Select value={planForm.is_active} onChange={(e) => setPlanForm({ ...planForm, is_active: e.target.value })} label="状态">
                    <MenuItem value={true}>启用</MenuItem>
                    <MenuItem value={false}>禁用</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={planForm.is_unlimited_time ? 12 : 6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={planForm.show_in_portal}
                      onChange={(e) => setPlanForm({ ...planForm, show_in_portal: e.target.checked })}
                      color="primary"
                    />
                  }
                  label="前台展示"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPlanDialogOpen(false)}>取消</Button>
          <Button variant="contained" onClick={handleSavePlan}>
            {editingPlan ? '更新' : '创建'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ClaudeCodeAdmin;
