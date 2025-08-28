import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Button,
  Fade,
  Zoom,
  LinearProgress,
  Divider,
  Avatar,
  useTheme,
  alpha
} from '@mui/material';
import {
  ContentCopy as CopyIcon,
  LocalOffer as OfferIcon,
  MonetizationOn as MoneyIcon,
  CardGiftcard as CouponIcon,
  Share as ShareIcon,
  AccessTime as TimeIcon,
  TrendingUp as TrendingIcon,
  CheckCircle as CheckIcon
} from '@mui/icons-material';
import { keyframes } from '@mui/system';

// 动画关键帧
const shimmer = keyframes`
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
`;

const glow = keyframes`
  0%, 100% { box-shadow: 0 0 5px rgba(25, 118, 210, 0.4); }
  50% { box-shadow: 0 0 20px rgba(25, 118, 210, 0.8), 0 0 30px rgba(25, 118, 210, 0.6); }
`;

const bounce = keyframes`
  0%, 20%, 53%, 80%, 100% { transform: translate3d(0,0,0); }
  40%, 43% { transform: translate3d(0, -8px, 0); }
  70% { transform: translate3d(0, -4px, 0); }
  90% { transform: translate3d(0, -2px, 0); }
`;

// 获取优惠券类型图标和颜色
const getCouponTypeConfig = (type, theme) => {
  switch (type) {
    case 'percentage':
      return {
        icon: <OfferIcon />,
        color: theme.palette.success.main,
        bgColor: alpha(theme.palette.success.main, 0.1),
        label: '折扣券'
      };
    case 'fixed':
      return {
        icon: <MoneyIcon />,
        color: theme.palette.info.main,
        bgColor: alpha(theme.palette.info.main, 0.1),
        label: '减免券'
      };
    case 'recharge':
      return {
        icon: <CouponIcon />,
        color: theme.palette.warning.main,
        bgColor: alpha(theme.palette.warning.main, 0.1),
        label: '奖励券'
      };
    default:
      return {
        icon: <CouponIcon />,
        color: theme.palette.grey[500],
        bgColor: alpha(theme.palette.grey[500], 0.1),
        label: '通用券'
      };
  }
};

// 获取状态配置
const getStatusConfig = (status, theme) => {
  switch (status) {
    case 1:
      return {
        color: theme.palette.success.main,
        bgColor: alpha(theme.palette.success.main, 0.1),
        label: '可用',
        textColor: theme.palette.success.contrastText
      };
    case 2:
      return {
        color: theme.palette.grey[500],
        bgColor: alpha(theme.palette.grey[500], 0.1),
        label: '已使用',
        textColor: theme.palette.grey[600]
      };
    case 3:
      return {
        color: theme.palette.error.main,
        bgColor: alpha(theme.palette.error.main, 0.1),
        label: '已过期',
        textColor: theme.palette.error.contrastText
      };
    default:
      return {
        color: theme.palette.grey[500],
        bgColor: alpha(theme.palette.grey[500], 0.1),
        label: '未知',
        textColor: theme.palette.grey[600]
      };
  }
};

// 判断是否即将过期
const isExpiringSoon = (expireTime, days = 7) => {
  const now = Date.now();
  const expire = new Date(expireTime);
  const diffDays = (expire - now) / (1000 * 60 * 60 * 24);
  return diffDays <= days && diffDays > 0;
};

// 获取过期进度
const getExpireProgress = (expireTime, validDays = 30) => {
  const now = Date.now();
  const expire = new Date(expireTime);
  const start = new Date(expire.getTime() - validDays * 24 * 60 * 60 * 1000);
  const total = expire - start;
  const remaining = expire - now;
  return Math.max(0, Math.min(100, (remaining / total) * 100));
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
  return coupon.description || '优惠券';
};

