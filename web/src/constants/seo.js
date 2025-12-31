const DEFAULT_BASE_URL = (import.meta.env.VITE_PUBLIC_SITE_URL || '').replace(/\/$/, '');

const DEFAULT_IMAGE_PATH = '/favicon.ico';

const getAbsoluteUrl = (path = '') => {
  if (!path) {
    return DEFAULT_BASE_URL;
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  if (DEFAULT_BASE_URL) {
    return `${DEFAULT_BASE_URL}${normalizedPath}`;
  }

  if (typeof window !== 'undefined' && window.location) {
    return `${window.location.origin}${normalizedPath}`;
  }

  return normalizedPath;
};

const mergeSeo = (base, override = {}) => ({
  ...base,
  ...override,
  openGraph: {
    ...base.openGraph,
    ...override.openGraph
  },
  twitter: {
    ...base.twitter,
    ...override.twitter
  }
});

const DEFAULT_SEO = {
  title: 'Chirou API - Vibe Coding AI编程助手',
  description:
    'Chirou API - Vibe Coding AI编程助手全家桶。支持Claude Code、Codex CLI、Gemini CLI三大AI编程工具，让AI帮你写代码。提供OpenAI、Claude、Gemini等主流大模型API接口，极速响应，稳定可靠。',
  keywords: ['Vibe Coding', 'AI编程助手', 'Claude Code', 'Codex CLI', 'Gemini CLI', 'AI写代码', 'Chirou API', 'OpenAI API', 'Claude API', 'Gemini API', 'AI代码生成', '智能编程', 'AI辅助开发', 'Cursor替代', 'Copilot替代', '大模型API'],
  robots: 'index,follow',
  openGraph: {
    type: 'website',
    siteName: 'Chirou API',
    title: 'Chirou API - Vibe Coding AI编程助手全家桶',
    description: '支持Claude Code、Codex CLI、Gemini CLI三大AI编程工具。提供OpenAI、Claude、Gemini等主流大模型API接口，让AI帮你写代码。',
    image: getAbsoluteUrl(DEFAULT_IMAGE_PATH)
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Chirou API - Vibe Coding AI编程助手全家桶',
    description: '支持Claude Code、Codex CLI、Gemini CLI三大AI编程工具。提供OpenAI、Claude、Gemini等主流大模型API接口。',
    image: getAbsoluteUrl(DEFAULT_IMAGE_PATH)
  }
};

const PANEL_SEO = {
  title: '控制台 - Chirou API',
  description: '管理 Chirou API 的通道、套餐、账单与用户配置。',
  robots: 'noindex,nofollow',
  openGraph: {
    type: 'website',
    title: 'Chirou API 控制台',
    description: '管理通道、账单、套餐与权限的运营控制台。'
  }
};

const ROUTE_SEO = {
  '/': {
    title: '✨ Chirou API - Vibe Coding AI编程助手 | Claude Code/Codex CLI/Gemini CLI',
    description:
      'Chirou API - Vibe Coding AI编程助手全家桶。支持Claude Code、Codex CLI、Gemini CLI三大AI编程工具，让AI帮你写代码。提供OpenAI、Claude、Gemini等主流大模型API接口。',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Chirou API',
      url: getAbsoluteUrl('/'),
      logo: getAbsoluteUrl(DEFAULT_IMAGE_PATH),
      description: 'Vibe Coding AI编程助手平台，支持Claude Code、Codex CLI、Gemini CLI，提供OpenAI、Claude、Gemini等主流大模型API接口。'
    }
  },
  '/about': {
    title: '关于我们 - Chirou API',
    description: '了解 Chirou API 的项目背景、开源生态与愿景，探索我们为开发者打造的多模型聚合平台。'
  },
  '/price': {
    title: '模型价格 - Chirou API',
    description: '查看 Chirou API 支持的各类模型价格与计费方式，快速评估成本并选择合适的模型方案。'
  },
  '/claude-code': {
    title: 'Claude Code - Vibe Coding AI终端编程助手 | Anthropic Claude Opus 4.5',
    description: 'Claude Code 是 Anthropic 官方推出的 AI 编程助手，基于 Claude Opus 4.5 驱动，支持终端集成、结对编程、智能调试与文档生成。Vibe Coding 必备工具。',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: 'Claude Code',
      description: 'Anthropic 官方 AI 编程助手，基于 Claude Opus 4.5，支持终端集成和结对编程',
      brand: { '@type': 'Brand', name: 'Anthropic' }
    }
  },
  '/packages': {
    title: 'Claude Code 套餐 - Vibe Coding AI编程助手订阅 | Chirou API',
    description: '订阅 Claude Code 套餐，体验 Anthropic 官方 AI 编程助手。支持 Claude Opus 4.5 驱动的智能编程、代码补全、调试与文档生成。Vibe Coding 开发者首选。'
  },
  '/codex-code': {
    title: 'Codex CLI - Vibe Coding AI编程助手 | OpenAI GPT 5.2 驱动',
    description: '探索 OpenAI Codex CLI 套餐，基于 GPT 5.2 的企业级 AI 编程助手。支持实时联网、智能代码重构、VSCode 深度集成。Vibe Coding 高效开发工具。',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: 'Codex CLI',
      description: 'OpenAI 企业级 AI 编程助手，基于 GPT 5.2，支持实时联网和智能重构',
      brand: { '@type': 'Brand', name: 'OpenAI' }
    }
  },
  '/gemini-code': {
    title: 'Gemini CLI - Vibe Coding AI编程助手 | Google 1M上下文 Agent模式',
    description: 'Google Gemini CLI，支持 1M tokens 超大上下文的 AI 编程助手。内置 Agent Mode 自动规划、Google Search 和多模态输入。Vibe Coding 云端开发利器。',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: 'Gemini CLI',
      description: 'Google AI 编程助手，支持 1M tokens 超大上下文和 Agent Mode',
      brand: { '@type': 'Brand', name: 'Google' }
    }
  },
  '/playground': {
    title: '体验中心 - Chirou API',
    description: '在 Chirou API Playground 快速测试模型能力，调试提示词并体验实时响应。',
    robots: 'index,follow'
  },
  '/login': {
    title: '登录 - Chirou API',
    description: '登录 Chirou API，管理您的 API 密钥、套餐与账单。',
    robots: 'noindex,nofollow'
  },
  '/register': {
    title: '注册 - Chirou API',
    description: '注册 Chirou API 账户，立即接入多家主流模型供应商。',
    robots: 'noindex,nofollow'
  },
  '/reset': {
    title: '找回密码 - Chirou API',
    description: '通过 Chirou API 重置密码，安全找回您的账户。',
    robots: 'noindex,nofollow'
  },
  '/user/reset': {
    title: '重设密码 - Chirou API',
    description: '更新您的 Chirou API 账户密码，保障账号安全。',
    robots: 'noindex,nofollow'
  }
};

const stripTrailingSlash = (path) => (path !== '/' ? path.replace(/\/+$/, '') || '/' : '/');

export const resolveSeoMeta = (pathname = '/') => {
  if (!pathname) {
    return DEFAULT_SEO;
  }

  const normalizedPath = stripTrailingSlash(pathname.split('?')[0].toLowerCase());

  let matchKey = null;
  let tempPath = normalizedPath;

  while (!matchKey && tempPath !== '') {
    if (ROUTE_SEO[tempPath]) {
      matchKey = tempPath;
      break;
    }

    const lastSlashIndex = tempPath.lastIndexOf('/');
    if (lastSlashIndex <= 0) {
      break;
    }
    tempPath = tempPath.substring(0, lastSlashIndex);
  }

  const resolved = mergeSeo(DEFAULT_SEO, matchKey ? ROUTE_SEO[matchKey] : ROUTE_SEO['/']);

  if (normalizedPath.startsWith('/panel')) {
    return mergeSeo(resolved, PANEL_SEO);
  }

  return resolved;
};

export const getCanonicalUrl = (pathname = '/') => {
  const cleanedPath = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return getAbsoluteUrl(cleanedPath);
};

export const getBaseUrl = () => getAbsoluteUrl('');
