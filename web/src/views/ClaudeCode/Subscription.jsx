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
  Add as AddIcon,
  Refresh as RefreshIcon,
  Cancel as CancelIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { API } from 'utils/api';
import { renderQuota, showError, showSuccess } from 'utils/common';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

const durationDisplayMap = {
  day: { label: '天', short: '天' },
  week: { label: '周', short: '周' },
  month: { label: '月', short: '月' },
  quarter: { label: '季度', short: '季度' }
};

const durationUnitTextMap = {
  day: '天',
  week: '周',
  month: '月',
  quarter: '季度'
};

const resolvePlanDuration = (plan) => {
  const unit = plan?.duration_unit || 'month';
  const value = plan?.duration_value || plan?.duration_months || 1;
  const display = durationDisplayMap[unit] || durationDisplayMap.month;
  const safeValue = value > 0 ? value : 1;
  return {
    unit,
    text: `${safeValue}${display.label}`,
    short: display.short
  };
};

const getQuotaDurationText = (plan) => {
  if (!plan) return '';
  const unit = plan.duration_unit || 'month';
  const value = plan.duration_value || plan.duration_months || 1;
  const unitLabel = durationUnitTextMap[unit] || durationUnitTextMap.month;
  if (value <= 1) {
    return unitLabel;
  }
  return `${value}${unitLabel}`;
};

