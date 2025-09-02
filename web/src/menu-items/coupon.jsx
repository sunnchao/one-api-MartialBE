// assets
import { IconTicket, IconGift, IconCalendarCheck, IconSparkles, IconDashboard } from '@tabler/icons-react';

// constant
const icons = { IconTicket, IconGift, IconCalendarCheck, IconSparkles, IconDashboard };

// ==============================|| COUPON MENU ITEMS ||============================== //

const coupon = {
  id: 'coupon',
  title: '优惠券',
  type: 'group',
  children: [
    {
      id: 'user-coupon',
      title: '我的优惠券',
      type: 'item',
      icon: icons.IconTicket,
      url: '/panel/user/coupon/enhanced',
      breadcrumbs: false
    },
    {
      id: 'coupon-management',
      title: '优惠券管理',
      type: 'item',
      icon: icons.IconGift,
      url: '/panel/coupon/enhanced',
      breadcrumbs: false,
      isAdmin: true
    }
  ]
};

export default coupon;
