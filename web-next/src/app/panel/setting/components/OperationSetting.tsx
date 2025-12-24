'use client';

import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Alert, Button, Card, Checkbox, Col, DatePicker, Form, Input, InputNumber, Row, Select, Space, Tag, Typography } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { useTranslation } from 'react-i18next';
import { API } from '@/utils/api';
import { showError, showSuccess, verifyJSON } from '@/utils/common';
import { LoadStatusContext } from '@/contexts/StatusContext';
import { useSelector } from 'react-redux';
import ChatLinksEditor from './ChatLinksEditor';

const { TextArea } = Input;
const { Title, Text } = Typography;

type Inputs = Record<string, any>;

function asBoolString(v: any) {
  if (v === true) return 'true';
  if (v === false) return 'false';
  return String(v);
}

function parseOptionList(data: any[]) {
  const next: Inputs = {};
  for (const item of data || []) {
    const key = item?.key;
    if (!key) continue;
    let value = item.value;
    if (key === 'RechargeDiscount') {
      try {
        value = JSON.stringify(JSON.parse(value), null, 2);
      } catch {
        // keep as-is
      }
    }
    if (key === 'SafeKeyWords' && typeof value === 'string' && value.trim().startsWith('[')) {
      try {
        value = JSON.parse(value);
      } catch {
        // keep as string
      }
    }
    next[key] = value;
  }
  return next;
}

function normalizeSafeKeywords(v: any) {
  if (Array.isArray(v)) return v.filter(Boolean).map(String);
  if (typeof v === 'string') {
    const trimmed = v.trim();
    if (!trimmed) return [];
    // newline separated
    return trimmed.split('\n').map((s) => s.trim()).filter(Boolean);
  }
  return [];
}

