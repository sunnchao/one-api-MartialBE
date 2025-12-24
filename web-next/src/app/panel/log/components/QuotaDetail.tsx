'use client';

import React, { useMemo } from 'react';
import { Alert, Descriptions, Tag, Typography } from 'antd';
import Decimal from 'decimal.js';
import { useTranslation } from 'react-i18next';
import { renderQuota } from '@/utils/common';

const { Paragraph, Text } = Typography;

export interface LogItem {
  quota?: number;
  prompt_tokens?: number;
  completion_tokens?: number;
  metadata?: Record<string, any>;
  model_name?: string;
  channel_id?: number;
  username?: string;
  request_ip?: string;
  source_ip?: string;
}

function calculatePrice(
  ratio: number,
  groupDiscount: number,
  isTimes: boolean,
  priceMultiplier = 0.002,
  cacheRatio?: number
) {
  const safeRatio = Number(ratio || 0);
  const safeGroup = Number(groupDiscount || 1);

  let discount = new Decimal(safeRatio).mul(safeGroup);
  if (!isTimes) discount = discount.mul(1000);

  let priceDecimal = discount.mul(priceMultiplier);
  if (cacheRatio) priceDecimal = priceDecimal.mul(cacheRatio);

  let priceString = priceDecimal.toFixed(6);
  priceString = priceString.replace(/(\.\d*?[1-9])0+$|\.0*$/, '$1');
  return priceString;
}

function calculateOriginalQuota(item: LogItem) {
  const metadata = item?.metadata || {};
  if (!item?.quota || !metadata?.group_ratio) return metadata?.original_quota || metadata?.origin_quota || 0;
  const quota = item.quota || 0;
  const groupRatio = metadata?.group_ratio || 1;
  if (groupRatio === 0) return quota;
  return quota / groupRatio || metadata?.original_quota || metadata?.origin_quota || 0;
}

function calculateTokens(item: LogItem) {
  const metadata = item?.metadata;
  const baseInputTokens = Number(metadata?.input_tokens ?? item?.prompt_tokens ?? 0);
  const baseOutputTokens = Number(item?.completion_tokens ?? 0);
  if (!metadata) return { totalInputTokens: baseInputTokens, totalOutputTokens: baseOutputTokens };

  let totalInputTokens = baseInputTokens;
  let totalOutputTokens = baseOutputTokens;

  const tokenDetails = [
    { key: 'input_text_tokens', ratioKey: 'input_text_tokens_ratio' },
    { key: 'output_text_tokens', ratioKey: 'output_text_tokens_ratio' },
    { key: 'input_audio_tokens', ratioKey: 'input_audio_tokens_ratio' },
    { key: 'output_audio_tokens', ratioKey: 'output_audio_tokens_ratio' },
    { key: 'cached_tokens', ratioKey: 'cached_tokens_ratio' },
    { key: 'cached_write_tokens', ratioKey: 'cached_write_tokens_ratio', onlyWhenNoInputTokens: true },
    { key: 'cached_read_tokens', ratioKey: 'cached_read_tokens_ratio', onlyWhenNoInputTokens: true },
    { key: 'reasoning_tokens', ratioKey: 'reasoning_tokens_ratio' },
    { key: 'input_image_tokens', ratioKey: 'input_image_tokens_ratio' },
    { key: 'output_image_tokens', ratioKey: 'output_image_tokens_ratio' },
  ]
    .filter((d) => !d.onlyWhenNoInputTokens || !metadata?.input_tokens)
    .filter((d) => Number(metadata?.[d.key] || 0) > 0)
    .map((d) => {
      const value = Number(metadata?.[d.key] || 0);
      const ratio = Number(metadata?.[d.ratioKey] || 1);
      const extra = Math.ceil(value * (ratio - 1));

      const isInputToken = [
        'input_text_tokens',
        'output_text_tokens',
        'input_audio_tokens',
        'cached_tokens',
        'cached_write_tokens',
        'cached_read_tokens',
        'input_image_tokens',
      ].includes(d.key);
      const isOutputToken = ['output_audio_tokens', 'reasoning_tokens', 'output_image_tokens'].includes(d.key);

      if (isInputToken) totalInputTokens += extra;
      if (isOutputToken) totalOutputTokens += extra;

      return { key: d.key, value, ratio, extra };
    });

  return { totalInputTokens, totalOutputTokens, tokenDetails };
}

function renderCachedTokens(metadata: any) {
  const cachedWriteTokens = Number(metadata?.cached_write_tokens) || 0;
  const cachedReadTokens = Number(metadata?.cached_read_tokens) || 0;
  if (!cachedWriteTokens && !cachedReadTokens) return null;

  const parts: string[] = [];
  if (cachedWriteTokens) parts.push(`cached_write: ${cachedWriteTokens}`);
  if (cachedReadTokens) parts.push(`cached_read: ${cachedReadTokens}`);
  return <Tag>{parts.join(', ')}</Tag>;
}

