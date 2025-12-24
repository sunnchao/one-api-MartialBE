'use client';

import React, { useState, useEffect, useContext } from 'react';
import { Card, Button, Input, Row, Col, Alert, Space, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { PlusOutlined, ReloadOutlined, SearchOutlined, CopyOutlined } from '@ant-design/icons';
import { API } from '@/utils/api';
import { showError, showSuccess, copy } from '@/utils/common';
import TokenTable from './components/TokenTable';
import TokenEditModal from './components/TokenEditModal';
import { UserContext } from '@/contexts/UserContext';
import { useSelector } from 'react-redux';

const { Text } = Typography;

export default function TokenPage() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [tokens, setTokens] = useState([]);
  const [pagination, setPagination] = useState({ page: 0, pageSize: 10, total: 0 });
  const [keyword, setKeyword] = useState('');
  const [editOpen, setEditOpen] = useState(false);
  const [editingTokenId, setEditingTokenId] = useState(0);
  
  const { loadUserGroup } = useContext(UserContext);
  const userGroup = useSelector((state: any) => state.account.userGroup);
  const [userGroupOptions, setUserGroupOptions] = useState<any[]>([]);
  const siteInfo = useSelector((state: any) => state.siteInfo);

  useEffect(() => {
    loadUserGroup();
  }, [loadUserGroup]);

  useEffect(() => {
    if (userGroup) {
        const options: any[] = [];
        Object.values(userGroup).forEach((item: any) => {
            options.push({ label: `${item.name} (倍率：${item.ratio})`, value: item.symbol });
        });
        setUserGroupOptions(options);
    }
  }, [userGroup]);

  const fetchTokens = async (page = 0, pageSize = 10, search = '') => {
    setLoading(true);
    try {
      const res = await API.get('/api/token/', {
        params: {
          page: page + 1,
          size: pageSize,
          keyword: search
        }
      });
      const { success, message: msg, data } = res.data;
      if (success) {
        setTokens(data.data);
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
    fetchTokens();
  }, []);

  const openEdit = (tokenId: number) => {
    setEditingTokenId(tokenId);
    setEditOpen(true);
  };

  const closeEdit = () => {
    setEditOpen(false);
    setEditingTokenId(0);
  };

  const handleManage = async (id: number, action: string, value?: any) => {
      try {
          let res;
          switch (action) {
              case 'status':
                  res = await API.put(`/api/token/?status_only=true`, { id, status: value });
                  break;
              case 'delete':
                  res = await API.delete(`/api/token/${id}`);
                  break;
          }
          
          if (res?.data.success) {
              showSuccess('操作成功完成！');
              fetchTokens(pagination.page, pagination.pageSize, keyword);
          } else {
              showError(res?.data.message || 'Operation failed');
          }
      } catch (error: any) {
          showError(error.message);
      }
  };

  const serverAddress = siteInfo?.server_address || 'https://api.wochirou.com';

  return (
    <div>
      <Alert
        message="API Info"
        description={
            <Space direction="vertical">
                <Text>{t('token_index.replaceApiAddress1')}</Text>
                <Space>
                    <Text strong>OpenAI:</Text>
                    <Text code copyable>{serverAddress}</Text>
                </Space>
            </Space>
        }
        type="info"
        showIcon={false}
        style={{ marginBottom: 16 }}
      />

      <Card>
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
            <Col>
                <Input 
                    placeholder={t('token_index.searchTokenName')} 
                    style={{ width: 200 }} 
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    onPressEnter={() => fetchTokens(0, pagination.pageSize, keyword)}
                />
            </Col>
            <Col>
                <Button type="primary" icon={<SearchOutlined />} onClick={() => fetchTokens(0, pagination.pageSize, keyword)}>
                    {t('common.search')}
                </Button>
            </Col>
            <Col>
                <Button icon={<ReloadOutlined />} onClick={() => { setKeyword(''); fetchTokens(0, pagination.pageSize, ''); }}>
                    {t('token_index.refresh')}
                </Button>
            </Col>
            <Col style={{ marginLeft: 'auto' }}>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => openEdit(0)}>
                    {t('token_index.createToken')}
                </Button>
            </Col>
        </Row>

        <TokenTable 
            loading={loading}
            tokens={tokens}
            pagination={pagination}
            onPageChange={(page: number, pageSize: number) => fetchTokens(page, pageSize, keyword)}
            onManage={handleManage}
            onEdit={(record: any) => openEdit(record?.id)}
            userGroupOptions={userGroupOptions}
        />
      </Card>

      <TokenEditModal
        open={editOpen}
        tokenId={editingTokenId}
        onCancel={closeEdit}
        onOk={() => {
          closeEdit();
          fetchTokens(pagination.page, pagination.pageSize, keyword);
        }}
        userGroupOptions={userGroupOptions}
      />
    </div>
  );
}
