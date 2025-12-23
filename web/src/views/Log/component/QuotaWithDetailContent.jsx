import { Box, Typography, Chip, Alert } from '@mui/material';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PercentIcon from '@mui/icons-material/Percent';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import CalculateIcon from '@mui/icons-material/Calculate';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import Decimal from 'decimal.js';
import { renderQuota } from 'utils/common';
import { calculateOriginalQuota } from './QuotaWithDetailRow';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

// Function to calculate price
export function calculatePrice(ratio, groupDiscount, isTimes, priceMultiplier = 0.002, cacheRatio) {
  // Ensure inputs are valid numbers
  ratio = ratio || 0;
  groupDiscount = groupDiscount || 0;

  let discount = new Decimal(ratio).mul(groupDiscount);

  if (!isTimes) {
    discount = discount.mul(1000);
  }

  // Calculate the price as a Decimal
  let priceDecimal = discount.mul(priceMultiplier);

  if (cacheRatio) {
    priceDecimal = priceDecimal.mul(cacheRatio);
  }

  // For display purposes, format with 6 decimal places and trim trailing zeros
  let priceString = priceDecimal.toFixed(6);
  priceString = priceString.replace(/(\.\d*?[1-9])0+$|\.0*$/, '$1');

  // For calculations, return the actual number value
  return priceString;
}

