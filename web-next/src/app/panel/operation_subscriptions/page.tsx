'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Typography,
  Card,
  Tabs,
  Table,
  Button,
  Input,
  Select,
  Switch,
  Modal,
  Form,
  Space,
  Tag,
  Tooltip,
  Popconfirm,
  Row,
  Col,
  Alert
} from 'antd';
import {
  ReloadOutlined,
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  UserAddOutlined
} from '@ant-design/icons';
import { renderQuota, showError, showSuccess, showWarning, timestamp2string } from '@/utils/common';
import { API } from '@/utils/api';

const { Title, Text } = Typography;
const { Option } = Select;

const durationUnitOptions = [
  { value: 'day', label: '按日', suffix: '天', short: '日' },
  { value: 'week', label: '按周', suffix: '周', short: '周' },
  { value: 'month', label: '按月', suffix: '个月', short: '月' },
  { value: 'quarter', label: '按季度', suffix: '个季度', short: '季度' }
];

const getDurationSuffix = (unit: string) => {
  const option = durationUnitOptions.find((item) => item.value === unit);
  return option ? option.suffix : '个月';
};

const getDurationShortLabel = (unit: string) => {
  const option = durationUnitOptions.find((item) => item.value === unit);
  return option ? option.short : '月';
};

const getDurationLabel = (unit = 'month', value = 1) => {
  const safeValue = value > 0 ? value : 1;
  return `${safeValue}${getDurationSuffix(unit)}`;
};

