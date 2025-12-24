'use client';

import React, { useState } from 'react';
import { Table, Tag, Button, Space, Image, Tooltip, Dropdown, MenuProps } from 'antd';
import { useTranslation } from 'react-i18next';
import { ACTION_TYPE, CODE_TYPE, STATUS_TYPE } from '@/constants/MidjourneyStatus';
import { timestamp2string, copy } from '@/utils/common';
import { DownOutlined, CopyOutlined, DownloadOutlined, ExportOutlined, EyeOutlined } from '@ant-design/icons';

interface MjTableProps {
  loading: boolean;
  logs: any[];
  pagination: any;
  onPageChange: (page: number, pageSize: number) => void;
  userIsAdmin: boolean;
}

export default function MjTable({ 
    loading, 
    logs, 
    pagination, 
    onPageChange,
    userIsAdmin
}: MjTableProps) {
  const { t } = useTranslation();
  const [previewImage, setPreviewImage] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);

  const renderType = (typeMap: any, value: any) => {
      const option = typeMap[value];
      if (option) {
          return <Tag color={option.color}>{option.text}</Tag>;
      }
      return <Tag color="default">未知</Tag>;
  };

  const downloadImage = async (url: string, filename: string) => {
    try {
        const response = await fetch(url);
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(blobUrl);
    } catch (e) {
        console.error('Download failed', e);
    }
  };

  const getMenuItems = (record: any): MenuProps['items'] => [
    {
      key: 'copy',
      label: '复制链接',
      icon: <CopyOutlined />,
      onClick: () => copy(record.image_url, '图片链接')
    },
    {
      key: 'download',
      label: '下载图片',
      icon: <DownloadOutlined />,
      onClick: () => downloadImage(record.image_url, `${record.mj_id}.png`)
    },
    {
      key: 'open',
      label: '新窗口打开',
      icon: <ExportOutlined />,
      onClick: () => window.open(record.image_url, '_blank')
    }
  ];

  const TruncatedText = ({ text }: { text: string }) => {
      if (!text) return null;
      const truncated = text.length > 30 ? text.substring(0, 30) + '...' : text;
      return (
          <Tooltip title={text}>
              <span style={{ cursor: 'pointer' }} onClick={() => copy(text, 'Text')}>{truncated}</span>
          </Tooltip>
      );
  };

  const columns = [
    {
      title: t('midjourneyPage.taskID') || 'Task ID',
      dataIndex: 'mj_id',
      key: 'mj_id',
      width: 150,
    },
    {
      title: t('midjourneyPage.submitTime') || 'Submit Time',
      dataIndex: 'submit_time',
      key: 'submit_time',
      render: (text: number) => timestamp2string(text / 1000),
      width: 180,
    },
    ...(userIsAdmin ? [
        {
            title: t('midjourneyPage.channel') || 'Channel',
            dataIndex: 'channel_id',
            key: 'channel_id',
        },
        {
            title: t('midjourneyPage.user') || 'User',
            dataIndex: 'user_id',
            key: 'user_id',
        }
    ] : []),
    {
      title: t('midjourneyPage.type') || 'Type',
      dataIndex: 'action',
      key: 'action',
      render: (text: string) => renderType(ACTION_TYPE, text)
    },
    ...(userIsAdmin ? [
        {
            title: t('midjourneyPage.submissionResult') || 'Result',
            dataIndex: 'code',
            key: 'code',
            render: (text: number) => renderType(CODE_TYPE, text)
        },
        {
            title: t('midjourneyPage.taskStatus') || 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (text: string) => renderType(STATUS_TYPE, text)
        }
    ] : []),
    {
      title: t('midjourneyPage.progress') || 'Progress',
      dataIndex: 'progress',
      key: 'progress',
      render: (text: string) => text ? `${text}%` : ''
    },
    {
      title: t('midjourneyPage.timeConsuming') || 'Time',
      key: 'time',
      render: (text: any, record: any) => {
          if (record.finish_time > 0) {
              const time = (record.finish_time - record.start_time) / 1000;
              return <Tag color={time > 60 ? 'error' : 'success'}>{time.toFixed(2)} 秒</Tag>;
          }
          return null;
      }
    },
    {
      title: t('midjourneyPage.resultImage') || 'Image',
      key: 'image_url',
      width: 120,
      render: (text: any, record: any) => {
          if (!record.image_url) return t('common.none');
          return (
              <Space.Compact size="small">
                  <Button 
                    type="primary" 
                    icon={<EyeOutlined />} 
                    onClick={() => {
                        setPreviewImage(record.image_url);
                        setPreviewOpen(true);
                    }}
                    size='middle'
                  >
                      {t('common.show')}
                  </Button>
                  <Dropdown menu={{ items: getMenuItems(record) }}>
                      <Button icon={<DownOutlined />} size='middle'/>
                  </Dropdown>
              </Space.Compact>
          );
      }
    },
    {
      title: t('midjourneyPage.prompt') || 'Prompt',
      dataIndex: 'prompt',
      key: 'prompt',
      render: (text: string) => <TruncatedText text={text} />
    },
    {
      title: t('midjourneyPage.promptEn') || 'Prompt En',
      dataIndex: 'prompt_en',
      key: 'prompt_en',
      render: (text: string) => <TruncatedText text={text} />
    },
    {
      title: t('midjourneyPage.failureReason') || 'Fail Reason',
      dataIndex: 'fail_reason',
      key: 'fail_reason',
      render: (text: string) => <TruncatedText text={text} />
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
            scroll={{ x: 1500 }}
            size='middle'
        />
        <Image
            width={200}
            style={{ display: 'none' }}
            src={previewImage}
            preview={{
                visible: previewOpen,
                onVisibleChange: (visible, prevVisible) => setPreviewOpen(visible),
                src: previewImage
            }}
        />
    </>
  );
}
