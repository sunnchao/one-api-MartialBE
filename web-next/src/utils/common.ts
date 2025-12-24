import { message } from 'antd';
import { API } from './api';
import Decimal from 'decimal.js';

export function getSystemName() {
  if (typeof window === 'undefined') return 'Chirou API';
  let system_name = localStorage.getItem('system_name');
  if (!system_name) return 'Chirou API';
  return system_name;
}

export function isMobile() {
  if (typeof window === 'undefined') return false;
  return window.innerWidth <= 600;
}

export function showError(error: any) {
  if (error.message) {
    if (error.name === 'AxiosError') {
      switch (error.response?.status) {
        case 429:
          message.error('错误：请求次数过多，请稍后再试！');
          break;
        case 500:
          message.error('错误：服务器内部错误，请联系管理员！');
          break;
        case 405:
          message.info('本站仅作演示之用，无服务端！');
          break;
        default:
          message.error('错误：' + error.message);
      }
    } else {
        message.error('错误：' + error.message);
    }
  } else {
    message.error('错误：' + error);
  }
}

export function showNotice(msg: string, isHTML = false) {
    // Antd message doesn't support HTML directly easily, stripping or showing as string
    message.info(msg);
}

export function showWarning(msg: string) {
  message.warning(msg);
}

export function showSuccess(msg: string) {
  message.success(msg);
}

export function showInfo(msg: string) {
  message.info(msg);
}

export function removeTrailingSlash(url: string) {
  return url.endsWith('/') ? url.slice(0, -1) : url;
}

export function verifyJSON(str: string) {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
}

export function copy(text: string, name = '') {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => {
        showSuccess(`复制${name}成功！`);
    }).catch(() => {
         message.error(`复制${name}失败，请手动复制`);
    });
  } else {
      message.error('当前环境不支持剪贴板操作');
  }
}

export async function getOAuthState() {
  try {
    const res = await API.get('/api/oauth/state');
    const { success, message: msg, data } = res.data;
    if (success) {
      return data;
    } else {
      showError(msg);
      return '';
    }
  } catch (error) {
    return '';
  }
}

export async function onGitHubOAuthClicked(github_client_id: string, openInNewTab = false) {
  const state = await getOAuthState();
  if (!state) return;
  let url = `https://github.com/login/oauth/authorize?client_id=${github_client_id}&state=${state}&scope=user:email`;
  if (openInNewTab) {
    window.open(url);
  } else {
    window.location.href = url;
  }
}

export async function onLarkOAuthClicked(lark_client_id: string) {
  const state = await getOAuthState();
  if (!state) return;
  const redirect_uri = `${window.location.origin}/oauth/lark`;
  window.open(
    `https://open.feishu.cn/open-apis/authen/v1/authorize?redirect_uri=${encodeURIComponent(redirect_uri)}&app_id=${lark_client_id}&state=${state}`
  );
}

export async function onLinuxDoOAuthClicked(
  linuxdo_client_id: string,
  openInNewTab = false,
  _linuxDoLoading?: boolean,
  setLinuxDoLoading?: (v: boolean) => void
) {
  setLinuxDoLoading?.(true);
  const state = await getOAuthState();
  if (!state) {
    setLinuxDoLoading?.(false);
    return;
  }
  const url = `https://connect.linux.do/oauth2/authorize?client_id=${linuxdo_client_id}&response_type=code&state=${state}&scope=user:profile`;
  if (openInNewTab) {
    window.open(url);
  } else {
    window.location.href = url;
  }
}

export async function getOIDCEndpoint() {
  try {
    const res = await API.get('/api/oauth/endpoint');
    const { success, message: msg, data } = res.data;
    if (success) return data;
    showError(msg);
    return '';
  } catch {
    return '';
  }
}

export async function onOIDCAuthClicked(openInNewTab = false) {
  const url = await getOIDCEndpoint();
  if (!url) return;
  if (openInNewTab) {
    window.open(url);
  } else {
    window.location.href = url;
  }
}

