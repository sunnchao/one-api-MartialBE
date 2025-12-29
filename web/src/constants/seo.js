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
  title: 'Chirou API - 让 AI 为您服务',
  description:
    'Chirou API 提供多家主流模型供应商的统一接入与计费，具备魔法般的响应速度、星级稳定性保障以及灵活扩展能力，帮助开发者快速构建 AI 应用。',
  keywords: ['Chirou API', 'AI 接口', 'OpenAI 代理', 'Claude', 'Gemini', '多模型聚合'],
  robots: 'index,follow',
  openGraph: {
    type: 'website',
    siteName: 'Chirou API',
    image: getAbsoluteUrl(DEFAULT_IMAGE_PATH)
  },
  twitter: {
    card: 'summary_large_image',
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
    title: '✨ Chirou API - 让 AI 为您服务',
    description:
      'Chirou API 聚合 OpenAI、Claude、Gemini 等主流模型供应商，提供极速稳定的接口体验与灵活计费方案，让您的应用拥有真正的魔法力量。',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Chirou API',
      url: getAbsoluteUrl('/'),
      logo: getAbsoluteUrl(DEFAULT_IMAGE_PATH),
      description: '让 AI 为您服务的接口平台，提供魔法般的响应速度和星级稳定性保障，支持 OpenAI、Claude、Gemini 等主流模型。'
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
  '/packages': {
    title: 'Claude Code 套餐 - Chirou API',
    description: '订阅 Claude Code 套餐，体验面向开发者的专业编程助手能力与增值服务。'
  },
  '/codex-code': {
    title: 'Codex Code 套餐 - Chirou API',
    description: '探索 Codex Code 套餐，为开发者提供高效的 AI 编程体验与全方位支持。'
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