const EnhancedCouponCard = ({
  coupon,
  selected = false,
  onSelect,
  onCopy,
  onShare,
  onUse,
  showActions = true,
  variant = 'default', // default, compact, featured
  animated = true,
  ...props
}) => {
  const theme = useTheme();
  const [copied, setCopied] = useState(false);
  const [hovered, setHovered] = useState(false);

  const typeConfig = getCouponTypeConfig(coupon.type, theme);
  const statusConfig = getStatusConfig(coupon.status, theme);
  const expiringSoon = isExpiringSoon(coupon.expire_time);
  const expireProgress = getExpireProgress(coupon.expire_time);

  const handleCopy = async () => {
    if (onCopy) {
      await onCopy(coupon.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getCardElevation = () => {
    if (selected) return 8;
    if (hovered) return 4;
    return 1;
  };

  const getCardStyles = () => {
    const baseStyles = {
      position: 'relative',
      cursor: onSelect ? 'pointer' : 'default',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      overflow: 'hidden',
      background: selected
        ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`
        : 'background.paper',
      border: selected ? `2px solid ${theme.palette.primary.main}` : '1px solid',
      borderColor: selected ? theme.palette.primary.main : alpha(theme.palette.divider, 0.12),
      '&:hover': onSelect
        ? {
            borderColor: theme.palette.primary.main,
            transform: 'translateY(-2px)'
          }
        : {},
      ...(animated &&
        selected && {
          animation: `${glow} 2s ease-in-out infinite`
        })
    };

    if (variant === 'featured') {
      return {
        ...baseStyles,
        background: `linear-gradient(135deg, ${typeConfig.color} 0%, ${alpha(typeConfig.color, 0.8)} 100%)`,
        color: 'white',
        '& .MuiTypography-root': {
          color: 'white'
        }
      };
    }

    return baseStyles;
  };

  const ValueDisplay = () => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Avatar
        sx={{
          width: 48,
          height: 48,
          bgcolor: typeConfig.bgColor,
          color: typeConfig.color,
          ...(animated &&
            hovered && {
              animation: `${bounce} 1s ease-in-out`
            })
        }}
      >
        {typeConfig.icon}
      </Avatar>
      <Box>
        <Typography variant="h5" fontWeight="bold" color={variant === 'featured' ? 'inherit' : typeConfig.color}>
          {coupon.type === 'percentage' ? `${coupon.value}%` : `$${coupon.value}`}
        </Typography>
        <Typography variant="caption" opacity={0.8}>
          {typeConfig.label}
        </Typography>
      </Box>
    </Box>
  );

  const StatusChip = () => (
    <Chip
      icon={coupon.status === 1 ? <CheckIcon /> : undefined}
      label={statusConfig.label}
      size="small"
      sx={{
        bgcolor: statusConfig.bgColor,
        color: statusConfig.color,
        fontWeight: 'medium',
        '& .MuiChip-icon': {
          color: statusConfig.color
        }
      }}
    />
  );

  const ExpireWarning = () => {
    if (!expiringSoon || coupon.status !== 1) return null;

    return (
      <Zoom in={true}>
        <Chip
          icon={<TimeIcon />}
          label="即将过期"
          color="warning"
          size="small"
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            zIndex: 1,
            ...(animated && {
              animation: `${bounce} 2s ease-in-out infinite`
            })
          }}
        />
      </Zoom>
    );
  };

  const ShimmerEffect = () => {
    if (!selected || !animated) return null;

    return (
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `linear-gradient(90deg, transparent, ${alpha(theme.palette.primary.main, 0.1)}, transparent)`,
          animation: `${shimmer} 2s ease-in-out infinite`,
          pointerEvents: 'none'
        }}
      />
    );
  };

  return (
    <Fade in={true} timeout={300}>
      <Card
        elevation={getCardElevation()}
        sx={getCardStyles()}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={onSelect}
        {...props}
      >
        <ExpireWarning />
        <ShimmerEffect />

        <CardContent sx={{ p: 3 }}>
          {/* 头部：价值显示和状态 */}
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
            <ValueDisplay />
            <StatusChip />
          </Box>

          {/* 优惠券名称和描述 */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" gutterBottom fontWeight="medium">
              {coupon.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ opacity: 0.8 }}>
              {formatCouponDescription(coupon)}
            </Typography>
          </Box>

          {/* 过期进度条 */}
          {coupon.status === 1 && (
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  有效期进度
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {expireProgress.toFixed(0)}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={expireProgress}
                sx={{
                  height: 4,
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.grey[500], 0.1),
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 2,
                    bgcolor: expiringSoon ? theme.palette.warning.main : theme.palette.success.main
                  }
                }}
              />
            </Box>
          )}

          <Divider sx={{ my: 2 }} />

          {/* 优惠券码 */}
          <Box
            sx={{
              p: 1.5,
              bgcolor: alpha(theme.palette.grey[500], 0.05),
              borderRadius: 1,
              border: `1px dashed ${alpha(theme.palette.divider, 0.3)}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: 2
            }}
          >
            <Typography
              variant="body2"
              fontFamily="monospace"
              sx={{
                letterSpacing: 1,
                fontWeight: 'medium'
              }}
            >
              {coupon.code}
            </Typography>
            <Tooltip title={copied ? '已复制!' : '复制优惠券码'}>
              <IconButton size="small" onClick={handleCopy} sx={{ color: copied ? 'success.main' : 'text.secondary' }}>
                {copied ? <CheckIcon fontSize="small" /> : <CopyIcon fontSize="small" />}
              </IconButton>
            </Tooltip>
          </Box>

          {/* 操作按钮 */}
          {showActions && (
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {onShare && (
                  <Tooltip title="分享优惠券">
                    <IconButton size="small" onClick={() => onShare(coupon)}>
                      <ShareIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>

              {coupon.status === 1 && onUse && (
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => onUse(coupon)}
                  sx={{
                    background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.dark} 90%)`,
                    '&:hover': {
                      transform: 'scale(1.05)'
                    }
                  }}
                >
                  立即使用
                </Button>
              )}

              {coupon.status === 2 && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TrendingIcon fontSize="small" color="success" />
                  <Typography variant="caption" color="success.main" fontWeight="medium">
                    节省了 ${coupon.saved_amount || 0}
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </CardContent>
      </Card>
    </Fade>
  );
};

export default EnhancedCouponCard;