export async function onWebAuthnClicked(
  username: string,
  showErrorFn: (msg: any) => void,
  showSuccessFn: (msg: any) => void,
  navigateToStatus?: () => void
) {
  try {
    if (!window.PublicKeyCredential) {
      showErrorFn('您的浏览器不支持WebAuthn');
      return;
    }

    const base64urlToUint8Array = (base64url: string) => {
      if (!base64url || typeof base64url !== 'string') throw new Error('Invalid base64url input');
      let base64 = base64url.trim().replace(/-/g, '+').replace(/_/g, '/');
      base64 = base64.replace(/=/g, '');
      while (base64.length % 4) base64 += '=';
      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      return bytes;
    };

    const uint8ArrayToBase64url = (buffer: Uint8Array) => {
      let binary = '';
      for (let i = 0; i < buffer.byteLength; i++) binary += String.fromCharCode(buffer[i]);
      return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    };

    const beginResponse = await fetch('/api/webauthn/login/begin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username ? username.trim() : '' }),
    });
    const beginData = await beginResponse.json();
    if (!beginData.success) {
      showErrorFn(beginData.message || 'WebAuthn登录开始失败');
      return;
    }

    const publicKey = beginData.data.publicKey;
    const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions = {
      ...publicKey,
      challenge: base64urlToUint8Array(publicKey.challenge),
      allowCredentials:
        publicKey.allowCredentials?.map((cred: any) => ({
          ...cred,
          id: base64urlToUint8Array(cred.id),
        })) || [],
    };

    const credential = (await navigator.credentials.get({
      publicKey: publicKeyCredentialRequestOptions,
    })) as PublicKeyCredential | null;

    if (!credential) {
      showErrorFn('WebAuthn认证被取消');
      return;
    }

    const assertion = credential.response as AuthenticatorAssertionResponse;
    const credentialData = {
      id: credential.id,
      rawId: uint8ArrayToBase64url(new Uint8Array(credential.rawId)),
      type: credential.type,
      response: {
        authenticatorData: uint8ArrayToBase64url(new Uint8Array(assertion.authenticatorData)),
        clientDataJSON: uint8ArrayToBase64url(new Uint8Array(assertion.clientDataJSON)),
        signature: uint8ArrayToBase64url(new Uint8Array(assertion.signature)),
        userHandle: assertion.userHandle ? uint8ArrayToBase64url(new Uint8Array(assertion.userHandle)) : null,
      },
    };

    const finishResponse = await fetch('/api/webauthn/login/finish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentialData),
    });
    const finishData = await finishResponse.json();
    if (!finishData.success) {
      showErrorFn(finishData.message || 'WebAuthn登录验证失败');
      return;
    }

    showSuccessFn('WebAuthn登录成功');
    navigateToStatus?.();
    window.location.reload();
  } catch (error: any) {
    const name = error?.name;
    if (name === 'NotAllowedError') showErrorFn('WebAuthn认证被拒绝或超时');
    else if (name === 'NotSupportedError') showErrorFn('设备不支持WebAuthn');
    else if (name === 'InvalidStateError') showErrorFn('WebAuthn认证器状态无效');
    else if (name === 'SecurityError') showErrorFn('WebAuthn安全错误');
    else showErrorFn('WebAuthn登录失败: ' + (error?.message || String(error)));
  }
}

// ...

export function timestamp2string(timestamp: number) {
  let date = new Date(timestamp * 1000);
  let year = date.getFullYear().toString();
  let month = (date.getMonth() + 1).toString();
  let day = date.getDate().toString();
  let hour = date.getHours().toString();
  let minute = date.getMinutes().toString();
  let second = date.getSeconds().toString();
  if (month.length === 1) {
    month = '0' + month;
  }
  if (day.length === 1) {
    day = '0' + day;
  }
  if (hour.length === 1) {
    hour = '0' + hour;
  }
  if (minute.length === 1) {
    minute = '0' + minute;
  }
  if (second.length === 1) {
    second = '0' + second;
  }
  return year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second;
}

export function calculateQuota(quota: number, digits = 6) {
  let quotaPerUnit = localStorage.getItem('quota_per_unit');
  let quotaPerUnitNum = parseFloat(quotaPerUnit || '500000');

  return (quota / quotaPerUnitNum).toFixed(digits);
}

