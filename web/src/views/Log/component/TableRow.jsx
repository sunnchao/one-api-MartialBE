import PropTypes from 'prop-types';
import { useMemo, useState } from 'react';
import { ArrowForward } from '@mui/icons-material';

import Badge from '@mui/material/Badge';

import { TableRow, TableCell, Stack, Collapse, Tooltip, Typography } from '@mui/material';

import { timestamp2string, renderQuota } from 'utils/common';
import Label from 'ui-component/Label';
import { useLogType } from '../type/LogType';
import { useTranslation } from 'react-i18next';
import QuotaWithDetailRow from './QuotaWithDetailRow';
import QuotaWithDetailContent from './QuotaWithDetailContent';
import { calculatePrice } from './QuotaWithDetailContent';
import { styled } from '@mui/material/styles';

function renderType(type, logTypes, t, isError) {
  if (isError) {
    return (
      <Label color="error" variant="outlined">
        错误
      </Label>
    );
  }
  const typeOption = logTypes[type];
  if (typeOption) {
    return (
      <Label variant="filled" color={typeOption.color}>
        {' '}
        {typeOption.text}{' '}
      </Label>
    );
  } else {
    return (
      <Label variant="filled" color="error">
        {' '}
        {t('logPage.unknown')}{' '}
      </Label>
    );
  }
}

function requestTimeLabelOptions(request_time) {
  let color = 'error';
  if (request_time === 0) {
    color = 'default';
  } else if (request_time <= 10) {
    color = 'success';
  } else if (request_time <= 50) {
    color = 'primary';
  } else if (request_time <= 100) {
    color = 'secondary';
  }

  return color;
}

function requestTSLabelOptions(request_ts) {
  let color = 'success';
  if (request_ts === 0) {
    color = 'default';
  } else if (request_ts <= 10) {
    color = 'error';
  } else if (request_ts <= 15) {
    color = 'secondary';
  } else if (request_ts <= 20) {
    color = 'primary';
  }

  return color;
}

