import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  LinearProgress,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  useTheme,
  alpha,
  Alert
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  MonetizationOn as MoneyIcon,
  People as PeopleIcon,
  LocalOffer as OfferIcon,
  Timeline as TimelineIcon,
  Star as StarIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { API } from 'utils/api';
import { showError } from 'utils/common';

// 获取优惠券统计数据
const fetchCouponAnalytics = async () => {
  try {
    // 并行调用多个API获取数据
    const [templatesRes, userCouponsRes] = await Promise.all([
      API.get('/api/admin/coupons/templates').catch(() => ({ data: { success: false, data: [] } })),
      API.get('/api/admin/coupons/user_coupons').catch(() => ({ data: { success: false, data: [] } }))
    ]);

    // 处理数据，如果管理员API不存在，降级使用用户API
    let templates = [];
    let userCoupons = [];

    if (templatesRes.data.success) {
      templates = templatesRes.data.data;
    }

    if (userCouponsRes.data.success) {
      userCoupons = userCouponsRes.data.data;
    } else {
      // 如果管理员API不存在，使用用户API获取当前用户的优惠券作为样本
      const userApiRes = await API.get('/api/user/coupons').catch(() => ({ data: { success: false, data: [] } }));
      if (userApiRes.data.success) {
        userCoupons = userApiRes.data.data;
      }
    }

    // 如果没有数据，返回空的统计结果
    if (userCoupons.length === 0) {
      return {
        overview: {
          totalCoupons: 0,
          activeCoupons: 0,
          usedCoupons: 0,
          totalSavings: 0,
          conversionRate: 0,
          popularityTrend: 0
        },
        typeDistribution: [],
        usageStats: [
          { period: '今日', issued: 0, used: 0, rate: 0 },
          { period: '本周', issued: 0, used: 0, rate: 0 },
          { period: '本月', issued: 0, used: 0, rate: 0 },
          { period: '总计', issued: 0, used: 0, rate: 0 }
        ],
        topPerformers: [],
        recentActivities: []
      };
    }

    // 计算统计数据
    const totalCoupons = userCoupons.length;
    const usedCoupons = userCoupons.filter((c) => c.status === 2).length;
    const activeCoupons = userCoupons.filter((c) => c.status === 1).length;
    const expiredCoupons = userCoupons.filter((c) => c.status === 3).length;

    // 计算节省总金额
    const totalSavings = userCoupons
      .filter((c) => c.status === 2 && c.saved_amount)
      .reduce((sum, c) => sum + (parseFloat(c.saved_amount) || 0), 0);

    // 计算转化率
    const conversionRate = totalCoupons > 0 ? (usedCoupons / totalCoupons) * 100 : 0;

    // 按类型统计
    const typeStats = {};
    userCoupons.forEach((coupon) => {
      const type = coupon.type || 'unknown';
      if (!typeStats[type]) {
        typeStats[type] = { count: 0, savings: 0 };
      }
      typeStats[type].count++;
      if (coupon.status === 2 && coupon.saved_amount) {
        typeStats[type].savings += parseFloat(coupon.saved_amount) || 0;
      }
    });

    const typeDistribution = Object.entries(typeStats).map(([type, data]) => ({
      type,
      name: type === 'percentage' ? '百分比折扣' : type === 'fixed' ? '固定金额' : type === 'recharge' ? '充值奖励' : '其他',
      count: data.count,
      percentage: totalCoupons > 0 ? (data.count / totalCoupons) * 100 : 0,
      savings: data.savings
    }));

    // 计算时间段统计
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    const getTodayCoupons = (coupons) => coupons.filter((c) => new Date(c.created_time) >= today);
    const getWeekCoupons = (coupons) => coupons.filter((c) => new Date(c.created_time) >= weekStart);
    const getMonthCoupons = (coupons) => coupons.filter((c) => new Date(c.created_time) >= monthStart);

    const todayCoupons = getTodayCoupons(userCoupons);
    const weekCoupons = getWeekCoupons(userCoupons);
    const monthCoupons = getMonthCoupons(userCoupons);

    const usageStats = [
      {
        period: '今日',
        issued: todayCoupons.length,
        used: todayCoupons.filter((c) => c.status === 2).length,
        rate: todayCoupons.length > 0 ? (todayCoupons.filter((c) => c.status === 2).length / todayCoupons.length) * 100 : 0
      },
      {
        period: '本周',
        issued: weekCoupons.length,
        used: weekCoupons.filter((c) => c.status === 2).length,
        rate: weekCoupons.length > 0 ? (weekCoupons.filter((c) => c.status === 2).length / weekCoupons.length) * 100 : 0
      },
      {
        period: '本月',
        issued: monthCoupons.length,
        used: monthCoupons.filter((c) => c.status === 2).length,
        rate: monthCoupons.length > 0 ? (monthCoupons.filter((c) => c.status === 2).length / monthCoupons.length) * 100 : 0
      },
      {
        period: '总计',
        issued: totalCoupons,
        used: usedCoupons,
        rate: conversionRate
      }
    ];

    // 计算热门优惠券（按使用次数排序）
    const couponUsage = {};
    userCoupons
      .filter((c) => c.status === 2)
      .forEach((coupon) => {
        const name = coupon.name || `优惠券${coupon.template_id}`;
        if (!couponUsage[name]) {
          couponUsage[name] = { used: 0, savings: 0 };
        }
        couponUsage[name].used++;
        couponUsage[name].savings += parseFloat(coupon.saved_amount) || 0;
      });

    const topPerformers = Object.entries(couponUsage)
      .map(([name, data]) => ({
        name,
        used: data.used,
        savings: data.savings,
        rate: 0 // 需要更复杂的计算来获得准确的转化率
      }))
      .sort((a, b) => b.used - a.used)
      .slice(0, 5);

    // 最近活动（简化版本，基于用户优惠券的状态变化）
    const recentActivities = userCoupons
      .sort((a, b) => new Date(b.created_time) - new Date(a.created_time))
      .slice(0, 5)
      .map((coupon) => ({
        type: coupon.status === 2 ? 'used' : coupon.status === 3 ? 'expired' : 'issued',
        name: coupon.name || `优惠券${coupon.id}`,
        time: getTimeAgo(coupon.created_time),
        user: coupon.status === 2 && coupon.used_time ? '用户' : '系统'
      }));

    return {
      overview: {
        totalCoupons,
        activeCoupons,
        usedCoupons,
        totalSavings,
        conversionRate: parseFloat(conversionRate.toFixed(1)),
        popularityTrend: 0 // 需要历史数据来计算趋势
      },
      typeDistribution,
      usageStats,
      topPerformers,
      recentActivities
    };
  } catch (error) {
    console.error('获取优惠券分析数据失败:', error);
    throw error;
  }
};