// QuotaWithDetailContent is responsible for rendering the detailed content
export default function QuotaWithDetailContent({ item, userGroup, totalInputTokens, totalOutputTokens }) {
  console.log(item);
  const { t } = useTranslation();
  // Calculate the original quota based on the formula
  const originalQuota = calculateOriginalQuota(item);
  const quota = item.quota || 0;

  const priceType = item.metadata?.price_type || 'tokens';
  const extraBilling = item?.metadata?.extra_billing || {};

  // Get input/output prices from metadata with appropriate defaults
  const originalInputPrice =
    item.metadata?.input_price_origin || (item.metadata?.input_ratio ? `$${calculatePrice(item.metadata.input_ratio, 1, false)}` : '$0');
  const originalOutputPrice =
    item.metadata?.output_price_origin || (item.metadata?.output_ratio ? `$${calculatePrice(item.metadata.output_ratio, 1, false)}` : '$0');
  const originalCachedWritePrice =
    item.metadata?.cached_write_tokens_price_origin ||
    (item.metadata?.cached_write_tokens_ratio
      ? `$${calculatePrice(item.metadata.input_ratio, 1, false, 0.002, item.metadata.cached_write_tokens_ratio)}`
      : '$0');
  const originalCachedReadPrice =
    item.metadata?.cached_read_token_price_origin ||
    (item.metadata?.cached_read_tokens_ratio
      ? `$${calculatePrice(item.metadata.input_ratio, 1, false, 0.002, item.metadata.cached_read_tokens_ratio)}`
      : '$0');
  const originalReasoningPrice =
    item.metadata?.reasoning_tokens_price_origin ||
    (item.metadata?.reasoning_tokens_ratio
      ? `$${calculatePrice(item.metadata.input_ratio, 1, false, 0.002, item.metadata.reasoning_tokens_ratio)}`
      : '$0');

  // Calculate actual prices based on ratios and group discount
  const groupRatio = item.metadata?.group_ratio || 1;
  const inputPrice =
    item.metadata?.input_price || (item.metadata?.input_ratio ? `$${calculatePrice(item.metadata.input_ratio, groupRatio, false)} ` : '$0');
  //
  const cachedWritePrice =
    item.metadata?.cached_write_tokens_price ||
    (item.metadata?.cached_write_tokens_ratio
      ? `$${calculatePrice(item.metadata.input_ratio, groupRatio, false, 0.002, item.metadata.cached_write_tokens_ratio)} `
      : '$0');
  const cachedReadPrice =
    item.metadata?.cached_read_tokens_price ||
    (item.metadata?.cached_read_tokens_ratio
      ? `$${calculatePrice(item.metadata.input_ratio, groupRatio, false, 0.002, item.metadata.cached_read_tokens_ratio)} `
      : '$0');
  const reasoningPrice =
    item.metadata?.reasoning_tokens_price ||
    (item.metadata?.reasoning_tokens_ratio
      ? `$${calculatePrice(item.metadata.input_ratio, groupRatio, false, 0.002, item.metadata.reasoning_tokens_ratio)} `
      : '$0');
  const outputPrice =
    item.metadata?.output_price ||
    (item.metadata?.output_ratio ? `$${calculatePrice(item.metadata.output_ratio, groupRatio, false)}` : '$0');

  const originaInputPriceUnit = originalInputPrice + ' /M';
  const originaOutPriceUnit = originalOutputPrice + ' /M';
  const originalCachedWritePriceUnit = originalCachedWritePrice + ' /M';
  const originalCachedReadPriceUnit = originalCachedReadPrice + ' /M';
  const originalReasoningPriceUnit = originalReasoningPrice + ' /M';
  const cachedWritePriceUnit = cachedWritePrice + ' /M';
  const cachedReadPriceUnit = cachedReadPrice + ' /M';
  const reasoningPriceUnit = reasoningPrice + ' /M';
  
  const inputPriceUnit = inputPrice + ' /M';
  const outputPriceUnit = outputPrice + ' /M';

  let calculateSteps = '';
  if (priceType === 'tokens') {
    calculateSteps = `(${totalInputTokens} / 1M × ${inputPrice} x ${groupRatio}倍)`;
    if (totalOutputTokens > 0) {
      calculateSteps += ` + (${totalOutputTokens} / 1M × ${outputPrice} x ${groupRatio}倍)`;
    }
  } else {
    calculateSteps = `${inputPrice}`;
  }

  const extraBillingSteps = [];

  if (extraBilling && Object.keys(extraBilling).length > 0) {
    Object.entries(extraBilling).forEach(([key, data]) => {
      if (data.type !== '') {
        extraBillingSteps.push(`${key}[${data.type}] : $${data.price} x ${data.call_count}`);
      } else {
        extraBillingSteps.push(`${key} : $${data.price} x ${data.call_count}`);
      }
    });
  }

  if (extraBillingSteps.length > 0) {
    calculateSteps += ` + (${extraBillingSteps.join(' + ')}) x ${groupRatio}`;
  }

  let savePercent = '';
  if (originalQuota > 0 && quota > 0 && groupRatio < 1) {
    savePercent = `${t('logPage.quotaDetail.saved')}${((1 - quota / originalQuota) * 100).toFixed(0)}%`;
  }

  // 检查是否为资源包抵扣
  const isResourcePackage = item?.metadata?.billing_type === 'resource_package';
  const resourcePackageId = item?.metadata?.resource_package_id;
  const packageServiceType = item?.metadata?.package_service_type;

  // 服务类型显示名称映射
  const serviceTypeNames = {
    claude_code: 'Claude Code',
    codex_code: 'Codex Code',
    gemini_code: 'Gemini Code'
  };

  return (
    <Box
      sx={{
        borderRadius: 0,
        background: (theme) => theme.palette.background.paper,
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 2
      }}
    >
      {/* 资源包抵扣提示 */}
      {isResourcePackage && (
        <Alert
          severity="warning"
          icon={<CardGiftcardIcon fontSize="inherit" />}
          sx={{
            borderRadius: 0,
            '& .MuiAlert-message': {
              width: '100%'
            }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              本次消费已由资源包抵扣
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              {packageServiceType && (
                <Chip label={serviceTypeNames[packageServiceType] || packageServiceType} size="small" color="primary" variant="outlined" />
              )}
              {resourcePackageId && <Chip label={`资源包 #${resourcePackageId}`} size="small" color="warning" variant="filled" />}
            </Box>
          </Box>
          <Typography variant="caption" sx={{ mt: 0.5, display: 'block', color: 'text.secondary' }}>
            此次请求未消耗用户余额，已从资源包中扣除 {renderQuota(quota, 6)}
          </Typography>
        </Alert>
      )}

      {/* 上方三栏 */}
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          overflowX: 'auto',
          '&::-webkit-scrollbar': {
            height: '6px'
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: (theme) => theme.palette.divider,
            borderRadius: '0'
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'transparent'
          }
        }}
      >
        {/* 原始价格 */}
        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            p: 2,
            borderRadius: 0,
            background: (theme) => (theme.palette.mode === 'dark' ? theme.palette.background.default : '#fafbfc')
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <AttachMoneyIcon sx={{ fontSize: 20, mr: 1, color: (theme) => theme.palette.info.main }} />
            <Typography sx={{ fontWeight: 600, fontSize: 12 }}>{t('logPage.quotaDetail.originalPrice')}</Typography>
          </Box>
          <Typography sx={{ fontSize: 12, color: (theme) => theme.palette.text.secondary, mb: 0.5, textAlign: 'left' }}>
            {t('logPage.quotaDetail.inputPrice')}: {originaInputPriceUnit}
          </Typography>
          <Typography sx={{ fontSize: 12, color: (theme) => theme.palette.text.secondary, textAlign: 'left' }}>
            {t('logPage.quotaDetail.outputPrice')}: {originaOutPriceUnit}
          </Typography>
          {item.metadata?.cached_write_tokens > 0 && (
            <Typography sx={{ fontSize: 12, color: (theme) => theme.palette.text.secondary, mt: 0.5, textAlign: 'left' }}>
              {t('logPage.quotaDetail.cachedWritePrice')}: {originalCachedWritePriceUnit}
            </Typography>
          )}
          {item.metadata?.cached_read_tokens > 0 && (
            <Typography sx={{ fontSize: 12, color: (theme) => theme.palette.text.secondary, mt: 0.5, textAlign: 'left' }}>
              {t('logPage.quotaDetail.cachedReadPrice')}: {originalCachedReadPriceUnit}
            </Typography>
          )}
          {item.metadata?.reasoning_tokens > 0 && (
            <Typography sx={{ fontSize: 12, color: (theme) => theme.palette.text.secondary, mt: 0.5, textAlign: 'left' }}>
              {t('logPage.quotaDetail.reasoningPrice')}: {originalReasoningPriceUnit}
            </Typography>
          )}
        </Box>
        {/* Group Ratio */}
        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            p: 2,
            borderRadius: 0,
            background: (theme) => (theme.palette.mode === 'dark' ? theme.palette.background.default : '#fafbfc')
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <PercentIcon sx={{ fontSize: 20, mr: 1, color: (theme) => theme.palette.info.main }} />
            <Typography sx={{ fontWeight: 600, fontSize: 12 }}>{t('logPage.quotaDetail.groupRatio')}</Typography>
          </Box>
          <Typography sx={{ fontSize: 13, color: (theme) => theme.palette.text.secondary, textAlign: 'left' }}>
            {t('logPage.groupLabel')}:{' '}
            {!item?.metadata?.is_backup_group
              ? userGroup[item?.metadata?.group_name]?.name || item?.metadata?.group_name || '未知分组'
              : `${userGroup[item?.metadata?.group_name]?.name || item?.metadata?.group_name || '未知分组'}→${userGroup[item?.metadata?.backup_group_name]?.name || item?.metadata?.backup_group_name || '未知备用分组'}`}
          </Typography>
          <Typography sx={{ fontSize: 12, color: (theme) => theme.palette.text.secondary, textAlign: 'left' }}>
            {t('logPage.quotaDetail.groupRatioValue')}: {groupRatio}
          </Typography>
        </Box>
        {/* Actual Price */}
        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            p: 2,
            borderRadius: 0,
            background: (theme) => (theme.palette.mode === 'dark' ? theme.palette.background.default : '#fafbfc')
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <CreditCardIcon sx={{ fontSize: 20, mr: 1, color: (theme) => theme.palette.primary.main }} />
            <Typography sx={{ fontWeight: 600, fontSize: 12 }}>{t('logPage.quotaDetail.actualPrice')}</Typography>
          </Box>
          <Typography sx={{ fontSize: 12, color: (theme) => theme.palette.text.secondary, mb: 0.5, textAlign: 'left' }}>
            {t('logPage.quotaDetail.input')}: {inputPriceUnit}
          </Typography>
          <Typography sx={{ fontSize: 12, color: (theme) => theme.palette.text.secondary, textAlign: 'left' }}>
            {t('logPage.quotaDetail.output')}: {outputPriceUnit}
          </Typography>
          {item.metadata?.cached_write_tokens > 0 && (
            <Typography sx={{ fontSize: 12, color: (theme) => theme.palette.text.secondary, mt: 0.5, textAlign: 'left' }}>
              {t('logPage.quotaDetail.cachedWrite')}: {cachedWritePriceUnit}
            </Typography>
          )}
          {item.metadata?.cached_read_tokens > 0 && (
            <Typography sx={{ fontSize: 12, color: (theme) => theme.palette.text.secondary, mt: 0.5, textAlign: 'left' }}>
              {t('logPage.quotaDetail.cachedRead')}: {cachedReadPriceUnit}
            </Typography>
          )}
          {item.metadata?.reasoning_tokens > 0 && (
            <Typography sx={{ fontSize: 12, color: (theme) => theme.palette.text.secondary, mt: 0.5, textAlign: 'left' }}>
              {t('logPage.quotaDetail.reasoning')}: {reasoningPriceUnit}
            </Typography>
          )}
        </Box>
      </Box>
      {/* Final Calculation Area */}
      <Box
        sx={{
          p: 2,
          borderRadius: 0,
          background: (theme) => (theme.palette.mode === 'dark' ? theme.palette.background.default : '#f7f8fa')
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <CalculateIcon sx={{ fontSize: 20, mr: 1, color: (theme) => theme.palette.success.main }} />
          <Typography sx={{ fontWeight: 600, fontSize: 12 }}>{t('logPage.quotaDetail.finalCalculation')}</Typography>
        </Box>
        <Typography sx={{ fontSize: 12, color: (theme) => theme.palette.text.secondary, mb: 1, textAlign: 'left' }}>
          {calculateSteps}
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'center' }, mb: 1 }}>
          <Typography
            sx={{
              fontSize: 12,
              color: (theme) => theme.palette.text.secondary,
              mr: 2,
              mb: { xs: 0.5, sm: 0 },
              textAlign: 'left'
            }}
          >
            {t('logPage.quotaDetail.originalBilling')}: {renderQuota(originalQuota, 6)}
          </Typography>
          <Typography
            sx={{
              fontSize: 12,
              color: (theme) => theme.palette.success.main,
              fontWeight: 500,
              mr: 2,
              mb: { xs: 0.5, sm: 0 },
              textAlign: 'left'
            }}
          >
            {t('logPage.quotaDetail.actualBilling')}: {renderQuota(quota, 6)}
          </Typography>
          {savePercent && (
            <Box
              sx={{
                display: 'inline-block',
                bgcolor: (theme) => theme.palette.success.dark,
                color: (theme) => theme.palette.success.contrastText,
                fontSize: 12,
                fontWeight: 500,
                borderRadius: 0,
                px: 1.2,
                py: 0.2
              }}
            >
              {savePercent}
            </Box>
          )}
        </Box>
        <Typography sx={{ fontSize: 12, color: (theme) => theme.palette.text.disabled, textAlign: 'left' }}>
          {t('logPage.quotaDetail.calculationNote')}
        </Typography>
      </Box>
    </Box>
  );
}

QuotaWithDetailContent.propTypes = {
  item: PropTypes.shape({
    quota: PropTypes.number,
    prompt_tokens: PropTypes.number,
    completion_tokens: PropTypes.number,
    metadata: PropTypes.shape({
      input_price_origin: PropTypes.string,
      output_price_origin: PropTypes.string,
      input_ratio: PropTypes.number,
      output_ratio: PropTypes.number,
      group_ratio: PropTypes.number,
      group_name: PropTypes.string,
      backup_group_name: PropTypes.string,
      is_backup_group: PropTypes.bool,
      input_price: PropTypes.string,
      output_price: PropTypes.string,
      original_quota: PropTypes.number,
      origin_quota: PropTypes.number,
      price_type: PropTypes.string,
      extra_billing: PropTypes.object
    })
  }).isRequired,
  totalInputTokens: PropTypes.number.isRequired,
  totalOutputTokens: PropTypes.number.isRequired,
  userGroup: PropTypes.object
};
