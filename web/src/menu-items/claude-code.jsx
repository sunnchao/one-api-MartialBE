import { Icon } from '@iconify/react';

const icons = {
  IconClaudeCode: () => <Icon width={20} icon="mdi:code-braces" />,
  IconSubscription: () => <Icon width={20} icon="solar:card-bold-duotone" />,
  IconTutorial: () => <Icon width={20} icon="solar:book-bold-duotone" />
};

const ClaudeCode = {
  id: 'claude-code',
  title: 'Claude Code',
  type: 'group',

  children: [
    {
      id: 'claude-code-tutorial',
      title: 'Claude Code',
      type: 'item',
      url: '/panel/claude-code',
      icon: icons.IconTutorial,
      breadcrumbs: false,
      isAdmin: true
    },
    {
      id: 'claude-code-subscription',
      title: '订阅管理',
      type: 'item',
      url: '/panel/claude-code/subscription',
      icon: icons.IconSubscription,
      breadcrumbs: false,
      isAdmin: true
    }
  ]
};

export default ClaudeCode;
