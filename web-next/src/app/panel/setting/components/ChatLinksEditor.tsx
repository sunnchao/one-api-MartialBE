'use client';

import React, { useMemo, useState } from 'react';
import { Button, Form, Input, Modal, Space, Switch, Table, Typography, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

const { Text } = Typography;

export interface ChatLinkItem {
  name: string;
  url: string;
  show?: boolean;
  sort?: number;
}

function safeParseLinks(jsonString: string): ChatLinkItem[] {
  if (!jsonString) return [];
  try {
    const data = JSON.parse(jsonString);
    if (!Array.isArray(data)) return [];
    return data
      .map((x) => ({
        name: String(x?.name ?? ''),
        url: String(x?.url ?? ''),
        show: Boolean(x?.show ?? true),
        sort: typeof x?.sort === 'number' ? x.sort : undefined,
      }))
      .filter((x) => x.name || x.url);
  } catch {
    return [];
  }
}

function stringifyLinks(items: ChatLinkItem[]) {
  return JSON.stringify(
    items.map((x, idx) => ({
      name: x.name,
      url: x.url,
      show: Boolean(x.show),
      sort: typeof x.sort === 'number' ? x.sort : idx,
    })),
    null,
    2
  );
}

export default function ChatLinksEditor({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (nextJson: string) => void;
  disabled?: boolean;
}) {
  const data = useMemo(() => safeParseLinks(value), [value]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [form] = Form.useForm<ChatLinkItem>();

  const openAdd = () => {
    setEditingIndex(null);
    form.setFieldsValue({ name: '', url: '', show: true, sort: data.length });
    setModalOpen(true);
  };

  const openEdit = (idx: number) => {
    setEditingIndex(idx);
    form.setFieldsValue({ ...data[idx] });
    setModalOpen(true);
  };

  const remove = (idx: number) => {
    const next = [...data];
    next.splice(idx, 1);
    onChange(stringifyLinks(next));
  };

  const save = async () => {
    const values = await form.validateFields();
    if (!values.url?.includes('{key}') || !values.url?.includes('{server}')) {
      message.warning('建议 URL 包含 {key} 与 {server} 占位符');
    }
    const next = [...data];
    if (editingIndex === null) next.push(values);
    else next[editingIndex] = values;
    onChange(stringifyLinks(next));
    setModalOpen(false);
  };

  return (
    <div>
      <Space style={{ width: '100%', justifyContent: 'space-between', marginBottom: 8 }}>
        <Text type="secondary">ChatLinks JSON 会自动由表格生成</Text>
        <Button icon={<PlusOutlined />} onClick={openAdd} disabled={disabled}>
          Add
        </Button>
      </Space>

      <Table
        size="small"
        rowKey={(r, idx) => `${r.name}-${idx}`}
        pagination={false}
        dataSource={[...data].sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0))}
        columns={[
          { title: 'Name', dataIndex: 'name', key: 'name', width: 180, ellipsis: true },
          { title: 'URL', dataIndex: 'url', key: 'url', ellipsis: true },
          {
            title: 'Show',
            dataIndex: 'show',
            key: 'show',
            width: 80,
            render: (v: boolean, _record, index) => (
              <Switch
                checked={Boolean(v)}
                disabled={disabled}
                size="default"
                onChange={(checked) => {
                  const next = [...data];
                  next[index] = { ...next[index], show: checked };
                  onChange(stringifyLinks(next));
                }}
              />
            ),
          },
          { title: 'Sort', dataIndex: 'sort', key: 'sort', width: 80 },
          {
            title: 'Actions',
            key: 'actions',
            width: 140,
            render: (_: any, _record: any, index: number) => (
              <Space>
                <Button size="small" onClick={() => openEdit(index)} disabled={disabled}>
                  Edit
                </Button>
                <Button size="small" danger onClick={() => remove(index)} disabled={disabled}>
                  Delete
                </Button>
              </Space>
            ),
          },
        ]}
      />

      <Modal open={modalOpen} onCancel={() => setModalOpen(false)} onOk={save} title={editingIndex === null ? 'Add link' : 'Edit link'}>
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Name required' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="url" label="URL" rules={[{ required: true, message: 'URL required' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="show" label="Show" valuePropName="checked">
            <Switch size="default" />
          </Form.Item>
          <Form.Item name="sort" label="Sort">
            <Input type="number" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
