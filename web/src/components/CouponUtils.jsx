import React from 'react';
import { Chip, Typography, Box } from '@mui/material';
import { CardGiftcard as CouponIcon, LocalOffer as OfferIcon, MonetizationOn as MoneyIcon } from '@mui/icons-material';

// 优惠券工具类组件和函数

// 获取优惠券类型图标
export const getCouponTypeIcon = (type, props = {}) => {
  switch (type) {
    case 'percentage':
      return <OfferIcon {...props} />;
    case 'fixed':
      return <MoneyIcon {...props} />;
    case 'recharge':
      return <CouponIcon {...props} />;
    default:
      return <CouponIcon {...props} />;
  }
};

// 获取优惠券类型文本
export const getCouponTypeText = (type) => {
  switch (type) {
    case 'percentage':
      return '百分比折扣';
    case 'fixed':
      return '固定金额';
    case 'recharge':
      return '充值奖励';
    default:
      return '未知类型';
  }
};

// 获取优惠券状态颜色
export const getCouponStatusColor = (status) => {
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
export const getCouponStatusText = (status) => {
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
export const formatCouponDescription = (coupon) => {
  if (coupon.type === 'percentage') {
    return `${coupon.value}%折扣，满$${coupon.min_amount}可用${coupon.max_discount > 0 ? `，最多减$${coupon.max_discount}` : ''}`;
  } else if (coupon.type === 'fixed') {
    return `减$${coupon.value}，满$${coupon.min_amount}可用`;
  } else if (coupon.type === 'recharge') {
    return `充值满$${coupon.min_amount}额外获得$${coupon.value}额度`;
  }
  return coupon.description || '暂无描述';
};

// 判断优惠券是否即将过期（7天内）
export const isExpiringSoon = (expireTime, days = 7) => {
  const now = Date.now();
  const expire = new Date(expireTime);
  const diffDays = (expire - now) / (1000 * 60 * 60 * 24);
  return diffDays <= days && diffDays > 0;
};

// 获取过期时间显示文本
export const getExpireTimeText = (expireTime) => {
  const now = Date.now();
  const expire = new Date(expireTime);
  const diffDays = Math.ceil((expire - now) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return '已过期';
  if (diffDays === 0) return '今天过期';
  if (diffDays === 1) return '明天过期';
  if (diffDays <= 7) return `${diffDays}天后过期`;
  return expire.toLocaleDateString();
};

// 计算优惠券折扣
export const calculateDiscount = (coupon, orderAmount) => {
  if (orderAmount < coupon.min_amount) {
    return { valid: false, reason: `订单金额不足，需要至少$${coupon.min_amount}` };
  }

  let discountAmount = 0;

  switch (coupon.type) {
    case 'percentage':
      discountAmount = orderAmount * (coupon.value / 100);
      if (coupon.max_discount > 0 && discountAmount > coupon.max_discount) {
        discountAmount = coupon.max_discount;
      }
      break;
    case 'fixed':
      discountAmount = coupon.value;
      if (discountAmount > orderAmount) {
        discountAmount = orderAmount;
      }
      break;
    case 'recharge':
      discountAmount = coupon.value; // 充值奖励不是折扣
      break;
    default:
      return { valid: false, reason: '不支持的优惠券类型' };
  }

  return {
    valid: true,
    discountAmount,
    finalAmount: orderAmount - discountAmount
  };
};

// 优惠券状态标签组件
export const CouponStatusChip = ({ status, ...props }) => (
  <Chip label={getCouponStatusText(status)} color={getCouponStatusColor(status)} size="small" {...props} />
);

// 优惠券类型标签组件
export const CouponTypeChip = ({ type, ...props }) => <Chip label={getCouponTypeText(type)} variant="outlined" size="small" {...props} />;

// 优惠券值显示组件
export const CouponValueDisplay = ({ coupon }) => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      {getCouponTypeIcon(coupon.type, { color: 'primary' })}
      <Typography variant="h6" color="primary">
        {coupon.type === 'percentage' ? `${coupon.value}% OFF` : `$${coupon.value}`}
      </Typography>
    </Box>
  );
};

// 优惠券卡片组件
export const CouponCard = ({ coupon, onClick, selected = false, showActions = false, actions = null, ...props }) => {
  return (
    <Box
      sx={{
        p: 2,
        border: 1,
        borderColor: selected ? 'primary.main' : 'divider',
        borderRadius: 1,
        cursor: onClick ? 'pointer' : 'default',
        position: 'relative',
        backgroundColor: selected ? 'primary.light' : 'background.paper',
        opacity: coupon.status === 1 ? 1 : 0.7,
        '&:hover': onClick
          ? {
              borderColor: 'primary.main',
              boxShadow: 1
            }
          : {}
      }}
      onClick={onClick}
      {...props}
    >
      {/* 即将过期提醒 */}
      {isExpiringSoon(coupon.expire_time) && coupon.status === 1 && (
        <Chip label="即将过期" color="warning" size="small" sx={{ position: 'absolute', top: 8, right: 8 }} />
      )}

      {/* 优惠券内容 */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
        <CouponValueDisplay coupon={coupon} />
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="subtitle1" gutterBottom>
            {coupon.name}
          </Typography>
          <CouponStatusChip status={coupon.status} />
        </Box>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {formatCouponDescription(coupon)}
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          {getExpireTimeText(coupon.expire_time)}
        </Typography>
        {showActions && actions}
      </Box>
    </Box>
  );
};

// 优惠券统计组件
export const CouponStats = ({ coupons }) => {
  const stats = {
    total: coupons.length,
    available: coupons.filter((c) => c.status === 1).length,
    used: coupons.filter((c) => c.status === 2).length,
    expired: coupons.filter((c) => c.status === 3).length,
    expiringSoon: coupons.filter((c) => c.status === 1 && isExpiringSoon(c.expire_time)).length
  };

  return (
    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
      <Chip label={`总计: ${stats.total}`} variant="outlined" />
      <Chip label={`可用: ${stats.available}`} color="success" />
      <Chip label={`已用: ${stats.used}`} color="default" />
      <Chip label={`过期: ${stats.expired}`} color="error" />
      {stats.expiringSoon > 0 && <Chip label={`即将过期: ${stats.expiringSoon}`} color="warning" />}
    </Box>
  );
};

// 验证优惠券码格式
export const validateCouponCode = (code) => {
  // 优惠券码格式：XXXX-XXXX-XXXX
  const pattern = /^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
  return pattern.test(code);
};

// 格式化优惠券码输入
export const formatCouponCodeInput = (input) => {
  // 移除所有非字母数字字符，转换为大写
  const cleaned = input.replace(/[^A-Z0-9]/g, '').toUpperCase();

  // 按4个字符分组，用连字符连接
  const groups = [];
  for (let i = 0; i < cleaned.length; i += 4) {
    groups.push(cleaned.slice(i, i + 4));
  }

  return groups.join('-').slice(0, 14); // 限制最大长度
};

export default {
  getCouponTypeIcon,
  getCouponTypeText,
  getCouponStatusColor,
  getCouponStatusText,
  formatCouponDescription,
  isExpiringSoon,
  getExpireTimeText,
  calculateDiscount,
  CouponStatusChip,
  CouponTypeChip,
  CouponValueDisplay,
  CouponCard,
  CouponStats,
  validateCouponCode,
  formatCouponCodeInput
};