export default function QuotaDetail({ item, userGroup }: { item: LogItem; userGroup?: Record<string, any> }) {
  const { t } = useTranslation();
  const metadata = item?.metadata || {};

  const { totalInputTokens, totalOutputTokens, tokenDetails } = useMemo(() => calculateTokens(item), [item]);

  const quota = Number(item?.quota || 0);
  const originalQuota = calculateOriginalQuota(item);
  const groupRatio = Number(metadata?.group_ratio || 1);
  const priceType = String(metadata?.price_type || 'tokens');

  const originalInputPrice =
    metadata?.input_price_origin ||
    (metadata?.input_ratio ? `$${calculatePrice(metadata.input_ratio, 1, priceType === 'times')}` : '$0');
  const originalOutputPrice =
    metadata?.output_price_origin ||
    (metadata?.output_ratio ? `$${calculatePrice(metadata.output_ratio, 1, false)}` : '$0');

  const inputPrice =
    metadata?.input_price || (metadata?.input_ratio ? `$${calculatePrice(metadata.input_ratio, groupRatio, priceType === 'times')}` : '$0');
  const outputPrice = metadata?.output_price || (metadata?.output_ratio ? `$${calculatePrice(metadata.output_ratio, groupRatio, false)}` : '$0');

  const extraBilling = metadata?.extra_billing || {};
  const extraBillingSteps = Object.entries(extraBilling)
    .map(([key, v]: any) => {
      if (!v) return null;
      const type = v.type ? `[${v.type}]` : '';
      return `${key}${type}: $${v.price} × ${v.call_count}`;
    })
    .filter(Boolean) as string[];

  let calculateSteps = '';
  if (priceType === 'tokens') {
    calculateSteps = `(${totalInputTokens} / 1M × ${inputPrice} × ${groupRatio}${t('logPage.quotaDetail.times')})`;
    if (totalOutputTokens > 0) {
      calculateSteps += ` + (${totalOutputTokens} / 1M × ${outputPrice} × ${groupRatio}${t('logPage.quotaDetail.times')})`;
    }
  } else {
    calculateSteps = `${inputPrice}`;
  }
  if (extraBillingSteps.length > 0) {
    calculateSteps += ` + (${extraBillingSteps.join(' + ')}) × ${groupRatio}`;
  }

  const isResourcePackage = metadata?.billing_type === 'resource_package';

  return (
    <div style={{ padding: 12 }}>
      {isResourcePackage && (
        <Alert
          type="warning"
          showIcon
          message={t('logPage.quotaDetail.resourcePackageTitle') || 'Resource package applied'}
          description={
            <div>
              <div style={{ marginBottom: 8 }}>
                <Tag color="gold">{metadata?.package_service_type || 'resource_package'}</Tag>
                {metadata?.resource_package_id ? <Tag>#{metadata.resource_package_id}</Tag> : null}
              </div>
              <Text type="secondary">
                {t('logPage.quotaDetail.resourcePackageDeducted') || 'Deducted from resource package'}: {renderQuota(quota, 6)}
              </Text>
            </div>
          }
          style={{ marginBottom: 12 }}
        />
      )}

      <Descriptions size="small" column={2} bordered>
        <Descriptions.Item label={t('logPage.modelLabel')}>{item.model_name || '-'}</Descriptions.Item>
        <Descriptions.Item label={t('logPage.groupLabel')}>
          {metadata?.group_name
            ? userGroup?.[metadata.group_name]?.name || metadata.group_name
            : metadata?.backup_group_name
              ? userGroup?.[metadata.backup_group_name]?.name || metadata.backup_group_name
              : '-'}
        </Descriptions.Item>

        <Descriptions.Item label={t('logPage.totalInputTokens')}>{totalInputTokens}</Descriptions.Item>
        <Descriptions.Item label={t('logPage.totalOutputTokens')}>{totalOutputTokens}</Descriptions.Item>

        <Descriptions.Item label={t('logPage.quotaDetail.groupRatio')}>{groupRatio}</Descriptions.Item>
        <Descriptions.Item label={t('logPage.quotaLabel')}>
          {groupRatio < 1 ? (
            <>
              <Text delete type="secondary" style={{ marginRight: 8 }}>
                {renderQuota(originalQuota, 6)}
              </Text>
              <Text>{renderQuota(quota, 6)}</Text>
            </>
          ) : (
            <Text>{renderQuota(quota, 6)}</Text>
          )}
        </Descriptions.Item>

        <Descriptions.Item label={t('logPage.quotaDetail.originalPrice')}>
          {priceType === 'times' ? (
            <div>{t('logPage.content.original_times_price', { times: String(originalInputPrice).replace(/^\$/, '') })}</div>
          ) : (
            <div>
              <div>{t('logPage.quotaDetail.inputPrice')}: {originalInputPrice} /M</div>
              <div>{t('logPage.quotaDetail.outputPrice')}: {originalOutputPrice} /M</div>
            </div>
          )}
        </Descriptions.Item>
        <Descriptions.Item label={t('logPage.quotaDetail.actualPrice')}>
          {priceType === 'times' ? (
            <div>{t('logPage.content.times_price', { times: String(inputPrice).replace(/^\$/, '') })}</div>
          ) : (
            <div>
              <div>{t('logPage.quotaDetail.input')}: {inputPrice} /M</div>
              <div>{t('logPage.quotaDetail.output')}: {outputPrice} /M</div>
            </div>
          )}
        </Descriptions.Item>
      </Descriptions>

      <div style={{ marginTop: 12 }}>
        {renderCachedTokens(metadata)}
        {tokenDetails && tokenDetails.length > 0 ? (
          <div style={{ marginTop: 8 }}>
            {tokenDetails.slice(0, 10).map((d) => (
              <Tag key={d.key}>
                {d.key}: {d.value} × ({d.ratio} - 1) = {d.extra}
              </Tag>
            ))}
          </div>
        ) : null}
      </div>

      <div style={{ marginTop: 12 }}>
        <Paragraph style={{ marginBottom: 6 }}>
          <Text strong>{t('logPage.content.calculate_steps')}</Text>
          <Text>{calculateSteps}</Text>
        </Paragraph>
        <Text type="secondary">{t('logPage.quotaDetail.calculationNote')}</Text>
      </div>
    </div>
  );
}
