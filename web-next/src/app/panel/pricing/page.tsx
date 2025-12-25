'use client';

import React, { useState, useEffect } from 'react';
import { Button, Input, Space, Tag, Table, Modal, Form, Select, InputNumber } from 'antd';
import { useTranslation } from 'react-i18next';
import { API } from '@/utils/api';
import { showError, showSuccess, renderNumber } from '@/utils/common';
import { PlusOutlined, ReloadOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

const { Option } = Select;

export default function PricingPage() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [prices, setPrices] = useState([]);
  const [ownedby, setOwnedby] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPrice, setEditingPrice] = useState<any>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchPrices();
    fetchOwnedby();
  }, []);

  const fetchOwnedby = async () => {
    try {
      const res = await API.get('/api/ownedby');
      const { success, data } = res.data;
      if (success) {
        let list = [];
        for (let key in data) {
          list.push({ value: parseInt(key), label: data[key]?.name || '' });
        }
        setOwnedby(list);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchPrices = async () => {
    setLoading(true);
    try {
      const res = await API.get('/api/prices');
      const { success, message: msg, data } = res.data;
      if (success) {
        setPrices(data);
      } else {
        showError(msg);
      }
    } catch (error: any) {
      showError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
      try {
          const res = await API.delete(`/api/prices/${id}`);
          if (res.data.success) {
              showSuccess(t('common.deleteSuccess'));
              fetchPrices();
          } else {
              showError(res.data.message);
          }
      } catch (error: any) {
          showError(error.message);
      }
  };

  const onFinish = async (values: any) => {
      try {
          const payload = {
              ...values,
              cache_input: values.cache_input ?? 0
          };
          let res;
          if (editingPrice) {
              res = await API.put(`/api/prices/${editingPrice.id}`, payload);
          } else {
              res = await API.post('/api/prices', payload);
          }
          if (res.data.success) {
              showSuccess(t('common.saveSuccess'));
              setModalOpen(false);
              fetchPrices();
          } else {
              showError(res.data.message);
          }
      } catch (error: any) {
          showError(error.message);
      }
  };

  const renderOwnedBy = (value: number) => ownedby.find((item) => item.value === value)?.label || '-';
  const renderMultiplier = (value?: number) => (value === undefined || value === null ? '-' : renderNumber(value));

  const columns = [
      {
          title: t('pricingPage.model'),
          dataIndex: 'model',
          key: 'model',
          render: (text: string) => <Tag color="blue">{text}</Tag>
      },
      {
          title: t('pricingPage.type'),
          dataIndex: 'type',
          key: 'type',
          render: (text: string) => <Tag>{text === 'tokens' ? 'Tokens' : 'Times'}</Tag>
      },
      {
          title: t('modelpricePage.modelMultiplier'),
          dataIndex: 'model_ratio',
          key: 'modelMultiplier',
          render: (text: number) => renderMultiplier(text ?? 1)
      },
      {
          title: t('modelpricePage.inputMultiplier'),
          dataIndex: 'input',
          key: 'input',
          render: (text: number) => renderMultiplier(text)
      },
      {
          title: t('modelpricePage.outputMultiplier'),
          dataIndex: 'output',
          key: 'output',
          render: (text: number) => renderMultiplier(text)
      },
      {
          title: t('modelpricePage.cacheInputMultiplier'),
          dataIndex: 'cache_input',
          key: 'cache_input',
          render: (text: number) => renderMultiplier(text)
      },
      {
          title: t('pricing_edit.channelType'),
          dataIndex: 'channel_type',
          key: 'channel_type',
          render: (value: number) => renderOwnedBy(value)
      },
      {
          title: t('common.action'),
          key: 'action',
          render: (_: any, record: any) => (
              <Space>
                  <Button
                      icon={<EditOutlined />}
                      onClick={() => {
                          setEditingPrice(record);
                          form.setFieldsValue({ model_ratio: 1, cache_input: 0, ...record });
                          setModalOpen(true);
                      }}
                  />
                  <Button danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} />
              </Space>
          )
      }
  ];

  return (
    <div style={{ padding: 24 }}>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Space>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => {
                        setEditingPrice(null);
                        form.resetFields();
                        form.setFieldsValue({ type: 'tokens', model_ratio: 1, cache_input: 0 });
                        setModalOpen(true);
                    }}
                    size={"middle"}
                >
                    {t('pricingPage.newButton')}
                </Button>
                <Button icon={<ReloadOutlined />} onClick={fetchPrices} size={'middle'}>
                    {t('pricingPage.refreshButton')}
                </Button>
            </Space>
        </div>

        <Table 
            loading={loading}
            dataSource={prices}
            columns={columns}
            rowKey="model"
            size={"middle"}
            pagination={{
              pageSize: 100
            }}
        />
      </Space>

      <Modal
        title={editingPrice ? t('common.edit') : t('common.create')}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
        okButtonProps={{
          size: "middle"
        }}
          cancelButtonProps={{
          size: "middle"
        }}
      >
          <Form form={form} layout="vertical" onFinish={onFinish}>
              <Form.Item name="model" label={t('pricingPage.model')} rules={[{ required: true }]}>
                  <Input size={"middle"}/>
              </Form.Item>
              <Form.Item name="type" label={t('pricingPage.type')} initialValue="tokens">
                  <Select size={"middle"}>
                      <Option value="tokens">Tokens</Option>
                      <Option value="times">Times</Option>
                  </Select>
              </Form.Item>
              <Form.Item name="model_ratio" label={t('modelpricePage.modelMultiplier')} initialValue={1}>
                  <InputNumber style={{ width: '100%' }} step={0.001} min={0} size={"middle"}/>
              </Form.Item>
              <Form.Item name="input" label={t('modelpricePage.inputMultiplier')} rules={[{ required: true }]}>
                  <InputNumber style={{ width: '100%' }} step={0.000001} min={0} size={"middle"}/>
              </Form.Item>
              <Form.Item name="output" label={t('modelpricePage.outputMultiplier')} rules={[{ required: true }]}>
                  <InputNumber style={{ width: '100%' }} step={0.000001} min={0} size={"middle"}/>
              </Form.Item>
              <Form.Item name="cache_input" label={t('modelpricePage.cacheInputMultiplier')} initialValue={0}>
                  <InputNumber style={{ width: '100%' }} step={0.000001} min={0} size={"middle"}/>
              </Form.Item>
              <Form.Item name="channel_type" label={t('pricing_edit.channelType')}>
                  <Select size={"middle"} showSearch={true}>
                      {ownedby.map((item: any) => (
                          <Option key={item.value} value={item.value}>{item.label}</Option>
                      ))}
                  </Select>
              </Form.Item>
          </Form>
      </Modal>
    </div>
  );
}
