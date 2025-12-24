'use client';

import React from 'react';
import { Input, DatePicker, Row, Col } from 'antd';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { SearchOutlined, NumberOutlined } from '@ant-design/icons';

interface MjFilterProps {
  filterName: any;
  handleFilterName: (name: string, value: any) => void;
  userIsAdmin: boolean;
}

export default function MjFilter({ filterName, handleFilterName, userIsAdmin }: MjFilterProps) {
  const { t } = useTranslation();

  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
      {userIsAdmin && (
        <Col xs={24} sm={12} md={6}>
            <Input 
                placeholder={t('tableToolBar.channelId') || 'Channel ID'}
                value={filterName.channel_id}
                onChange={(e) => handleFilterName('channel_id', e.target.value)}
                prefix={<SearchOutlined style={{ color: 'rgba(0,0,0,0.25)' }} />}
                size='middle'
            />
        </Col>
      )}
      <Col xs={24} sm={12} md={6}>
        <Input 
            placeholder={t('tableToolBar.taskId') || 'Task ID'}
            value={filterName.mj_id}
            onChange={(e) => handleFilterName('mj_id', e.target.value)}
            prefix={<NumberOutlined style={{ color: 'rgba(0,0,0,0.25)' }} />}
            size='middle'
        />
      </Col>
      <Col xs={24} sm={12} md={6}>
        <DatePicker 
            style={{ width: '100%' }}
            placeholder={t('tableToolBar.startTime') || 'Start Time'}
            showTime
            value={filterName.start_timestamp ? dayjs(filterName.start_timestamp) : null}
            onChange={(date) => handleFilterName('start_timestamp', date ? date.valueOf() : 0)}
            size='middle'
        />
      </Col>
      <Col xs={24} sm={12} md={6}>
        <DatePicker 
            style={{ width: '100%' }}
            placeholder={t('tableToolBar.endTime') || 'End Time'}
            showTime
            value={filterName.end_timestamp ? dayjs(filterName.end_timestamp) : null}
            onChange={(date) => handleFilterName('end_timestamp', date ? date.valueOf() : 0)}
            size='middle'
        />
      </Col>
    </Row>
  );
}
