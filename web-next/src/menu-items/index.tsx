// Placeholder icons, mapped to Ant Design
import { 
  DashboardOutlined, 
  BarChartOutlined, 
  InfoCircleOutlined, 
  PlayCircleOutlined, 
  UserOutlined,
  PartitionOutlined,
  ShoppingOutlined,
  DollarOutlined,
  RobotOutlined,
  SettingOutlined,
  KeyOutlined,
  ProfileOutlined,
  FileTextOutlined,
  PictureOutlined,
  UnorderedListOutlined
} from '@ant-design/icons';

const icons = {
  IconDashboard: DashboardOutlined,
  IconChartHistogram: BarChartOutlined,
  IconList: BarChartOutlined,
  IconBallFootball: PlayCircleOutlined,
  IconSystemInfo: InfoCircleOutlined,
  IconUser: UserOutlined,
  IconSitemap: PartitionOutlined,
  IconBasket: ShoppingOutlined,
  IconUsers: UserOutlined,
  IconReceipt2: DollarOutlined,
  IconBrandTelegram: RobotOutlined,
  IconModel: RobotOutlined,
  IconInfo: InfoCircleOutlined,
  IconClaudeCodeAdmin: RobotOutlined,
  IconCoin: DollarOutlined,
  IconBrandPaypal: DollarOutlined,
  IconKey: KeyOutlined,
  IconUserScan: ProfileOutlined,
  IconSettingsCog: SettingOutlined,
  IconArticle: FileTextOutlined,
  IconInvoice: DollarOutlined,
  IconBrush: PictureOutlined,
  IconChecklist: UnorderedListOutlined
};

const dashboard = {
  id: 'dashboard',
  title: 'Dashboard',
  type: 'group',
  children: [
    {
      id: 'dashboard',
      title: '总览',
      type: 'item',
      url: '/panel/dashboard',
      icon: icons.IconDashboard,
      breadcrumbs: false,
      isAdmin: false
    },
    {
      id: 'analytics',
      title: '分析',
      type: 'item',
      url: '/panel/analytics',
      icon: icons.IconChartHistogram,
      breadcrumbs: false,
      isAdmin: true
    },
    {
      id: 'multi_user_stats',
      title: '多用户统计',
      type: 'item',
      url: '/panel/multi_user_stats',
      icon: icons.IconList,
      breadcrumbs: false,
      isAdmin: true
    },
    {
      id: 'playground',
      title: 'Playground',
      type: 'item',
      url: '/panel/playground',
      icon: icons.IconBallFootball,
      breadcrumbs: false
    },
    {
      id: 'systemInfo',
      title: '系统信息',
      type: 'item',
      url: '/panel/system_info',
      icon: icons.IconSystemInfo,
      breadcrumbs: false,
      isAdmin: true
    }
  ]
};

const usage = {
  id: 'usage',
  title: 'Usage',
  type: 'group',
  children: [
    {
      id: 'log',
      title: '日志',
      type: 'item',
      url: '/panel/log',
      icon: icons.IconArticle,
      breadcrumbs: false
    },
    // {
    //   id: 'invoice',
    //   title: '月度账单',
    //   type: 'item',
    //   url: '/panel/invoice',
    //   icon: icons.IconInvoice,
    //   breadcrumbs: false
    // },
    {
      id: 'midjourney',
      title: 'Midjourney',
      type: 'item',
      url: '/panel/midjourney',
      icon: icons.IconBrush,
      breadcrumbs: false
    },
    {
      id: 'task',
      title: '异步任务',
      type: 'item',
      url: '/panel/task',
      icon: icons.IconChecklist,
      breadcrumbs: false
    }
  ]
};

const setting = {
  id: 'setting',
  title: 'Setting',
  type: 'group',
  children: [
    {
      id: 'user',
      title: '用户',
      type: 'item',
      url: '/panel/user',
      icon: icons.IconUser,
      breadcrumbs: false,
      isAdmin: true
    },
    {
      id: 'channel',
      title: '渠道',
      type: 'item',
      url: '/panel/channel',
      icon: icons.IconSitemap,
      breadcrumbs: false,
      isAdmin: true
    },
    {
      id: 'operation',
      title: '运营',
      type: 'collapse',
      icon: icons.IconBasket,
      isAdmin: true,
      children: [
        {
          id: 'user_group',
          title: '用户分组',
          type: 'item',
          url: '/panel/user_group',
          icon: icons.IconUsers,
          breadcrumbs: false,
          isAdmin: true
        },
        {
          id: 'pricing',
          title: '模型价格',
          type: 'item',
          url: '/panel/pricing',
          icon: icons.IconReceipt2,
          breadcrumbs: false,
          isAdmin: true
        },
        {
          id: 'telegram',
          title: 'Telegram Bot',
          type: 'item',
          url: '/panel/telegram',
          icon: icons.IconBrandTelegram,
          breadcrumbs: false,
          isAdmin: true
        },
        {
          id: 'model_ownedby',
          title: '模型归属',
          type: 'item',
          url: '/panel/model_ownedby',
          icon: icons.IconModel,
          breadcrumbs: false,
          isAdmin: true
        },
        {
          id: 'model_info',
          title: '模型详情',
          type: 'item',
          url: '/panel/model_info',
          icon: icons.IconInfo,
          breadcrumbs: false,
          isAdmin: true
        },
        {
          id: 'operation_subscriptions',
          title: '套餐管理',
          type: 'item',
          url: '/panel/operation_subscriptions',
          icon: icons.IconClaudeCodeAdmin,
          breadcrumbs: false,
          isAdmin: true
        }
      ]
    },
    {
      id: 'paySetting',
      title: '支付设置',
      type: 'collapse',
      icon: icons.IconBrandPaypal,
      isAdmin: true,
      children: [
        {
          id: 'redemption',
          title: '兑换',
          type: 'item',
          url: '/panel/redemption',
          icon: icons.IconCoin,
          breadcrumbs: false,
          isAdmin: true
        },
        {
          id: 'payment',
          title: '支付',
          type: 'item',
          url: '/panel/payment',
          icon: icons.IconBrandPaypal,
          breadcrumbs: false,
          isAdmin: true
        }
      ]
    },
    {
      id: 'topup',
      title: '充值',
      type: 'item',
      url: '/panel/topup',
      icon: icons.IconCoin, // Reuse coin icon or find another
      breadcrumbs: false,
      isAdmin: false // Everyone needs topup
    },
    {
      id: 'token',
      title: '令牌',
      type: 'item',
      url: '/panel/token',
      icon: icons.IconKey,
      breadcrumbs: false
    },
    {
      id: 'profile',
      title: '个人设置',
      type: 'item',
      url: '/panel/profile',
      icon: icons.IconUserScan,
      breadcrumbs: false,
      isAdmin: false
    },
    {
      id: 'setting',
      title: '设置',
      type: 'item',
      url: '/panel/setting',
      icon: icons.IconSettingsCog,
      breadcrumbs: false,
      isAdmin: true
    }
  ]
};

const menuItems = {
  items: [dashboard, usage, setting]
};

export default menuItems;