export function renderQuota(quota: number, digits = 2) {
  let displayInCurrency = localStorage.getItem('display_in_currency');
  let isCurrency = displayInCurrency === 'true';
  if (isCurrency) {
    if (quota < 0) {
      return '-$' + calculateQuota(Math.abs(quota), digits);
    }
    return '$' + calculateQuota(quota, digits);
  }
  return renderNumber(quota);
}

export function renderQuotaByMoney(money: number | string) {
  const quotaPerUnitNum = parseFloat(localStorage.getItem('quota_per_unit') || '500000');
  return new Decimal(Number(money)).mul(quotaPerUnitNum).toFixed(0);
}

export function renderNumber(num: number) {
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1) + 'B';
  } else if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 10000) {
    return (num / 1000).toFixed(1) + 'k';
  } else {
    return num.toString();
  }
}

export function renderQuotaWithPrompt(quota: number, digits: number) {
  let displayInCurrency = localStorage.getItem('display_in_currency');
  let isCurrency = displayInCurrency === 'true';
  if (isCurrency) {
    return `（等价金额：${renderQuota(quota, digits)}）`;
  }
  return '';
}

export const CHAT_LINKS = [
  { name: 'ChatGPT Next', url: 'https://chat.oneapi.pro/#/?settings={"key":"sk-{key}","url":"{server}"}', show: true },
  { name: 'chatgpt-web-midjourney-proxy', url: 'https://vercel.ddaiai.com/#/?settings={"key":"sk-{key}","url":"{server}"}', show: true },
  { name: 'AMA 问天', url: 'ama://set-api-key?server={server}&key=sk-{key}', show: true },
  { name: 'OpenCat', url: 'opencat://team/join?domain={server}&token=sk-{key}', show: true }
];

export function getChatLinks() {
  if (typeof window === 'undefined') return CHAT_LINKS;
  let links = CHAT_LINKS;
  let siteInfo = JSON.parse(localStorage.getItem('siteInfo') || '{}');
  let chatLinks = JSON.parse(siteInfo?.chat_links || '[]');

  if (chatLinks.length === 0) {
    links = CHAT_LINKS;
    if (siteInfo?.chat_link) {
      for (let i = 0; i < links.length; i++) {
        if (links[i].name === 'ChatGPT Next') {
          links[i].url = siteInfo.chat_link + `/#/?settings={"key":"sk-{key}","url":"{server}"}`;
          links[i].show = true;
          break;
        }
      }
    }
  } else {
    links = chatLinks;
  }

  links.sort((a: any, b: any) => {
    if (!a?.sort) return 1;
    if (!b?.sort) return -1;
    return b.sort - a.sort;
  });
  return links;
}

export function replaceChatPlaceholders(text: string, key: string, server: string) {
  const base64Pattern = /base64<\[([^\]]+)\]>/g;
  return text
    .replace(base64Pattern, (match, content) => {
      const replacedContent = content.replace('{key}', key).replace('{server}', server);
      try {
        return btoa(decodeURIComponent(replacedContent));
      } catch (error) {
        return replacedContent;
      }
    })
    .replace('{key}', key)
    .replace('{server}', server);
}

export function renderGroup(groups: any[], group: string) {
  if (group === '') {
    return '跟随用户分组';
  }
  return groups.find((g) => g.value === group)?.label || '未知';
}

export function valueFormatter(value: number, showSymbol = true, isM = true) {
  if (value >= 1000000000) {
    return (value / 1000000000).toFixed(1) + 'B';
  } else if (value >= 1000000) {
    return (value / 1000000).toFixed(1) + 'M';
  } else if (value >= 1000) {
    return (value / 1000).toFixed(1) + 'k';
  } else {
    return value.toString();
  }
}

export function thousandsSeparator(num: number) {
  return num.toLocaleString();
}

export function trims(obj: any): any {
  if (!obj) return obj;
  if (typeof obj === 'string') return obj.trim();
  if (typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) {
    return obj.map(trims);
  }
  const newObj: any = {};
  for (const key in obj) {
    newObj[key] = trims(obj[key]);
  }
  return newObj;
}

export function downloadTextAsFile(text: string, filename: string) {
  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
