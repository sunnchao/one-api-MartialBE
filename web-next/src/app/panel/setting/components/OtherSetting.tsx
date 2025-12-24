'use client';

import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Alert, Button, Card, Form, Input, Modal, Space, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { API } from '@/utils/api';
import { showError, showSuccess } from '@/utils/common';
import { LoadStatusContext } from '@/contexts/StatusContext';

const { TextArea } = Input;
const { Text } = Typography;

type Inputs = Record<string, any>;

function pickOptions(data: any[], keys: string[]) {
  const set = new Set(keys);
  const next: Inputs = {};
  for (const item of data || []) {
    if (!item?.key) continue;
    if (set.has(item.key)) next[item.key] = item.value;
  }
  return next;
}

export default function OtherSetting() {
  const { t } = useTranslation();
  const loadStatus = useContext(LoadStatusContext);

  const [loading, setLoading] = useState(false);
  const [inputs, setInputs] = useState<Inputs>({
    Footer: '',
    Notice: '',
    About: '',
    SystemName: '',
    Logo: '',
    HomePageContent: '',
    AnalyticsCode: '',
  });

  const version = useMemo(() => import.meta.env.VITE_APP_VERSION || import.meta.env.VITE_APP_COMMIT || 'unknown', []);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [updateData, setUpdateData] = useState({ tag: '', content: '' });

  const getOptions = async () => {
    const res = await API.get('/api/option/');
    const { success, message, data } = res.data;
    if (!success) throw new Error(message || 'Failed to load options');
    setInputs((prev) => ({ ...prev, ...pickOptions(data, Object.keys(prev)) }));
  };

  useEffect(() => {
    getOptions().catch((e) => showError(e?.message || String(e)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateOption = async (key: string, value: any) => {
    setLoading(true);
    try {
      const res = await API.put('/api/option/', { key, value });
      const { success, message } = res.data;
      if (!success) throw new Error(message || 'Update failed');
      showSuccess(t('common.saveSuccess') || 'Saved');
      await getOptions();
      await loadStatus?.();
    } catch (e: any) {
      showError(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  const openGitHubRelease = () => {
    window.open('https://github.com/sunnchao/one-api-MartialBE/releases/latest', '_blank', 'noreferrer');
  };

  const checkUpdate = async () => {
    try {
      if (!version || version === 'unknown') {
        showError('无法获取当前版本号');
        return;
      }

      // vX.Y.Z tags
      if (String(version).startsWith('v')) {
        const res = await fetch('https://api.github.com/repos/sunnchao/one-api-MartialBE/tags');
        const tags = await res.json();
        if (!Array.isArray(tags) || tags.length === 0) {
          showError('无法获取最新版本信息');
          return;
        }
        const latest = tags[0]?.name;
        if (latest === version) {
          showSuccess(`已是最新版本：${latest}`);
        } else {
          setUpdateData({ tag: latest, content: '' });
          setUpdateModalOpen(true);
        }
      } else {
        const res = await fetch('https://api.github.com/repos/sunnchao/one-api-MartialBE/commits/main');
        const json = await res.json();
        const sha = json?.sha;
        const msg = json?.commit?.message || '';
        const newVersion = sha ? `dev-${String(sha).slice(0, 7)}` : 'dev-latest';
        if (newVersion === version) {
          showSuccess(`已是最新版本：${newVersion}`);
        } else {
          setUpdateData({ tag: newVersion, content: msg });
          setUpdateModalOpen(true);
        }
      }
    } catch (e: any) {
      showError(e?.message || String(e));
    }
  };

  return (
    <Form layout="vertical">
      <Card title={t('setting_index.otherSettings.generalSettings.title')} style={{ marginBottom: 16 }}>
        <Space direction="vertical" style={{ width: '100%' }} size={12}>
          <Space wrap>
            <Text>{t('setting_index.otherSettings.generalSettings.currentVersion') || 'Current Version'}:</Text>
            <Text code>{version}</Text>
            <Button onClick={checkUpdate}>{t('setting_index.otherSettings.generalSettings.checkUpdate') || 'Check Update'}</Button>
            <Button onClick={openGitHubRelease}>{t('setting_index.otherSettings.generalSettings.openRelease') || 'Open Releases'}</Button>
          </Space>

          <Form.Item label={t('setting_index.otherSettings.generalSettings.noticeLabel')}>
            <TextArea
              rows={8}
              value={inputs.Notice}
              onChange={(e) => setInputs((p) => ({ ...p, Notice: e.target.value }))}
              placeholder={t('setting_index.otherSettings.generalSettings.noticePlaceholder')}
            />
          </Form.Item>
          <Button type="primary" onClick={() => updateOption('Notice', inputs.Notice)} loading={loading}>
            {t('setting_index.otherSettings.generalSettings.saveNotice')}
          </Button>
        </Space>
      </Card>

      <Card title={t('setting_index.otherSettings.customSettings.title')}>
        <Space direction="vertical" style={{ width: '100%' }} size={12}>
          <Form.Item label={t('setting_index.otherSettings.customSettings.systemNameLabel')}>
            <Input value={inputs.SystemName} onChange={(e) => setInputs((p) => ({ ...p, SystemName: e.target.value }))} />
          </Form.Item>
          <Button onClick={() => updateOption('SystemName', inputs.SystemName)} loading={loading}>
            {t('setting_index.otherSettings.customSettings.setSystemName')}
          </Button>

          <Form.Item label={t('setting_index.otherSettings.customSettings.logoLabel')}>
            <Input value={inputs.Logo} onChange={(e) => setInputs((p) => ({ ...p, Logo: e.target.value }))} />
          </Form.Item>
          <Button onClick={() => updateOption('Logo', inputs.Logo)} loading={loading}>
            {t('setting_index.otherSettings.customSettings.setLogo')}
          </Button>

          <Form.Item label={t('setting_index.otherSettings.customSettings.footerLabel')}>
            <TextArea rows={4} value={inputs.Footer} onChange={(e) => setInputs((p) => ({ ...p, Footer: e.target.value }))} />
          </Form.Item>
          <Button onClick={() => updateOption('Footer', inputs.Footer)} loading={loading}>
            {t('setting_index.otherSettings.customSettings.setFooter') || 'Save Footer'}
          </Button>

          <Form.Item label={t('setting_index.otherSettings.customSettings.aboutLabel') || 'About'}>
            <TextArea rows={6} value={inputs.About} onChange={(e) => setInputs((p) => ({ ...p, About: e.target.value }))} />
          </Form.Item>
          <Button onClick={() => updateOption('About', inputs.About)} loading={loading}>
            {t('setting_index.otherSettings.customSettings.setAbout') || 'Save About'}
          </Button>

          <Form.Item label={t('setting_index.otherSettings.customSettings.homePageContentLabel') || 'Home Page Content'}>
            <TextArea rows={8} value={inputs.HomePageContent} onChange={(e) => setInputs((p) => ({ ...p, HomePageContent: e.target.value }))} />
          </Form.Item>
          <Button onClick={() => updateOption('HomePageContent', inputs.HomePageContent)} loading={loading}>
            {t('setting_index.otherSettings.customSettings.setHomePageContent') || 'Save Home Page'}
          </Button>

          <Form.Item label={t('setting_index.otherSettings.customSettings.analyticsCodeLabel') || 'Analytics Code'}>
            <TextArea rows={6} value={inputs.AnalyticsCode} onChange={(e) => setInputs((p) => ({ ...p, AnalyticsCode: e.target.value }))} />
          </Form.Item>
          <Button onClick={() => updateOption('AnalyticsCode', inputs.AnalyticsCode)} loading={loading}>
            {t('setting_index.otherSettings.customSettings.setAnalyticsCode') || 'Save Analytics'}
          </Button>
        </Space>
      </Card>

      <Modal
        open={updateModalOpen}
        onCancel={() => setUpdateModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setUpdateModalOpen(false)}>
            Close
          </Button>,
          <Button key="open" type="primary" onClick={openGitHubRelease}>
            Open Releases
          </Button>,
        ]}
        title="Update"
      >
        <Alert
          type="info"
          showIcon
          message={`Latest: ${updateData.tag}`}
          description={updateData.content ? <pre style={{ whiteSpace: 'pre-wrap' }}>{updateData.content}</pre> : null}
        />
      </Modal>
    </Form>
  );
}

