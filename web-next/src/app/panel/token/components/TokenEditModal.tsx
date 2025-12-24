'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Button, DatePicker, Divider, Form, Input, InputNumber, Modal, Select, Space, Switch, Typography } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { useTranslation } from 'react-i18next';
import { API } from '@/utils/api';
import { showError, showSuccess } from '@/utils/common';

const { Text } = Typography;

type TokenSetting = {
  heartbeat?: { enabled?: boolean; timeout_seconds?: number };
  limits?: { limits_ip_setting?: { enabled?: boolean; whitelist?: string[] } };
};

type TokenRecord = {
  id: number;
  name: string;
  expired_time: number;
  remain_quota: number;
  unlimited_quota: boolean;
  group: string;
  backup_group: string;
  model_limits: string;
  model_limits_enabled: boolean;
  billing_type: string;
  setting?: TokenSetting;
};

type FormValues = {
  name: string;
  never_expires: boolean;
  expired_at?: Dayjs;
  unlimited_quota: boolean;
  remain_quota: number;
  group: string;
  backup_groups: string[];
  billing_type: string;
  model_limits_enabled: boolean;
  model_limits_text: string;
  heartbeat_enabled: boolean;
  heartbeat_timeout_seconds: number;
  ip_whitelist_enabled: boolean;
  ip_whitelist_text: string;
};

function splitList(input: string): string[] {
  return input
    .split(/[\n,]/g)
    .map((s) => s.trim())
    .filter(Boolean);
}

function joinCsv(values: string[]): string {
  return values.map((s) => s.trim()).filter(Boolean).join(',');
}

