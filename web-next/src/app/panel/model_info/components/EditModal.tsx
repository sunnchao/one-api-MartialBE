'use client';

import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Select, Tag, AutoComplete, message } from 'antd';
import { API } from '@/utils/api';
import { showError, showSuccess, trims } from '@/utils/common';
import { MODALITY_OPTIONS } from '@/constants/Modality';

interface EditModalProps {
  open: boolean;
  editId: number;
  onCancel: () => void;
  onOk: (status: boolean) => void;
  existingModels: string[];
}

export default function EditModal({ open, editId, onCancel, onOk, existingModels = [] }: EditModalProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [modelOptions, setModelOptions] = useState<{ value: string }[]>([]);
  const [originalModel, setOriginalModel] = useState('');

  const fetchModelList = async () => {
    try {
      const res = await API.get('/api/prices/model_list');
      const { success, data } = res.data;
      if (success) {
        setModelOptions(data.map((item: string) => ({ value: item })));
      }
    } catch (error) {
      console.error('Failed to fetch model list:', error);
    }
  };

  const loadModelInfo = async () => {
    try {
      const res = await API.get(`/api/model_info/${editId}`);
      const { success, message, data } = res.data;
      if (success) {
        // Parse JSON strings to arrays for Select components
        const inputModalities = data.input_modalities ? JSON.parse(data.input_modalities) : [];
        const outputModalities = data.output_modalities ? JSON.parse(data.output_modalities) : [];
        const tags = data.tags ? JSON.parse(data.tags) : [];

        form.setFieldsValue({
          ...data,
          input_modalities: inputModalities,
          output_modalities: outputModalities,
          tags: tags
        });
        setOriginalModel(data.model);
      } else {
        showError(message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchModelList();
  }, []);

  useEffect(() => {
    if (open) {
      if (editId) {
        loadModelInfo();
      } else {
        form.resetFields();
        form.setFieldsValue({
            context_length: 128000,
            max_tokens: 4096,
            input_modalities: ['text'],
            output_modalities: ['text'],
            tags: []
        });
        setOriginalModel('');
      }
    }
  }, [open, editId]);

  const onFinish = async (values: any) => {
    setLoading(true);
    
    // Check for duplicates
    if (existingModels.includes(values.model) && values.model !== originalModel) {
        showError('模型标识已存在');
        setLoading(false);
        return;
    }

    const submitValues = {
        ...values,
        // Stringify arrays for backend
        input_modalities: JSON.stringify(values.input_modalities),
        output_modalities: JSON.stringify(values.output_modalities),
        tags: JSON.stringify(values.tags)
    };

    try {
      let res;
      if (editId) {
        res = await API.put('/api/model_info/', { ...submitValues, id: editId });
      } else {
        res = await API.post('/api/model_info/', submitValues);
      }
      
      const { success, message: msg } = res.data;
      if (success) {
        showSuccess('保存成功');
        onOk(true);
      } else {
        showError(msg);
      }
    } catch (error: any) {
      showError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const modalityOptions = Object.values(MODALITY_OPTIONS).map(opt => ({
      label: (
          <Tag color={opt.color}>{opt.text}</Tag>
      ),
      value: opt.value
  }));

  const tagRender = (props: any) => {
    const { label, value, closable, onClose } = props;
    const option = MODALITY_OPTIONS[value];
    
    // If it's a known modality, use its color, otherwise use default
    if (option) {
        return (
            <Tag color={option.color} closable={closable} onClose={onClose} style={{ marginRight: 3 }}>
                {option.text}
            </Tag>
        );
    }
    
    return (
        <Tag closable={closable} onClose={onClose} style={{ marginRight: 3 }}>
            {label}
        </Tag>
    );
  };

  return (
    <Modal
      title={editId ? '编辑模型信息' : '新建模型信息'}
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={loading}
      width={800}
    >
      <Form 
        form={form} 
        layout="vertical" 
        onFinish={onFinish}
        initialValues={{
            context_length: 128000,
            max_tokens: 4096,
            input_modalities: ['text'],
            output_modalities: ['text'],
            tags: []
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            <Form.Item
                name="model"
                label="模型标识"
                rules={[{ required: true, message: '模型标识不能为空' }]}
            >
                <AutoComplete
                    options={modelOptions.filter(opt => !existingModels.includes(opt.value) || opt.value === form.getFieldValue('model'))}
                    placeholder="请输入或选择模型标识"
                    onChange={(value) => {
                        if (value && !form.getFieldValue('name')) {
                            form.setFieldValue('name', value);
                        }
                    }}
                />
            </Form.Item>
            
            <Form.Item
                name="name"
                label="模型名称"
                rules={[{ required: true, message: '模型名称不能为空' }]}
            >
                <Input placeholder="请输入模型名称" />
            </Form.Item>
        </div>

        <Form.Item
            name="description"
            label="描述"
        >
            <Input.TextArea rows={3} placeholder="请输入模型描述" />
        </Form.Item>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            <Form.Item
                name="context_length"
                label="上下文长度"
                rules={[{ required: true, message: '上下文长度不能为空' }]}
            >
                <InputNumber style={{ width: '100%' }} min={0} />
            </Form.Item>

            <Form.Item
                name="max_tokens"
                label="最大Token"
                rules={[{ required: true, message: '最大Token不能为空' }]}
            >
                <InputNumber style={{ width: '100%' }} min={0} />
            </Form.Item>
        </div>

        <Form.Item
            name="input_modalities"
            label="输入模态"
        >
            <Select
                mode="tags"
                style={{ width: '100%' }}
                placeholder="选择或输入"
                options={modalityOptions}
                tagRender={tagRender}
            />
        </Form.Item>

        <Form.Item
            name="output_modalities"
            label="输出模态"
        >
            <Select
                mode="tags"
                style={{ width: '100%' }}
                placeholder="选择或输入"
                options={modalityOptions}
                tagRender={tagRender}
            />
        </Form.Item>

        <Form.Item
            name="tags"
            label="标签"
        >
            <Select
                mode="tags"
                style={{ width: '100%' }}
                placeholder="输入标签,回车键确认"
                tokenSeparators={[',']}
            />
        </Form.Item>
      </Form>
    </Modal>
  );
}
