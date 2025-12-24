'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Button,
  Collapse,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Switch,
  Typography,
} from 'antd';
import { useTranslation } from 'react-i18next';
import { API } from '@/utils/api';
import { showError, showSuccess } from '@/utils/common';
import { CHANNEL_OPTIONS } from '@/constants/ChannelConstants';

const { Text } = Typography;

type ChannelRecord = any;

type FormValues = {
  name: string;
  type: number;
  enabled: boolean;
  key: string;
  base_url: string;
  other: string;
  proxy: string;
  test_model: string;
  models: string[];
  groups: string[];
  tag: string;
  weight?: number;
  priority?: number;
  only_chat: boolean;
  compatible_response: boolean;
  auto_ban: boolean;
  pre_cost?: number;
  disabled_stream: string;
  model_mapping: string;
  model_headers: string;
  status_code_mapping: string;
  custom_parameter: string;
};

function toTextareaList(value?: string | string[]) {
  if (!value) return '';
  if (Array.isArray(value)) return value.join('\n');
  return String(value);
}

function ensureJson(input: string, type: 'object' | 'array') {
  const text = (input || '').trim();
  if (!text) return undefined;
  const parsed = JSON.parse(text);
  if (type === 'array' && !Array.isArray(parsed)) throw new Error('array');
  if (type === 'object' && (parsed === null || Array.isArray(parsed) || typeof parsed !== 'object')) throw new Error('object');
  return text;
}

