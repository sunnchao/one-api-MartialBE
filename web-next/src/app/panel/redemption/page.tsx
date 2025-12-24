'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Row, Col } from 'antd';
import { useTranslation } from 'react-i18next';
import { PlusOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { API } from '@/utils/api';
import { showError, showSuccess } from '@/utils/common';
import RedemptionTable from './components/RedemptionTable';
import RedemptionEditModal from './components/RedemptionEditModal';

export default function RedemptionPage() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [redemptions, setRedemptions] = useState([]);
  const [pagination, setPagination] = useState({ page: 0, pageSize: 10, total: 0 });
  const [keyword, setKeyword] = useState('');
  
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editRedemptionId, setEditRedemptionId] = useState<number | undefined>(undefined);

  const fetchRedemptions = async (page = 0, pageSize = 10, search = '') => {
    setLoading(true);
    try {
      const res = await API.get('/api/redemption/', {
        params: {
          page: page + 1,
          size: pageSize,
          keyword: search
        }
      });
      const { success, message: msg, data } = res.data;
      if (success) {
        setRedemptions(data.data);
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
    fetchRedemptions();
  }, []);

  const handleManage = async (id: number, action: string, value?: any) => {
      try {
          let res;
          switch (action) {
              case 'delete':
                  res = await API.delete(`/api/redemption/${id}`);
                  break;
              case 'status':
                  res = await API.put(`/api/redemption/?status_only=true`, { id, status: value });
                  break;
          }
          
          if (res?.data.success) {
              showSuccess(t('redemptionPage.successMessage'));
              fetchRedemptions(pagination.page, pagination.pageSize, keyword);
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
                <Input 
                    placeholder={t('redemptionPage.searchPlaceholder')} 
                    style={{ width: 250 }} 
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    onPressEnter={() => fetchRedemptions(0, pagination.pageSize, keyword)}
                    size={"middle"}
                />
            </Col>
            <Col>
                <Button size={"middle"} type="primary" icon={<SearchOutlined />} onClick={() => fetchRedemptions(0, pagination.pageSize, keyword)}>
                    {t('common.search')}
                </Button>
            </Col>
            <Col>
                <Button size={"middle"} icon={<ReloadOutlined />} onClick={() => { setKeyword(''); fetchRedemptions(0, pagination.pageSize, ''); }}>
                    {t('redemptionPage.refreshButton')}
                </Button>
            </Col>
            <Col style={{ marginLeft: 'auto' }}>
                <Button size={"middle"} type="primary" icon={<PlusOutlined />} onClick={() => { setEditRedemptionId(undefined); setEditModalOpen(true); }}>
                    {t('redemptionPage.createRedemptionCode')}
                </Button>
            </Col>
        </Row>

        <RedemptionTable 
            loading={loading}
            redemptions={redemptions}
            pagination={pagination}
            onPageChange={(page: number, pageSize: number) => fetchRedemptions(page, pageSize, keyword)}
            onManage={handleManage}
            onEdit={(record: any) => { setEditRedemptionId(record.id); setEditModalOpen(true); }}
        />
      </Card>

      <RedemptionEditModal 
        open={editModalOpen}
        redemptionId={editRedemptionId}
        onCancel={() => setEditModalOpen(false)}
        onSuccess={() => { setEditModalOpen(false); fetchRedemptions(pagination.page, pagination.pageSize, keyword); }}
      />
    </div>
  );
}