export default function TokenEditModal({
  open,
  tokenId,
  onCancel,
  onOk,
  userGroupOptions,
}: {
  open: boolean;
  tokenId: number;
  onCancel: () => void;
  onOk: () => void;
  userGroupOptions: Array<{ label: string; value: string }>;
}) {
  const { t } = useTranslation();
  const [form] = Form.useForm<FormValues>();
  const [loading, setLoading] = useState(false);

  const isEdit = tokenId > 0;

  const groupSelectOptions = useMemo(() => {
    const follow = { label: t('token_index.selectGroup') ? '跟随用户分组' : 'Follow user group', value: '' };
    return [follow, ...userGroupOptions];
  }, [t, userGroupOptions]);

  const resetForm = () => {
    form.setFieldsValue({
      name: '',
      never_expires: true,
      expired_at: undefined,
      unlimited_quota: true,
      remain_quota: 0,
      group: '',
      backup_groups: [],
      billing_type: 'tokens',
      model_limits_enabled: false,
      model_limits_text: '',
      heartbeat_enabled: false,
      heartbeat_timeout_seconds: 30,
      ip_whitelist_enabled: false,
      ip_whitelist_text: '',
    });
  };

  useEffect(() => {
    if (!open) return;

    if (!isEdit) {
      resetForm();
      return;
    }

    (async () => {
      setLoading(true);
      try {
        const res = await API.get(`/api/token/${tokenId}`);
        const { success, message, data } = res.data;
        if (!success) {
          showError(message || 'Failed to load token');
          return;
        }
        const token = data as TokenRecord;
        const setting = (token.setting || {}) as TokenSetting;
        const ipSetting = setting?.limits?.limits_ip_setting || {};
        const heartbeat = setting?.heartbeat || {};

        form.setFieldsValue({
          name: token.name || '',
          never_expires: token.expired_time === -1,
          expired_at: token.expired_time && token.expired_time !== -1 ? dayjs.unix(token.expired_time) : undefined,
          unlimited_quota: Boolean(token.unlimited_quota),
          remain_quota: Number(token.remain_quota || 0),
          group: token.group || '',
          backup_groups: token.backup_group ? token.backup_group.split(',').map((s) => s.trim()).filter(Boolean) : [],
          billing_type: (token.billing_type as string) || 'tokens',
          model_limits_enabled: Boolean(token.model_limits_enabled),
          model_limits_text: token.model_limits ? token.model_limits.split(',').join('\n') : '',
          heartbeat_enabled: Boolean(heartbeat.enabled),
          heartbeat_timeout_seconds: Number(heartbeat.timeout_seconds || 30),
          ip_whitelist_enabled: Boolean(ipSetting.enabled),
          ip_whitelist_text: Array.isArray(ipSetting.whitelist) ? ipSetting.whitelist.join('\n') : '',
        });
      } catch (e: any) {
        showError(e?.message || 'Failed to load token');
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, tokenId]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (values.heartbeat_enabled) {
        const n = Number(values.heartbeat_timeout_seconds);
        if (!Number.isFinite(n) || n < 30 || n > 90) {
          form.setFields([{ name: 'heartbeat_timeout_seconds', errors: [t('token_index.heartbeatTimeoutHelperText') || '30-90 seconds'] }]);
          return;
        }
      }

      const expired_time =
        values.never_expires ? -1 : values.expired_at ? Math.floor(values.expired_at.valueOf() / 1000) : Math.floor(Date.now() / 1000);

      const modelLimits = joinCsv(splitList(values.model_limits_text || ''));
      const ipWhitelist = splitList(values.ip_whitelist_text || '');

      const payload: any = {
        ...(isEdit ? { id: tokenId } : {}),
        name: values.name?.trim(),
        expired_time,
        unlimited_quota: Boolean(values.unlimited_quota),
        remain_quota: Number(values.remain_quota || 0),
        group: values.group || '',
        backup_group: joinCsv(values.backup_groups || []),
        model_limits_enabled: Boolean(values.model_limits_enabled),
        model_limits: modelLimits,
        billing_type: values.billing_type || 'tokens',
        setting: {
          heartbeat: {
            enabled: Boolean(values.heartbeat_enabled),
            timeout_seconds: Number(values.heartbeat_timeout_seconds || 30),
          },
          limits: {
            limits_ip_setting: {
              enabled: Boolean(values.ip_whitelist_enabled),
              whitelist: ipWhitelist,
            },
          },
        },
      };

      setLoading(true);
      const res = isEdit ? await API.put('/api/token/', payload) : await API.post('/api/token/', payload);
      const { success, message } = res.data;
      if (success) {
        showSuccess(t('common.success') || 'Success');
        onOk();
      } else {
        showError(message || 'Operation failed');
      }
    } catch (e: any) {
      if (e?.errorFields) return;
      showError(e?.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      title={isEdit ? t('token_index.editToken') : t('token_index.createToken')}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          {t('token_index.cancel') || t('common.cancel') || 'Cancel'}
        </Button>,
        <Button key="ok" type="primary" loading={loading} onClick={handleSubmit}>
          {t('token_index.submit') || t('common.submit') || 'Submit'}
        </Button>,
      ]}
      width={760}
      destroyOnClose
      maskClosable={false}
    >
      <Alert type="info" showIcon={false} message={t('token_index.quotaNote')} style={{ marginBottom: 12 }} />

      <Form form={form} layout="vertical" requiredMark={false} initialValues={{ never_expires: true, unlimited_quota: true, billing_type: 'tokens' }}>
        <Form.Item name="name" label={t('token_index.name')} rules={[{ required: true, message: t('common.required') || 'Required' }, { max: 30 }]}>
          <Input placeholder={t('token_index.searchTokenName')} />
        </Form.Item>

        <Space size="large" wrap style={{ width: '100%' }}>
          <Form.Item name="never_expires" valuePropName="checked" label={t('token_index.neverExpires')} style={{ marginBottom: 0 }}>
            <Switch size="default" />
          </Form.Item>
          <Form.Item shouldUpdate noStyle>
            {() => {
              const never = form.getFieldValue('never_expires');
              if (never) return null;
              return (
                <Form.Item name="expired_at" label={t('token_index.expiryTime')} rules={[{ required: true, message: t('token_index.invalidDate') }]}>
                  <DatePicker showTime style={{ width: 260 }} />
                </Form.Item>
              );
            }}
          </Form.Item>
        </Space>

        <Space size="large" wrap style={{ width: '100%' }}>
          <Form.Item name="unlimited_quota" valuePropName="checked" label={t('token_index.unlimitedQuota')} style={{ marginBottom: 0 }}>
            <Switch size="default" />
          </Form.Item>
          <Form.Item shouldUpdate noStyle>
            {() => {
              const unlimited = form.getFieldValue('unlimited_quota');
              if (unlimited) return null;
              return (
                <Form.Item name="remain_quota" label={t('token_index.quota')} rules={[{ type: 'number', min: 0 }]}>
                  <InputNumber style={{ width: 260 }} />
                </Form.Item>
              );
            }}
          </Form.Item>
        </Space>

        <Divider style={{ margin: '12px 0' }} />

        <Space size="large" wrap style={{ width: '100%' }}>
          <Form.Item name="group" label={t('token_index.userGroup')} style={{ flex: '1 1 280px' }}>
            <Select options={groupSelectOptions} />
          </Form.Item>
          <Form.Item name="backup_groups" label={t('token_index.userBackupGroup')} style={{ flex: '2 1 360px' }}>
            <Select
              mode="multiple"
              allowClear
              placeholder={t('token_index.backupGroupHelperText')}
              options={userGroupOptions}
            />
          </Form.Item>
        </Space>
        <Text type="secondary">{t('token_index.selectGroupInfo')}</Text>

        <Divider style={{ margin: '12px 0' }} />

        <Form.Item name="billing_type" label={t('token_index.billingType.header')}>
          <Select
            options={[
              { label: t('token_index.billingType.tokens'), value: 'tokens' },
              { label: t('token_index.billingType.times'), value: 'times' },
            ]}
          />
        </Form.Item>

        <Divider style={{ margin: '12px 0' }} />

        <Form.Item name="model_limits_enabled" valuePropName="checked" label={t('token_index.limits_models_switch')}>
          <Switch size="default" />
        </Form.Item>
        <Form.Item shouldUpdate noStyle>
          {() => {
            const enabled = form.getFieldValue('model_limits_enabled');
            if (!enabled) return null;
            return (
              <Form.Item name="model_limits_text" label={t('token_index.limit_models')} extra={t('token_index.limit_models_info')}>
                <Input.TextArea rows={5} placeholder="gpt-4o\ngpt-4.1\nclaude-3-5-sonnet" />
              </Form.Item>
            );
          }}
        </Form.Item>

        <Divider style={{ margin: '12px 0' }} />

        <Form.Item name="heartbeat_enabled" valuePropName="checked" label={t('token_index.heartbeat')}>
          <Switch size="default" />
        </Form.Item>
        <Form.Item shouldUpdate noStyle>
          {() => {
            const enabled = form.getFieldValue('heartbeat_enabled');
            if (!enabled) return null;
            return (
              <Form.Item
                name="heartbeat_timeout_seconds"
                label={t('token_index.heartbeatTimeout')}
                rules={[{ type: 'number', min: 30, max: 90 }]}
                extra={t('token_index.heartbeatTimeoutHelperText')}
              >
                <InputNumber style={{ width: 260 }} min={30} max={90} step={1} />
              </Form.Item>
            );
          }}
        </Form.Item>

        <Divider style={{ margin: '12px 0' }} />

        <Form.Item name="ip_whitelist_enabled" valuePropName="checked" label={t('token_index.limits_ip_whitelist_switch')}>
          <Switch size="default" />
        </Form.Item>
        <Form.Item shouldUpdate noStyle>
          {() => {
            const enabled = form.getFieldValue('ip_whitelist_enabled');
            if (!enabled) return null;
            return (
              <Form.Item name="ip_whitelist_text" label={t('token_index.limits_ip_whitelist_input')} extra={t('token_index.limits_ip_whitelist_helper')}>
                <Input.TextArea rows={5} placeholder="192.168.1.1\n10.0.0.0/8\n172.16.0.0/12" />
              </Form.Item>
            );
          }}
        </Form.Item>
      </Form>
    </Modal>
  );
}