export default function ChannelEditModal({
  open,
  channelId,
  onCancel,
  onOk,
  groupOptions,
  modelOptions,
}: {
  open: boolean;
  channelId: number;
  onCancel: () => void;
  onOk: () => void;
  groupOptions: string[];
  modelOptions: Array<{ label: string; value: string; group?: string }>;
}) {
  const { t } = useTranslation();
  const [form] = Form.useForm<FormValues>();
  const [loading, setLoading] = useState(false);

  const isEdit = channelId > 0;

  const typeOptions = useMemo(
    () =>
      Object.values(CHANNEL_OPTIONS)
        .sort((a, b) => a.value - b.value)
        .map((opt) => ({ label: opt.text, value: opt.value })),
    [],
  );

  const groupSelectOptions = useMemo(
    () => groupOptions.map((g) => ({ label: g, value: g })),
    [groupOptions],
  );

  const initForm = (record?: ChannelRecord) => {
    const groupStr = record?.group || 'default';
    const groups = String(groupStr)
      .split(',')
      .map((s: string) => s.trim())
      .filter(Boolean);

    const models = String(record?.models || '')
      .split(',')
      .map((s: string) => s.trim())
      .filter(Boolean);

    form.setFieldsValue({
      name: record?.name || '',
      type: Number(record?.type || 1),
      enabled: Number(record?.status || 2) === 1,
      key: record?.key || '',
      base_url: record?.base_url || '',
      other: record?.other || '',
      proxy: record?.proxy || '',
      test_model: record?.test_model || '',
      models,
      groups: groups.length ? groups : ['default'],
      tag: record?.tag || '',
      weight: typeof record?.weight === 'number' ? record.weight : Number(record?.weight || 1),
      priority: typeof record?.priority === 'number' ? record.priority : Number(record?.priority || 0),
      only_chat: Boolean(record?.only_chat),
      compatible_response: Boolean(record?.compatible_response),
      auto_ban: (record?.auto_ban ?? 1) !== 0,
      pre_cost: Number(record?.pre_cost || 1),
      disabled_stream: toTextareaList(record?.disabled_stream || []),
      model_mapping: record?.model_mapping || '',
      model_headers: record?.model_headers || '',
      status_code_mapping: record?.status_code_mapping || '',
      custom_parameter: record?.custom_parameter || '',
    });
  };

  useEffect(() => {
    if (!open) return;
    if (!isEdit) {
      initForm();
      return;
    }
    (async () => {
      setLoading(true);
      try {
        const res = await API.get(`/api/channel/${channelId}`);
        const { success, message, data } = res.data;
        if (!success) {
          showError(message || 'Failed to load channel');
          return;
        }
        initForm(data);
      } catch (e: any) {
        showError(e?.message || 'Failed to load channel');
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, channelId]);

  const submit = async () => {
    try {
      const values = await form.validateFields();

      const disabledStreamList = (values.disabled_stream || '')
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);

      let model_mapping: string | undefined;
      let model_headers: string | undefined;
      let status_code_mapping: string | undefined;
      let custom_parameter: string | undefined;

      try {
        model_mapping = ensureJson(values.model_mapping, 'object');
        model_headers = ensureJson(values.model_headers, 'object');
        status_code_mapping = ensureJson(values.status_code_mapping, 'object');
        custom_parameter = ensureJson(values.custom_parameter, 'object');
      } catch {
        showError(t('channel_edit.validJson') || 'Must be valid JSON');
        return;
      }

      const payload: any = {
        ...(isEdit ? { id: channelId } : {}),
        name: values.name?.trim(),
        type: Number(values.type),
        status: values.enabled ? 1 : 2,
        key: values.key || '',
        base_url: values.base_url || '',
        other: values.other || '',
        proxy: values.proxy || '',
        test_model: values.test_model || '',
        models: (values.models || []).join(','),
        group: (values.groups || ['default']).join(','),
        tag: values.tag || '',
        weight: Number(values.weight || 1),
        priority: Number(values.priority || 0),
        only_chat: Boolean(values.only_chat),
        compatible_response: Boolean(values.compatible_response),
        auto_ban: values.auto_ban ? 1 : 0,
        pre_cost: Number(values.pre_cost || 1),
        disabled_stream: disabledStreamList,
        model_mapping: model_mapping ?? '',
        model_headers: model_headers ?? '',
        status_code_mapping: status_code_mapping ?? '',
        custom_parameter: custom_parameter ?? '',
      };

      setLoading(true);
      const res = isEdit ? await API.put('/api/channel/', payload) : await API.post('/api/channel/', payload);
      const { success, message } = res.data;
      if (success) {
        showSuccess(isEdit ? t('channel_edit.editSuccess') : t('channel_edit.addSuccess'));
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
      title={isEdit ? `${t('common.edit')}${t('channel_index.channel')}` : t('channel_index.newChannel')}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" size="middle" onClick={onCancel}>
          {t('common.cancel')}
        </Button>,
        <Button key="ok" size="middle" type="primary" loading={loading} onClick={submit}>
          {t('common.submit') || t('token_index.submit')}
        </Button>,
      ]}
      width={860}
      destroyOnClose
      maskClosable={false}
    >
      <Alert type="info" showIcon={false} message={t('channel_index.priorityWeightExplanation')} style={{ marginBottom: 12 }} />

      <Form form={form} layout="vertical" requiredMark={false} size="middle">
        <Space size="large" wrap style={{ width: '100%' }}>
          <Form.Item name="name" label={t('channel_index.name')} rules={[{ required: true, message: t('channel_edit.requiredName') }]}>
            <Input style={{ width: 320 }} />
          </Form.Item>
          <Form.Item name="type" label={t('channel_index.type')} rules={[{ required: true, message: t('channel_edit.requiredChannel') }]}>
            <Select style={{ width: 240 }} options={typeOptions} />
          </Form.Item>
          <Form.Item name="enabled" label={t('channel_index.status')} valuePropName="checked">
            <Switch size="default" />
          </Form.Item>
        </Space>

        <Space size="large" wrap style={{ width: '100%' }}>
          <Form.Item
            name="groups"
            label={t('channel_index.group')}
            rules={[{ required: true, message: t('channel_edit.requiredGroup') }]}
            style={{ flex: '1 1 360px' }}
          >
            <Select mode="multiple" allowClear options={groupSelectOptions} placeholder="default" />
          </Form.Item>
          <Form.Item name="tag" label={t('channel_index.tags')} style={{ flex: '1 1 240px' }}>
            <Input placeholder={t('channel_edit.tag') || ''} />
          </Form.Item>
        </Space>

        <Space size="large" wrap style={{ width: '100%' }}>
          <Form.Item name="priority" label={t('channel_index.priority')} style={{ width: 180 }}>
            <InputNumber min={0} step={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="weight" label={t('channel_index.weight')} style={{ width: 180 }}>
            <InputNumber min={1} step={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="auto_ban" label={t('channel_edit.auto_ban') || '自动禁用'} valuePropName="checked">
            <Switch size="default" />
          </Form.Item>
        </Space>

        <Form.Item name="key" label={t('channel_edit.requiredKey') ? t('channel_edit.requiredKey').replace(' 不能为空', '') : 'Key'} rules={[{ required: true, message: t('channel_edit.requiredKey') }]}>
          <Input.TextArea rows={4} placeholder={t('channel_edit.batchKeytip') || ''} />
        </Form.Item>

        <Form.Item name="base_url" label={t('channel_edit.baseUrl') || 'base_url'}>
          <Input.TextArea rows={2} placeholder={t('channel_edit.openaiBaseUrlTip') || ''} />
        </Form.Item>

        <Space size="large" wrap style={{ width: '100%' }}>
          <Form.Item name="test_model" label={t('channel_index.testModel')} style={{ flex: '1 1 300px' }}>
            <Input placeholder={t('channel_edit.test_model') || ''} />
          </Form.Item>
          <Form.Item name="proxy" label={t('channel_edit.proxy') || 'proxy'} style={{ flex: '1 1 300px' }}>
            <Input />
          </Form.Item>
        </Space>

        <Form.Item
          name="models"
          label={t('channel_index.model')}
          rules={[
            {
              validator: async (_, value) => {
                if (Array.isArray(value) && value.length > 0) return;
                throw new Error(t('channel_edit.requiredModels'));
              },
            },
          ]}
          extra={t('channel_edit.inputChannelModel')}
        >
          <Select
            mode="tags"
            allowClear
            showSearch
            placeholder={t('channel_edit.models') || ''}
            options={modelOptions}
            optionFilterProp="label"
            tokenSeparators={[',', '\n', ' ']}
            maxTagCount="responsive"
          />
        </Form.Item>

        <Form.Item name="other" label={t('channel_index.otherParameters')}>
          <Input />
        </Form.Item>

        <Space size="large" wrap style={{ width: '100%' }}>
          <Form.Item name="only_chat" label={t('channel_edit.only_chat') || '仅支持聊天'} valuePropName="checked">
            <Switch size="default" />
          </Form.Item>
          <Form.Item name="compatible_response" label={t('channel_edit.compatible_response') || '兼容Response API'} valuePropName="checked">
            <Switch size="default" />
          </Form.Item>
          <Form.Item name="pre_cost" label={t('channel_edit.pre_cost') || '预计费选项'} style={{ width: 180 }}>
            <InputNumber min={0} step={1} style={{ width: '100%' }} />
          </Form.Item>
        </Space>

        <Collapse
          items={[
            {
              key: 'advanced',
              label: t('channel_edit.expand') || 'Advanced',
              children: (
                <Space direction="vertical" style={{ width: '100%' }} size="middle">
                  <Text type="secondary">
                    {t('channel_edit.validJson') || 'These fields must be valid JSON when filled.'}
                  </Text>
                  <Form.Item name="disabled_stream" label={t('channel_edit.disabled_stream') || '禁用流式的模型'}>
                    <Input.TextArea rows={3} placeholder="gpt-4o\ngpt-4.1" />
                  </Form.Item>
                  <Form.Item name="model_mapping" label={t('channel_edit.modelMapping') || '模型映射'}>
                    <Input.TextArea rows={4} placeholder='{"gpt-4o":"gpt-4o-mini"}' />
                  </Form.Item>
                  <Form.Item name="model_headers" label={t('channel_edit.model_headers') || '自定义模型请求头'}>
                    <Input.TextArea rows={4} placeholder='{"X-Header":"value"}' />
                  </Form.Item>
                  <Form.Item name="status_code_mapping" label={t('channel_edit.status_code_mapping') || '状态码映射'}>
                    <Input.TextArea rows={4} placeholder='{"429":503}' />
                  </Form.Item>
                  <Form.Item name="custom_parameter" label={t('channel_edit.custom_parameter') || '额外参数'}>
                    <Input.TextArea rows={4} placeholder='{"overwrite":true,"stream":false}' />
                  </Form.Item>
                </Space>
              ),
            },
          ]}
        />
      </Form>
    </Modal>
  );
}
