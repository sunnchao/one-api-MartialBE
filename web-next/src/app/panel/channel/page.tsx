'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Select, Row, Col, Space } from 'antd';
import { useTranslation } from 'react-i18next';
import { PlusOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { API } from '@/utils/api';
import { showError, showSuccess } from '@/utils/common';
import ChannelTable from './components/ChannelTable';
import { CHANNEL_OPTIONS } from '@/constants/ChannelConstants';
import ChannelEditModal from './components/ChannelEditModal';

const { Option } = Select;

export default function ChannelPage() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [channels, setChannels] = useState([]);
  const [pagination, setPagination] = useState({ page: 0, pageSize: 10, total: 0 });
  const [searchKeyword, setSearchKeyword] = useState<any>({});
  const [editOpen, setEditOpen] = useState(false);
  const [editingChannelId, setEditingChannelId] = useState(0);
  const [groupOptions, setGroupOptions] = useState<string[]>([]);
  const [modelOptions, setModelOptions] = useState<Array<{ label: string; value: string; group?: string }>>([]);

  const fetchChannels = async (page = 0, pageSize = 10, keyword = {}) => {
    setLoading(true);
    try {
      const res = await API.get('/api/channel/', {
        params: {
          page: page + 1,
          size: pageSize,
          ...keyword
        }
      });
      const { success, message: msg, data } = res.data;
      if (success) {
        setChannels(data.data);
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
    fetchChannels();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await API.get('/api/group/');
        if (res.data?.success) {
          setGroupOptions(res.data.data || []);
        }
      } catch {
        // ignore
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await API.get('/api/channel/models');
        const list = res.data?.data;
        if (Array.isArray(list)) {
          setModelOptions(
            list.map((m: any) => ({
              label: m.id,
              value: m.id,
              group: m.owned_by || undefined,
            })),
          );
        }
      } catch {
        // ignore
      }
    })();
  }, []);

  const openEdit = (channelId: number) => {
    setEditingChannelId(channelId);
    setEditOpen(true);
  };

  const closeEdit = () => {
    setEditOpen(false);
    setEditingChannelId(0);
  };

  const handleManage = async (id: number, action: string, value?: any) => {
      try {
          let res;
          switch (action) {
              case 'status':
                  res = await API.put('/api/channel/', { id, status: value });
                  break;
              case 'priority':
                  res = await API.put('/api/channel/', { id, priority: Number(value) });
                  break;
              case 'delete':
                  res = await API.delete(`/api/channel/${id}`);
                  break;
              case 'test':
                  res = await API.get(`/api/channel/test/${id}`, { params: { model: value } });
                  break;
              case 'copy':
                  // Logic for copy usually involves fetching then posting
                  const oldRes = await API.get(`/api/channel/${id}`);
                  const data = oldRes.data.data;
                  delete data.id;
                  delete data.test_time;
                  delete data.balance_updated_time;
                  delete data.used_quota;
                  delete data.response_time;
                  data.name += '_copy';
                  res = await API.post('/api/channel/', data);
                  break;
          }
          
          if (res?.data.success) {
              showSuccess(t('common.operationSuccess'));
              fetchChannels(pagination.page, pagination.pageSize, searchKeyword);
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
                    placeholder={t('channel_index.name')} 
                    style={{ width: 200 }} 
                    value={searchKeyword.name || ''}
                    onChange={(e) => setSearchKeyword({ ...searchKeyword, name: e.target.value })}
                    size='middle'
                />
            </Col>
            <Col>
                <Select 
                    placeholder={t('channel_index.type')} 
                    style={{ width: 150 }}
                    allowClear
                    value={searchKeyword.type}
                    onChange={(val) => setSearchKeyword({ ...searchKeyword, type: val })}
                    size='middle'
                >
                    {Object.values(CHANNEL_OPTIONS).map((opt) => (
                        <Option key={opt.value} value={opt.value}>{opt.text}</Option>
                    ))}
                </Select>
            </Col>
            <Col>
                <Button type="primary" icon={<SearchOutlined />} onClick={() => fetchChannels(0, pagination.pageSize, searchKeyword)} size='middle'>
                    {t('common.search')}
                </Button>
            </Col>
            <Col>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={() => {
                    setSearchKeyword({});
                    fetchChannels(0, pagination.pageSize, {});
                  }}
                  size='middle'
                >
                    {t('common.reset')}
                </Button>
            </Col>
            <Col style={{ marginLeft: 'auto' }}>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => openEdit(0)} size='middle'>
                    {t('channel_index.newChannel')}
                </Button>
            </Col>
        </Row>

        <ChannelTable 
            loading={loading}
            channels={channels}
            pagination={pagination}
            onPageChange={(page: number, pageSize: number) => fetchChannels(page, pageSize, searchKeyword)}
            onManage={handleManage}
            onEdit={(record: any) => openEdit(record?.id)}
        />
      </Card>

      <ChannelEditModal
        open={editOpen}
        channelId={editingChannelId}
        groupOptions={groupOptions}
        modelOptions={modelOptions}
        onCancel={closeEdit}
        onOk={() => {
          closeEdit();
          fetchChannels(pagination.page, pagination.pageSize, searchKeyword);
        }}
      />
    </div>
  );
}
