// assets
import { IconTicket, IconGift, IconCalendarCheck, IconSparkles, IconDashboard } from '@tabler/icons-react';

// constant
const icons = { IconTicket, IconGift, IconCalendarCheck, IconSparkles, IconDashboard };

// ==============================|| COUPON MENU ITEMS ||============================== //

const coupon = {
  id: 'coupon',
  title: '优惠券系统',
  type: 'group',
  children: [
    {
      id: 'user-coupon',
      title: '我的优惠券',
      type: 'collapse',
      icon: icons.IconTicket,
      children: [
        {
          id: 'user-coupon-basic',
          title: '基础版',
          type: 'item',
          url: '/panel/user/coupon',
          breadcrumbs: false
        },
        {
          id: 'user-coupon-enhanced',
          title: '增强版',
          type: 'item',
          url: '/panel/user/coupon/enhanced',
          breadcrumbs: false
        }
      ]
    },
    {
      id: 'coupon-management',
      title: '优惠券管理',
      type: 'collapse',
      icon: icons.IconGift,
      isAdmin: true,
      children: [
        {
          id: 'coupon-management-basic',
          title: '基础管理',
          type: 'item',
          url: '/panel/coupon',
          breadcrumbs: false,
          isAdmin: true
        },
        {
          id: 'coupon-management-enhanced',
          title: '增强管理',
          type: 'item',
          url: '/panel/coupon/enhanced',
          breadcrumbs: false,
          isAdmin: true
        }
      ]
    }
  ]
};

export default coupon;
