'use client';

import React, { useState } from 'react';
import { Table, Tag, Tooltip, Modal, Button } from 'antd';
import { useTranslation } from 'react-i18next';
import { STATUS_TYPE } from '@/constants/TaskStatus';
import { timestamp2string, copy } from '@/utils/common';
import SunoMusic from './SunoMusic';
import CodeBlock from '@/components/CodeBlock';

interface TaskTableProps {
  loading: boolean;
  logs: any[];
  pagination: any;
  onPageChange: (page: number, pageSize: number) => void;
  userIsAdmin: boolean;
}

export default function TaskTable({ 
    loading, 
    logs, 
    pagination, 
    onPageChange,
    userIsAdmin
}: TaskTableProps) {
  const { t } = useTranslation();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalItem, setModalItem] = useState<any>(null);

  const renderDialog = (item: any) => {
    if (!item?.data) {
        return <p>无数据</p>;
    }

    if (item.platform === 'suno' && item.action === 'MUSIC') {
        return <SunoMusic items={item.data} />;
    }

    return <CodeBlock code={JSON.stringify(item.data, null, 2)} language="json" />;
  };

  const handleRowClick = (item: any) => {
      setModalItem(item);
      setModalOpen(true);
  };

  const columns = [
    {
      title: t('taskPage.task') || 'Task ID',
      dataIndex: 'task_id',
      key: 'task_id',
    },
    {
      title: t('taskPage.subTime') || 'Submit Time',
      dataIndex: 'submit_time',
      key: 'submit_time',
      render: (text: number) => timestamp2string(text),
      width: 180,
    },
    {
      title: t('taskPage.finishTime') || 'Finish Time',
      dataIndex: 'finish_time',
      key: 'finish_time',
      render: (text: number) => timestamp2string(text),
      width: 180,
    },
    ...(userIsAdmin ? [
        {
            title: t('taskPage.channel') || 'Channel',
            dataIndex: 'channel_id',
            key: 'channel_id',
        },
        {
            title: t('taskPage.user') || 'User',
            dataIndex: 'user_id',
            key: 'user_id',
        }
    ] : []),
    {
      title: t('taskPage.platform') || 'Platform',
      dataIndex: 'platform',
      key: 'platform',
      render: (text: string) => <Tag color="success">{text}</Tag>
    },
    {
      title: t('taskPage.type') || 'Action',
      dataIndex: 'action',
      key: 'action',
      render: (text: string) => <Tag color="purple">{text}</Tag>
    },
    {
      title: t('taskPage.time') || 'Time',
      key: 'time',
      render: (text: any, record: any) => {
          if (record.finish_time > 0) {
              const time = (record.finish_time - record.submit_time);
              return <Tag color={time > 60 ? 'error' : 'success'}>{time.toFixed(2)} 秒</Tag>;
          }
          return null;
      }
    },
    {
      title: t('taskPage.progress') || 'Progress',
      dataIndex: 'progress',
      key: 'progress',
      render: (text: number) => `${text}%`
    },
    {
      title: t('taskPage.status') || 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (text: string, record: any) => {
          const status = STATUS_TYPE[text] || STATUS_TYPE.UNKNOWN;
          return (
              <Tag 
                color={status.color} 
                style={{ cursor: 'pointer' }}
                onClick={() => handleRowClick(record)}
              >
                  {status.text}
              </Tag>
          );
      }
    },
    {
      title: t('taskPage.fail') || 'Fail Reason',
      dataIndex: 'fail_reason',
      key: 'fail_reason',
      render: (text: string) => {
          if (!text) return null;
          const truncated = text.length > 30 ? text.substring(0, 30) + '...' : text;
          return (
              <Tooltip title={text}>
                  <span style={{ cursor: 'pointer' }} onClick={() => copy(text, 'Fail Reason')}>{truncated}</span>
              </Tooltip>
          );
      }
    }
  ];

  return (
    <>
        <Table
        columns={columns}
        dataSource={logs}
        rowKey="id"
        loading={loading}
        pagination={{
            current: pagination.page + 1,
            pageSize: pagination.pageSize,
            total: pagination.total,
            onChange: (page, pageSize) => onPageChange(page - 1, pageSize),
            showSizeChanger: true
        }}
        scroll={{ x: 1600 }}
        size='middle'
        />
        
        <Modal
            title="Task Details"
            open={modalOpen}
            onCancel={() => setModalOpen(false)}
            footer={[
                <Button key="close" onClick={() => setModalOpen(false)}>
                    {t('common.close')}
                </Button>
            ]}
            width={800}
        >
            {renderDialog(modalItem)}
        </Modal>
    </>
  );
}
