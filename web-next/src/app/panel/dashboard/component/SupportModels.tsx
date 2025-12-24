'use client';

import React, { useState, useEffect } from 'react';
import { Card, Tag, Typography, Button, Space } from 'antd';
import { useTranslation } from 'react-i18next';
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import { API } from '@/utils/api';
import { showError, copy } from '@/utils/common';

const { Text } = Typography;

const SupportModels = () => {
  const [modelList, setModelList] = useState<Record<string, string[]>>({});
  const [expanded, setExpanded] = useState(false);
  const { t } = useTranslation();
  // const ownedby = useUserStore((state) => state.siteInfo?.ownedby) || []; // verify store

  // Mocking ownedby for now if store not ready
  const ownedby = [
      { name: 'OpenAI', id: 1 },
      { name: 'Anthropic', id: 2 },
      { name: 'Google', id: 3 },
  ];

  const fetchModels = async () => {
    try {
      const res = await API.get(`/api/available_model`);
      const { data, success } = res.data;
      if (!success) return;

      const modelGroup = Object.entries(data).reduce((acc: any, [modelId, modelInfo]: [string, any]) => {
        const { owned_by } = modelInfo;
        if (!acc[owned_by]) {
          acc[owned_by] = [];
        }
        acc[owned_by].push(modelId);
        return acc;
      }, {});

      // Sort models
      Object.values(modelGroup).forEach((models: any) => models.sort());

      // Sort groups
      const sortedModelGroup = Object.keys(modelGroup)
        .sort((a, b) => {
          const ownerA = ownedby?.find((item: any) => item.name === a);
          const ownerB = ownedby?.find((item: any) => item.name === b);
          return (ownerA?.id || 0) - (ownerB?.id || 0);
        })
        .reduce((acc: any, key) => {
          acc[key] = modelGroup[key];
          return acc;
        }, {});

      setModelList(sortedModelGroup);
    } catch (error: any) {
      showError(error.message);
    }
  };

  useEffect(() => {
    fetchModels();
  }, []);

  return (
    <Card styles={{ body: { padding: '16px' } }}>
      <div style={{ position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, width: '100%', paddingRight: 40 }}>
          <Text type="secondary" style={{ whiteSpace: 'nowrap', flex: '0 0 auto' }}>
            {t('dashboard_index.model_price')}:
          </Text>

          {!expanded && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                minWidth: 0,
                flex: '1 1 auto',
                overflow: 'hidden',
                maskImage: 'linear-gradient(to right, black 90%, transparent 100%)',
                WebkitMaskImage: 'linear-gradient(to right, black 90%, transparent 100%)',
              }}
            >
              {Object.entries(modelList)
                .slice(0, 1)
                .map(([provider, models]) => (
                  <div key={provider} style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                    <Text strong type="secondary" style={{ whiteSpace: 'nowrap', flex: '0 0 auto' }}>
                      {provider}:
                    </Text>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, overflow: 'hidden' }}>
                      {models.map((model) => (
                        <Tag
                          key={model}
                          color="blue"
                          style={{ cursor: 'pointer', flex: '0 0 auto', maxWidth: '100%' }}
                          onClick={() => copy(model, t('dashboard_index.model_name'))}
                        >
                          {model}
                        </Tag>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        <div style={{ position: 'absolute', right: 0, top: 0 }}>
           <Button 
             type="text" 
             size="small" 
             icon={expanded ? <UpOutlined /> : <DownOutlined />} 
             onClick={() => setExpanded(!expanded)}
           />
        </div>

        {expanded && (
          <Space direction="vertical" style={{ width: '100%', marginTop: 16 }}>
             {Object.entries(modelList).map(([provider, models]) => (
               <div key={provider}>
                 <Space style={{ marginBottom: 8 }}>
                    {/* <Avatar src={getIconByName(provider)} size="small" /> */}
                    <Text strong type="secondary" style={{ wordBreak: 'break-word' }}>
                      {provider}
                    </Text>
                 </Space>
                 <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {models.map((model) => (
                      <Tag 
                        key={model} 
                        color="blue" 
                        style={{ cursor: 'pointer' }}
                        onClick={() => copy(model, t('dashboard_index.model_name'))}
                      >
                        {model}
                      </Tag>
                    ))}
                 </div>
               </div>
             ))}
          </Space>
        )}
      </div>
    </Card>
  );
};

export default SupportModels;
