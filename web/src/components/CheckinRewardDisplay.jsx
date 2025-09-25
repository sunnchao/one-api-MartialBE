import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  LinearProgress,
  Stack,
  Alert,
  Avatar,
  ListItem,
  ListItemAvatar,
  ListItemText,
  useTheme,
  alpha
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Stars as StarsIcon,
  TrendingUp as TrendingUpIcon,
  EmojiEvents as TrophyIcon,
  CardGiftcard as CouponIcon
} from '@mui/icons-material';
import CheckinService from 'services/checkinService';

/**
 * 签到奖励信息显示组件
 * 展示基于签到记录的优惠券奖励建议
 */
const CheckinRewardDisplay = ({ checkinData = [] }) => {
  const theme = useTheme();
  const [rewardInfo, setRewardInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const generateRewardInfo = () => {
      setLoading(true);
      try {
        const info = CheckinService.generateCouponRewards(checkinData);
        setRewardInfo(info);
      } catch (error) {
        console.error('生成奖励信息失败:', error);
      } finally {
        setLoading(false);
      }
    };

    generateRewardInfo();
  }, [checkinData]);

  if (loading || !rewardInfo) {
    return (
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            签到奖励加载中...
          </Typography>
          <LinearProgress />
        </CardContent>
      </Card>
    );
  }

  const { stats, rewards, totalMultiplier } = rewardInfo;

  const getRewardIcon = (type) => {
    switch (type) {
      case 'consecutive_bonus':
        return <StarsIcon color="primary" />;
      case 'monthly_active':
        return <TrendingUpIcon color="success" />;
      case 'newcomer_bonus':
        return <TrophyIcon color="warning" />;
      default:
        return <CouponIcon color="info" />;
    }
  };

  const getRewardColor = (type) => {
    switch (type) {
      case 'consecutive_bonus':
        return 'primary';
      case 'monthly_active':
        return 'success';
      case 'newcomer_bonus':
        return 'warning';
      default:
        return 'info';
    }
  };

  return (
    <Card
      sx={{
        mb: 2,
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.success.main, 0.05)} 100%)`,
        border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar sx={{ bgcolor: theme.palette.primary.main, mr: 2 }}>
            <CheckIcon />
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight="bold">
              签到奖励状态
            </Typography>
            <Typography variant="body2" color="text.secondary">
              基于您的签到记录生成奖励建议
            </Typography>
          </Box>
        </Box>

        {/* 签到统计 */}
        <Box sx={{ mb: 3 }}>
          <Stack direction="row" spacing={2} flexWrap="wrap">
            <Chip icon={<CheckIcon />} label={`总签到: ${stats.totalCheckins}天`} color="default" variant="outlined" />
            <Chip icon={<StarsIcon />} label={`连续签到: ${stats.consecutiveDays}天`} color="primary" variant="outlined" />
            <Chip icon={<TrendingUpIcon />} label={`本月签到: ${stats.thisMonthCheckins}天`} color="success" variant="outlined" />
            {stats.isCheckedInToday && <Chip icon={<CheckIcon />} label="今日已签到" color="success" size="small" />}
          </Stack>
        </Box>

        {/* 奖励信息 */}
        {rewards.length > 0 ? (
          <>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              🎁 可获得奖励 (总倍数: {totalMultiplier.toFixed(1)}x)
            </Typography>
            <Stack spacing={1}>
              {rewards.map((reward, index) => (
                <ListItem
                  key={index}
                  sx={{
                    bgcolor: alpha(theme.palette[getRewardColor(reward.type)].main, 0.1),
                    borderRadius: 1,
                    border: `1px solid ${alpha(theme.palette[getRewardColor(reward.type)].main, 0.2)}`
                  }}
                >
                  <ListItemAvatar>
                    <Avatar
                      sx={{
                        bgcolor: theme.palette[getRewardColor(reward.type)].main,
                        width: 32,
                        height: 32
                      }}
                    >
                      {getRewardIcon(reward.type)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography fontWeight="bold">{reward.title}</Typography>
                        <Chip label={`${reward.multiplier}x`} size="small" color={getRewardColor(reward.type)} variant="filled" />
                      </Box>
                    }
                    secondary={reward.description}
                  />
                </ListItem>
              ))}
            </Stack>
          </>
        ) : (
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">继续签到可获得更多优惠券奖励！连续签到7天可获得额外奖励加成。</Typography>
          </Alert>
        )}

        {/* 进度条 - 显示连续签到进度 */}
        {stats.consecutiveDays < 7 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              连续签到进度 ({stats.consecutiveDays}/7天)
            </Typography>
            <LinearProgress
              variant="determinate"
              value={(stats.consecutiveDays / 7) * 100}
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                '& .MuiLinearProgress-bar': {
                  borderRadius: 4
                }
              }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
              再签到{7 - stats.consecutiveDays}天可获得连续签到奖励
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default CheckinRewardDisplay;