export default function OperationSetting() {
  const { t } = useTranslation();
  const loadStatus = useContext(LoadStatusContext);
  const siteInfo = useSelector((state: any) => state.siteInfo);

  const now = useMemo(() => new Date(), []);
  const [historyTimestamp, setHistoryTimestamp] = useState<number>(Math.floor(now.getTime() / 1000) - 30 * 24 * 3600);
  const [invoiceMonth, setInvoiceMonth] = useState<Dayjs | null>(dayjs().startOf('month'));

  const [inputs, setInputs] = useState<Inputs>({});
  const [originInputs, setOriginInputs] = useState<Inputs>({});
  const [safeTools, setSafeTools] = useState<string[]>([]);
  const [safeToolsLoading, setSafeToolsLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  const getOptions = async () => {
    const res = await API.get('/api/option/');
    const { success, message, data } = res.data;
    if (!success) throw new Error(message || 'Failed to load options');
    const next = parseOptionList(data);
    setInputs((prev) => ({ ...prev, ...next }));
    setOriginInputs(next);
  };

  const getSafeTools = async () => {
    setSafeToolsLoading(true);
    try {
      const res = await API.get('/api/option/safe_tools');
      const { success, message, data } = res.data;
      if (!success) throw new Error(message || 'Failed to load safe tools');
      setSafeTools(Array.isArray(data) ? data.map(String) : []);
    } finally {
      setSafeToolsLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        await getSafeTools();
        await getOptions();
      } catch (e: any) {
        showError(e?.message || String(e));
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateOption = async (key: string, value: any) => {
    setLoading(true);
    try {
      let finalValue = value;
      if (key.endsWith('Enabled')) {
        // toggle or accept explicit bool
        if (typeof value === 'undefined') {
          finalValue = inputs[key] === 'true' ? 'false' : 'true';
        } else {
          finalValue = asBoolString(value);
        }
      }
      if (key === 'SafeKeyWords' && Array.isArray(finalValue)) {
        finalValue = JSON.stringify(finalValue);
      }

      const res = await API.put('/api/option/', { key, value: finalValue });
      const { success, message } = res.data;
      if (!success) throw new Error(message || 'Update failed');

      setInputs((prev) => ({ ...prev, [key]: finalValue }));
      await getOptions();
      await getSafeTools();
      await loadStatus?.();
      return true;
    } catch (e: any) {
      showError(e?.message || String(e));
      return false;
    } finally {
      setLoading(false);
    }
  };

  const submitConfig = async (group: string) => {
    try {
      switch (group) {
        case 'general': {
          const keys = ['TopUpLink', 'ChatLink', 'QuotaPerUnit', 'RetryTimes', 'RetryCooldownSeconds', 'RetryTimeOut'];
          for (const k of keys) {
            if (originInputs[k] !== inputs[k]) await updateOption(k, inputs[k]);
          }
          // toggles
          for (const k of ['DisplayInCurrencyEnabled', 'ApproximateTokenEnabled']) {
            if (originInputs[k] !== inputs[k]) await updateOption(k, inputs[k]);
          }
          break;
        }
        case 'monitor': {
          for (const k of ['ChannelDisableThreshold', 'QuotaRemindThreshold']) {
            if (originInputs[k] !== inputs[k]) await updateOption(k, inputs[k]);
          }
          for (const k of ['AutomaticDisableChannelEnabled', 'AutomaticEnableChannelEnabled']) {
            if (originInputs[k] !== inputs[k]) await updateOption(k, inputs[k]);
          }
          break;
        }
        case 'quota': {
          for (const k of ['QuotaForNewUser', 'QuotaForInvitee', 'QuotaForInviter', 'PreConsumedQuota']) {
            if (originInputs[k] !== inputs[k]) await updateOption(k, inputs[k]);
          }
          break;
        }
        case 'payment': {
          for (const k of ['PaymentUSDRate', 'PaymentMinAmount']) {
            if (originInputs[k] !== inputs[k]) await updateOption(k, inputs[k]);
          }
          if (originInputs.RechargeDiscount !== inputs.RechargeDiscount) {
            if (!verifyJSON(inputs.RechargeDiscount)) {
              showError('RechargeDiscount 不是合法的 JSON 字符串');
              return;
            }
            await updateOption('RechargeDiscount', inputs.RechargeDiscount);
          }
          break;
        }
        case 'chatlinks': {
          if (originInputs.ChatLinks !== inputs.ChatLinks) {
            if (!verifyJSON(inputs.ChatLinks)) {
              showError('ChatLinks 不是合法的 JSON 字符串');
              return;
            }
            await updateOption('ChatLinks', inputs.ChatLinks);
          }
          break;
        }
        case 'other': {
          for (const k of ['ChatImageRequestProxy', 'CFWorkerImageUrl', 'CFWorkerImageKey']) {
            if (originInputs[k] !== inputs[k]) await updateOption(k, inputs[k]);
          }
          break;
        }
        case 'log': {
          if (originInputs.LogConsumeEnabled !== inputs.LogConsumeEnabled) await updateOption('LogConsumeEnabled', inputs.LogConsumeEnabled);
          break;
        }
        case 'DisableChannelKeywords': {
          if (originInputs.DisableChannelKeywords !== inputs.DisableChannelKeywords) {
            await updateOption('DisableChannelKeywords', inputs.DisableChannelKeywords);
          }
          break;
        }
        case 'claude': {
          if (originInputs.ClaudeBudgetTokensPercentage !== inputs.ClaudeBudgetTokensPercentage) {
            await updateOption('ClaudeBudgetTokensPercentage', inputs.ClaudeBudgetTokensPercentage);
          }
          if (originInputs.ClaudeDefaultMaxTokens !== inputs.ClaudeDefaultMaxTokens) {
            if (!verifyJSON(inputs.ClaudeDefaultMaxTokens)) {
              showError('默认MaxToken数量不是合法的 JSON 字符串');
              return;
            }
            await updateOption('ClaudeDefaultMaxTokens', inputs.ClaudeDefaultMaxTokens);
          }
          break;
        }
        case 'gemini': {
          if (originInputs.GeminiOpenThink !== inputs.GeminiOpenThink) {
            if (!verifyJSON(inputs.GeminiOpenThink)) {
              showError('GeminiOpenThink 不是合法的 JSON 字符串');
              return;
            }
            await updateOption('GeminiOpenThink', inputs.GeminiOpenThink);
          }
          break;
        }
        case 'safety': {
          if (originInputs.EnableSafe !== inputs.EnableSafe) await updateOption('EnableSafe', inputs.EnableSafe);
          if (originInputs.SafeToolName !== inputs.SafeToolName) await updateOption('SafeToolName', inputs.SafeToolName);

          const safeKeywords = normalizeSafeKeywords(inputs.SafeKeyWords);
          const safeKeywordsJson = JSON.stringify(safeKeywords);
          if (String(originInputs.SafeKeyWords) !== safeKeywordsJson) {
            await updateOption('SafeKeyWords', safeKeywords);
            setInputs((prev) => ({ ...prev, SafeKeyWords: safeKeywords }));
          }
          break;
        }
      }

      showSuccess('保存成功！');
    } catch (e: any) {
      showError('保存失败：' + (e?.message || '未知错误'));
    }
  };

  const deleteHistoryLogs = async () => {
    try {
      const res = await API.delete(`/api/log/?target_timestamp=${Math.floor(historyTimestamp)}`);
      const { success, message, data } = res.data;
      if (success) {
        showSuccess(`${data} 条日志已清理！`);
        return;
      }
      showError('日志清理失败：' + message);
    } catch (e: any) {
      showError(e?.message || String(e));
    }
  };

  const genInvoiceMonth = async () => {
    try {
      if (!invoiceMonth) return;
      const time = invoiceMonth.format('YYYY-MM-DD');
      const res = await API.post(`/api/option/invoice/gen/${time}`);
      const { success, message } = res.data;
      if (success) showSuccess('账单生成成功！');
      else showError('账单生成失败：' + message);
    } catch (e: any) {
      showError(e?.message || String(e));
    }
  };

  const updateInvoiceMonth = async () => {
    try {
      if (!invoiceMonth) return;
      const time = invoiceMonth.format('YYYY-MM-DD');
      const res = await API.post(`/api/option/invoice/update/${time}`);
      const { success, message } = res.data;
      if (success) showSuccess('账单更新成功！');
      else showError('账单更新失败：' + message);
    } catch (e: any) {
      showError(e?.message || String(e));
    }
  };

  const enabled = (key: string) => inputs[key] === 'true';

  return (
    <Form layout="vertical">
      <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <Card
        title={t('setting_index.operationSettings.generalSettings.title')}
        extra={
          <Button type="primary" onClick={() => submitConfig('general')} loading={loading}>
            {t('setting_index.operationSettings.generalSettings.saveButton')}
          </Button>
        }
      >
        <Row gutter={16}>
          <Col xs={24} md={8}>
            <Form.Item label={t('setting_index.operationSettings.generalSettings.topUpLink.label')}>
              <Input
                value={inputs.TopUpLink}
                onChange={(e) => setInputs((p) => ({ ...p, TopUpLink: e.target.value }))}
                placeholder={t('setting_index.operationSettings.generalSettings.topUpLink.placeholder')}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item label={t('setting_index.operationSettings.generalSettings.chatLink.label')}>
              <Input
                value={inputs.ChatLink}
                onChange={(e) => setInputs((p) => ({ ...p, ChatLink: e.target.value }))}
                placeholder={t('setting_index.operationSettings.generalSettings.chatLink.placeholder')}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item label={t('setting_index.operationSettings.generalSettings.quotaPerUnit.label')}>
              <InputNumber style={{ width: '100%' }} value={Number(inputs.QuotaPerUnit || 0)} onChange={(v) => setInputs((p) => ({ ...p, QuotaPerUnit: v }))} />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col xs={24} md={8}>
            <Form.Item label={t('setting_index.operationSettings.generalSettings.retryTimes.label')}>
              <InputNumber style={{ width: '100%' }} value={Number(inputs.RetryTimes || 0)} onChange={(v) => setInputs((p) => ({ ...p, RetryTimes: v }))} />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item label={t('setting_index.operationSettings.generalSettings.retryCooldownSeconds.label')}>
              <InputNumber
                style={{ width: '100%' }}
                value={Number(inputs.RetryCooldownSeconds || 0)}
                onChange={(v) => setInputs((p) => ({ ...p, RetryCooldownSeconds: v }))}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item label={t('setting_index.operationSettings.generalSettings.retryTimeOut.label')}>
              <InputNumber style={{ width: '100%' }} value={Number(inputs.RetryTimeOut || 0)} onChange={(v) => setInputs((p) => ({ ...p, RetryTimeOut: v }))} />
            </Form.Item>
          </Col>
        </Row>
        <Space wrap>
          <Checkbox
            checked={enabled('DisplayInCurrencyEnabled')}
            onChange={(e) => setInputs((p) => ({ ...p, DisplayInCurrencyEnabled: e.target.checked ? 'true' : 'false' }))}
          >
            {t('setting_index.operationSettings.generalSettings.displayInCurrency')}
          </Checkbox>
          <Checkbox
            checked={enabled('ApproximateTokenEnabled')}
            onChange={(e) => setInputs((p) => ({ ...p, ApproximateTokenEnabled: e.target.checked ? 'true' : 'false' }))}
          >
            {t('setting_index.operationSettings.generalSettings.approximateToken')}
          </Checkbox>
        </Space>
      </Card>

      <Card
        title={t('setting_index.operationSettings.otherSettings.title')}
        extra={
          <Button type="primary" onClick={() => submitConfig('other')} loading={loading}>
            {t('setting_index.operationSettings.otherSettings.saveButton')}
          </Button>
        }
      >
        <Alert type="info" showIcon message={t('setting_index.operationSettings.otherSettings.alert')} style={{ marginBottom: 16 }} />
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item label={t('setting_index.operationSettings.otherSettings.chatImageRequestProxy.label')}>
              <Input
                value={inputs.ChatImageRequestProxy}
                onChange={(e) => setInputs((p) => ({ ...p, ChatImageRequestProxy: e.target.value }))}
                placeholder={t('setting_index.operationSettings.otherSettings.chatImageRequestProxy.placeholder')}
              />
            </Form.Item>
          </Col>
        </Row>
        <Alert type="info" showIcon message={t('setting_index.operationSettings.otherSettings.CFWorkerImageUrl.alert')} style={{ marginBottom: 16 }} />
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item label={t('setting_index.operationSettings.otherSettings.CFWorkerImageUrl.label')}>
              <Input value={inputs.CFWorkerImageUrl} onChange={(e) => setInputs((p) => ({ ...p, CFWorkerImageUrl: e.target.value }))} />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label={t('setting_index.operationSettings.otherSettings.CFWorkerImageUrl.key')}>
              <Input value={inputs.CFWorkerImageKey} onChange={(e) => setInputs((p) => ({ ...p, CFWorkerImageKey: e.target.value }))} />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      <Card title={t('setting_index.operationSettings.logSettings.title')}>
        <Space direction="vertical" style={{ width: '100%' }} size={12}>
          <Checkbox
            checked={enabled('LogConsumeEnabled')}
            onChange={(e) => setInputs((p) => ({ ...p, LogConsumeEnabled: e.target.checked ? 'true' : 'false' }))}
          >
            {t('setting_index.operationSettings.logSettings.logConsume')}
          </Checkbox>
          <Space wrap>
            <DatePicker
              showTime
              value={dayjs.unix(historyTimestamp)}
              onChange={(v) => setHistoryTimestamp(v ? v.unix() : historyTimestamp)}
              placeholder={t('setting_index.operationSettings.logSettings.logCleanupTime.placeholder')}
            />
            <Button onClick={deleteHistoryLogs} loading={loading}>
              {t('setting_index.operationSettings.logSettings.clearLogs')}
            </Button>
            <Button type="primary" onClick={() => submitConfig('log')} loading={loading}>
              Save
            </Button>
          </Space>
        </Space>
      </Card>

      {siteInfo?.UserInvoiceMonth ? (
        <Card title={t('setting_index.operationSettings.invoice.title')}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <DatePicker
              picker="month"
              value={invoiceMonth}
              onChange={(v) => setInvoiceMonth(v ? v.startOf('month') : null)}
              placeholder={t('setting_index.operationSettings.invoice.genTime')}
            />
            <Space>
              <Button type="primary" onClick={genInvoiceMonth} disabled={!invoiceMonth}>
                {t('setting_index.operationSettings.invoice.genMonthInvoice')}
              </Button>
              <Button onClick={updateInvoiceMonth} disabled={!invoiceMonth}>
                {t('setting_index.operationSettings.invoice.updateMonthInvoice')}
              </Button>
            </Space>
          </Space>
        </Card>
      ) : null}

      <Card
        title={t('setting_index.operationSettings.monitoringSettings.title')}
        extra={
          <Button type="primary" onClick={() => submitConfig('monitor')} loading={loading}>
            {t('setting_index.operationSettings.monitoringSettings.saveMonitoringSettings')}
          </Button>
        }
      >
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item label={t('setting_index.operationSettings.monitoringSettings.channelDisableThreshold.label')}>
              <InputNumber style={{ width: '100%' }} value={Number(inputs.ChannelDisableThreshold || 0)} onChange={(v) => setInputs((p) => ({ ...p, ChannelDisableThreshold: v }))} />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label={t('setting_index.operationSettings.monitoringSettings.quotaRemindThreshold.label')}>
              <InputNumber style={{ width: '100%' }} value={Number(inputs.QuotaRemindThreshold || 0)} onChange={(v) => setInputs((p) => ({ ...p, QuotaRemindThreshold: v }))} />
            </Form.Item>
          </Col>
        </Row>
        <Space direction="vertical">
          <Checkbox
            checked={enabled('AutomaticDisableChannelEnabled')}
            onChange={(e) => setInputs((p) => ({ ...p, AutomaticDisableChannelEnabled: e.target.checked ? 'true' : 'false' }))}
          >
            {t('setting_index.operationSettings.monitoringSettings.automaticDisableChannel')}
          </Checkbox>
          <Checkbox
            checked={enabled('AutomaticEnableChannelEnabled')}
            onChange={(e) => setInputs((p) => ({ ...p, AutomaticEnableChannelEnabled: e.target.checked ? 'true' : 'false' }))}
          >
            {t('setting_index.operationSettings.monitoringSettings.automaticEnableChannel')}
          </Checkbox>
        </Space>
      </Card>

      <Card
        title={t('setting_index.operationSettings.quotaSettings.title')}
        extra={
          <Button type="primary" onClick={() => submitConfig('quota')} loading={loading}>
            {t('setting_index.operationSettings.quotaSettings.saveQuotaSettings')}
          </Button>
        }
      >
        <Row gutter={16}>
          <Col xs={24} md={6}>
            <Form.Item label={t('setting_index.operationSettings.quotaSettings.quotaForNewUser.label')}>
              <InputNumber style={{ width: '100%' }} value={Number(inputs.QuotaForNewUser || 0)} onChange={(v) => setInputs((p) => ({ ...p, QuotaForNewUser: v }))} />
            </Form.Item>
          </Col>
          <Col xs={24} md={6}>
            <Form.Item label={t('setting_index.operationSettings.quotaSettings.preConsumedQuota.label')}>
              <InputNumber style={{ width: '100%' }} value={Number(inputs.PreConsumedQuota || 0)} onChange={(v) => setInputs((p) => ({ ...p, PreConsumedQuota: v }))} />
            </Form.Item>
          </Col>
          <Col xs={24} md={6}>
            <Form.Item label={t('setting_index.operationSettings.quotaSettings.quotaForInviter.label')}>
              <InputNumber style={{ width: '100%' }} value={Number(inputs.QuotaForInviter || 0)} onChange={(v) => setInputs((p) => ({ ...p, QuotaForInviter: v }))} />
            </Form.Item>
          </Col>
          <Col xs={24} md={6}>
            <Form.Item label={t('setting_index.operationSettings.quotaSettings.quotaForInvitee.label')}>
              <InputNumber style={{ width: '100%' }} value={Number(inputs.QuotaForInvitee || 0)} onChange={(v) => setInputs((p) => ({ ...p, QuotaForInvitee: v }))} />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      <Card
        title={t('setting_index.operationSettings.paymentSettings.title')}
        extra={
          <Button type="primary" onClick={() => submitConfig('payment')} loading={loading}>
            {t('setting_index.operationSettings.paymentSettings.save')}
          </Button>
        }
      >
        <Alert
          type="info"
          showIcon
          message={<span dangerouslySetInnerHTML={{ __html: t('setting_index.operationSettings.paymentSettings.alert') }} />}
          style={{ marginBottom: 16 }}
        />
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item label={t('setting_index.operationSettings.paymentSettings.usdRate.label')}>
              <InputNumber style={{ width: '100%' }} value={Number(inputs.PaymentUSDRate || 0)} onChange={(v) => setInputs((p) => ({ ...p, PaymentUSDRate: v }))} />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label={t('setting_index.operationSettings.paymentSettings.minAmount.label')}>
              <InputNumber style={{ width: '100%' }} value={Number(inputs.PaymentMinAmount || 0)} onChange={(v) => setInputs((p) => ({ ...p, PaymentMinAmount: v }))} />
            </Form.Item>
          </Col>
        </Row>
        <Alert
          type="info"
          showIcon
          message={<span dangerouslySetInnerHTML={{ __html: t('setting_index.operationSettings.paymentSettings.discountInfo') }} />}
          style={{ marginBottom: 16 }}
        />
        <Form.Item label={t('setting_index.operationSettings.paymentSettings.discount.label')}>
          <TextArea rows={6} value={inputs.RechargeDiscount} onChange={(e) => setInputs((p) => ({ ...p, RechargeDiscount: e.target.value }))} placeholder={t('setting_index.operationSettings.paymentSettings.discount.placeholder')} />
        </Form.Item>
      </Card>

      <Card
        title={t('setting_index.operationSettings.chatLinkSettings.title')}
        extra={
          <Button type="primary" onClick={() => submitConfig('chatlinks')} loading={loading}>
            {t('setting_index.operationSettings.chatLinkSettings.save')}
          </Button>
        }
      >
        <Alert
          type="info"
          showIcon
          message={<span dangerouslySetInnerHTML={{ __html: t('setting_index.operationSettings.chatLinkSettings.info') }} />}
          style={{ marginBottom: 16 }}
        />
        <ChatLinksEditor
          value={inputs.ChatLinks || '[]'}
          disabled={loading}
          onChange={(next) => setInputs((p) => ({ ...p, ChatLinks: next }))}
        />
      </Card>

      <Card
        title={t('setting_index.operationSettings.disableChannelKeywordsSettings.title')}
        extra={
          <Button type="primary" onClick={() => submitConfig('DisableChannelKeywords')} loading={loading}>
            {t('setting_index.operationSettings.disableChannelKeywordsSettings.save')}
          </Button>
        }
      >
        <Form.Item label={t('setting_index.operationSettings.disableChannelKeywordsSettings.info')}>
          <TextArea rows={6} value={inputs.DisableChannelKeywords} onChange={(e) => setInputs((p) => ({ ...p, DisableChannelKeywords: e.target.value }))} />
        </Form.Item>
      </Card>

      <Card
        title={t('setting_index.operationSettings.claudeSettings.title')}
        extra={
          <Button type="primary" onClick={() => submitConfig('claude')} loading={loading}>
            {t('setting_index.operationSettings.claudeSettings.save')}
          </Button>
        }
      >
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item label={t('setting_index.operationSettings.claudeSettings.budgetTokensPercentage.label')}>
              <InputNumber
                style={{ width: '100%' }}
                value={Number(inputs.ClaudeBudgetTokensPercentage || 0)}
                onChange={(v) => setInputs((p) => ({ ...p, ClaudeBudgetTokensPercentage: v }))}
              />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item label={t('setting_index.operationSettings.claudeSettings.defaultMaxTokens.label')}>
          <TextArea
            rows={5}
            value={inputs.ClaudeDefaultMaxTokens}
            onChange={(e) => setInputs((p) => ({ ...p, ClaudeDefaultMaxTokens: e.target.value }))}
            placeholder={t('setting_index.operationSettings.claudeSettings.defaultMaxTokens.placeholder')}
          />
        </Form.Item>
      </Card>

      <Card
        title={t('setting_index.operationSettings.geminiSettings.title')}
        extra={
          <Button type="primary" onClick={() => submitConfig('gemini')} loading={loading}>
            {t('setting_index.operationSettings.geminiSettings.save')}
          </Button>
        }
      >
        <Form.Item label={t('setting_index.operationSettings.geminiSettings.geminiOpenThink.label')}>
          <TextArea
            rows={5}
            value={inputs.GeminiOpenThink}
            onChange={(e) => setInputs((p) => ({ ...p, GeminiOpenThink: e.target.value }))}
            placeholder={t('setting_index.operationSettings.geminiSettings.geminiOpenThink.placeholder')}
          />
        </Form.Item>
      </Card>

      <Card
        title={
          <Space>
            <span>{t('setting_index.operationSettings.safetySettings.title')}</span>
            <Tag color="red">Beta</Tag>
          </Space>
        }
        extra={
          <Button type="primary" onClick={() => submitConfig('safety')} loading={loading}>
            {t('setting_index.operationSettings.safetySettings.save')}
          </Button>
        }
      >
        <Space direction="vertical" style={{ width: '100%' }} size={12}>
          <Checkbox
            checked={inputs.EnableSafe === 'true'}
            onChange={(e) => setInputs((p) => ({ ...p, EnableSafe: e.target.checked ? 'true' : 'false' }))}
          >
            {t('setting_index.operationSettings.safetySettings.enableSafe')}
          </Checkbox>

          <Form.Item label={t('setting_index.operationSettings.safetySettings.safeToolName.label')}>
            <Select
              value={inputs.SafeToolName || ''}
              loading={safeToolsLoading}
              onChange={(v) => setInputs((p) => ({ ...p, SafeToolName: v }))}
              options={safeTools.map((tool) => ({ value: tool, label: tool }))}
              placeholder={safeToolsLoading ? 'Loading...' : 'Select'}
            />
          </Form.Item>

          <Form.Item label={t('setting_index.operationSettings.safetySettings.safeKeyWords.label')}>
            <TextArea
              rows={6}
              value={Array.isArray(inputs.SafeKeyWords) ? inputs.SafeKeyWords.join('\n') : inputs.SafeKeyWords}
              onChange={(e) => setInputs((p) => ({ ...p, SafeKeyWords: e.target.value }))}
              placeholder={t('setting_index.operationSettings.safetySettings.safeKeyWords.placeholder')}
            />
            <Text type="secondary">每行一个关键词</Text>
          </Form.Item>
        </Space>
      </Card>
      </Space>
    </Form>
  );
}