// 计算时间差
const getTimeAgo = (timestamp) => {
  const now = new Date();
  const time = new Date(timestamp);
  const diffMs = now - time;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 60) {
    return `${diffMins}分钟前`;
  } else if (diffHours < 24) {
    return `${diffHours}小时前`;
  } else {
    return `${diffDays}天前`;
  }
};

const StatCard = ({ title, value, subtitle, trend, icon, color = 'primary' }) => {
  const theme = useTheme();
  const colorConfig = {
    primary: theme.palette.primary.main,
    success: theme.palette.success.main,
    warning: theme.palette.warning.main,
    error: theme.palette.error.main,
    info: theme.palette.info.main
  };

  const selectedColor = colorConfig[color] || theme.palette.primary.main;

  return (
    <Card sx={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: 80,
          height: 80,
          background: `linear-gradient(135deg, ${alpha(selectedColor, 0.1)} 0%, ${alpha(selectedColor, 0.05)} 100%)`,
          borderRadius: '0 0 0 80px'
        }}
      />
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box>
            <Typography color="text.secondary" gutterBottom variant="body2" fontWeight="medium">
              {title}
            </Typography>
            <Typography variant="h4" fontWeight="bold" color={selectedColor}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {subtitle}
              </Typography>
            )}
            {trend !== undefined && (
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                {trend > 0 ? <TrendingUpIcon fontSize="small" color="success" /> : <TrendingDownIcon fontSize="small" color="error" />}
                <Typography variant="caption" color={trend > 0 ? 'success.main' : 'error.main'} fontWeight="medium" sx={{ ml: 0.5 }}>
                  {Math.abs(trend)}%
                </Typography>
              </Box>
            )}
          </Box>
          <Avatar sx={{ bgcolor: alpha(selectedColor, 0.1), color: selectedColor }}>{icon}</Avatar>
        </Box>
      </CardContent>
    </Card>
  );
};

const ProgressBar = ({ label, value, total, color = 'primary' }) => {
  const theme = useTheme();
  const percentage = (value / total) * 100;

  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="body2" fontWeight="medium">
          {label}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {value} / {total} ({percentage.toFixed(1)}%)
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={percentage}
        sx={{
          height: 8,
          borderRadius: 4,
          bgcolor: alpha(theme.palette.grey[500], 0.1),
          '& .MuiLinearProgress-bar': {
            borderRadius: 4,
            bgcolor: theme.palette[color]?.main || theme.palette.primary.main
          }
        }}
      />
    </Box>
  );
};

