'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { Card, Tabs, Input, Avatar, Tag, Row, Col, Typography, Space, Tooltip, message, Empty, Statistic, theme } from 'antd';
import { SearchOutlined, CopyOutlined, DatabaseOutlined, UsergroupAddOutlined, CheckCircleFilled, CloseCircleFilled } from '@ant-design/icons';
import { API } from '@/utils/api';
import { showError, valueFormatter } from '@/utils/common';
import { getSupportedEndpoints, getEndpointColor } from '@/utils/endpointUtils';
import useIsAdmin from '@/hooks/useIsAdmin';

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;

export default function ModelPrice() {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  // @ts-ignore
  const ownedby = useSelector((state) => state.siteInfo?.ownedby) || [];

  const [filteredRows, setFilteredRows] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [availableModels, setAvailableModels] = useState<Record<string, any>>({});
  const [modelInfoMap, setModelInfoMap] = useState<Record<string, any>>({});
  const [userGroupMap, setUserGroupMap] = useState<Record<string, any>>({});
  const [selectedGroup, setSelectedGroup] = useState('default');
  const [selectedOwnedBy, setSelectedOwnedBy] = useState<number>(1);
  const [unit] = useState('K');
  const userIsAdmin = useIsAdmin();

  const fetchAvailableModels = useCallback(async () => {
    try {
      const res = await API.get('/api/available_model');
      const { success, message, data } = res.data;
      if (success) {
        setAvailableModels(data);
        setSelectedOwnedBy(1);
      } else {
        showError(message);
      }
    } catch (error) {
      console.error(error);
    }
  }, []);

  // 获取模型信息
  const fetchModelInfo = useCallback(async () => {
    try {
      const res = await API.get('/api/model_info/');
      const { success, message, data } = res.data;
      if (success) {
        // 转换为 map 方便查找
        const infoMap: Record<string, any> = {};
        data.forEach((info: any) => {
          infoMap[info.model] = info;
        });
        setModelInfoMap(infoMap);
      } else {
        showError(message);
      }
    } catch (error) {
      console.error(error);
    }
  }, []);

  // 获取用户组
  const fetchUserGroupMap = useCallback(async () => {
    try {
      const res = await API.get(userIsAdmin ? '/api/user_group_map_by_admin' : '/api/user_group_map');
      const { success, message, data } = res.data;
      if (success) {
        setUserGroupMap(data);
        if (data && Object.keys(data).length > 0) {
            setSelectedGroup(Object.keys(data)[0]);
        }
      } else {
        showError(message);
      }
    } catch (error) {
      console.error(error);
    }
  }, [userIsAdmin]);

  useEffect(() => {
    fetchAvailableModels();
    fetchModelInfo();
    fetchUserGroupMap();
  }, [fetchAvailableModels, fetchModelInfo, fetchUserGroupMap]);

  useEffect(() => {
    if (!availableModels || !userGroupMap || !selectedGroup) return;

    const calculatedRows = Object.entries(availableModels)
      .filter(([, model]) => model.owned_by_id === selectedOwnedBy)
      .map(([modelName, model], index) => {
        const group = userGroupMap[selectedGroup];
        const originalPrice = {
          input: model?.price.input,
          output: model?.price.output
        };

        const price = group
          ? {
              input: group.ratio * model?.price.input,
              output: group.ratio * model?.price.output,
              enable: model.groups.includes(selectedGroup),
              ratio: group.ratio
            }
          : {
              input: model?.price.input,
              output: model?.price.output,
              enable: false,
              ratio: 1
            };

        const formatPrice = (value: any, type: string) => {
          if (typeof value === 'number') {
            let nowUnit = '';
            let isM = unit === 'M';
            if (type === 'times') {
              isM = false;
            }
            if (type === 'tokens') {
              nowUnit = `/ 1${unit}`;
            }
            return valueFormatter(value, true, isM) + nowUnit;
          }
          return value;
        };

        return {
          id: index + 1,
          model: modelName,
          provider: model.owned_by,
          modelInfo: modelInfoMap[modelName],
          userGroup: model.groups,
          endPoints: model.end_points,
          type: model.price.type,
          originalInput: formatPrice(originalPrice.input, model.price.type),
          originalOutput: formatPrice(originalPrice.output, model.price.type),
          input: formatPrice(price.input, model.price.type),
          output: formatPrice(price.output, model.price.type),
          ratio: group?.ratio || 1,
          extraRatios: model.price?.extra_ratios,
          enable: price.enable
        };
      });

    let filtered = calculatedRows.filter((row) => row.model.toLowerCase().includes(searchQuery.toLowerCase()));

    setFilteredRows(filtered);
  }, [availableModels, userGroupMap, selectedGroup, selectedOwnedBy, t, unit, searchQuery, modelInfoMap]);

  const uniqueOwnedBy = [
    ...new Set(Object.values(availableModels).map((model: any) => JSON.stringify({ id: model.owned_by_id, name: model.owned_by })))
  ].map((item: any) => JSON.parse(item));
  uniqueOwnedBy.sort((a, b) => a.id - b.id);
  const zeroId = uniqueOwnedBy.find((item) => item.id === 0);
  if (zeroId) {
    uniqueOwnedBy.splice(uniqueOwnedBy.indexOf(zeroId), 1);
    uniqueOwnedBy.push(zeroId);
  }

  const getIconByName = (name: string) => {
    if (name === 'all') return null;
    const owner = ownedby.find((item: any) => item.name === name);
    return owner?.icon;
  };

  const tabsItems = uniqueOwnedBy.map((ownedBy) => ({
      key: String(ownedBy.id),
      label: (
          <Space>
              <Avatar
                  src={getIconByName(ownedBy.name)}
                  size={20}
                  style={{ backgroundColor: 'transparent' }}
              >
                  {ownedBy.name.charAt(0).toUpperCase()}
              </Avatar>
              {ownedBy.name}
          </Space>
      )
  }));

  return (
    <div style={{ padding: '32px 24px', minHeight: '100vh', maxWidth: 1600, margin: '0 auto' }}>
      
      {/* Header Section */}
      <div style={{ marginBottom: 40, textAlign: 'center' }}>
        <Title level={2} style={{ marginBottom: 24 }}>Model Pricing</Title>
        <Input 
            prefix={<SearchOutlined style={{ color: token.colorTextDescription }} />}
            placeholder={t('Search model name...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', maxWidth: 600, borderRadius: 100 }}
            size="large"
            allowClear
        />
      </div>

      {/* User Group Filters */}
      {Object.keys(userGroupMap).length > 0 && (
        <div style={{ marginBottom: 32 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
            {Object.entries(userGroupMap).map(([key, group]: [string, any]) => (
                <div
                key={key}
                onClick={() => setSelectedGroup(key)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 16px',
                    borderRadius: 20,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    border: '1px solid',
                    borderColor: selectedGroup === key ? token.colorPrimary : token.colorBorder,
                    backgroundColor: selectedGroup === key ? token.colorPrimaryBg : token.colorBgContainer,
                    color: selectedGroup === key ? token.colorPrimary : token.colorText,
                }}
                >
                <UsergroupAddOutlined />
                <span style={{ fontWeight: 500 }}>{group.name}</span>
                <Tag bordered={false} color={selectedGroup === key ? 'blue' : 'default'} style={{ margin: 0 }}>
                    {group.ratio}x
                </Tag>
                </div>
            ))}
            </div>
        </div>
      )}

      {/* Provider Tabs */}
      <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'center' }}>
          <Tabs
            activeKey={String(selectedOwnedBy)}
            onChange={(key) => setSelectedOwnedBy(Number(key))}
            items={tabsItems}
            type="card"
            style={{ maxWidth: '100%' }}
            size={'large'}
          />
      </div>

      {/* Model Cards Grid */}
      <Row gutter={[20, 20]}>
        {filteredRows.length > 0 ? (
          filteredRows.map((row) => (
            <Col xs={24} sm={12} md={8} lg={8} xl={8} xxl={8} key={row.id}>
              <Card
                hoverable
                bordered={false}
                style={{ height: '100%', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
                styles={{ body: { padding: '20px', height: '100%', display: 'flex', flexDirection: 'column' } }}
              >
                {/* Card Header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 16 }}>
                    <div style={{ 
                        width: 44, 
                        height: 44, 
                        borderRadius: 10, 
                        background: token.colorFillAlter, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        marginRight: 12,
                        flexShrink: 0
                    }}>
                         <Avatar
                            src={getIconByName(row.provider)}
                            size={32}
                            shape="square"
                            style={{ backgroundColor: 'transparent' }}
                            icon={<DatabaseOutlined style={{ color: token.colorPrimary, fontSize: 20 }} />}
                        />
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                        <Typography.Text 
                            strong 
                            style={{ fontSize: 16, display: 'block', marginBottom: 2 }} 
                            ellipsis={{ tooltip: row.model }}
                        >
                            {row.model}
                        </Typography.Text>
                        <Space size={4}>
                            <Tag style={{ margin: 0, fontSize: 10, lineHeight: '18px' }}>{row.provider}</Tag>
                            <CopyOutlined 
                                style={{ fontSize: 12, color: token.colorTextDescription, cursor: 'pointer' }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigator.clipboard.writeText(row.model);
                                    message.success(t('Copied'));
                                }}
                            />
                        </Space>
                    </div>
                </div>

                {/* Pricing Area */}
                <div style={{ 
                    background: token.colorFillQuaternary, 
                    borderRadius: 8, 
                    padding: '12px', 
                    marginBottom: 16,
                    flex: 1
                }}>
                  {row.type === 'times' ? (
                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text type="secondary" style={{ fontSize: 12 }}>Per Request</Text>
                        <Text strong style={{ fontSize: 16, color: token.colorTextHeading }}>{row.input}</Text>
                     </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text type="secondary" style={{ fontSize: 12 }}>Item Input</Text>
                            <Text strong style={{ fontSize: 14 }}>{row.input}</Text>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text type="secondary" style={{ fontSize: 12 }}>Item Output</Text>
                            <Text strong style={{ fontSize: 14 }}>{row.output}</Text>
                        </div>
                    </div>
                  )}
                  {row.ratio !== 1 && (
                     <div style={{ marginTop: 8, paddingTop: 8, borderTop: `1px dashed ${token.colorBorder}` }}>
                         <Text type="secondary" style={{ fontSize: 10 }}>Ratio: </Text>
                         <Tag color="geekblue" style={{ margin: 0, fontSize: 10 }}>{row.ratio}x</Tag>
                     </div>
                  )}
                </div>

                {/* Footer / Meta */}
                <div style={{ marginTop: 'auto' }}>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                       {row.enable ? (
                           <Tag icon={<CheckCircleFilled />} color="success" bordered={false}>Available</Tag>
                       ) : (
                           <Tag icon={<CloseCircleFilled />} color="default" bordered={false}>Unavailable</Tag>
                       )}
                       {row.type === 'times' && <Tag color="warning" bordered={false}>Request</Tag>}
                    </div>

                    {row.userGroup && row.userGroup.length > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, overflowX: 'auto', scrollbarWidth: 'none' }}>
                            <Text type="secondary" style={{ fontSize: 10, flexShrink: 0 }}>Groups:</Text>
                            {row.userGroup.slice(0, 3).map((g: string) => (
                                <Tag key={g} style={{ fontSize: 10, margin: 0 }}>{userGroupMap[g]?.name || g}</Tag>
                            ))}
                            {row.userGroup.length > 3 && <Tag style={{ fontSize: 10, margin: 0 }}>...</Tag>}
                        </div>
                    )}
                </div>

              </Card>
            </Col>
          ))
        ) : (
          <Col span={24}>
            <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={t('No models found')}
            />
          </Col>
        )}
      </Row>
    </div>
  );
}
