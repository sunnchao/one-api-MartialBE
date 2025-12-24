'use client';

import React, { useState } from 'react';
import { Row, Col, Collapse, Avatar, Typography, List } from 'antd';
import CodeBlock from '@/components/CodeBlock';
import { useTranslation } from 'react-i18next';

const { Text } = Typography;
const { Panel } = Collapse;

interface SunoMusicProps {
  items: any[];
}

export default function SunoMusic({ items }: SunoMusicProps) {
  const { t } = useTranslation();
  const [selectedItem, setSelectedItem] = useState(items[0]);

  const TruncatedText = (text: string) => {
    return text.length > 30 ? text.substring(0, 30) + '...' : text;
  };

  return (
    <Row gutter={16}>
      <Col span={14}>
        <List
            itemLayout="horizontal"
            dataSource={items}
            renderItem={(item) => (
                <List.Item 
                    onClick={() => setSelectedItem(item)}
                    style={{ 
                        cursor: 'pointer',
                        backgroundColor: item.id === selectedItem?.id ? 'rgba(22, 119, 255, 0.1)' : 'transparent',
                        padding: '12px 16px',
                        borderBottom: '1px dashed #f0f0f0'
                    }}
                >
                    <List.Item.Meta
                        avatar={<Avatar shape="square" src={item.image_url} size={48} />}
                        title={<Text ellipsis>{item.title}</Text>}
                        description={<Text type="secondary" ellipsis>{TruncatedText(item.metadata.prompt)}</Text>}
                    />
                </List.Item>
            )}
        />
      </Col>

      <Col span={10}>
        {selectedItem && (
          <Collapse defaultActiveKey={['audio', 'video']}>
            <Panel header={t('suno.music') || 'Music'} key="audio">
                <audio controls src={selectedItem.audio_url} style={{ width: '100%' }}>
                  <track kind="captions" />
                </audio>
            </Panel>
            <Panel header={t('suno.video') || 'Video'} key="video">
                <video controls src={selectedItem.video_url} style={{ width: '100%' }}>
                  <track kind="captions" />
                </video>
            </Panel>
            <Panel header={t('suno.lyrics') || 'Lyrics'} key="lyrics">
                <CodeBlock code={selectedItem.metadata.prompt} />
            </Panel>
            <Panel header={t('suno.response') || 'Response'} key="response">
                <CodeBlock code={JSON.stringify(selectedItem, null, 2)} />
            </Panel>
          </Collapse>
        )}
      </Col>
    </Row>
  );
}