export default function LogTableRow({ item, userIsAdmin, userGroup, columnVisibility }) {
  const { t } = useTranslation();
  const LogType = useLogType();
  let request_time = item.request_time / 1000;
  let request_time_str = request_time.toFixed(2) + ' S';

  let first_time = item.metadata?.first_response ? item.metadata.first_response / 1000 : 0;
  let first_time_str = first_time ? `${first_time.toFixed(2)} S` : '';

  const stream_time = request_time - first_time;

  let request_ts = 0;
  let request_ts_str = '';
  if (first_time > 0 && item.completion_tokens > 0) {
    // Using the completion_tokens directly since we already checked it's > 0
    request_ts = item.completion_tokens / stream_time;
    request_ts_str = `${request_ts.toFixed(2)} t/s`;
  }
  const { totalInputTokens, totalOutputTokens, show, tokenDetails } = useMemo(() => calculateTokens(item), [item]);

  // 计算当前显示的列数
  const colCount = Object.values(columnVisibility).filter(Boolean).length;

  // 展开状态（仅type=2时才有展开）
  const [open, setOpen] = useState(false);
  const showExpand = item.type === 2 && columnVisibility.quota;

  return (
    <>
      <TableRow tabIndex={item.id}>
        {columnVisibility.created_at && <TableCell sx={{ p: '10px 8px' }}>{timestamp2string(item.created_at)}</TableCell>}

        {userIsAdmin && columnVisibility.channel_id && (
          <TableCell sx={{ p: '10px 8px' }}>
            {item.channel_id || ''}
            {item.channel?.name ? <div style={{ fontSize: '12px', color: '#6C7A92' }}>({item.channel.name})</div> : ''}
          </TableCell>
        )}
        {userIsAdmin && columnVisibility.user_id && (
          <TableCell sx={{ p: '10px 8px' }}>
            <Label color="default" variant="outlined" copyText={item.username}>
              {item.username} {item.user_id}
            </Label>
          </TableCell>
        )}

        {columnVisibility.group && (
          <TableCell sx={{ p: '10px 8px' }}>
            {item?.metadata?.is_backup_group ? (
              // 显示分组重定向：原始分组 → 备份分组
              <Stack direction="row" spacing={1} alignItems="center">
                <Label color="default" variant="soft">
                  {userGroup[item.metadata.group_name]?.name || '跟随用户'}
                </Label>
                <ArrowForward sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Label color="warning" variant="soft">
                  {userGroup[item?.metadata?.backup_group_name]?.name || item?.metadata?.backup_group_name || '备份分组'}
                </Label>
              </Stack>
            ) : // 正常显示分组
            item?.metadata?.group_name || item?.metadata?.backup_group_name ? (
              <Label color="default" variant="soft">
                {userGroup[item?.metadata?.group_name || item?.metadata?.backup_group_name]?.name ||
                  item?.metadata?.group_name ||
                  item?.metadata?.backup_group_name ||
                  '跟随用户'}
              </Label>
            ) : (
              ''
            )}
          </TableCell>
        )}
        {columnVisibility.token_name && (
          <TableCell sx={{ p: '10px 8px' }}>
            {item.token_name && (
              <Label color="default" variant="soft" copyText={item.token_name}>
                {item.token_name}
              </Label>
            )}
          </TableCell>
        )}
        {columnVisibility.type && <TableCell sx={{ p: '10px 8px' }}>{renderType(item.type, LogType, t, item.is_error)}</TableCell>}
        {columnVisibility.model_name && <TableCell sx={{ p: '10px 8px' }}>{viewModelName(item.model_name, item.is_stream)}</TableCell>}

        {columnVisibility.duration && (
          <TableCell sx={{ p: '10px 8px' }}>
            {item.type === 2 ? (
              <Stack direction="column" spacing={0.5}>
                <Label color={requestTimeLabelOptions(request_time)} variant="outlined">
                  {item.request_time === 0 ? '无' : request_time_str} {first_time_str ? ' / ' + first_time_str : ''}
                </Label>

                {request_ts_str && (
                  <Label color={requestTSLabelOptions(request_ts)} variant="outlined">
                    {request_ts_str}
                  </Label>
                )}
              </Stack>
            ) : null}
          </TableCell>
        )}
        {columnVisibility.message && (
          <TableCell sx={{ p: '10px 8px' }}>{viewInput(item, t, totalInputTokens, totalOutputTokens, show, tokenDetails)}</TableCell>
        )}
        {columnVisibility.completion && <TableCell sx={{ p: '10px 8px' }}>{item.completion_tokens || ''}</TableCell>}
        {columnVisibility.quota && (
          <TableCell sx={{ p: '10px 8px' }}>
            {item.type === 2 ? (
              <QuotaWithDetailRow item={item} open={open} setOpen={setOpen} />
            ) : item.quota ? (
              renderQuota(item.quota, 6)
            ) : (
              ''
            )}
          </TableCell>
        )}
        {columnVisibility.request_ip && <TableCell sx={{ p: '10px 8px' }}>{item.request_ip || ''}</TableCell>}
        {columnVisibility.detail && (
          <TableCell sx={{ p: '10px 8px' }}>{viewLogContent(item, t, totalInputTokens, totalOutputTokens)}</TableCell>
        )}
      </TableRow>
      {/* 展开行 */}
      {showExpand && (
        <TableRow>
          <TableCell colSpan={colCount} sx={{ p: 0, border: 0, background: (theme) => theme.palette.background.paper }}>
            <Collapse in={open} timeout="auto" unmountOnExit>
              <QuotaWithDetailContent
                item={item}
                userGroup={userGroup}
                t={t}
                totalInputTokens={totalInputTokens}
                totalOutputTokens={totalOutputTokens}
              />
            </Collapse>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

LogTableRow.propTypes = {
  item: PropTypes.object,
  userIsAdmin: PropTypes.bool,
  userGroup: PropTypes.object,
  columnVisibility: PropTypes.object
};

function viewModelName(model_name, isStream) {
  if (!model_name) {
    return '';
  }

  if (isStream) {
    return (
      <Badge
        badgeContent="Stream"
        color="primary"
        sx={{
          '& .MuiBadge-badge': {
            fontSize: '0.55rem',
            height: '16px',
            minWidth: '16px',
            padding: '0 4px',
            top: '-3px'
          }
        }}
      >
        <Label color="primary" variant="outlined" copyText={model_name}>
          {model_name}
        </Label>
      </Badge>
    );
  }

  return (
    <Label color="primary" variant="outlined" copyText={model_name}>
      {model_name}
    </Label>
  );
}

const MetadataTypography = styled(Typography)(({ theme }) => ({
  fontSize: 12,
  color: theme.palette.grey[300],
  '&:not(:last-child)': {
    marginBottom: theme.spacing(0.5)
  }
}));

function viewInput(item, t, totalInputTokens, totalOutputTokens, show, tokenDetails) {
  const baseInputTokens = item?.metadata?.input_tokens ?? item.prompt_tokens;

  if (!baseInputTokens) return '';
  if (!show) return baseInputTokens;

  const tooltipContent = tokenDetails.map(({ key, label, tokens, value, rate, labelParams }) => (
    <MetadataTypography key={key}>{`${t(label, labelParams)}: ${value} *  (${rate} - 1) = ${tokens}`}</MetadataTypography>
  ));

  return (
    <Badge variant="dot" color="primary">
      <Tooltip
        title={
          <>
            {tooltipContent}
            <MetadataTypography>
              {t('logPage.totalInputTokens')}: {totalInputTokens}
            </MetadataTypography>
            <MetadataTypography>
              {t('logPage.totalOutputTokens')}: {totalOutputTokens}
            </MetadataTypography>
          </>
        }
        placement="top"
        arrow
      >
        <span style={{ cursor: 'help' }}>{baseInputTokens}</span>
      </Tooltip>
    </Badge>
  );
}

function calculateTokens(item) {
  const { prompt_tokens, completion_tokens, metadata } = item;
  const baseInputTokens = metadata?.input_tokens ?? prompt_tokens ?? 0;
  const baseOutputTokens = completion_tokens ?? 0;

  if (!metadata) {
    return {
      totalInputTokens: baseInputTokens,
      totalOutputTokens: baseOutputTokens,
      cached_write_tokens: metadata?.cached_write_tokens || 0,
      cached_write_tokens_ratio: metadata?.cached_write_tokens_ratio || 0,
      cached_read_tokens: metadata?.cached_read_tokens || 0,
      cached_read_tokens_ratio: metadata?.cached_read_tokens_ratio || 0,
      reasoning_tokens: metadata?.reasoning_tokens || 0,
      reasoning_tokens_ratio: metadata?.reasoning_tokens_ratio || 0,
      input_tokens: metadata?.input_tokens || 0,
      show: false,
      tokenDetails: []
    };
  }

  let totalInputTokens = baseInputTokens;
  let totalOutputTokens = baseOutputTokens;
  let show = false;

  const input_audio_tokens = metadata?.input_audio_tokens_ratio || 1;
  const output_audio_tokens = metadata?.output_audio_tokens_ratio || 1;
  const input_image_tokens = metadata?.input_image_tokens_ratio || 1;
  const output_image_tokens = metadata?.output_image_tokens_ratio || 1;

  const cached_ratio = metadata?.cached_tokens_ratio || 1;
  const cached_write_ratio = metadata?.cached_write_tokens_ratio || 1;
  const cached_read_ratio = metadata?.cached_read_tokens_ratio || 1;
  const reasoning_tokens = metadata?.reasoning_tokens_ratio || 1;
  const input_text_tokens_ratio = metadata?.input_text_tokens_ratio || 1;
  const output_text_tokens_ratio = metadata?.output_text_tokens_ratio || 1;

  const tokenDetails = [
    {
      key: 'input_text_tokens',
      label: 'logPage.inputTextTokens',
      rate: input_text_tokens_ratio,
      labelParams: { ratio: input_text_tokens_ratio }
    },
    {
      key: 'output_text_tokens',
      label: 'logPage.outputTextTokens',
      rate: output_text_tokens_ratio,
      labelParams: { ratio: output_text_tokens_ratio }
    },
    {
      key: 'input_audio_tokens',
      label: 'logPage.inputAudioTokens',
      rate: input_audio_tokens,
      labelParams: { ratio: input_audio_tokens }
    },
    {
      key: 'output_audio_tokens',
      label: 'logPage.outputAudioTokens',
      rate: output_audio_tokens,
      labelParams: { ratio: output_audio_tokens }
    },
    { key: 'cached_tokens', label: 'logPage.cachedTokens', rate: cached_ratio, labelParams: { ratio: cached_ratio } },
    metadata?.input_tokens
      ? null
      : {
          key: 'cached_write_tokens',
          label: 'logPage.cachedWriteTokens',
          rate: cached_write_ratio,
          labelParams: { ratio: cached_write_ratio }
        },
    metadata?.input_tokens
      ? null
      : {
          key: 'cached_read_tokens',
          label: 'logPage.cachedReadTokens',
          rate: cached_read_ratio,
          labelParams: { ratio: cached_read_ratio }
        },
    { key: 'reasoning_tokens', label: 'logPage.reasoningTokens', rate: reasoning_tokens, labelParams: { ratio: reasoning_tokens } },
    {
      key: 'input_image_tokens',
      label: 'logPage.inputImageTokens',
      rate: input_image_tokens,
      labelParams: { ratio: input_image_tokens }
    },
    {
      key: 'output_image_tokens',
      label: 'logPage.outputImageTokens',
      rate: output_image_tokens,
      labelParams: { ratio: output_image_tokens }
    }
  ]
    .filter((item) => item !== null)
    .filter(({ key }) => metadata[key] > 0)
    .map(({ key, label, rate, labelParams }) => {
      const tokens = Math.ceil(metadata[key] * (rate - 1));

      // Check if this token type affects input or output totals
      const isInputToken = [
        'input_text_tokens',
        'output_text_tokens',
        'input_audio_tokens',
        'cached_tokens',
        'cached_write_tokens',
        'cached_read_tokens',
        'input_image_tokens'
      ].includes(key);

      const isOutputToken = ['output_audio_tokens', 'reasoning_tokens', 'output_image_tokens'].includes(key);

      if (isInputToken) {
        totalInputTokens += tokens;
        show = true;
      } else if (isOutputToken) {
        totalOutputTokens += tokens;
        show = true;
      }

      return { key, label, tokens, value: metadata[key], rate, labelParams };
    });

  return {
    totalInputTokens,
    totalOutputTokens,
    show,
    tokenDetails
  };
}

function viewLogContent(item, t) {
  const cachedTokensLabel = renderCachedTokens(item?.metadata);

  // totalOutputTokens is passed but not used in this function
  // Check if we have the necessary data to calculate prices
  if (!item?.metadata?.input_ratio) {
    const free = (item.quota === 0 || item.quota === undefined) && item.type === 2;
    const baseContent = free ? (
      <Label
        color={free ? 'success' : 'secondary'}
        variant="soft"
        sx={{
          fontSize: 12
        }}
      >
        {t('logPage.content.free')}
      </Label>
    ) : (
      <span style={{ fontSize: 12 }}>{item.content || ''}</span>
    );

    if (!cachedTokensLabel) return baseContent;

    return (
      <Stack direction="column">
        {cachedTokensLabel}
        {baseContent}
      </Stack>
    );
  }

  // Ensure we have valid values with appropriate defaults
  const groupDiscount = item?.metadata?.group_ratio || 1;
  const priceType = item?.metadata?.price_type || '';
  const originalCompletionRatio = item?.metadata?.output_ratio || 0;
  const originalInputRatio = item?.metadata?.input_ratio || 0;

  let inputPriceInfo;
  let outputPriceInfo = '';
  if (priceType === 'times') {
    // Calculate prices for 'times' price type
    const inputPrice = calculatePrice(originalInputRatio, groupDiscount, true);

    inputPriceInfo = t('logPage.content.times_price', {
      times: inputPrice
    });
  } else {
    // Calculate prices for a standard price type
    const inputPrice = calculatePrice(originalInputRatio, groupDiscount, false);
    const outputPrice = calculatePrice(originalCompletionRatio, groupDiscount, false);

    inputPriceInfo = t('logPage.content.input_price', {
      price: inputPrice
    });
    outputPriceInfo = t('logPage.content.output_price', {
      price: outputPrice
    });
  }

  return (
    <Stack direction="row" spacing={0.3} display={'flex'} justifyContent={'center'}>
      {cachedTokensLabel}
      {inputPriceInfo && (
        <Label color="info" variant="ghost" sx={{ fontSize: 12 }}>
          {inputPriceInfo}
        </Label>
      )}
      {outputPriceInfo && (
        <Label color="info" variant="ghost" sx={{ fontSize: 12 }}>
          {outputPriceInfo}
        </Label>
      )}
    </Stack>
  );
}

function renderCachedTokens(metadata) {
  const cachedWriteTokens = Number(metadata?.cached_write_tokens) || 0;
  const cachedReadTokens = Number(metadata?.cached_read_tokens) || 0;

  if (!cachedWriteTokens && !cachedReadTokens) return null;

  const parts = [];
  if (cachedWriteTokens) parts.push(`缓存写入: ${cachedWriteTokens}`);
  if (cachedReadTokens) parts.push(`缓存读取: ${cachedReadTokens}`);

  return metadata?.input_tokens ? (
    <Label
      color="default"
      sx={{
        fontSize: 11,
        px: 0.5,
        py: 0,
        backgroundColor: 'transparent',
        borderColor: 'transparent',
        color: 'text.secondary'
      }}
    >
      {parts.join(' / ')}
    </Label>
  ) : null;
}
