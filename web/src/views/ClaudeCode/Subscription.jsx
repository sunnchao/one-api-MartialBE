import React, { useState, useEffect, useMemo } from 'react';
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
  MenuItem,
  Tabs,
  Tab
} from '@mui/material';
import {
  Star as StarIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  Cancel as CancelIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Storefront as StorefrontIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
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

const PackagesSubscription = () => {
  const { t } = useTranslation();
  const account = useSelector((state) => state.account);
  const siteInfo = useSelector((state) => state.siteInfo);
  const quotaPerUnit = Number(siteInfo?.quota_per_unit) || 500000;
  const balanceQuota = account?.user?.quota || 0;
  const [subscriptions, setSubscriptions] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [purchaseDialog, setPurchaseDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('balance');
  const [activeTab, setActiveTab] = useState(1);
  const [cancelDialog, setCancelDialog] = useState(false);
  const [cancelingSubscription, setCancelingSubscription] = useState(null);
  const [showPlans, setShowPlans] = useState(false);
  const selectedPlanDuration = selectedPlan ? resolvePlanDuration(selectedPlan) : null;
  const formatQuotaCount = (value) => {
    if (typeof value !== 'number' || Number.isNaN(value)) {
      return '0';
    }
    return Math.max(value, 0).toLocaleString();
  };
  const formatQuotaLimit = (value) => {
    if (!value || value <= 0) {
      return '不限';
    }
    return renderQuota(value, 6);
  };
  const formatQuotaUsed = (value) => renderQuota(value || 0, 6);
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

  // 获取用户订阅
  const fetchSubscriptions = async () => {
    try {
      const res = await API.get('/api/user/packages/subscriptions');
      if (res.data.success) {
        setSubscriptions(res.data.data || []);
      } else {
        setSubscriptions([]);
      }
    } catch (error) {
      console.error('获取订阅信息失败:', error);
      setSubscriptions([]);
    }
  };

  // 获取可用套餐
  const fetchPlans = async () => {
    try {
      const res = await API.get('/api/user/packages/plans');
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

  // 购买订阅
  const purchaseSubscription = async () => {
    if (!selectedPlan) return;
    if (paymentMethod === 'balance' && balanceCost > balanceQuota) {
      showError('余额不足，请先充值');
      return;
    }

    setLoading(true);
    try {
      const res = await API.post('/api/user/packages/purchase', {
        plan_type: selectedPlan.type,
        payment_method: paymentMethod,
        hash_id: selectedPlan.hash_id
      });

      if (res.data.success) {
        if (paymentMethod === 'balance') {
          showSuccess(res.data.message || '订阅已激活');
          setPurchaseDialog(false);
          fetchSubscriptions();
          return;
        }
        showSuccess('订单创建成功！正在跳转到支付页面...');
        if (res.data.payment_url) {
          window.open(res.data.payment_url, '_blank');
        }
        setPurchaseDialog(false);
        setTimeout(() => {
          fetchSubscriptions();
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

  // 打开取消订阅弹框
  const openCancelDialog = (subscription) => {
    setCancelingSubscription(subscription);
    setCancelDialog(true);
  };

  // 取消订阅
  const cancelSubscription = async () => {
    if (!cancelingSubscription) return;

    try {
      const res = await API.post('/api/user/packages/cancel', {
        plan_type: cancelingSubscription.service_type,
        hash_id: cancelingSubscription.hash_id
      });
      if (res.data.success) {
        showSuccess(t('packages.subscription.cancelSuccess'));
        fetchSubscriptions();
        setCancelDialog(false);
        setCancelingSubscription(null);
      } else {
        showError(res.data.message);
      }
    } catch (error) {
      showError(t('packages.subscription.cancelFailed'));
    }
  };

  // 复制API Key到剪贴板
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      showSuccess('已复制到剪贴板');
    });
  };

  useEffect(() => {
    fetchSubscriptions();
    fetchPlans();
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
      case 'exhausted':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active':
        return t('packages.subscription.status.active');
      case 'expired':
        return t('packages.subscription.status.expired');
      case 'cancelled':
        return t('packages.subscription.status.cancelled');
      case 'pending':
        return t('packages.subscription.status.pending');
      case 'exhausted':
        return t('packages.subscription.status.exhausted');
      default:
        return t('packages.subscription.status.unknown');
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
      case 'exhausted':
        return <WarningIcon />;
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

  // 计算单个订阅的使用情况
  const getSubscriptionUsage = (subscription) => {
    const totalQuota = subscription.total_quota ?? subscription.max_requests_per_month ?? 0;
    const fallbackUsedQuota =
      typeof subscription.total_quota === 'number' && typeof subscription.remain_quota === 'number'
        ? subscription.total_quota - subscription.remain_quota
        : subscription.used_requests_this_month ?? 0;
    const usedQuota = subscription.used_quota ?? fallbackUsedQuota;
    const normalizedTotalQuota = typeof totalQuota === 'number' && totalQuota > 0 ? totalQuota : 0;
    const normalizedUsedQuota = typeof usedQuota === 'number' && usedQuota > 0 ? Math.min(usedQuota, normalizedTotalQuota || usedQuota) : 0;
    const usagePercentage = normalizedTotalQuota > 0 ? (normalizedUsedQuota / normalizedTotalQuota) * 100 : 0;
    return { totalQuota: normalizedTotalQuota, usedQuota: normalizedUsedQuota, usagePercentage };
  };

  // 根据 Tab 过滤订阅
  const filteredSubscriptions = useMemo(() => {
    switch (activeTab) {
      case 0: // 全部
        return subscriptions;
      case 1: // 活跃
        return subscriptions.filter((sub) => sub.status === 'active');
      case 2: // 已取消
        return subscriptions.filter((sub) => sub.status === 'cancelled');
      case 3: // 未激活 (expired, pending, exhausted, 其他)
        return subscriptions.filter(
          (sub) => ['expired', 'pending', 'exhausted'].includes(sub.status) || !['active', 'cancelled'].includes(sub.status)
        );
      default:
        return subscriptions;
    }
  }, [subscriptions, activeTab]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Container>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
        <Typography variant="h2" gutterBottom>
          {t('packages.subscription.title')}
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={showPlans ? <ExpandLessIcon /> : <StorefrontIcon />}
            onClick={() => setShowPlans(!showPlans)}
          >
            {t('packages.menu.viewPlans')}
          </Button>
        </Stack>
      </Stack>

      {/* Tab 菜单 */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label={t('packages.subscription.tabs.all')} />
          <Tab label={t('packages.subscription.tabs.active')} />
          <Tab label={t('packages.subscription.tabs.cancelled')} />
          <Tab label={t('packages.subscription.tabs.other')} />
        </Tabs>
      </Box>

      {/* 订阅列表 */}
      {filteredSubscriptions.length > 0 ? (
        <Grid container spacing={3}>
          {filteredSubscriptions.map((subscription) => {
            const usage = getSubscriptionUsage(subscription);
            return (
              <Grid item xs={12} md={6} key={subscription.id}>
                <Card>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      <Typography variant="h6">{subscription.service_type}</Typography>
                      <Stack direction="row" spacing={1} alignItems="center">
                        {getStatusIcon(subscription.status)}
                        <Chip label={getStatusText(subscription.status)} color={getStatusColor(subscription.status)} size="small" />
                      </Stack>
                    </Box>

                    <Stack spacing={2}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {t('packages.subscription.subscriptionPeriod')}
                        </Typography>
                        <Typography variant="body2">
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
                          {t('packages.subscription.price')}
                        </Typography>
                        <Typography variant="body1" color="primary">
                          ${subscription.price} {subscription.currency}/月
                        </Typography>
                      </Box>

                      <Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {t('packages.subscription.quotaDisplay.total', { count: renderQuota(usage.totalQuota, 6) })}
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min(usage.usagePercentage, 100)}
                          sx={{
                            height: 6,
                            borderRadius: 3,
                            backgroundColor: 'rgba(0,0,0,0.1)',
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 3,
                              backgroundColor: usage.usagePercentage > 80 ? 'error.main' : 'primary.main'
                            }
                          }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {t('packages.subscription.usagePercentage', { percentage: usage.usagePercentage.toFixed(1) })}
                        </Typography>
                      </Box>

                      {subscription.status === 'active' && (
                      <Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          订阅限额
                        </Typography>
                        <Stack spacing={0.5}>
                          <Typography variant="caption">
                            日限额: {formatQuotaUsed(subscription.daily_quota_used)} / {formatQuotaLimit(subscription.daily_quota_limit)}
                          </Typography>
                          <Typography variant="caption">
                            周限额: {formatQuotaUsed(subscription.weekly_quota_used)} / {formatQuotaLimit(subscription.weekly_quota_limit)}
                          </Typography>
                          <Typography variant="caption">
                            月限额: {formatQuotaUsed(subscription.monthly_quota_used)} / {formatQuotaLimit(subscription.monthly_quota_limit)}
                          </Typography>
                        </Stack>
                      </Box>
                      )}

                      {subscription.package_plan.description && (
                        <Typography variant="caption" color="text.secondary">
                          {subscription.package_plan.description}
                        </Typography>
                      )}

                      {subscription.status === 'active' && (
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          disabled={subscription.payment_method === 'balance'}
                          onClick={() => openCancelDialog(subscription)}
                          startIcon={<CancelIcon />}
                        >
                          {t('packages.subscription.cancelSubscription')}
                        </Button>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      ) : (
        <Alert severity="info" sx={{ mb: 4 }}>
          {subscriptions.length === 0
            ? [0, 1].includes(activeTab)
              ? t('packages.subscription.noActiveSubscription')
              : t('packages.subscription.noPackages')
            : t('common.noData')}
        </Alert>
      )}

      {/* 可用套餐 */}
      {showPlans && (
        <>
          <Typography variant="h4" gutterBottom sx={{ mt: 4 }}>
            {t('packages.subscription.selectPlan')}
          </Typography>
          <Alert severity="info" sx={{ mb: 3 }}>
            {t('packages.menu.planDescription')}
          </Alert>

          <Grid container spacing={3}>
            {(plans || [])
              .filter((plan) => plan.show_in_portal !== false && plan.is_active)
              .map((plan) => {
                const durationInfo = resolvePlanDuration(plan);
                const planQuotaDescription = plan.is_unlimited_time
                  ? t('packages.subscription.quotaDisplay.unlimited', { count: renderQuota(getPlanQuotaValue(plan), 6) })
                  : t('packages.subscription.quotaDisplay.perDuration', {
                      duration: getQuotaDurationText(plan) || durationInfo.text,
                      count: renderQuota(getPlanQuotaValue(plan), 6)
                    });
                const planDailyLimit = formatQuotaLimit(plan.daily_quota_per_plan);
                const planWeeklyLimit = formatQuotaLimit(plan.weekly_quota_per_plan);
                const planMonthlyLimit = formatQuotaLimit(plan.monthly_quota_per_plan);
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
                            {t('packages.subscription.recommended')}
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
                              日/周/月限额: {planDailyLimit} / {planWeeklyLimit} / {planMonthlyLimit}
                            </Typography>
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
                          disabled={loading}
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
                          {t('packages.subscription.selectThisPlan')}
                        </Button>
                      </Box>
                    </Card>
                  </Grid>
                );
              })}
          </Grid>
        </>
      )}

      {/* 购买确认对话框 */}
      <Dialog open={purchaseDialog} onClose={() => setPurchaseDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('packages.subscription.confirmPurchase')}</DialogTitle>
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
                <InputLabel>{t('packages.subscription.paymentMethod')}</InputLabel>
                <Select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  label={t('packages.subscription.paymentMethod')}
                >
                  <MenuItem value="balance">{t('packages.subscription.paymentMethods.balance')}</MenuItem>
                  {/*<MenuItem value="stripe">{t('packages.subscription.paymentMethods.stripe')}</MenuItem>*/}
                  {/*<MenuItem value="alipay">{t('packages.subscription.paymentMethods.alipay')}</MenuItem>*/}
                  {/*<MenuItem value="wxpay">{t('packages.subscription.paymentMethods.wxpay')}</MenuItem>*/}
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
            {loading ? <CircularProgress size={20} /> : t('packages.subscription.confirmPurchase')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 取消订阅确认弹框 */}
      <Dialog open={cancelDialog} onClose={() => setCancelDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('packages.subscription.cancelSubscription')}</DialogTitle>
        <DialogContent>
          <Typography sx={{ mt: 2 }}>{t('packages.subscription.cancelConfirmMessage')}</Typography>
          {cancelingSubscription && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary">
                {t('packages.subscription.serviceType')}: {cancelingSubscription.service_type}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialog(false)}>{t('common.cancel')}</Button>
          <Button onClick={cancelSubscription} variant="contained" color="error">
            {t('packages.subscription.confirmCancel')}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default PackagesSubscription;
