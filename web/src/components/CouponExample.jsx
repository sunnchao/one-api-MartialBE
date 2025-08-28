import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Button,
  TextField,
  Typography,
  Box,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemText,
  Divider,
  Alert,
  Grid
} from '@mui/material';
import { API } from 'utils/api';
import { showError, showSuccess } from 'utils/common';

// 优惠券使用组件示例
const CouponExample = () => {
  const [coupons, setCoupons] = useState([]);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [orderAmount, setOrderAmount] = useState(50);
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [finalAmount, setFinalAmount] = useState(50);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [checkinData, setCheckinData] = useState(null);

  // 获取用户优惠券列表
  const fetchCoupons = async () => {
    try {
      const res = await API.get('/api/user/coupons?status=1');
      if (res.data.success) {
        setCoupons(res.data.data);
      }
    } catch (error) {
      showError('获取优惠券失败');
    }
  };

  // 验证优惠券
  const validateCoupon = async (code, amount) => {
    try {
      const res = await API.get(`/api/user/coupons/validate?code=${code}&amount=${amount}`);
      if (res.data.success) {
        const { discount_amount, final_amount } = res.data.data;
        setDiscount(discount_amount);
        setFinalAmount(final_amount);
        return true;
      } else {
        showError(res.data.message);
        return false;
      }
    } catch (error) {
      showError('验证优惠券失败');
      return false;
    }
  };

  // 应用优惠券
  const applyCoupon = async () => {
    if (!couponCode) {
      showError('请输入优惠券码');
      return;
    }
    await validateCoupon(couponCode, orderAmount);
  };

  // 选择优惠券
  const selectCoupon = async (coupon) => {
    setCouponCode(coupon.code);
    const isValid = await validateCoupon(coupon.code, orderAmount);
    if (isValid) {
      setSelectedCoupon(coupon);
      setDialogOpen(false);
    }
  };

  // 用户签到
  const performCheckin = async () => {
    try {
      const res = await API.post('/api/user/checkin');
      if (res.data.success) {
        setCheckinData(res.data.data);
        showSuccess(res.data.message);
        // 如果获得了优惠券，刷新优惠券列表
        if (res.data.data.reward_type === 'coupon') {
          fetchCoupons();
        }
      } else {
        showError(res.data.message);
      }
    } catch (error) {
      showError('签到失败');
    }
  };

  // 重置订单金额时重新计算
  useEffect(() => {
    if (couponCode && orderAmount) {
      validateCoupon(couponCode, orderAmount);
    } else {
      setDiscount(0);
      setFinalAmount(orderAmount);
    }
  }, [orderAmount]);

  useEffect(() => {
    fetchCoupons();
  }, []);

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

  return (
    <Box sx={{ maxWidth: 800, margin: 'auto', p: 2 }}>
      <Typography variant="h4" gutterBottom>
        优惠券系统演示
      </Typography>

      {/* 签到区域 */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            每日签到
          </Typography>
          <Button variant="contained" onClick={performCheckin} sx={{ mr: 2 }}>
            立即签到
          </Button>
          {checkinData && (
            <Alert severity="success" sx={{ mt: 2 }}>
              连续签到 {checkinData.consecutive_days} 天！{checkinData.description}
              {checkinData.coupon_code && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  优惠券码：{checkinData.coupon_code}
                </Typography>
              )}
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* 充值订单区域 */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            模拟充值订单
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
              <TextField
                label="充值金额"
                type="number"
                value={orderAmount}
                onChange={(e) => setOrderAmount(parseFloat(e.target.value) || 0)}
                fullWidth
                InputProps={{
                  startAdornment: '$'
                }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="优惠券码"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                fullWidth
                placeholder="XXXX-XXXX-XXXX"
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <Button variant="outlined" onClick={applyCoupon} fullWidth>
                应用优惠券
              </Button>
            </Grid>
            <Grid item xs={12} sm={2}>
              <Button variant="outlined" onClick={() => setDialogOpen(true)} fullWidth>
                选择优惠券
              </Button>
            </Grid>
          </Grid>

          {/* 订单金额计算 */}
          <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
            <Typography variant="body1">原价：${orderAmount.toFixed(2)}</Typography>
            {discount > 0 && (
              <Typography variant="body1" color="success.main">
                优惠：-${discount.toFixed(2)}
              </Typography>
            )}
            <Divider sx={{ my: 1 }} />
            <Typography variant="h6" color="primary">
              应付：${finalAmount.toFixed(2)}
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* 我的优惠券列表 */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            我的优惠券
          </Typography>
          {coupons.length === 0 ? (
            <Typography color="text.secondary">暂无可用优惠券</Typography>
          ) : (
            <Grid container spacing={2}>
              {coupons.map((coupon) => (
                <Grid item xs={12} sm={6} md={4} key={coupon.id}>
                  <Card
                    variant="outlined"
                    sx={{
                      cursor: 'pointer',
                      border: selectedCoupon?.id === coupon.id ? 2 : 1,
                      borderColor: selectedCoupon?.id === coupon.id ? 'primary.main' : 'divider'
                    }}
                    onClick={() => selectCoupon(coupon)}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Typography variant="subtitle1" component="div">
                          {coupon.name}
                        </Typography>
                        <Chip label={getCouponStatusText(coupon.status)} color={getCouponStatusColor(coupon.status)} size="small" />
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {formatCouponDescription(coupon)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        码：{coupon.code}
                      </Typography>
                      <br />
                      <Typography variant="caption" color="text.secondary">
                        过期时间：{new Date(coupon.expire_time).toLocaleDateString()}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </CardContent>
      </Card>

      {/* 优惠券选择对话框 */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>选择优惠券</DialogTitle>
        <DialogContent>
          <List>
            {coupons.map((coupon) => (
              <React.Fragment key={coupon.id}>
                <ListItem button onClick={() => selectCoupon(coupon)} disabled={coupon.status !== 1 || orderAmount < coupon.min_amount}>
                  <ListItemText
                    primary={coupon.name}
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {formatCouponDescription(coupon)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {coupon.code} | 过期：{new Date(coupon.expire_time).toLocaleDateString()}
                        </Typography>
                        {orderAmount < coupon.min_amount && (
                          <Typography variant="caption" color="error">
                            订单金额不足，需要至少${coupon.min_amount}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                  <Chip label={getCouponStatusText(coupon.status)} color={getCouponStatusColor(coupon.status)} size="small" />
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default CouponExample;
