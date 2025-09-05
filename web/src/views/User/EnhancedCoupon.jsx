import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Tabs,
  Tab,
  Fab,
  Zoom,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Divider,
  Alert,
  Chip,
  Badge,
  LinearProgress,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Tooltip,
  Skeleton,
  useTheme,
  alpha
} from '@mui/material';
import {
  CardGiftcard as CouponIcon,
  EventAvailable as CheckinIcon,
  History as HistoryIcon,
  Refresh as RefreshIcon,
  Share as ShareIcon,
  LocalOffer as OfferIcon,
  MonetizationOn as MoneyIcon,
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckIcon,
  Timer as TimerIcon,
  Stars as StarsIcon
} from '@mui/icons-material';

// 导入增强组件
import EnhancedCouponCard from 'components/EnhancedCouponCard';
import CouponFilter from 'components/CouponFilter';
import CheckinService from 'services/checkinService';
import { API } from 'utils/api';
import { showError, showSuccess, showInfo } from 'utils/common';

// Tab面板组件
function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`user-enhanced-tabpanel-${index}`}
      aria-labelledby={`user-enhanced-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

// 统计卡片组件
const StatCard = ({ icon, title, value, subtitle, color = 'primary', trend }) => {
  const theme = useTheme();
  const colorConfig = {
    primary: theme.palette.primary.main,
    success: theme.palette.success.main,
    warning: theme.palette.warning.main,
    error: theme.palette.error.main,
    info: theme.palette.info.main
  };

  return (
    <Card
      sx={{
        height: '100%',
        background: `linear-gradient(135deg, ${alpha(colorConfig[color], 0.1)} 0%, ${alpha(colorConfig[color], 0.05)} 100%)`,
        border: `1px solid ${alpha(colorConfig[color], 0.2)}`
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography color="text.secondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h3" fontWeight="bold" color={colorConfig[color]}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {subtitle}
              </Typography>
            )}
            {trend && (
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <TrendingUpIcon fontSize="small" color="success" />
                <Typography variant="caption" color="success.main" sx={{ ml: 0.5 }}>
                  +{trend}% 本月
                </Typography>
              </Box>
            )}
          </Box>
          <Avatar
            sx={{
              bgcolor: alpha(colorConfig[color], 0.2),
              color: colorConfig[color],
              width: 56,
              height: 56
            }}
          >
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );
};

// 签到进度组件
const CheckinProgress = ({ consecutiveDays, todayChecked, onCheckin, loading }) => {
  const theme = useTheme();
  const progress = Math.min((consecutiveDays / 7) * 100, 100);

  return (
    <Card
      sx={{
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" fontWeight="bold">
            每日签到
          </Typography>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<CheckinIcon />}
            onClick={onCheckin}
            disabled={loading || todayChecked}
            sx={{
              background: todayChecked ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.9)',
              color: todayChecked ? 'inherit' : theme.palette.primary.main,
              '&:hover': {
                background: 'rgba(255,255,255,0.8)'
              }
            }}
          >
            {todayChecked ? '今日已签到' : '立即签到'}
          </Button>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="body2">连续签到进度</Typography>
            <Typography variant="body2">{consecutiveDays} / 7 天</Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 8,
              borderRadius: 4,
              bgcolor: 'rgba(255,255,255,0.2)',
              '& .MuiLinearProgress-bar': {
                borderRadius: 4,
                bgcolor: 'rgba(255,255,255,0.9)'
              }
            }}
          />
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="caption">坚持签到可获得更多奖励</Typography>
          <Chip
            icon={<StarsIcon />}
            label={consecutiveDays >= 7 ? '连续奖励' : '继续努力'}
            size="small"
            sx={{
              bgcolor: 'rgba(255,255,255,0.2)',
              color: 'white'
            }}
          />
        </Box>
      </CardContent>
    </Card>
  );
};

// 优惠券使用测试组件
const CouponTester = ({ open, onClose, coupon }) => {
  const [testAmount, setTestAmount] = useState(50);
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    if (open && coupon) {
      // 模拟计算优惠
      const calculateDiscount = () => {
        if (testAmount < coupon.min_amount) {
          setTestResult({
            valid: false,
            reason: `订单金额不足，需要至少$${coupon.min_amount}`
          });
          return;
        }

        let discountAmount = 0;
        if (coupon.type === 'percentage') {
          discountAmount = testAmount * (coupon.value / 100);
          if (coupon.max_discount > 0 && discountAmount > coupon.max_discount) {
            discountAmount = coupon.max_discount;
          }
        } else if (coupon.type === 'fixed') {
          discountAmount = Math.min(coupon.value, testAmount);
        }

        setTestResult({
          valid: true,
          discountAmount,
          finalAmount: testAmount - discountAmount
        });
      };

      calculateDiscount();
    }
  }, [testAmount, coupon, open]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>优惠券使用计算器</DialogTitle>
      <DialogContent>
        {coupon && (
          <>
            <EnhancedCouponCard coupon={coupon} variant="compact" showActions={false} sx={{ mb: 3 }} />

            <TextField
              fullWidth
              label="测试订单金额"
              type="number"
              value={testAmount}
              onChange={(e) => setTestAmount(parseFloat(e.target.value) || 0)}
              InputProps={{ startAdornment: '$' }}
              sx={{ mb: 3 }}
            />

            {testResult && (
              <Card
                sx={{
                  bgcolor: testResult.valid ? 'success.light' : 'warning.light',
                  color: testResult.valid ? 'success.contrastText' : 'warning.contrastText'
                }}
              >
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    计算结果
                  </Typography>
                  {testResult.valid ? (
                    <Box>
                      <Typography variant="body1">订单金额：${testAmount.toFixed(2)}</Typography>
                      <Typography variant="body1" color="success.main">
                        优惠金额：-${testResult.discountAmount.toFixed(2)}
                      </Typography>
                      <Divider sx={{ my: 1 }} />
                      <Typography variant="h5" fontWeight="bold">
                        应付金额：${testResult.finalAmount.toFixed(2)}
                      </Typography>
                    </Box>
                  ) : (
                    <Alert severity="warning" sx={{ mt: 1 }}>
                      {testResult.reason}
                    </Alert>
                  )}
                </CardContent>
              </Card>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>关闭</Button>
      </DialogActions>
    </Dialog>
  );
};

const EnhancedUserCoupon = () => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);

  // 数据状态
  const [coupons, setCoupons] = useState([]);
  const [checkinData, setCheckinData] = useState({
    records: [],
    consecutive_days: 0,
    has_checked_today: false
  });
  const [loading, setLoading] = useState(false);
  const [checkinLoading, setCheckinLoading] = useState(false);

  // UI状态
  const [viewMode, setViewMode] = useState('grid');
  const [testerDialog, setTesterDialog] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [filteredCoupons, setFilteredCoupons] = useState([]);

  // 获取用户优惠券
  const fetchCoupons = async (status = null) => {
    setLoading(true);
    try {
      const url = status ? `/api/user/coupons?status=${status}` : '/api/user/coupons';
      const res = await API.get(url);
      if (res.data.success) {
        const data = res.data.data || [];
        setCoupons(data);
        setFilteredCoupons(data);
      }
    } catch (error) {
      showError('获取优惠券失败');
    } finally {
      setLoading(false);
    }
  };

  // 获取签到数据
  const fetchCheckinData = async () => {
    try {
      const checkinList = await CheckinService.getCheckinList();
      setCheckinData(checkinList);

      // 获取签到统计和奖励信息
      const rewardInfo = CheckinService.generateCouponRewards(checkinList.records);
      console.log('签到奖励信息:', rewardInfo);
    } catch (error) {
      showError('获取签到记录失败');
      console.error(error);
    }
  };

  // 执行签到
  const performCheckin = async () => {
    setCheckinLoading(true);
    try {
      const res = await API.post('/api/user/checkin');
      if (res.data.success) {
        showSuccess(res.data.message);
        fetchCheckinData();
        // 签到成功后总是刷新优惠券列表，因为可能获得新的优惠券
        fetchCoupons();
      } else {
        showError(res.data.message);
      }
    } catch (error) {
      showError('签到失败');
    } finally {
      setCheckinLoading(false);
    }
  };

  // 处理优惠券使用
  const handleUseCoupon = (coupon) => {
    setSelectedCoupon(coupon);
    setTesterDialog(true);
  };

  // 处理优惠券分享
  const handleShareCoupon = async (coupon) => {
    const shareText = `🎫 ${coupon.name}\n💰 优惠：${coupon.type === 'percentage' ? `${coupon.value}%折扣` : `$${coupon.value}`}\n⏰ 有效期至：${new Date(coupon.expire_time).toLocaleDateString()}\n🔥 优惠券码：${coupon.code}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: '优惠券分享',
          text: shareText
        });
      } catch (error) {
        // 用户取消分享
      }
    } else {
      // 复制到剪贴板
      await navigator.clipboard.writeText(shareText);
      showSuccess('优惠券信息已复制到剪贴板');
    }
  };

  // 复制优惠券码
  const handleCopyCouponCode = async (code) => {
    await navigator.clipboard.writeText(code);
    showSuccess('优惠券码已复制');
  };

  // 应用过滤器
  const handleFilterChange = (filterParams) => {
    let filtered = [...coupons];

    // 搜索过滤
    if (filterParams.search) {
      const searchTerm = filterParams.search.toLowerCase();
      filtered = filtered.filter(
        (coupon) => coupon.name.toLowerCase().includes(searchTerm) || coupon.code.toLowerCase().includes(searchTerm)
      );
    }

    // 状态过滤
    if (filterParams.status && filterParams.status.length > 0) {
      filtered = filtered.filter((coupon) => filterParams.status.includes(coupon.status));
    }

    // 类型过滤
    if (filterParams.type && filterParams.type.length > 0) {
      filtered = filtered.filter((coupon) => filterParams.type.includes(coupon.type));
    }

    // 仅显示可用
    if (filterParams.onlyAvailable) {
      filtered = filtered.filter((coupon) => coupon.status === 1);
    }

    // 即将过期
    if (filterParams.expiringSoon) {
      const sevenDaysFromNow = Date.now() + 7 * 24 * 60 * 60 * 1000;
      filtered = filtered.filter((coupon) => coupon.status === 1 && new Date(coupon.expire_time).getTime() <= sevenDaysFromNow);
    }

    setFilteredCoupons(filtered);
  };

  useEffect(() => {
    fetchCoupons();
    fetchCheckinData();
  }, []);

  // 统计数据
  const stats = {
    total: coupons.length,
    available: coupons.filter((c) => c.status === 1).length,
    used: coupons.filter((c) => c.status === 2).length,
    expired: coupons.filter((c) => c.status === 3).length,
    totalSaved: coupons.filter((c) => c.status === 2).reduce((sum, c) => sum + (c.saved_amount || 0), 0)
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* 页面标题 */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight="bold">
          🎫 我的优惠券中心
        </Typography>
        <Typography variant="body1" color="text.secondary">
          管理您的优惠券，享受更多优惠
        </Typography>
      </Box>

      {/* 统计卡片 */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard
            icon={<CouponIcon />}
            title="可用优惠券"
            value={stats.available}
            subtitle={`共 ${stats.total} 张`}
            color="success"
            trend={12}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard icon={<MoneyIcon />} title="累计节省" value={`$${stats.totalSaved.toFixed(2)}`} subtitle="历史总计" color="warning" />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard icon={<CheckIcon />} title="已使用" value={stats.used} subtitle="成功使用" color="info" />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard icon={<TimerIcon />} title="已过期" value={stats.expired} subtitle="未及时使用" color="error" />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <CheckinProgress
            consecutiveDays={checkinData.consecutive_days}
            todayChecked={checkinData.has_checked_today}
            onCheckin={performCheckin}
            loading={checkinLoading}
          />
        </Grid>
      </Grid>

      {/* 标签页 */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab
            label={
              <Badge badgeContent={stats.available} color="primary" max={99}>
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
        {/* 过滤器 */}
        <CouponFilter
          onFilterChange={handleFilterChange}
          onViewModeChange={setViewMode}
          totalCount={coupons.length}
          filteredCount={filteredCoupons.length}
          initialFilters={{ onlyAvailable: true }}
        />

        {/* 优惠券列表 */}
        {loading ? (
          <Grid container spacing={3}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Grid item xs={12} sm={6} md={4} key={i}>
                <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 1 }} />
              </Grid>
            ))}
          </Grid>
        ) : filteredCoupons.length === 0 ? (
          <Card sx={{ textAlign: 'center', py: 8 }}>
            <CardContent>
              <CouponIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                暂无优惠券
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 3 }}>
                完成签到或参与活动可获得优惠券
              </Typography>
              {/* <Button variant="contained" startIcon={<CheckinIcon />} onClick={() => setTabValue(1)}>
                去签到
              </Button> */}
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {filteredCoupons.map((coupon) => (
              <Grid item xs={12} sm={6} md={4} key={coupon.id}>
                <EnhancedCouponCard
                  coupon={coupon}
                  onCopy={handleCopyCouponCode}
                  onShare={handleShareCoupon}
                  onUse={handleUseCoupon}
                  animated={true}
                  variant="default"
                />
              </Grid>
            ))}
          </Grid>
        )}
      </TabPanel>

      {/* 签到中心 */}
      <TabPanel value={tabValue} index={1}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  📅 签到记录
                </Typography>
                {checkinData.records.length === 0 ? (
                  <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                    暂无签到记录
                  </Typography>
                ) : (
                  <List>
                    {checkinData.records.slice(0, 10).map((record, index) => (
                      <ListItem key={record.id} divider={index < 9}>
                        <ListItemIcon>
                          <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.main' }}>📅</Avatar>
                        </ListItemIcon>
                        <ListItemText
                          primary={`签到时间: ${new Date(record.created_time).toLocaleString()}`}
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                {record.description}
                              </Typography>
                            </Box>
                          }
                        />
                        <Chip
                          label={record.reward_type === 'quota' ? '额度奖励' : record.reward_type === 'coupon' ? '优惠券' : '倍率奖励'}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  🏆 签到统计
                </Typography>
                <Box sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="h2" color="primary.main" fontWeight="bold">
                    {checkinData.consecutive_days}
                  </Typography>
                  <Typography color="text.secondary">连续签到天数</Typography>
                </Box>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="secondary.main" fontWeight="bold">
                    {checkinData.records.length}
                  </Typography>
                  <Typography color="text.secondary">总签到次数</Typography>
                </Box>
              </CardContent>
            </Card>

            <Alert severity="info">
              <Typography variant="body2">💡 连续签到可获得更丰厚的奖励，包括更高价值的优惠券和额度奖励！</Typography>
            </Alert>
          </Grid>
        </Grid>
      </TabPanel>

      {/* 使用记录 */}
      <TabPanel value={tabValue} index={2}>
        <Typography variant="h6" gutterBottom>
          📊 优惠券使用记录
        </Typography>

        {stats.used === 0 ? (
          <Card sx={{ textAlign: 'center', py: 8 }}>
            <CardContent>
              <HistoryIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                暂无使用记录
              </Typography>
              <Typography color="text.secondary">使用优惠券后记录会在这里显示</Typography>
            </CardContent>
          </Card>
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
                          <Typography variant="subtitle1" fontWeight="medium">
                            {coupon.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {coupon.code}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={3}>
                          <Typography variant="body2" color="text.secondary">
                            订单金额: ${coupon.used_amount || 0}
                          </Typography>
                          <Typography variant="body2" color="success.main" fontWeight="medium">
                            节省: ${coupon.saved_amount || 0}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={3}>
                          <Typography variant="body2" color="text.secondary">
                            订单号: {coupon.order_id || 'N/A'}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={3}>
                          <Typography variant="body2" color="text.secondary">
                            使用时间: {coupon.used_time ? new Date(coupon.used_time).toLocaleString() : 'N/A'}
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

      {/* 浮动刷新按钮 */}
      <Fab
        color="primary"
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1000
        }}
        onClick={() => {
          fetchCoupons();
          fetchCheckinData();
        }}
      >
        <RefreshIcon />
      </Fab>

      {/* 优惠券测试器 */}
      <CouponTester open={testerDialog} onClose={() => setTesterDialog(false)} coupon={selectedCoupon} />
    </Box>
  );
};

export default EnhancedUserCoupon;
