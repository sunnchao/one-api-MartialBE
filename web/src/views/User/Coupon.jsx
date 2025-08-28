import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Grid,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Divider,
  Alert,
  Tabs,
  Tab,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Tooltip,
  LinearProgress,
  Badge
} from '@mui/material';
import {
  CardGiftcard as CouponIcon,
  EventAvailable as CheckinIcon,
  AccessTime as TimeIcon,
  MonetizationOn as MoneyIcon,
  LocalOffer as OfferIcon,
  History as HistoryIcon,
  Refresh as RefreshIcon,
  ContentCopy as CopyIcon
} from '@mui/icons-material';
import { API } from 'utils/api';
import { showError, showSuccess, showInfo } from 'utils/common';

// Tab面板组件
function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`user-coupon-tabpanel-${index}`}
      aria-labelledby={`user-coupon-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const UserCoupon = () => {
  const [tabValue, setTabValue] = useState(0);

  // 优惠券相关状态
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);

  // 签到相关状态
  const [checkinData, setCheckinData] = useState({
    records: [],
    consecutive_days: 0,
    has_checked_today: false
  });
  const [checkinLoading, setCheckinLoading] = useState(false);

  // 测试使用相关状态
  const [testDialog, setTestDialog] = useState(false);
  const [testAmount, setTestAmount] = useState(50);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [testResult, setTestResult] = useState(null);

  // 获取用户优惠券列表
  const fetchCoupons = async (status = null) => {
    setLoading(true);
    try {
      const url = status ? `/api/user/coupons?status=${status}` : '/api/user/coupons';
      const res = await API.get(url);
      if (res.data.success) {
        setCoupons(res.data.data || []);
      }
    } catch (error) {
      showError('获取优惠券失败');
    } finally {
      setLoading(false);
    }
  };

  // 获取签到记录
  const fetchCheckinData = async () => {
    try {
      const res = await API.get('/api/user/checkin/list');
      if (res.data.success) {
        setCheckinData(res.data.data);
      }
    } catch (error) {
      showError('获取签到记录失败');
    }
  };

  // 执行签到
  const performCheckin = async () => {
    setCheckinLoading(true);
    try {
      const res = await API.post('/api/user/checkin');
      if (res.data.success) {
        showSuccess(res.data.message);
        // 更新签到数据
        fetchCheckinData();
        // 如果获得了优惠券，刷新优惠券列表
        if (res.data.data.reward_type === 'coupon') {
          fetchCoupons();
        }
      } else {
        showError(res.data.message);
      }
    } catch (error) {
      showError('签到失败');
    } finally {
      setCheckinLoading(false);
    }
  };

  // 测试优惠券使用
  const testCouponUsage = async () => {
    if (!selectedCoupon) return;

    try {
      const res = await API.get(`/api/user/coupons/validate?code=${selectedCoupon.code}&amount=${testAmount}`);
      if (res.data.success) {
        setTestResult(res.data.data);
      } else {
        showError(res.data.message);
        setTestResult(null);
      }
    } catch (error) {
      showError('验证优惠券失败');
      setTestResult(null);
    }
  };

  // 复制优惠券码
  const copyCouponCode = (code) => {
    navigator.clipboard
      .writeText(code)
      .then(() => {
        showSuccess('优惠券码已复制到剪贴板');
      })
      .catch(() => {
        showError('复制失败');
      });
  };

  // 获取优惠券状态标签颜色
  const getCouponStatusColor = (status) => {
    switch (status) {
      case 1:
        return 'success';
      case 2:
        return 'default';
      case 3:
        return 'error';
      default:
        return 'default';
    }
  };

  // 获取优惠券状态文本
  const getCouponStatusText = (status) => {
    switch (status) {
      case 1:
        return '可用';
      case 2:
        return '已使用';
      case 3:
        return '已过期';
      default:
        return '未知';
    }
  };

  // 格式化优惠券描述
  const formatCouponDescription = (coupon) => {
    if (coupon.type === 'percentage') {
      return `${coupon.value}%折扣，满$${coupon.min_amount}可用${coupon.max_discount > 0 ? `，最多减$${coupon.max_discount}` : ''}`;
    } else if (coupon.type === 'fixed') {
      return `减$${coupon.value}，满$${coupon.min_amount}可用`;
    } else if (coupon.type === 'recharge') {
      return `充值满$${coupon.min_amount}额外获得$${coupon.value}额度`;
    }
    return coupon.description || '暂无描述';
  };

  // 获取优惠券类型图标
  const getCouponTypeIcon = (type) => {
    switch (type) {
      case 'percentage':
        return <OfferIcon />;
      case 'fixed':
        return <MoneyIcon />;
      case 'recharge':
        return <CouponIcon />;
      default:
        return <CouponIcon />;
    }
  };

  // 获取签到奖励类型图标
  const getRewardTypeIcon = (type) => {
    switch (type) {
      case 'quota':
        return <MoneyIcon color="primary" />;
      case 'coupon':
        return <CouponIcon color="secondary" />;
      case 'multiplier':
        return <OfferIcon color="success" />;
      default:
        return <CouponIcon />;
    }
  };

  // 判断优惠券是否即将过期（7天内）
  const isExpiringSoon = (expireTime) => {
    const now = Date.now();
    const expire = new Date(expireTime);
    const diffDays = (expire - now) / (1000 * 60 * 60 * 24);
    return diffDays <= 7 && diffDays > 0;
  };

  // 获取过期时间显示
  const getExpireTimeText = (expireTime) => {
    const now = Date.now();
    const expire = new Date(expireTime);
    const diffDays = Math.ceil((expire - now) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return '已过期';
    if (diffDays === 0) return '今天过期';
    if (diffDays === 1) return '明天过期';
    if (diffDays <= 7) return `${diffDays}天后过期`;
    return expire.toLocaleDateString();
  };

  useEffect(() => {
    fetchCoupons();
    fetchCheckinData();
  }, []);

  useEffect(() => {
    if (testDialog && selectedCoupon) {
      testCouponUsage();
    }
  }, [testAmount, selectedCoupon, testDialog]);

  // 统计不同状态的优惠券数量
  const couponStats = {
    available: coupons.filter((c) => c.status === 1).length,
    used: coupons.filter((c) => c.status === 2).length,
    expired: coupons.filter((c) => c.status === 3).length
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h4" gutterBottom>
        我的优惠券
      </Typography>

      {/* 统计卡片 */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <CouponIcon color="success" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" color="success.main">
                {couponStats.available}
              </Typography>
              <Typography color="text.secondary">可用优惠券</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <HistoryIcon color="action" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" color="text.secondary">
                {couponStats.used}
              </Typography>
              <Typography color="text.secondary">已使用</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <TimeIcon color="error" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" color="error.main">
                {couponStats.expired}
              </Typography>
              <Typography color="text.secondary">已过期</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <CheckinIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" color="primary.main">
                {checkinData.consecutive_days}
              </Typography>
              <Typography color="text.secondary">连续签到天数</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab
            label={
              <Badge badgeContent={couponStats.available} color="primary">
                可用优惠券
              </Badge>
            }
          />
          <Tab label="签到中心" />
          <Tab label="使用记录" />
        </Tabs>
      </Box>

      {/* 可用优惠券 */}
      <TabPanel value={tabValue} index={0}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">我的优惠券</Typography>
          <Button startIcon={<RefreshIcon />} onClick={() => fetchCoupons()} disabled={loading}>
            刷新
          </Button>
        </Box>

        {loading ? (
          <LinearProgress />
        ) : coupons.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <CouponIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              暂无优惠券
            </Typography>
            <Typography color="text.secondary">完成签到或参与活动可获得优惠券</Typography>
          </Paper>
        ) : (
          <Grid container spacing={2}>
            {coupons.map((coupon) => (
              <Grid item xs={12} sm={6} md={4} key={coupon.id}>
                <Card
                  sx={{
                    height: '100%',
                    position: 'relative',
                    border: coupon.status === 1 ? 2 : 1,
                    borderColor: coupon.status === 1 ? 'primary.main' : 'divider',
                    opacity: coupon.status === 1 ? 1 : 0.7
                  }}
                >
                  {isExpiringSoon(coupon.expire_time) && coupon.status === 1 && (
                    <Chip label="即将过期" color="warning" size="small" sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }} />
                  )}

                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                      <Box sx={{ mr: 2 }}>{getCouponTypeIcon(coupon.type)}</Box>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" component="div" gutterBottom>
                          {coupon.name}
                        </Typography>
                        <Chip label={getCouponStatusText(coupon.status)} color={getCouponStatusColor(coupon.status)} size="small" />
                      </Box>
                    </Box>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {formatCouponDescription(coupon)}
                    </Typography>

                    <Box
                      sx={{
                        p: 1,
                        bgcolor: 'grey.100',
                        borderRadius: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        mb: 2
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        {coupon.code}
                      </Typography>
                      <Tooltip title="复制优惠券码">
                        <IconButton size="small" onClick={() => copyCouponCode(coupon.code)}>
                          <CopyIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="caption" color="text.secondary">
                        <TimeIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                        {getExpireTimeText(coupon.expire_time)}
                      </Typography>

                      {coupon.status === 1 && (
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => {
                            setSelectedCoupon(coupon);
                            setTestDialog(true);
                          }}
                        >
                          测试使用
                        </Button>
                      )}
                    </Box>

                    {coupon.status === 2 && (
                      <Box sx={{ mt: 2, p: 1, bgcolor: 'success.light', borderRadius: 1 }}>
                        <Typography variant="caption" color="success.contrastText">
                          已使用 • 节省了 ${coupon.saved_amount}
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </TabPanel>

      {/* 签到中心 */}
      <TabPanel value={tabValue} index={1}>
        <Box sx={{ mb: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">每日签到</Typography>
                <Button
                  variant="contained"
                  startIcon={<CheckinIcon />}
                  onClick={performCheckin}
                  disabled={checkinLoading || checkinData.has_checked_today}
                >
                  {checkinData.has_checked_today ? '今日已签到' : '立即签到'}
                </Button>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'primary.light', borderRadius: 1 }}>
                    <Typography variant="h3" color="primary.contrastText">
                      {checkinData.consecutive_days}
                    </Typography>
                    <Typography color="primary.contrastText">连续签到天数</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'secondary.light', borderRadius: 1 }}>
                    <Typography variant="h3" color="secondary.contrastText">
                      {checkinData.records.length}
                    </Typography>
                    <Typography color="secondary.contrastText">总签到次数</Typography>
                  </Box>
                </Grid>
              </Grid>

              {checkinData.has_checked_today && (
                <Alert severity="success" sx={{ mt: 2 }}>
                  今日已完成签到！明天再来吧～
                </Alert>
              )}
            </CardContent>
          </Card>
        </Box>

        {/* 签到记录 */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              最近签到记录
            </Typography>
            {checkinData.records.length === 0 ? (
              <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                暂无签到记录
              </Typography>
            ) : (
              <List>
                {checkinData.records.slice(0, 10).map((record, index) => (
                  <React.Fragment key={record.id}>
                    <ListItem>
                      <ListItemIcon>{getRewardTypeIcon(record.reward_type)}</ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body1">第{record.day}天签到</Typography>
                            <Chip
                              label={record.reward_type === 'quota' ? '额度奖励' : record.reward_type === 'coupon' ? '优惠券' : '倍率奖励'}
                              size="small"
                              variant="outlined"
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {record.description}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(record.created_time).toLocaleString()}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < checkinData.records.slice(0, 10).length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            )}
          </CardContent>
        </Card>
      </TabPanel>

      {/* 使用记录 */}
      <TabPanel value={tabValue} index={2}>
        <Typography variant="h6" gutterBottom>
          优惠券使用记录
        </Typography>

        {coupons.filter((c) => c.status === 2).length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <HistoryIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              暂无使用记录
            </Typography>
            <Typography color="text.secondary">使用优惠券后记录会在这里显示</Typography>
          </Paper>
        ) : (
          <Grid container spacing={2}>
            {coupons
              .filter((c) => c.status === 2)
              .map((coupon) => (
                <Grid item xs={12} key={coupon.id}>
                  <Card variant="outlined">
                    <CardContent>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={3}>
                          <Typography variant="subtitle1">{coupon.name}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {coupon.code}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={3}>
                          <Typography variant="body2" color="text.secondary">
                            订单金额: ${coupon.used_amount}
                          </Typography>
                          <Typography variant="body2" color="success.main">
                            节省: ${coupon.saved_amount}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={3}>
                          <Typography variant="body2" color="text.secondary">
                            订单号: {coupon.order_id}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={3}>
                          <Typography variant="body2" color="text.secondary">
                            使用时间: {new Date(coupon.used_time).toLocaleString()}
                          </Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
          </Grid>
        )}
      </TabPanel>

      {/* 测试使用对话框 */}
      <Dialog open={testDialog} onClose={() => setTestDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>测试优惠券使用</DialogTitle>
        <DialogContent>
          {selectedCoupon && (
            <>
              <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="subtitle1" gutterBottom>
                  {selectedCoupon.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {formatCouponDescription(selectedCoupon)}
                </Typography>
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  优惠券码: {selectedCoupon.code}
                </Typography>
              </Box>

              <TextField
                fullWidth
                label="测试金额"
                type="number"
                value={testAmount}
                onChange={(e) => setTestAmount(parseFloat(e.target.value) || 0)}
                InputProps={{
                  startAdornment: '$'
                }}
                sx={{ mb: 2 }}
              />

              {testResult && (
                <Box sx={{ p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
                  <Typography variant="body2" gutterBottom>
                    <strong>优惠计算结果：</strong>
                  </Typography>
                  <Typography variant="body2">原价：${testAmount.toFixed(2)}</Typography>
                  <Typography variant="body2" color="success.main">
                    优惠：-${testResult.discount_amount.toFixed(2)}
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="h6" color="primary">
                    应付：${testResult.final_amount.toFixed(2)}
                  </Typography>
                </Box>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTestDialog(false)}>关闭</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserCoupon;
