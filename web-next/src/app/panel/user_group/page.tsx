'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button, Row, Col } from 'antd';
import { useTranslation } from 'react-i18next';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { API } from '@/utils/api';
import { showError, showSuccess } from '@/utils/common';
import UserGroupTable from './components/UserGroupTable';
import UserGroupEditModal from './components/UserGroupEditModal';

export default function UserGroupPage() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [userGroups, setUserGroups] = useState([]);
  const [pagination, setPagination] = useState({ page: 0, pageSize: 10, total: 0 });
  
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editUserGroupId, setEditUserGroupId] = useState<number | undefined>(undefined);

  const fetchUserGroups = async (page = 0, pageSize = 10) => {
    setLoading(true);
    try {
      const res = await API.get('/api/user_group/', {
        params: {
          page: page + 1,
          size: pageSize
        }
      });
      const { success, message: msg, data } = res.data;
      if (success) {
        setUserGroups(data.data);
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
    fetchUserGroups();
  }, []);

  const handleManage = async (id: number, action: string) => {
      try {
          let res;
          switch (action) {
              case 'delete':
                  res = await API.delete(`/api/user_group/${id}`);
                  break;
              case 'status':
                  res = await API.put(`/api/user_group/enable/${id}`);
                  break;
          }
          
          if (res?.data.success) {
              showSuccess(t('userPage.operationSuccess'));
              fetchUserGroups(pagination.page, pagination.pageSize);
          } else {
              showError(res?.data.message || 'Operation failed');
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
                <Button size='middle' icon={<ReloadOutlined />} onClick={() => fetchUserGroups(0, pagination.pageSize)}>
                    {t('userPage.refresh')}
                </Button>
            </Col>
            <Col style={{ marginLeft: 'auto' }}>
                <Button size='middle' type="primary" icon={<PlusOutlined />} onClick={() => { setEditUserGroupId(undefined); setEditModalOpen(true); }}>
                    {t('userGroup.create')}
                </Button>
            </Col>
        </Row>

        <UserGroupTable 
            loading={loading}
            userGroups={userGroups}
            pagination={pagination}
            onPageChange={(page: number, pageSize: number) => fetchUserGroups(page, pageSize)}
            onManage={handleManage}
            onEdit={(record: any) => { setEditUserGroupId(record.id); setEditModalOpen(true); }}
        />
      </Card>

      <UserGroupEditModal 
        open={editModalOpen}
        userGroupId={editUserGroupId}
        onCancel={() => setEditModalOpen(false)}
        onSuccess={() => { setEditModalOpen(false); fetchUserGroups(pagination.page, pagination.pageSize); }}
      />
    </div>
  );
}