const CouponAnalytics = () => {
  const theme = useTheme();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // 获取真实数据
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const analyticsData = await fetchCouponAnalytics();
        setData(analyticsData);
      } catch (err) {
        console.error('获取优惠券分析数据失败:', err);
        setError('获取数据失败，请稍后重试');
        showError('获取优惠券分析数据失败');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          📊 优惠券数据分析仪表板
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          正在加载数据...
        </Typography>
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Card sx={{ height: 120 }}>
                <CardContent>
                  <LinearProgress />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          📊 优惠券数据分析仪表板
        </Typography>
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  if (!data) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          📊 优惠券数据分析仪表板
        </Typography>
        <Alert severity="info" sx={{ mt: 2 }}>
          暂无数据
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom fontWeight="bold">
        📊 优惠券数据分析仪表板
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        实时监控优惠券的发放、使用情况和转化效果
      </Typography>

      {/* 核心指标 */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="总优惠券数"
            value={data.overview.totalCoupons.toLocaleString()}
            subtitle="已发放优惠券"
            icon={<OfferIcon />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="使用率"
            value={`${data.overview.conversionRate}%`}
            subtitle={`${data.overview.usedCoupons} / ${data.overview.activeCoupons} 已使用`}
            trend={data.overview.popularityTrend}
            icon={<TrendingUpIcon />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="总节省金额"
            value={`$${data.overview.totalSavings.toLocaleString()}`}
            subtitle="用户累计节省"
            icon={<MoneyIcon />}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="活跃优惠券"
            value={data.overview.activeCoupons.toLocaleString()}
            subtitle="当前可用"
            icon={<StarIcon />}
            color="info"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* 类型分布 */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="medium">
                优惠券类型分布
              </Typography>
              {data.typeDistribution.map((type, index) => (
                <Box key={type.type} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" fontWeight="medium">
                      {type.name}
                    </Typography>
                    <Chip
                      label={`${type.count} (${type.percentage}%)`}
                      size="small"
                      variant="outlined"
                      color={index === 0 ? 'primary' : index === 1 ? 'secondary' : 'default'}
                    />
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={type.percentage}
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      bgcolor: alpha(theme.palette.grey[500], 0.1),
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 3,
                        bgcolor:
                          index === 0 ? theme.palette.primary.main : index === 1 ? theme.palette.secondary.main : theme.palette.grey[500]
                      }
                    }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                    节省金额: ${type.savings.toLocaleString()}
                  </Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* 使用统计 */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="medium">
                使用统计
              </Typography>
              {data.usageStats.map((stat, index) => (
                <Box key={stat.period} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" fontWeight="medium">
                      {stat.period}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stat.used} / {stat.issued} ({stat.rate}%)
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={stat.rate}
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      bgcolor: alpha(theme.palette.grey[500], 0.1),
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 3,
                        bgcolor:
                          stat.rate >= 70
                            ? theme.palette.success.main
                            : stat.rate >= 50
                              ? theme.palette.warning.main
                              : theme.palette.error.main
                      }
                    }}
                  />
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* 热门优惠券 */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="medium">
                🏆 热门优惠券排行
              </Typography>
              <List dense>
                {data.topPerformers.map((coupon, index) => (
                  <React.Fragment key={coupon.name}>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar
                          sx={{
                            bgcolor:
                              index === 0
                                ? theme.palette.warning.main
                                : index === 1
                                  ? alpha(theme.palette.warning.main, 0.7)
                                  : index === 2
                                    ? alpha(theme.palette.warning.main, 0.4)
                                    : theme.palette.grey[400],
                            width: 32,
                            height: 32,
                            fontSize: '0.875rem'
                          }}
                        >
                          {index + 1}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={coupon.name}
                        secondary={`${coupon.used}次使用 • $${coupon.savings}节省 • ${coupon.rate}%转化率`}
                        primaryTypographyProps={{ fontWeight: 'medium', variant: 'body2' }}
                        secondaryTypographyProps={{ variant: 'caption' }}
                      />
                    </ListItem>
                    {index < data.topPerformers.length - 1 && <Divider variant="inset" component="li" />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* 最近活动 */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="medium">
                📈 最近活动
              </Typography>
              <List dense>
                {data.recentActivities.map((activity, index) => {
                  const getActivityIcon = (type) => {
                    switch (type) {
                      case 'created':
                        return <OfferIcon fontSize="small" />;
                      case 'used':
                        return <MoneyIcon fontSize="small" />;
                      case 'expired':
                        return <ScheduleIcon fontSize="small" />;
                      case 'issued':
                        return <PeopleIcon fontSize="small" />;
                      default:
                        return <TimelineIcon fontSize="small" />;
                    }
                  };

                  const getActivityColor = (type) => {
                    switch (type) {
                      case 'created':
                        return theme.palette.primary.main;
                      case 'used':
                        return theme.palette.success.main;
                      case 'expired':
                        return theme.palette.error.main;
                      case 'issued':
                        return theme.palette.info.main;
                      default:
                        return theme.palette.grey[500];
                    }
                  };

                  return (
                    <React.Fragment key={index}>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar
                            sx={{
                              bgcolor: alpha(getActivityColor(activity.type), 0.1),
                              color: getActivityColor(activity.type),
                              width: 32,
                              height: 32
                            }}
                          >
                            {getActivityIcon(activity.type)}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={activity.name}
                          secondary={`${activity.user} • ${activity.time}`}
                          primaryTypographyProps={{ fontWeight: 'medium', variant: 'body2' }}
                          secondaryTypographyProps={{ variant: 'caption' }}
                        />
                      </ListItem>
                      {index < data.recentActivities.length - 1 && <Divider variant="inset" component="li" />}
                    </React.Fragment>
                  );
                })}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CouponAnalytics;