const ClaudeCodeSubscription = () => {
  const { t } = useTranslation();
  const account = useSelector((state) => state.account);
  const siteInfo = useSelector((state) => state.siteInfo);
  const quotaPerUnit = Number(siteInfo?.quota_per_unit) || 500000;
  const balanceQuota = account?.user?.quota || 0;
  const [subscription, setSubscription] = useState(null);
  const [plans, setPlans] = useState([]);
  const [apiKeys, setApiKeys] = useState([]);
  const [loading, setLoading] = useState(false);
  const [createKeyDialog, setCreateKeyDialog] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [purchaseDialog, setPurchaseDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('balance');
  const [newApiKey, setNewApiKey] = useState('');
  const selectedPlanDuration = selectedPlan ? resolvePlanDuration(selectedPlan) : null;
  const currentPlan = subscription ? plans.find((plan) => plan.type === subscription.plan_type) : null;
  const currentPlanDuration = currentPlan ? resolvePlanDuration(currentPlan) : null;
  const formatQuotaCount = (value) => {
    if (typeof value !== 'number' || Number.isNaN(value)) {
      return '0';
    }
    return Math.max(value, 0).toLocaleString();
  };
  const getPlanQuotaValue = (plan) => {
    if (!plan) return 0;
    const quota = plan.total_quota ?? plan.max_requests_per_month ?? 0;
    if (typeof quota !== 'number' || Number.isNaN(quota)) {
      return 0;
    }
    return Math.max(quota, 0);
  };
  const calculateBalanceCost = (plan) => {
    if (!plan) return 0;
    return Math.max(0, Math.round((plan.price || 0) * quotaPerUnit));
  };
  const balanceCost = calculateBalanceCost(selectedPlan);
  const hasEnoughBalance = paymentMethod !== 'balance' || balanceQuota >= balanceCost;

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

  // 购买订阅
  const purchaseSubscription = async () => {
    if (!selectedPlan) return;
    if (paymentMethod === 'balance' && balanceCost > balanceQuota) {
      showError('余额不足，请先充值');
      return;
    }

    setLoading(true);
    try {
      const res = await API.post('/api/user/claude-code/purchase', {
        plan_type: selectedPlan.type,
        payment_method: paymentMethod
      });

      if (res.data.success) {
        if (paymentMethod === 'balance') {
          showSuccess(res.data.message || '订阅已激活');
          setPurchaseDialog(false);
          fetchSubscription();
          return;
        }
        showSuccess('订单创建成功！正在跳转到支付页面...');
        if (res.data.payment_url) {
          window.open(res.data.payment_url, '_blank');
        }
        setPurchaseDialog(false);
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

  const totalQuota = subscription ? subscription.total_quota ?? subscription.max_requests_per_month ?? 0 : 0;
  const fallbackUsedQuota =
    subscription && typeof subscription?.total_quota === 'number' && typeof subscription?.remain_quota === 'number'
      ? subscription.total_quota - subscription.remain_quota
      : subscription?.used_requests_this_month ?? 0;
  const usedQuota = subscription ? subscription.used_quota ?? fallbackUsedQuota : fallbackUsedQuota;
  const normalizedTotalQuota =
    typeof totalQuota === 'number' && totalQuota > 0
      ? totalQuota
      : currentPlan
        ? getPlanQuotaValue(currentPlan)
        : 0;
  const normalizedUsedQuota =
    typeof usedQuota === 'number' && usedQuota > 0
      ? Math.min(usedQuota, normalizedTotalQuota || usedQuota)
      : 0;
  const usagePercentage = normalizedTotalQuota > 0 ? (normalizedUsedQuota / normalizedTotalQuota) * 100 : 0;
  const isUnlimitedSubscription = Boolean(subscription?.is_unlimited_time ?? currentPlan?.is_unlimited_time);
  const subscriptionQuotaDescription = (() => {
    if (!subscription && !currentPlan) {
      return '';
    }
    const quotaCountDisplay = formatQuotaCount(normalizedTotalQuota);
    if (isUnlimitedSubscription) {
      return t('claudeCode.subscription.quotaDisplay.unlimited', { count: quotaCountDisplay });
    }
    if (currentPlan) {
      const durationText = getQuotaDurationText(currentPlan) || currentPlanDuration?.text || durationDisplayMap.month.label;
      return t('claudeCode.subscription.quotaDisplay.perDuration', {
        duration: durationText,
        count: quotaCountDisplay
      });
    }
    return t('claudeCode.subscription.quotaDisplay.total', { count: quotaCountDisplay });
  })();

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={4}>
        <Typography variant="h2" gutterBottom>
          {t('claudeCode.subscription.title')}
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => {
              fetchSubscription();
              fetchApiKeys();
            }}
          >
            {t('common.refresh')}
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateKeyDialog(true)}
            disabled={!subscription || subscription.status !== 'active'}
          >
            {t('claudeCode.subscription.createApiKey')}
          </Button>
        </Stack>
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
                    {subscriptionQuotaDescription && (
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {subscriptionQuotaDescription}
                      </Typography>
                    )}
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

      {/* 可用套餐 */}
      <Typography variant="h4" gutterBottom sx={{ mt: 4 }}>
        {t('claudeCode.subscription.selectPlan')}
      </Typography>
      <Alert severity="info" sx={{ mb: 3 }}>
        管理员统一配置以下套餐，可直接使用账户余额或在线支付购买。
      </Alert>

      <Grid container spacing={3}>
        {(plans || [])
          .filter((plan) => plan.show_in_portal !== false)
          .map((plan) => {
          const durationInfo = resolvePlanDuration(plan);
          const planQuotaDescription = plan.is_unlimited_time
            ? t('claudeCode.subscription.quotaDisplay.unlimited', { count: formatQuotaCount(getPlanQuotaValue(plan)) })
            : t('claudeCode.subscription.quotaDisplay.perDuration', {
              duration: getQuotaDurationText(plan) || durationInfo.text,
              count: formatQuotaCount(getPlanQuotaValue(plan))
            });
          return (
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
                      /{plan.currency}/{plan.is_unlimited_time ? '永久' : durationInfo.short}
                    </Typography>
                  </Box>

                  <Typography variant="body2" color="text.secondary" paragraph align="center">
                    {plan.description}
                  </Typography>

                  <Divider sx={{ my: 2 }} />

                  <Stack spacing={1.5}>
                    <Box display="flex" alignItems="center">
                      <CheckCircleIcon color="success" sx={{ fontSize: 20, mr: 1 }} />
                      <Typography variant="body2">{planQuotaDescription}</Typography>
                    </Box>

                    <Box display="flex" alignItems="center">
                      <CheckCircleIcon color="success" sx={{ fontSize: 20, mr: 1 }} />
                      <Typography variant="body2">
                        {plan.is_unlimited_time ? <strong>无时间限制</strong> : `${durationInfo.text}订阅`}
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
          );
          })}
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

          <Divider sx={{ my: 3 }} />
          <Stack spacing={1.5}>
            <Typography variant="subtitle2">{t('claudeCode.subscription.apiKeysManagement')}</Typography>
            {apiKeys.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                {t('claudeCode.subscription.noApiKeys')}
              </Typography>
            ) : (
              apiKeys.map((key) => (
                <Stack key={key.id} direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
                  <Box>
                    <Typography variant="body2">{key.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {key.last_used_time ? formatDate(key.last_used_time) : t('claudeCode.subscription.neverUsed')}
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1}>
                    <Chip
                      label={
                        key.status === 1
                          ? t('claudeCode.subscription.status.active')
                          : t('claudeCode.subscription.status.disabled')
                      }
                      size="small"
                      color={key.status === 1 ? 'success' : 'default'}
                      variant="outlined"
                    />
                    <Button size="small" color="error" onClick={() => deleteApiKey(key.id)}>
                      {t('common.delete')}
                    </Button>
                  </Stack>
                </Stack>
              ))
            )}
          </Stack>
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
                价格：${selectedPlan.price} {selectedPlan.currency}/{selectedPlan.is_unlimited_time ? '永久' : selectedPlanDuration?.short}
              </Typography>
              {!selectedPlan.is_unlimited_time && (
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  订阅周期：{selectedPlanDuration?.text}
                </Typography>
              )}
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
                  <MenuItem value="balance">{t('claudeCode.subscription.paymentMethods.balance')}</MenuItem>
                  <MenuItem value="stripe">{t('claudeCode.subscription.paymentMethods.stripe')}</MenuItem>
                  <MenuItem value="alipay">{t('claudeCode.subscription.paymentMethods.alipay')}</MenuItem>
                  <MenuItem value="wxpay">{t('claudeCode.subscription.paymentMethods.wxpay')}</MenuItem>
                </Select>
              </FormControl>

              {paymentMethod === 'balance' && selectedPlan && (
                <Alert severity={hasEnoughBalance ? 'info' : 'warning'} sx={{ mt: 2 }}>
                  {hasEnoughBalance
                    ? `本次将扣除 ${renderQuota(balanceCost, 6)} (约 $${selectedPlan.price})，当前余额 ${renderQuota(balanceQuota, 6)}`
                    : `余额不足，需 ${renderQuota(balanceCost, 6)}，当前余额 ${renderQuota(balanceQuota, 6)}`}
                </Alert>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPurchaseDialog(false)}>{t('common.cancel')}</Button>
          <Button onClick={purchaseSubscription} variant="contained" disabled={loading || !hasEnoughBalance}>
            {loading ? <CircularProgress size={20} /> : t('claudeCode.subscription.confirmPurchase')}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ClaudeCodeSubscription;
