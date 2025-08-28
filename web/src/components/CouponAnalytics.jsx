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
  alpha
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

// 模拟数据生成函数
const generateMockData = () => {
  return {
    overview: {
      totalCoupons: 1247,
      activeCoupons: 856,
      usedCoupons: 391,
      totalSavings: 15420.5,
      conversionRate: 68.5,
      popularityTrend: 12.3
    },
    typeDistribution: [
      { type: 'percentage', name: '百分比折扣', count: 520, percentage: 41.7, savings: 8900.2 },
      { type: 'fixed', name: '固定金额', count: 387, percentage: 31.0, savings: 4520.8 },
      { type: 'recharge', name: '充值奖励', count: 340, percentage: 27.3, savings: 2000.5 }
    ],
    usageStats: [
      { period: '今日', issued: 45, used: 23, rate: 51.1 },
      { period: '本周', issued: 312, used: 198, rate: 63.5 },
      { period: '本月', issued: 1247, used: 856, rate: 68.6 },
      { period: '总计', issued: 5420, used: 3780, rate: 69.7 }
    ],
    topPerformers: [
      { name: '新用户专享券', used: 156, savings: 2340.5, rate: 89.2 },
      { name: '月末大促销', used: 134, savings: 1980.3, rate: 76.8 },
      { name: '充值奖励券', used: 98, savings: 1560.0, rate: 72.1 },
      { name: '会员专属券', used: 87, savings: 1340.2, rate: 68.9 },
      { name: '限时折扣券', used: 76, savings: 1120.8, rate: 65.4 }
    ],
    recentActivities: [
      { type: 'created', name: '春节特惠券', time: '2小时前', user: '管理员' },
      { type: 'used', name: '新用户专享券', time: '3小时前', user: 'user123' },
      { type: 'expired', name: '限时折扣券', time: '5小时前', user: 'system' },
      { type: 'issued', name: '充值奖励券', time: '1天前', user: '系统发放' },
      { type: 'used', name: '月末大促销', time: '1天前', user: 'user456' }
    ]
  };
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

  useEffect(() => {
    // 模拟API调用
    const fetchData = async () => {
      setLoading(true);
      // 模拟网络延迟
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setData(generateMockData());
      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          数据分析仪表板
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
