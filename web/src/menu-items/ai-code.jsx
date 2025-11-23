import { Icon } from '@iconify/react';

const icons = {
  IconClaudeCode: () => <Icon width={20} icon="solar:book-bold-duotone" />,
  IconCodexCode: () => <Icon width={20} icon="solar:code-bold-duotone" />,
  IconGeminiCode: () => <Icon width={20} icon="solar:stars-bold-duotone" />
};

const AICode = {
  id: 'ai-code',
  title: 'AI Code',
  type: 'group',

  children: [
    {
      id: 'claude-code-tutorial',
      title: 'Claude Code',
      type: 'item',
      url: '/panel/claude-code',
      icon: icons.IconClaudeCode,
      breadcrumbs: false
    },
    {
      id: 'codex-code-tutorial',
      title: 'Codex Code',
      type: 'item',
      url: '/panel/codex-code',
      icon: icons.IconCodexCode,
      breadcrumbs: false
    },
    {
      id: 'gemini-code-tutorial',
      title: 'Gemini Code',
      type: 'item',
      url: '/panel/gemini-code',
      icon: icons.IconGeminiCode,
      breadcrumbs: false
    }
  ]
};

export default AICode;
