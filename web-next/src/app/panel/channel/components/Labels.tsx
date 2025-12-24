'use client';

import React from 'react';
import { Tag, Tooltip } from 'antd';
import { useTranslation } from 'react-i18next';

export const ResponseTimeLabel = ({ test_time, response_time, handle_action }: any) => {
  const { t } = useTranslation();
  let color = 'default';
  let time = response_time / 1000;
  let timeStr = time.toFixed(2) + t('res_time.second');

  if (response_time === 0) {
    color = 'default';
  } else if (response_time <= 1000) {
    color = 'success';
  } else if (response_time <= 3000) {
    color = 'processing'; // Antd 'processing' is blue
  } else if (response_time <= 5000) {
    color = 'warning';
  } else {
    color = 'error';
  }
  
  const timestamp2string = (timestamp: number) => {
      return new Date(timestamp * 1000).toLocaleString();
  };

  let title = (
    <div>
      {t('res_time.testClick')}
      <br />
      {test_time != 0 ? t('res_time.lastTime') + timestamp2string(test_time) : t('res_time.noTest')}
    </div>
  );

  return (
    <Tooltip title={title} placement="top">
      <Tag color={color} onClick={handle_action} style={{ cursor: 'pointer' }}>
         {response_time == 0 ? t('res_time.noTest') : timeStr} 
      </Tag>
    </Tooltip>
  );
};

export const GroupLabel = ({ group }: { group: string }) => {
  let groups: string[] = [];
  if (group === '') {
    groups = ['default'];
  } else {
    groups = group.split(',');
    groups.sort();
  }
  return (
    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
      {groups.map((group, index) => {
        // Simple color mapping based on group name hash or fixed
        let color = 'default';
        if (group === 'default') color = 'geekblue';
        if (group === 'vip') color = 'gold';
        if (group === 'svip') color = 'red';
        
        return <Tag key={index} color={color}>{group}</Tag>;
      })}
    </div>
  );
};
