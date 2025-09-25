import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Box,
  Chip,
  LinearProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Stack,
  Divider,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Star as StarIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  Cancel as CancelIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { API } from 'utils/api';
import { showError, showSuccess, showInfo } from 'utils/common';
import { useTranslation } from 'react-i18next';

const ClaudeCodeSubscription = () => {
  const { t } = useTranslation();
  const [subscription, setSubscription] = useState(null);
  const [plans, setPlans] = useState([]);
  const [apiKeys, setApiKeys] = useState([]);
  const [usageStats, setUsageStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [createKeyDialog, setCreateKeyDialog] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [purchaseDialog, setPurchaseDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('stripe');
  const [newApiKey, setNewApiKey] = useState('');

  // 获取用户订阅状态
  const fetchSubscription = async () => {
    try {
      const res = await API.get('/api/user/claude-code/subscription');
      if (res.data.success) {
        setSubscription(res.data.data);
      } else {
        setSubscription(null);
      }
    } catch (error) {
      console.error('获取订阅信息失败:', error);
      setSubscription(null);
    }
  };

  // 获取可用套餐
  const fetchPlans = async () => {
    try {
      const res = await API.get('/api/user/claude-code/plans');
      if (res.data.success) {
        setPlans(res.data.data || []);
      } else {
        setPlans([]);
      }
    } catch (error) {
      showError('获取套餐信息失败');
      setPlans([]);
    }
  };

  // 获取API Keys
  const fetchApiKeys = async () => {
    try {
      const res = await API.get('/api/user/claude-code/api-keys');
      if (res.data.success) {
        setApiKeys(res.data.data || []);
      } else {
        setApiKeys([]);
      }
    } catch (error) {
      console.error('获取API Keys失败:', error);
      setApiKeys([]);
    }
  };

  // 获取使用统计
  const fetchUsageStats = async () => {
    try {
      const res = await API.get('/api/user/claude-code/usage-stats');
      if (res.data.success) {
        setUsageStats(res.data.data);
      }
    } catch (error) {
      console.error('获取使用统计失败:', error);
    }
  };

  // 购买订阅
  const purchaseSubscription = async () => {
    if (!selectedPlan) return;

    setLoading(true);
    try {
      const res = await API.post('/api/user/claude-code/purchase', {
        plan_type: selectedPlan.type,
        payment_method: paymentMethod
      });

      if (res.data.success) {
        showSuccess('订单创建成功！正在跳转到支付页面...');
        // 跳转到支付页面
        if (res.data.payment_url) {
          window.open(res.data.payment_url, '_blank');
        }
        setPurchaseDialog(false);
        // 延迟刷新，等待用户完成支付
        setTimeout(() => {
          fetchSubscription();
        }, 3000);
      } else {
        showError(res.data.message);
      }
    } catch (error) {
      showError('购买失败');
    } finally {
      setLoading(false);
    }
  };

  // 创建API Key
  const createApiKey = async () => {
    if (!newKeyName.trim()) {
      showError('请输入API Key名称');
      return;
    }

    setLoading(true);
    try {
      const res = await API.post('/api/user/claude-code/api-keys', {
        name: newKeyName
      });

      if (res.data.success) {
        showSuccess('API Key创建成功！');
        setNewApiKey(res.data.data.key);
        setNewKeyName('');
        fetchApiKeys();
      } else {
        showError(res.data.message);
      }
    } catch (error) {
      showError('创建失败');
    } finally {
      setLoading(false);
    }
  };

  // 删除API Key
  const deleteApiKey = async (keyId) => {
    if (!window.confirm('确定要删除这个API Key吗？删除后将无法恢复！')) {
      return;
    }

    try {
      const res = await API.delete(`/api/user/claude-code/api-keys/${keyId}`);
      if (res.data.success) {
        showSuccess('删除成功');
        fetchApiKeys();
      } else {
        showError(res.data.message);
      }
    } catch (error) {
      showError('删除失败');
    }
  };

  // 取消订阅
  const cancelSubscription = async () => {
    if (!window.confirm('确定要取消订阅吗？订阅将在到期时失效。')) {
      return;
    }

    try {
      const res = await API.post('/api/user/claude-code/cancel');
      if (res.data.success) {
        showSuccess('订阅已取消');
        fetchSubscription();
      } else {
        showError(res.data.message);
      }
    } catch (error) {
      showError('取消失败');
    }
  };

  // 复制API Key到剪贴板
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      showSuccess('已复制到剪贴板');
    });
  };

  useEffect(() => {
    fetchSubscription();
    fetchPlans();
    fetchApiKeys();
    fetchUsageStats();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'expired':
        return 'error';
      case 'cancelled':
        return 'warning';
      case 'pending':
        return 'info';
      default:
        return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active':
        return t('claudeCode.subscription.status.active');
      case 'expired':
        return t('claudeCode.subscription.status.expired');
      case 'cancelled':
        return t('claudeCode.subscription.status.cancelled');
      case 'pending':
        return t('claudeCode.subscription.status.pending');
      default:
        return t('claudeCode.subscription.status.unknown');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircleIcon />;
      case 'expired':
        return <WarningIcon />;
      case 'cancelled':
        return <CancelIcon />;
      case 'pending':
        return <InfoIcon />;
      default:
        return <InfoIcon />;
    }
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const usagePercentage = subscription ? (subscription.used_requests_this_month / subscription.max_requests_per_month) * 100 : 0;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={4}>
        <Typography variant="h2" gutterBottom>
          {t('claudeCode.subscription.title')}
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={() => {
            fetchSubscription();
            fetchApiKeys();
            fetchUsageStats();
          }}
        >
          {t('common.refresh')}
        </Button>
      </Stack>

      {/* 当前订阅状态 */}
      {subscription ? (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h5">{t('claudeCode.subscription.currentSubscription')}</Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                {getStatusIcon(subscription.status)}
                <Chip label={getStatusText(subscription.status)} color={getStatusColor(subscription.status)} />
              </Stack>
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      {t('claudeCode.subscription.planType')}
                    </Typography>
                    <Typography variant="h6">{subscription.plan_type}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      {t('claudeCode.subscription.subscriptionPeriod')}
                    </Typography>
                    <Typography variant="body1">
                      {subscription.end_time > subscription.start_time + 50 * 365 * 24 * 60 * 60 ? (
                        <>
                          {formatDate(subscription.start_time)} - <Chip label="无时间限制" color="success" size="small" />
                        </>
                      ) : (
                        `${formatDate(subscription.start_time)} - ${formatDate(subscription.end_time)}`
                      )}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      {t('claudeCode.subscription.price')}
                    </Typography>
                    <Typography variant="h6" color="primary">
                      ${subscription.price} {subscription.currency}/月
                    </Typography>
                  </Box>
                </Stack>
              </Grid>

              <Grid item xs={12} md={6}>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {t('claudeCode.subscription.monthlyUsage', {
                        used: subscription.used_requests_this_month,
                        total: subscription.max_requests_per_month
                      })}
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(usagePercentage, 100)}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: 'rgba(0,0,0,0.1)',
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 4,
                          backgroundColor: usagePercentage > 80 ? 'error.main' : 'primary.main'
                        }
                      }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {t('claudeCode.subscription.usagePercentage', { percentage: usagePercentage.toFixed(1) })}
                    </Typography>
                  </Box>

                  {subscription.status === 'active' && (
                    <Button variant="outlined" color="error" size="small" onClick={cancelSubscription} startIcon={<CancelIcon />}>
                      {t('claudeCode.subscription.cancelSubscription')}
                    </Button>
                  )}
                </Stack>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      ) : (
        <Alert severity="info" sx={{ mb: 4 }}>
          {t('claudeCode.subscription.noActiveSubscription')}
        </Alert>
      )}

      {/* API Keys 管理 */}
      {subscription && subscription.status === 'active' && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h5">{t('claudeCode.subscription.apiKeysManagement')}</Typography>
              <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateKeyDialog(true)}>
                {t('claudeCode.subscription.createApiKey')}
              </Button>
            </Box>

            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>{t('claudeCode.subscription.table.name')}</TableCell>
                    <TableCell>{t('claudeCode.subscription.table.status')}</TableCell>
                    <TableCell>{t('claudeCode.subscription.table.usageCount')}</TableCell>
                    <TableCell>{t('claudeCode.subscription.table.lastUsed')}</TableCell>
                    <TableCell>{t('claudeCode.subscription.table.createdTime')}</TableCell>
                    <TableCell align="center">{t('claudeCode.subscription.table.actions')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(apiKeys || []).map((key) => (
                    <TableRow key={key.id}>
                      <TableCell>{key.name}</TableCell>
                      <TableCell>
                        <Chip
                          label={
                            key.status === 1 ? t('claudeCode.subscription.status.active') : t('claudeCode.subscription.status.disabled')
                          }
                          color={key.status === 1 ? 'success' : 'error'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{key.usage_count}</TableCell>
                      <TableCell>{key.last_used_time ? formatDate(key.last_used_time) : t('claudeCode.subscription.neverUsed')}</TableCell>
                      <TableCell>{formatDate(key.created_time)}</TableCell>
                      <TableCell align="center">
                        <Tooltip title={t('common.delete')}>
                          <IconButton size="small" color="error" onClick={() => deleteApiKey(key.id)}>
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!apiKeys || apiKeys.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        <Typography color="text.secondary">{t('claudeCode.subscription.noApiKeys')}</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* 可用套餐 */}
      <Typography variant="h4" gutterBottom sx={{ mt: 4 }}>
        {t('claudeCode.subscription.selectPlan')}
      </Typography>

      <Grid container spacing={3}>
        {(plans || []).map((plan) => (
          <Grid item xs={12} md={4} key={plan.id}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                border: plan.type === 'pro' ? 2 : 1,
                borderColor: plan.type === 'pro' ? 'primary.main' : 'divider',
                position: 'relative',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: (theme) => theme.shadows[8]
                }
              }}
            >
              {plan.type === 'pro' && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: -10,
                    right: 16,
                    zIndex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: 'primary.main',
                    color: 'primary.contrastText',
                    borderRadius: '12px',
                    px: 1,
                    py: 0.5
                  }}
                >
                  <StarIcon sx={{ fontSize: 16, mr: 0.5 }} />
                  <Typography variant="caption" fontWeight="bold">
                    {t('claudeCode.subscription.recommended')}
                  </Typography>
                </Box>
              )}

              <CardContent sx={{ flexGrow: 1, p: 3 }}>
                <Typography variant="h5" gutterBottom align="center">
                  {plan.name}
                </Typography>
                <Box textAlign="center" mb={2}>
                  <Typography variant="h3" color="primary" component="span">
                    ${plan.price}
                  </Typography>
                  <Typography variant="h6" color="text.secondary" component="span">
                    /{plan.currency}/月
                  </Typography>
                </Box>

                <Typography variant="body2" color="text.secondary" paragraph align="center">
                  {plan.description}
                </Typography>

                <Divider sx={{ my: 2 }} />

                <Stack spacing={1.5}>
                  <Box display="flex" alignItems="center">
                    <CheckCircleIcon color="success" sx={{ fontSize: 20, mr: 1 }} />
                    <Typography variant="body2">
                      {t('claudeCode.subscription.monthlyRequests', { count: plan.max_requests_per_month.toLocaleString() })}
                    </Typography>
                  </Box>

                  <Box display="flex" alignItems="center">
                    <CheckCircleIcon color="success" sx={{ fontSize: 20, mr: 1 }} />
                    <Typography variant="body2">{t('claudeCode.subscription.maxDevices', { count: plan.max_client_count })}</Typography>
                  </Box>

                  <Box display="flex" alignItems="center">
                    <CheckCircleIcon color="success" sx={{ fontSize: 20, mr: 1 }} />
                    <Typography variant="body2">
                      {plan.is_unlimited_time ? <strong>无时间限制</strong> : `${plan.duration_months || 1}个月订阅`}
                    </Typography>
                  </Box>

                  {/* 功能特性 */}
                  {plan.features &&
                    plan.features.Data &&
                    Object.entries(plan.features.Data).map(
                      ([key, value]) =>
                        value === true && (
                          <Box key={key} display="flex" alignItems="center">
                            <CheckCircleIcon color="success" sx={{ fontSize: 20, mr: 1 }} />
                            <Typography variant="body2">{key}</Typography>
                          </Box>
                        )
                    )}
                </Stack>
              </CardContent>

              <Box sx={{ p: 3, pt: 0 }}>
                <Button
                  fullWidth
                  variant={plan.type === 'pro' ? 'contained' : 'outlined'}
                  size="large"
                  disabled={loading || (subscription?.plan_type === plan.type && subscription?.status === 'active')}
                  onClick={() => {
                    setSelectedPlan(plan);
                    setPurchaseDialog(true);
                  }}
                  sx={{
                    py: 1.5,
                    fontSize: '1rem',
                    fontWeight: 600
                  }}
                >
                  {subscription?.plan_type === plan.type && subscription?.status === 'active'
                    ? t('claudeCode.subscription.currentPlan')
                    : t('claudeCode.subscription.selectThisPlan')}
                </Button>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* 创建API Key对话框 */}
      <Dialog open={createKeyDialog} onClose={() => setCreateKeyDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('claudeCode.subscription.createApiKey')}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label={t('claudeCode.subscription.apiKeyName')}
            fullWidth
            variant="outlined"
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            placeholder={t('claudeCode.subscription.apiKeyPlaceholder')}
          />

          {newApiKey && (
            <Alert severity="success" sx={{ mt: 2 }}>
              <Typography variant="body2" gutterBottom>
                <strong>{t('claudeCode.subscription.apiKeyCreatedSuccess')}</strong>
              </Typography>
              <Box
                sx={{
                  backgroundColor: 'rgba(0,0,0,0.05)',
                  p: 1,
                  borderRadius: 1,
                  mt: 1,
                  cursor: 'pointer'
                }}
                onClick={() => copyToClipboard(newApiKey)}
              >
                <Typography variant="code" sx={{ wordBreak: 'break-all' }}>
                  {newApiKey}
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary">
                {t('claudeCode.subscription.clickToCopy')}
              </Typography>
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setCreateKeyDialog(false);
              setNewKeyName('');
              setNewApiKey('');
            }}
          >
            {newApiKey ? t('common.close') : t('common.cancel')}
          </Button>
          {!newApiKey && (
            <Button onClick={createApiKey} variant="contained" disabled={loading}>
              {loading ? <CircularProgress size={20} /> : t('common.create')}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* 购买确认对话框 */}
      <Dialog open={purchaseDialog} onClose={() => setPurchaseDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('claudeCode.subscription.confirmPurchase')}</DialogTitle>
        <DialogContent>
          {selectedPlan && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedPlan.name}
              </Typography>
              <Typography variant="body1" gutterBottom>
                {t('claudeCode.subscription.pricePerMonth', { price: selectedPlan.price, currency: selectedPlan.currency })}
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                {selectedPlan.description}
              </Typography>

              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel>{t('claudeCode.subscription.paymentMethod')}</InputLabel>
                <Select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  label={t('claudeCode.subscription.paymentMethod')}
                >
                  <MenuItem value="stripe">{t('claudeCode.subscription.paymentMethods.stripe')}</MenuItem>
                  <MenuItem value="alipay">{t('claudeCode.subscription.paymentMethods.alipay')}</MenuItem>
                  <MenuItem value="wxpay">{t('claudeCode.subscription.paymentMethods.wxpay')}</MenuItem>
                </Select>
              </FormControl>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPurchaseDialog(false)}>{t('common.cancel')}</Button>
          <Button onClick={purchaseSubscription} variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={20} /> : t('claudeCode.subscription.confirmPurchase')}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ClaudeCodeSubscription;
