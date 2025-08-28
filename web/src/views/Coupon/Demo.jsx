import React, { useState } from 'react';
import { Box, Typography, Grid, Card, CardContent, Button, TextField, Alert, Tabs, Tab, Paper } from '@mui/material';
import { CouponCard, CouponStats, calculateDiscount, formatCouponCodeInput, validateCouponCode } from 'components/CouponUtils';

// 示例优惠券数据
const sampleCoupons = [
  {
    id: 1,
    code: 'SAVE10-2024-NEWU',
    name: '新用户专享券',
    type: 'percentage',
    value: 10,
    min_amount: 20,
    max_discount: 5,
    status: 1,
    expire_time: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7天后过期
    description: '新用户首次充值享受9折优惠'
  },
  {
    id: 2,
    code: 'FIXED5-DEAL-BEST',
    name: '固定减免券',
    type: 'fixed',
    value: 5,
    min_amount: 30,
    max_discount: 0,
    status: 1,
    expire_time: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30天后过期
    description: '充值满$30减$5'
  },
  {
    id: 3,
    code: 'BONUS3-RECH-ARGE',
    name: '充值奖励券',
    type: 'recharge',
    value: 3,
    min_amount: 25,
    max_discount: 0,
    status: 1,
    expire_time: Date.now() + 15 * 24 * 60 * 60 * 1000, // 15天后过期
    description: '充值满$25额外获得$3额度'
  },
  {
    id: 4,
    code: 'USED-COUP-ON01',
    name: '已使用优惠券',
    type: 'percentage',
    value: 15,
    min_amount: 50,
    max_discount: 10,
    status: 2,
    expire_time: Date.now() + 30 * 24 * 60 * 60 * 1000,
    description: '已使用的优惠券示例'
  }
];

function TabPanel({ children, value, index, ...other }) {
  return (
    <div role="tabpanel" hidden={value !== index} id={`demo-tabpanel-${index}`} aria-labelledby={`demo-tab-${index}`} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const CouponDemo = () => {
  const [tabValue, setTabValue] = useState(0);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [orderAmount, setOrderAmount] = useState(50);
  const [couponCode, setCouponCode] = useState('');
  const [discountResult, setDiscountResult] = useState(null);

  // 处理优惠券选择
  const handleCouponSelect = (coupon) => {
    setSelectedCoupon(coupon);
    setCouponCode(coupon.code);

    // 计算折扣
    if (coupon.status === 1) {
      const result = calculateDiscount(coupon, orderAmount);
      setDiscountResult(result);
    }
  };

  // 处理订单金额变化
  const handleAmountChange = (e) => {
    const amount = parseFloat(e.target.value) || 0;
    setOrderAmount(amount);

    if (selectedCoupon) {
      const result = calculateDiscount(selectedCoupon, amount);
      setDiscountResult(result);
    }
  };

  // 处理优惠券码输入
  const handleCouponCodeChange = (e) => {
    const formatted = formatCouponCodeInput(e.target.value);
    setCouponCode(formatted);

    // 查找匹配的优惠券
    const matchedCoupon = sampleCoupons.find((c) => c.code === formatted);
    if (matchedCoupon) {
      setSelectedCoupon(matchedCoupon);
      const result = calculateDiscount(matchedCoupon, orderAmount);
      setDiscountResult(result);
    } else {
      setSelectedCoupon(null);
      setDiscountResult(null);
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h4" gutterBottom>
        优惠券系统演示
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        这是优惠券系统的功能演示页面，展示了优惠券的各种使用场景和界面组件。
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="优惠券展示" />
          <Tab label="使用计算器" />
          <Tab label="组件展示" />
        </Tabs>
      </Box>

      {/* 优惠券展示 */}
      <TabPanel value={tabValue} index={0}>
        <CouponStats coupons={sampleCoupons} />

        <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
          示例优惠券
        </Typography>

        <Grid container spacing={2}>
          {sampleCoupons.map((coupon) => (
            <Grid item xs={12} sm={6} md={4} key={coupon.id}>
              <CouponCard
                coupon={coupon}
                onClick={() => handleCouponSelect(coupon)}
                selected={selectedCoupon?.id === coupon.id}
                showActions={true}
                actions={
                  <Button size="small" variant="outlined">
                    {coupon.status === 1 ? '使用' : '查看'}
                  </Button>
                }
              />
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      {/* 使用计算器 */}
      <TabPanel value={tabValue} index={1}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  订单信息
                </Typography>

                <TextField
                  fullWidth
                  label="订单金额"
                  type="number"
                  value={orderAmount}
                  onChange={handleAmountChange}
                  InputProps={{
                    startAdornment: '$'
                  }}
                  sx={{ mb: 2 }}
                />

                <TextField
                  fullWidth
                  label="优惠券码"
                  value={couponCode}
                  onChange={handleCouponCodeChange}
                  placeholder="XXXX-XXXX-XXXX"
                  helperText={couponCode && !validateCouponCode(couponCode) ? '优惠券码格式不正确' : ''}
                  error={couponCode && !validateCouponCode(couponCode)}
                />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  计算结果
                </Typography>

                {selectedCoupon ? (
                  <Box>
                    <Typography variant="body1" gutterBottom>
                      <strong>选中优惠券：</strong>
                      {selectedCoupon.name}
                    </Typography>

                    {discountResult ? (
                      discountResult.valid ? (
                        <Box sx={{ p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
                          <Typography variant="body2" gutterBottom>
                            原价：${orderAmount.toFixed(2)}
                          </Typography>
                          <Typography variant="body2" color="success.main" gutterBottom>
                            优惠：-${discountResult.discountAmount.toFixed(2)}
                          </Typography>
                          <Typography variant="h6" color="primary">
                            应付：${discountResult.finalAmount.toFixed(2)}
                          </Typography>
                        </Box>
                      ) : (
                        <Alert severity="warning">{discountResult.reason}</Alert>
                      )
                    ) : null}
                  </Box>
                ) : (
                  <Typography color="text.secondary">请选择优惠券或输入优惠券码</Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* 组件展示 */}
      <TabPanel value={tabValue} index={2}>
        <Typography variant="h6" gutterBottom>
          优惠券工具组件展示
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                优惠券统计组件
              </Typography>
              <CouponStats coupons={sampleCoupons} />
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                优惠券卡片组件
              </Typography>
              <CouponCard coupon={sampleCoupons[0]} />
            </Paper>
          </Grid>
        </Grid>

        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            功能特性
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" color="primary">
                    多种类型
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    支持百分比折扣、固定金额、充值奖励
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" color="primary">
                    智能计算
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    自动计算折扣金额和最终价格
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" color="primary">
                    状态管理
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    可用、已使用、已过期状态管理
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" color="primary">
                    过期提醒
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    即将过期的优惠券自动标记
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </TabPanel>
    </Box>
  );
};

export default CouponDemo;