export default function ClaudeCodeAdmin() {
  const [activeTab, setActiveTab] = useState('subscriptions');
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  // Data
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);

  // Pagination
  const [subscriptionPagination, setSubscriptionPagination] = useState({ page: 1, pageSize: 10, total: 0 });
  const [userPagination, setUserPagination] = useState({ page: 1, pageSize: 10, total: 0 });

  // Search & Grant
  const [searchKeyword, setSearchKeyword] = useState('');
  const [grantModalOpen, setGrantModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [grantForm] = Form.useForm();

  // Plan Management
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [planForm] = Form.useForm();

  const planNameMap = useMemo(() => {
    const map: Record<string, string> = {};
    plans.forEach((plan) => {
      if (plan?.type) {
        map[plan.type] = plan.name || plan.type;
      }
    });
    return map;
  }, [plans]);

  // Fetch functions
  const fetchPlans = async () => {
    try {
      const res = await API.get('/api/claude-code-admin/plans', {
        params: { include_hidden: true }
      });
      if (res.data.success) {
        setPlans(res.data.data || []);
      }
    } catch (error) {
      console.error('获取套餐列表失败:', error);
      setPlans([]);
    }
  };

  const fetchSubscriptions = async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const res = await API.get('/api/claude-code-admin/subscriptions', {
        params: {
          page: page,
          page_size: pageSize
        }
      });
      if (res.data.success) {
        setSubscriptions(res.data.data.subscriptions || []);
        setSubscriptionPagination({ page, pageSize, total: res.data.data.total || 0 });
      } else {
        showError('获取订阅列表失败: ' + res.data.message);
      }
    } catch (error) {
      showError('获取订阅列表失败');
    } finally {
      setLoading(false);
    }
  };

  const searchUsers = async (page = 1, pageSize = 10) => {
    if (!searchKeyword.trim()) {
      showWarning('请输入搜索关键词');
      return;
    }

    setSearchLoading(true);
    try {
      const res = await API.get('/api/claude-code-admin/users/search', {
        params: {
          keyword: searchKeyword,
          page: page,
          page_size: pageSize
        }
      });
      if (res.data.success) {
        setUsers(res.data.data.users || []);
        setUserPagination({ page, pageSize, total: res.data.data.total || 0 });
      } else {
        showError('搜索用户失败: ' + res.data.message);
      }
    } catch (error) {
      showError('搜索用户失败');
    } finally {
      setSearchLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  useEffect(() => {
    if (activeTab === 'subscriptions') {
      fetchSubscriptions(subscriptionPagination.page, subscriptionPagination.pageSize);
    } else if (activeTab === 'plans') {
        fetchPlans(); // Refresh plans when tab active
    }
  }, [activeTab]);

  // Actions
  const handleGrant = async (values: any) => {
    if (!selectedUser) return;

    try {
      const res = await API.post('/api/claude-code-admin/grant-subscription', {
        user_id: selectedUser.id,
        ...values
      });

      if (res.data.success) {
        showSuccess('套餐发放成功');
        setGrantModalOpen(false);
        setSelectedUser(null);
        grantForm.resetFields();
        fetchSubscriptions();
      } else {
        showError('发放失败: ' + res.data.message);
      }
    } catch (error) {
      showError('发放失败');
    }
  };

  const handleCancelSubscription = async (id: number) => {
    try {
      const res = await API.delete(`/api/claude-code-admin/subscriptions/${id}`);
      if (res.data.success) {
        showSuccess('订阅已取消');
        fetchSubscriptions(subscriptionPagination.page, subscriptionPagination.pageSize);
      } else {
        showError('取消订阅失败: ' + res.data.message);
      }
    } catch (error) {
      showError('取消订阅失败');
    }
  };

  const handleSavePlan = async (values: any) => {
    try {
      const url = editingPlan ? `/api/claude-code-admin/plans/${editingPlan.id}` : '/api/claude-code-admin/plans';
      const method = editingPlan ? 'put' : 'post';
      // Convert to float/int
      const submitValues = {
          ...values,
          price: parseFloat(values.price),
          total_quota: Math.round(parseFloat(values.total_quota) * 500000),
          max_client_count: parseInt(values.max_client_count),
          duration_value: parseInt(values.duration_value) || 1,
          sort_order: parseInt(values.sort_order) || 0
      };

      // Handle duration logic
      if (!values.is_unlimited_time) {
          const unit = values.duration_unit;
          const val = submitValues.duration_value;
          submitValues.duration_months = unit === 'month' ? val : (unit === 'quarter' ? val * 3 : val);
      } else {
          submitValues.duration_months = 1; // Default
          submitValues.duration_value = 1;
      }

      // @ts-ignore
      const res = await API[method](url, submitValues);

      if (res.data.success) {
        showSuccess(editingPlan ? '套餐更新成功' : '套餐创建成功');
        setPlanModalOpen(false);
        fetchPlans();
      } else {
        showError(res.data.message);
      }
    } catch (error) {
      showError(editingPlan ? '更新套餐失败' : '创建套餐失败');
    }
  };

  const handleDeletePlan = async (id: number) => {
    try {
      const res = await API.delete(`/api/claude-code-admin/plans/${id}`);
      if (res.data.success) {
        showSuccess('套餐删除成功');
        fetchPlans();
      } else {
        showError(res.data.message);
      }
    } catch (error) {
      showError('删除套餐失败');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'expired': return 'error';
      case 'cancelled': return 'default';
      case 'pending': return 'processing';
      case 'exhausted': return 'warning';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return '活跃';
      case 'expired': return '已过期';
      case 'cancelled': return '已取消';
      case 'pending': return '待付款';
      case 'exhausted': return '额度已用尽';
      default: return status;
    }
  };

  // Columns
  const subscriptionColumns = [
    { title: '用户ID', dataIndex: 'user_id', key: 'user_id' },
    { 
        title: '服务类型', 
        dataIndex: 'service_type', 
        key: 'service_type',
        render: (text: string) => {
            let color = 'default';
            let label = text;
            if (text === 'claude_code') { color = 'blue'; label = 'Claude Code'; }
            else if (text === 'codex_code') { color = 'purple'; label = 'Codex Code'; }
            else if (text === 'gemini_code') { color = 'orange'; label = 'Gemini Code'; }
            return <Tag color={color}>{label}</Tag>;
        }
    },
    { 
        title: '套餐名称', 
        dataIndex: 'plan_type', 
        key: 'plan_type',
        render: (text: string) => planNameMap[text] || text || '-' 
    },
    { 
        title: '状态', 
        dataIndex: 'status', 
        key: 'status',
        render: (text: string) => <Tag color={getStatusColor(text)}>{getStatusText(text)}</Tag>
    },
    { 
        title: '时间', 
        key: 'time', 
        render: (text: any, record: any) => (
            <div style={{ fontSize: 12 }}>
                <div>始: {timestamp2string(record.start_time)}</div>
                <div>终: {timestamp2string(record.end_time)}</div>
            </div>
        )
    },
    { 
        title: '额度(总/剩/用)', 
        key: 'quota', 
        render: (text: any, record: any) => (
            <div style={{ fontSize: 12 }}>
                <div>总: {renderQuota(record.total_quota, 6)}</div>
                <div>剩: {renderQuota(record.remain_quota, 6)}</div>
                <div>用: {renderQuota(record.used_quota, 6)}</div>
            </div>
        )
    },
    { title: '支付方式', dataIndex: 'payment_method', key: 'payment_method' },
    {
        title: '操作',
        key: 'action',
        render: (text: any, record: any) => record.status === 'active' && (
            <Popconfirm title="确定要取消这个订阅吗？" onConfirm={() => handleCancelSubscription(record.id)}>
                <Button size="small" danger>取消</Button>
            </Popconfirm>
        )
    }
  ];

  const userColumns = [
      { title: '用户ID', dataIndex: 'id', key: 'id' },
      { title: '用户名', dataIndex: 'username', key: 'username' },
      { title: '邮箱', dataIndex: 'email', key: 'email' },
      { title: '余额', dataIndex: 'quota', key: 'quota', render: (val: number) => `$${(val/500000).toFixed(2)}` },
      { title: '注册时间', dataIndex: 'created_time', key: 'created_time', render: (val: number) => timestamp2string(val) },
      {
          title: '操作',
          key: 'action',
          render: (text: any, record: any) => (
              <Button 
                type="primary" 
                size="small" 
                icon={<UserAddOutlined />}
                onClick={() => { setSelectedUser(record); grantForm.setFieldsValue({ planType: 'basic', duration: 1, durationUnit: 'month' }); setGrantModalOpen(true); }}
              >
                  发放套餐
              </Button>
          )
      }
  ];

  const planColumns = [
      { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
      { title: '名称', dataIndex: 'name', key: 'name' },
      { title: '类型', dataIndex: 'type', key: 'type', render: (text: string) => <Tag>{text}</Tag> },
      { title: '价格', key: 'price', render: (text: any, record: any) => `${record.price} ${record.currency}` },
      { 
          title: '时长', 
          key: 'duration', 
          render: (text: any, record: any) => record.is_unlimited_time 
            ? <Tag color="success">无限制</Tag> 
            : <Tag color="blue">{getDurationLabel(record.duration_unit, record.duration_value)}</Tag>
      },
      { title: '总额度', dataIndex: 'total_quota', key: 'total_quota', render: (val: number) => `$${(val/500000).toFixed(2)}` },
      { title: '状态', dataIndex: 'is_active', key: 'is_active', render: (val: boolean) => <Tag color={val ? 'success' : 'default'}>{val ? '启用' : '禁用'}</Tag> },
      {
          title: '操作',
          key: 'action',
          render: (text: any, record: any) => (
              <Space size="small">
                  <Button size="small" icon={<EditOutlined />} onClick={() => { 
                      setEditingPlan(record); 
                      setPlanFormValues(record);
                      setPlanModalOpen(true); 
                  }} />
                  <Popconfirm title="确定删除？" onConfirm={() => handleDeletePlan(record.id)}>
                      <Button size="small" danger icon={<DeleteOutlined />} />
                  </Popconfirm>
              </Space>
          )
      }
  ];

  const setPlanFormValues = (plan: any) => {
      planForm.setFieldsValue({
          ...plan,
          service_type: plan.service_type || 'claude_code',
          total_quota: plan.total_quota / 500000,
          is_unlimited_time: plan.is_unlimited_time || false,
          duration_unit: plan.duration_unit || 'month',
          duration_value: plan.duration_value || 1,
          show_in_portal: plan.show_in_portal ?? true
      });
  };

  return (
    <div style={{ padding: 24 }}>
        <Title level={2} style={{ marginBottom: 24 }}>订阅管理面板</Title>
        
        <Card>
            <Tabs 
                activeKey={activeTab} 
                onChange={setActiveTab}
                items={[
                    { 
                        key: 'subscriptions', 
                        label: '订阅列表',
                        children: (
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                                    <Button icon={<ReloadOutlined />} onClick={() => fetchSubscriptions(subscriptionPagination.page, subscriptionPagination.pageSize)}>刷新</Button>
                                </div>
                                <Table 
                                    columns={subscriptionColumns} 
                                    dataSource={subscriptions} 
                                    rowKey="id"
                                    loading={loading}
                                    pagination={{
                                        current: subscriptionPagination.page,
                                        pageSize: subscriptionPagination.pageSize,
                                        total: subscriptionPagination.total,
                                        onChange: (page, pageSize) => fetchSubscriptions(page, pageSize)
                                    }}
                                    scroll={{ x: 1000 }}
                                />
                            </div>
                        )
                    },
                    {
                        key: 'users',
                        label: '用户搜索 & 发放套餐',
                        children: (
                            <div>
                                <Space style={{ marginBottom: 16 }}>
                                    <Input 
                                        placeholder="输入用户ID、用户名或邮箱" 
                                        value={searchKeyword}
                                        onChange={(e) => setSearchKeyword(e.target.value)}
                                        style={{ width: 300 }}
                                        onPressEnter={() => searchUsers()}
                                    />
                                    <Button type="primary" icon={<SearchOutlined />} onClick={() => searchUsers()} loading={searchLoading}>搜索</Button>
                                </Space>
                                <Table 
                                    columns={userColumns} 
                                    dataSource={users} 
                                    rowKey="id"
                                    loading={searchLoading}
                                    pagination={{
                                        current: userPagination.page,
                                        pageSize: userPagination.pageSize,
                                        total: userPagination.total,
                                        onChange: (page, pageSize) => searchUsers(page, pageSize)
                                    }}
                                />
                            </div>
                        )
                    },
                    {
                        key: 'plans',
                        label: '套餐管理',
                        children: (
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                                    <Button type="primary" icon={<PlusOutlined />} onClick={() => { 
                                        setEditingPlan(null); 
                                        planForm.resetFields();
                                        planForm.setFieldsValue({
                                            service_type: 'claude_code',
                                            currency: 'USD',
                                            total_quota: 1, // Display value
                                            max_client_count: 1,
                                            is_unlimited_time: false,
                                            duration_unit: 'month',
                                            duration_value: 1,
                                            is_active: true,
                                            show_in_portal: true,
                                            price: 0,
                                            sort_order: 0
                                        });
                                        setPlanModalOpen(true); 
                                    }}>创建套餐</Button>
                                </div>
                                <Table 
                                    columns={planColumns} 
                                    dataSource={plans} 
                                    rowKey="id"
                                    pagination={false}
                                    scroll={{ x: 1000 }}
                                />
                            </div>
                        )
                    }
                ]}
            />
        </Card>

        {/* Grant Modal */}
        <Modal
            title={`为用户 "${selectedUser?.username}" 发放 Claude Code 套餐`}
            open={grantModalOpen}
            onCancel={() => setGrantModalOpen(false)}
            onOk={() => grantForm.submit()}
        >
            <Alert message={`用户信息：ID=${selectedUser?.id}, 邮箱=${selectedUser?.email}`} type="info" style={{ marginBottom: 16 }} />
            <Form form={grantForm} layout="vertical" onFinish={handleGrant}>
                <Form.Item name="planType" label="套餐类型" required>
                    <Select>
                        {plans.map(plan => (
                            <Option key={plan.type} value={plan.type}>
                                {plan.name} - ${plan.price}/{plan.currency}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>
                <Form.Item name="durationUnit" label="时长单位" required>
                    <Select>
                        {durationUnitOptions.map(opt => <Option key={opt.value} value={opt.value}>{opt.label}</Option>)}
                    </Select>
                </Form.Item>
                <Form.Item name="duration" label="订阅时长" required>
                    <Input type="number" min={1} max={365} />
                </Form.Item>
                <Form.Item name="reason" label="发放原因">
                    <Input.TextArea rows={3} placeholder="选填" />
                </Form.Item>
            </Form>
        </Modal>

        {/* Plan Modal */}
        <Modal
            title={editingPlan ? '编辑套餐' : '创建新套餐'}
            open={planModalOpen}
            onCancel={() => setPlanModalOpen(false)}
            onOk={() => planForm.submit()}
            width={800}
        >
            <Form form={planForm} layout="vertical" onFinish={handleSavePlan}>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="name" label="套餐名称" rules={[{ required: true }]}>
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="service_type" label="服务类型">
                            <Select>
                                <Option value="claude_code">Claude Code</Option>
                                <Option value="codex_code">Codex Code</Option>
                                <Option value="gemini_code">Gemini Code</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="type" label="套餐类型" rules={[{ required: true }]} help={editingPlan ? '类型不可修改' : '唯一标识符，如 basic, pro'}>
                            <Input disabled={!!editingPlan} />
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Form.Item name="description" label="套餐描述">
                            <Input.TextArea rows={2} />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="price" label="价格" rules={[{ required: true }]}>
                            <Input type="number" step="0.01" />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="currency" label="货币">
                            <Select>
                                <Option value="USD">USD</Option>
                                <Option value="EUR">EUR</Option>
                                <Option value="CNY">CNY</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="sort_order" label="排序权重">
                            <Input type="number" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="total_quota" label="总额度 (USD)" rules={[{ required: true }]} help="显示金额，实际额度 = 金额 × 500000">
                            <Input type="number" step="0.01" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="max_client_count" label="最大设备数" rules={[{ required: true }]}>
                            <Input type="number" min={1} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="is_unlimited_time" label="时间限制类型">
                            <Select>
                                <Option value={false}>限制时间</Option>
                                <Option value={true}>无时间限制</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    
                    <Form.Item noStyle shouldUpdate={(prev, current) => prev.is_unlimited_time !== current.is_unlimited_time}>
                        {({ getFieldValue }) => !getFieldValue('is_unlimited_time') && (
                            <>
                                <Col span={6}>
                                    <Form.Item name="duration_unit" label="时长单位">
                                        <Select>
                                            {durationUnitOptions.map(opt => <Option key={opt.value} value={opt.value}>{opt.label}</Option>)}
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col span={6}>
                                    <Form.Item name="duration_value" label="时长数值">
                                        <Input type="number" min={1} />
                                    </Form.Item>
                                </Col>
                            </>
                        )}
                    </Form.Item>

                    <Col span={12}>
                        <Form.Item name="is_active" label="状态">
                            <Select>
                                <Option value={true}>启用</Option>
                                <Option value={false}>禁用</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="show_in_portal" label="前台展示" valuePropName="checked">
                            <Switch size="default" />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Modal>
    </div>
  );
}
