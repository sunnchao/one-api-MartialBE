'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Row, Col, Space, Modal, InputNumber, Form, message } from 'antd';
import { useTranslation } from 'react-i18next';
import { PlusOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { API } from '@/utils/api';
import { showError, showSuccess, renderQuota, renderQuotaByMoney } from '@/utils/common';
import UserTable from './components/UserTable';
import UserEditModal from './components/UserEditModal';

export default function UserPage() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 0, pageSize: 10, total: 0 });
  const [keyword, setKeyword] = useState('');
  
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editUserId, setEditUserId] = useState<number | undefined>(undefined);
  
  const [quotaModalOpen, setQuotaModalOpen] = useState(false);
  const [currentQuotaUser, setCurrentQuotaUser] = useState<any>(null);
  const [quotaForm] = Form.useForm();

  const fetchUsers = async (page = 0, pageSize = 10, search = '') => {
    setLoading(true);
    try {
      const res = await API.get('/api/user/', {
        params: {
          page: page + 1,
          size: pageSize,
          keyword: search
        }
      });
      const { success, message: msg, data } = res.data;
      if (success) {
        setUsers(data.data);
        setPagination({ page, pageSize, total: data.total_count });
      } else {
        showError(msg);
      }
    } catch (error: any) {
      showError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleManage = async (username: string, action: string, value?: any) => {
      try {
          let url = '/api/user/manage';
          let data: any = { username };
          let res;

          switch (action) {
              case 'delete':
                  data.action = 'delete';
                  break;
              case 'status':
                  data.action = value === 1 ? 'enable' : 'disable';
                  break;
              case 'role':
                  data.action = value ? 'promote' : 'demote';
                  break;
          }

          res = await API.post(url, data);
          
          if (res?.data.success) {
              showSuccess(t('userPage.operationSuccess'));
              fetchUsers(pagination.page, pagination.pageSize, keyword);
          } else {
              showError(res?.data.message);
          }
      } catch (error: any) {
          showError(error.message);
      }
  };

  const handleQuotaSubmit = async () => {
      const values = await quotaForm.validateFields();
      const quota = renderQuotaByMoney(values.amount);
      try {
          const res = await API.post(`/api/user/quota/${currentQuotaUser.id}`, { 
              quota: parseInt(quota), 
              remark: values.remark 
          });
          const { success, message: msg } = res.data;
          if (success) {
              showSuccess(t('userPage.operationSuccess'));
              setQuotaModalOpen(false);
              fetchUsers(pagination.page, pagination.pageSize, keyword);
          } else {
              showError(msg);
          }
      } catch (error: any) {
          showError(error.message);
      }
  };

  return (
    <div>
      <Card>
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
            <Col>
                <Input 
                    placeholder={t('userPage.searchPlaceholder')} 
                    style={{ width: 250 }} 
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    onPressEnter={() => fetchUsers(0, pagination.pageSize, keyword)}
                    size='middle'
                />
            </Col>
            <Col>
                <Button type="primary" icon={<SearchOutlined />} onClick={() => fetchUsers(0, pagination.pageSize, keyword)}
                  size='middle'
                >
                    {t('common.search')}
                </Button>
            </Col>
            <Col>
                <Button icon={<ReloadOutlined />} onClick={() => { setKeyword(''); fetchUsers(0, pagination.pageSize, ''); }}
                  size='middle'
                >
                    {t('userPage.refresh')}
                </Button>
            </Col>
            <Col style={{ marginLeft: 'auto' }}>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditUserId(undefined); setEditModalOpen(true); }}
                size='middle'
                >
                    {t('userPage.createUser')}
                </Button>
            </Col>
        </Row>

        <UserTable 
            loading={loading}
            users={users}
            pagination={pagination}
            onPageChange={(page: number, pageSize: number) => fetchUsers(page, pageSize, keyword)}
            onManage={handleManage}
            onEdit={(record: any) => { setEditUserId(record.id); setEditModalOpen(true); }}
            onManageQuota={(record: any) => { setCurrentQuotaUser(record); setQuotaModalOpen(true); quotaForm.resetFields(); }}
            onShowToken={(record: any) => { message.info('Token info not implemented yet') }}
        />
      </Card>

      <UserEditModal 
        open={editModalOpen}
        userId={editUserId}
        onCancel={() => setEditModalOpen(false)}
        onSuccess={() => { setEditModalOpen(false); fetchUsers(pagination.page, pagination.pageSize, keyword); }}
      />

      <Modal
        title={t('userPage.changeQuota')}
        open={quotaModalOpen}
        onCancel={() => setQuotaModalOpen(false)}
        onOk={handleQuotaSubmit}
      >
          <Form form={quotaForm} layout="vertical">
              <Form.Item 
                name="amount" 
                label={t('userPage.changeQuota')} 
                rules={[{ required: true }]}
                extra={currentQuotaUser && t('userPage.changeQuotaHelperText', { quota: renderQuota(currentQuotaUser.quota, 6) })}
              >
                  <InputNumber prefix="$" style={{ width: '100%' }} size='middle' />
              </Form.Item>
              <Form.Item name="remark" label={t('userPage.quotaRemark')}>
                  <Input size='middle'/>
              </Form.Item>
          </Form>
      </Modal>
    </div>
  );
}
