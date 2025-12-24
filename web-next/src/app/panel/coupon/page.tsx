'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  Typography,
  Button,
  Table,
  Modal,
  Input,
  Select,
  Switch,
  Alert,
  Tabs,
  Space,
  Row,
  Col,
  Tag,
  Tooltip,
  Popconfirm,
  InputNumber,
  Form
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SendOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { API } from '@/utils/api';
import { showError, showSuccess } from '@/utils/common';

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

export default function CouponManagement() {
  const [activeTab, setActiveTab] = useState('templates');

  // Coupon Template State
  const [templates, setTemplates] = useState<any[]>([]);
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [templateForm] = Form.useForm();

  // Check-in Reward State
  const [checkinRewards, setCheckinRewards] = useState<any[]>([]);
  const [rewardModalOpen, setRewardModalOpen] = useState(false);
  const [editingReward, setEditingReward] = useState<any>(null);
  const [rewardForm] = Form.useForm();

  // Batch Issue State
  const [batchModalOpen, setBatchModalOpen] = useState(false);
  const [batchForm] = Form.useForm();

  // Fetch Data
  const fetchTemplates = async () => {
    try {
      const res = await API.get('/api/coupon/admin/templates');
      if (res.data.success) {
        setTemplates(res.data.data || []);
      }
    } catch (error) {
      showError('获取优惠券模板失败');
    }
  };

  const fetchCheckinRewards = async () => {
    try {
      const res = await API.get('/api/coupon/checkin_rewards');
      if (res.data.success) {
        setCheckinRewards(res.data.data || []);
      }
    } catch (error) {
      showError('获取签到奖励配置失败');
    }
  };

  useEffect(() => {
    fetchTemplates();
    fetchCheckinRewards();
  }, []);

  // Template Actions
  const handleTemplateSubmit = async (values: any) => {
    try {
      const url = editingTemplate ? `/api/coupon/admin/templates/${editingTemplate.id}` : '/api/coupon/admin/templates';
      const method = editingTemplate ? 'put' : 'post';

      // @ts-ignore
      const res = await API[method](url, {
          ...values,
          is_active: values.is_active ?? true
      });
      
      if (res.data.success) {
        showSuccess(editingTemplate ? '更新成功' : '创建成功');
        setTemplateModalOpen(false);
        templateForm.resetFields();
        fetchTemplates();
      } else {
        showError(res.data.message);
      }
    } catch (error) {
      showError('操作失败');
    }
  };

  const handleDeleteTemplate = async (id: number) => {
    try {
      const res = await API.delete(`/api/coupon/admin/templates/${id}`);
      if (res.data.success) {
        showSuccess('删除成功');
        fetchTemplates();
      } else {
        showError(res.data.message);
      }
    } catch (error) {
      showError('删除失败');
    }
  };

  // Reward Actions
  const handleRewardSubmit = async (values: any) => {
    try {
      const url = editingReward ? `/api/coupon/admin/checkin_rewards/${editingReward.id}` : '/api/coupon/admin/checkin_rewards';
      const method = editingReward ? 'put' : 'post';

      // @ts-ignore
      const res = await API[method](url, {
          ...values,
          is_enabled: values.is_enabled ?? true
      });
      
      if (res.data.success) {
        showSuccess(editingReward ? '更新成功' : '创建成功');
        setRewardModalOpen(false);
        rewardForm.resetFields();
        fetchCheckinRewards();
      } else {
        showError(res.data.message);
      }
    } catch (error) {
      showError('操作失败');
    }
  };

  // Batch Issue
  const handleBatchIssue = async (values: any) => {
    try {
      const userIds = values.user_ids
        .split(',')
        .map((id: string) => parseInt(id.trim()))
        .filter((id: number) => !isNaN(id));
      
      if (userIds.length === 0) {
        showError('请输入有效的用户ID');
        return;
      }

      const res = await API.post('/api/coupon/admin/batch_issue', {
        ...values,
        user_ids: userIds
      });

      if (res.data.success) {
        const { success_count, fail_count } = res.data.data;
        showSuccess(`批量发放完成：成功 ${success_count} 个，失败 ${fail_count} 个`);
        setBatchModalOpen(false);
        batchForm.resetFields();
      } else {
        showError(res.data.message);
      }
    } catch (error) {
      showError('批量发放失败');
    }
  };

  // Helpers
  const getCouponTypeText = (type: string) => {
    switch (type) {
      case 'percentage': return '百分比折扣';
      case 'fixed': return '固定金额';
      case 'recharge': return '充值奖励';
      default: return type;
    }
  };

  const getRewardTypeText = (type: string) => {
    switch (type) {
      case 'quota': return '额度奖励';
      case 'coupon': return '优惠券';
      case 'multiplier': return '倍率奖励';
      default: return type;
    }
  };

  // Columns
  const templateColumns = [
    { 
        title: '名称', 
        dataIndex: 'name', 
        key: 'name',
        render: (text: string, record: any) => (
            <div>
                <div>{text}</div>
                <Text type="secondary" style={{ fontSize: 12 }}>{record.description}</Text>
            </div>
        )
    },
    { 
        title: '类型', 
        dataIndex: 'type', 
        key: 'type',
        render: (text: string) => <Tag>{getCouponTypeText(text)}</Tag>
    },
    { 
        title: '折扣值', 
        key: 'value',
        render: (text: any, record: any) => (
            <div>
                {record.type === 'percentage' ? `${record.value}%` : `$${record.value}`}
                {record.max_discount > 0 && <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.45)' }}>最多减${record.max_discount}</div>}
            </div>
        )
    },
    { 
        title: '使用条件', 
        key: 'condition',
        render: (text: any, record: any) => (
            <div>
                满${record.min_amount}可用
                <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.45)' }}>有效期{record.valid_days}天</div>
            </div>
        )
    },
    { 
        title: '发放/使用', 
        key: 'usage',
        render: (text: any, record: any) => (
            <div>
                {record.issued_count}/{record.total_limit || '无限制'}
                <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.45)' }}>已使用: {record.used_count}</div>
            </div>
        )
    },
    { 
        title: '状态', 
        dataIndex: 'is_active', 
        key: 'is_active',
        render: (val: boolean) => <Tag color={val ? 'success' : 'default'}>{val ? '启用' : '禁用'}</Tag>
    },
    {
        title: '操作',
        key: 'action',
        render: (text: any, record: any) => (
            <Space size="small">
                <Button size="small" icon={<EditOutlined />} onClick={() => {
                    setEditingTemplate(record);
                    templateForm.setFieldsValue(record);
                    setTemplateModalOpen(true);
                }} />
                <Popconfirm title="确定删除？" onConfirm={() => handleDeleteTemplate(record.id)}>
                    <Button size="small" danger icon={<DeleteOutlined />} />
                </Popconfirm>
            </Space>
        )
    }
  ];

  const rewardColumns = [
    { title: '签到天数', dataIndex: 'day', key: 'day', render: (val: number) => `第${val}天`, sorter: (a: any, b: any) => a.day - b.day },
    { title: '奖励类型', dataIndex: 'reward_type', key: 'reward_type', render: (val: string) => <Tag>{getRewardTypeText(val)}</Tag> },
    { 
        title: '奖励内容', 
        key: 'content',
        render: (text: any, record: any) => (
            <div>
                {record.reward_type === 'quota' && `${record.quota_amount}额度`}
                {record.reward_type === 'coupon' && `优惠券ID: ${record.coupon_id}`}
                {record.reward_type === 'multiplier' && `${record.multiplier_val}倍率 持续${record.multiplier_day}天`}
                <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.45)' }}>{record.description}</div>
            </div>
        )
    },
    { title: '获得概率', dataIndex: 'probability', key: 'probability', render: (val: number) => `${(val * 100).toFixed(1)}%` },
    { title: '状态', dataIndex: 'is_enabled', key: 'is_enabled', render: (val: boolean) => <Tag color={val ? 'success' : 'default'}>{val ? '启用' : '禁用'}</Tag> },
    {
        title: '操作',
        key: 'action',
        render: (text: any, record: any) => (
            <Button size="small" icon={<EditOutlined />} onClick={() => {
                setEditingReward(record);
                rewardForm.setFieldsValue(record);
                setRewardModalOpen(true);
            }} />
        )
    }
  ];

  return (
    <div style={{ padding: 24 }}>
      <Title level={2} style={{ marginBottom: 24 }}>优惠券管理</Title>

      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
            <TabPane tab="优惠券模板" key="templates">
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                    <Space>
                        <Button icon={<ReloadOutlined />} onClick={fetchTemplates}>刷新</Button>
                        <Button type="primary" icon={<PlusOutlined />} onClick={() => {
                            setEditingTemplate(null);
                            templateForm.resetFields();
                            templateForm.setFieldsValue({
                                type: 'percentage',
                                valid_days: 30,
                                user_limit: 1,
                                is_active: true,
                                source: 'admin'
                            });
                            setTemplateModalOpen(true);
                        }}>新建模板</Button>
                    </Space>
                </div>
                <Table 
                    columns={templateColumns} 
                    dataSource={templates} 
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                />
            </TabPane>

            <TabPane tab="签到奖励配置" key="rewards">
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                    <Space>
                        <Button icon={<ReloadOutlined />} onClick={fetchCheckinRewards}>刷新</Button>
                        <Button type="primary" icon={<PlusOutlined />} onClick={() => {
                            setEditingReward(null);
                            rewardForm.resetFields();
                            rewardForm.setFieldsValue({
                                reward_type: 'quota',
                                probability: 1.0,
                                is_enabled: true
                            });
                            setRewardModalOpen(true);
                        }}>新建奖励</Button>
                    </Space>
                </div>
                <Table 
                    columns={rewardColumns} 
                    dataSource={checkinRewards} 
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                />
            </TabPane>

            <TabPane tab="批量操作" key="batch">
                <div style={{ maxWidth: 800 }}>
                    <Title level={4}>批量发放优惠券</Title>
                    <Form form={batchForm} layout="vertical" onFinish={() => setBatchModalOpen(true)}>
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item name="template_id" label="选择优惠券模板" rules={[{ required: true }]}>
                                    <Select>
                                        {templates.filter(t => t.is_active).map(t => (
                                            <Option key={t.id} value={t.id}>{t.name} - {getCouponTypeText(t.type)}</Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item name="source" label="发放来源" initialValue="admin">
                                    <Select>
                                        <Option value="admin">管理员发放</Option>
                                        <Option value="activity">活动奖励</Option>
                                        <Option value="compensation">补偿发放</Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item name="user_ids" label="用户ID列表" rules={[{ required: true }]} help="输入要发放优惠券的用户ID，用逗号分隔">
                                    <Input.TextArea rows={4} placeholder="例如：1,2,3,4,5" />
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Button type="primary" htmlType="submit" icon={<SendOutlined />}>批量发放</Button>
                            </Col>
                        </Row>
                    </Form>
                </div>
            </TabPane>
        </Tabs>
      </Card>

      {/* Template Modal */}
      <Modal
        title={editingTemplate ? '编辑优惠券模板' : '新建优惠券模板'}
        open={templateModalOpen}
        onCancel={() => setTemplateModalOpen(false)}
        onOk={() => templateForm.submit()}
        width={800}
      >
        <Form form={templateForm} layout="vertical" onFinish={handleTemplateSubmit}>
            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item name="name" label="优惠券名称" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item name="type" label="优惠券类型" rules={[{ required: true }]}>
                        <Select>
                            <Option value="percentage">百分比折扣</Option>
                            <Option value="fixed">固定金额减免</Option>
                            <Option value="recharge">充值奖励</Option>
                        </Select>
                    </Form.Item>
                </Col>
                <Col span={24}>
                    <Form.Item name="description" label="描述">
                        <Input.TextArea rows={2} />
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item name="value" label="折扣值/金额" rules={[{ required: true }]} help="例如：10 表示10%折扣或$10">
                        <InputNumber style={{ width: '100%' }} />
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item name="min_amount" label="最低消费金额">
                        <InputNumber style={{ width: '100%' }} />
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item name="max_discount" label="最大折扣金额" help="仅百分比折扣有效，0表示无限制">
                        <InputNumber style={{ width: '100%' }} />
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item name="valid_days" label="有效天数">
                        <InputNumber style={{ width: '100%' }} min={1} />
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item name="total_limit" label="总发放限制" help="0表示无限制">
                        <InputNumber style={{ width: '100%' }} min={0} />
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item name="user_limit" label="每用户限制">
                        <InputNumber style={{ width: '100%' }} min={1} />
                    </Form.Item>
                </Col>
                <Col span={24}>
                    <Form.Item name="is_active" label="状态" valuePropName="checked">
                        <Switch size="default" />
                    </Form.Item>
                </Col>
            </Row>
        </Form>
      </Modal>

      {/* Reward Modal */}
      <Modal
        title={editingReward ? '编辑签到奖励' : '新建签到奖励'}
        open={rewardModalOpen}
        onCancel={() => setRewardModalOpen(false)}
        onOk={() => rewardForm.submit()}
        width={800}
      >
        <Form form={rewardForm} layout="vertical" onFinish={handleRewardSubmit}>
            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item name="day" label="签到天数" rules={[{ required: true }]}>
                        <InputNumber style={{ width: '100%' }} min={1} />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item name="reward_type" label="奖励类型" rules={[{ required: true }]}>
                        <Select>
                            <Option value="quota">额度奖励</Option>
                            <Option value="coupon">优惠券</Option>
                            <Option value="multiplier">倍率奖励</Option>
                        </Select>
                    </Form.Item>
                </Col>
                
                <Form.Item noStyle shouldUpdate={(prev, current) => prev.reward_type !== current.reward_type}>
                    {({ getFieldValue }) => {
                        const type = getFieldValue('reward_type');
                        return (
                            <>
                                {type === 'quota' && (
                                    <Col span={12}>
                                        <Form.Item name="quota_amount" label="额度数量">
                                            <InputNumber style={{ width: '100%' }} />
                                        </Form.Item>
                                    </Col>
                                )}
                                {type === 'coupon' && (
                                    <Col span={12}>
                                        <Form.Item name="coupon_id" label="优惠券模板">
                                            <Select>
                                                {templates.filter(t => t.is_active).map(t => (
                                                    <Option key={t.id} value={t.id}>{t.name}</Option>
                                                ))}
                                            </Select>
                                        </Form.Item>
                                    </Col>
                                )}
                                {type === 'multiplier' && (
                                    <>
                                        <Col span={6}>
                                            <Form.Item name="multiplier_val" label="倍率值">
                                                <InputNumber style={{ width: '100%' }} step={0.1} />
                                            </Form.Item>
                                        </Col>
                                        <Col span={6}>
                                            <Form.Item name="multiplier_day" label="持续天数">
                                                <InputNumber style={{ width: '100%' }} min={1} />
                                            </Form.Item>
                                        </Col>
                                    </>
                                )}
                            </>
                        );
                    }}
                </Form.Item>

                <Col span={12}>
                    <Form.Item name="probability" label="获得概率" help="0-1之间，1表示100%获得">
                        <InputNumber style={{ width: '100%' }} min={0} max={1} step={0.1} />
                    </Form.Item>
                </Col>
                <Col span={24}>
                    <Form.Item name="description" label="奖励描述">
                        <Input />
                    </Form.Item>
                </Col>
                <Col span={24}>
                    <Form.Item name="is_enabled" label="状态" valuePropName="checked">
                        <Switch size="default" />
                    </Form.Item>
                </Col>
            </Row>
        </Form>
      </Modal>

      {/* Batch Confirm Modal */}
      <Modal
        title="确认批量发放"
        open={batchModalOpen}
        onCancel={() => setBatchModalOpen(false)}
        onOk={() => handleBatchIssue(batchForm.getFieldsValue())}
      >
        <Alert message="请确认以下信息无误后执行批量发放操作" type="warning" style={{ marginBottom: 16 }} />
        <p><strong>优惠券模板：</strong> {templates.find(t => t.id === batchForm.getFieldValue('template_id'))?.name || '未选择'}</p>
        <p><strong>发放来源：</strong> {batchForm.getFieldValue('source')}</p>
        <p><strong>目标用户：</strong> {batchForm.getFieldValue('user_ids')?.split(',').length || 0} 个用户</p>
      </Modal>
    </div>
  );
}
