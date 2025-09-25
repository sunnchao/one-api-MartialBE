/**
 * 端点类型映射配置
 */
const ENDPOINT_MAPPING = {
  8: 'OpenAI',
  14: 'Anthropic',
  25: 'Gemini',
  42: 'Gemini'
};

/**
 * 默认端点类型（当没有匹配到任何已知端点时）
 */
const DEFAULT_ENDPOINT = 'OpenAI';

/**
 * 根据端点ID数组获取支持的端点类型
 * @param {number[]} endPoints - 端点ID数组
 * @returns {string[]} 支持的端点类型数组
 */
export function getSupportedEndpoints(endPoints) {
  if (!endPoints || !Array.isArray(endPoints) || endPoints.length === 0) {
    return [DEFAULT_ENDPOINT];
  }

  // 获取所有匹配的端点类型，去重
  const supportedTypes = [...new Set(
    endPoints
      .map(id => ENDPOINT_MAPPING[id])
      .filter(Boolean) // 过滤掉 undefined
  )];

  // 如果没有找到任何匹配的端点类型，返回默认类型
  if (supportedTypes.length === 0) {
    return [DEFAULT_ENDPOINT];
  }

  // 如果包含 Anthropic 或者 Gemini，那么追加 OpenAI（如果还没有的话）
  if ((supportedTypes.includes('Anthropic') || supportedTypes.includes('Gemini')) &&
      !supportedTypes.includes('OpenAI')) {
    supportedTypes.push('OpenAI');
  }

  return supportedTypes;
}

/**
 * 检查是否支持特定的端点类型
 * @param {number[]} endPoints - 端点ID数组
 * @param {string} endpointType - 要检查的端点类型
 * @returns {boolean} 是否支持该端点类型
 */
export function supportsEndpoint(endPoints, endpointType) {
  const supportedTypes = getSupportedEndpoints(endPoints);
  return supportedTypes.includes(endpointType);
}

/**
 * 获取端点类型对应的颜色配置
 * @param {string} endpointType - 端点类型
 * @returns {object} 包含颜色配置的对象
 */
export function getEndpointColor(endpointType) {
  const colorMap = {
    'OpenAI': {
      backgroundColor: 'rgba(52, 211, 153, 0.1)',
      color: 'rgb(52, 211, 153)'
    },
    'Anthropic': {
      backgroundColor: 'rgba(205, 130, 88, 0.1)',
      color: 'rgb(205, 130, 88)'
    },
    'Gemini': {
      backgroundColor: 'rgba(66, 133, 244, 0.1)',
      color: 'rgb(66, 133, 244)'
    }
  };

  return colorMap[endpointType] || {
    backgroundColor: 'rgba(107, 114, 128, 0.1)',
    color: 'rgb(107, 114, 128)'
  };
}