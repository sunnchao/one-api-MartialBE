'use client';

import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Alert, Button, Card, Checkbox, Col, Form, Input, Modal, Row, Select, Space, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { API } from '@/utils/api';
import { showError, showSuccess, removeTrailingSlash } from '@/utils/common';
import { LoadStatusContext } from '@/contexts/StatusContext';

const { Text } = Typography;

type Inputs = Record<string, any>;

function parseOptions(data: any[]) {
  const next: Inputs = {};
  for (const item of data || []) {
    if (!item?.key) continue;
    next[item.key] = item.value;
  }
  return next;
}

export default function SystemSetting() {
  const { t } = useTranslation();
  const loadStatus = useContext(LoadStatusContext);

  const [loading, setLoading] = useState(false);
  const [inputs, setInputs] = useState<Inputs>({});
  const [originInputs, setOriginInputs] = useState<Inputs>({});

  const [emailDomainWhitelist, setEmailDomainWhitelist] = useState<string[]>([]);
  const [passwordWarningOpen, setPasswordWarningOpen] = useState(false);

  const getOptions = async () => {
    const res = await API.get('/api/option/');
    const { success, message, data } = res.data;
    if (!success) throw new Error(message || 'Failed to load options');
    const next = parseOptions(data);
    setInputs({
      ...next,
      EmailDomainWhitelist: String(next.EmailDomainWhitelist || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    });
    setOriginInputs(next);
    setEmailDomainWhitelist(
      String(next.EmailDomainWhitelist || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    );
  };

  useEffect(() => {
    getOptions().catch((e) => showError(e?.message || String(e)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateOption = async (key: string, value: any) => {
    setLoading(true);
    try {
      let finalValue = value;
      const toggleKeys = new Set([
        'PasswordLoginEnabled',
        'PasswordRegisterEnabled',
        'EmailVerificationEnabled',
        'GitHubOAuthEnabled',
        'GitHubOldIdCloseEnabled',
        'LinuxDoOAuthEnabled',
        'WeChatAuthEnabled',
        'LarkAuthEnabled',
        'OIDCAuthEnabled',
        'TurnstileCheckEnabled',
        'EmailDomainRestrictionEnabled',
        'RegisterEnabled',
      ]);

      if (toggleKeys.has(key)) {
        finalValue = inputs[key] === 'true' ? 'false' : 'true';
      }

      const res = await API.put('/api/option/', { key, value: finalValue });
      const { success, message } = res.data;
      if (!success) throw new Error(message || 'Update failed');

      setInputs((prev) => ({ ...prev, [key]: finalValue }));
      await getOptions();
      await loadStatus?.();
      showSuccess(t('common.saveSuccess') || 'Saved');
      return true;
    } catch (e: any) {
      showError(e?.message || String(e));
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (key: string) => {
    if (key === 'PasswordLoginEnabled' && inputs[key] === 'true') {
      setPasswordWarningOpen(true);
      return;
    }
    await updateOption(key, undefined);
  };

  const submitServerAddress = async () => {
    const v = removeTrailingSlash(String(inputs.ServerAddress || '').trim());
    await updateOption('ServerAddress', v);
  };

  const submitSMTP = async () => {
    const keys = ['SMTPServer', 'SMTPAccount', 'SMTPFrom', 'SMTPPort', 'SMTPToken'];
    for (const k of keys) {
      const value = String(inputs[k] ?? '');
      if (originInputs[k] !== value && value !== '') await updateOption(k, value);
    }
  };

  const submitOIDC = async () => {
    const keys = ['OIDCClientId', 'OIDCIssuer', 'OIDCScopes', 'OIDCUsernameClaims'];
    for (const k of keys) {
      if (originInputs[k] !== inputs[k]) await updateOption(k, inputs[k]);
    }
    if (originInputs.OIDCClientSecret !== inputs.OIDCClientSecret && String(inputs.OIDCClientSecret || '') !== '') {
      await updateOption('OIDCClientSecret', inputs.OIDCClientSecret);
    }
  };

  const submitGitHub = async () => {
    if (originInputs.GitHubClientId !== inputs.GitHubClientId) await updateOption('GitHubClientId', inputs.GitHubClientId);
    if (originInputs.GitHubClientSecret !== inputs.GitHubClientSecret && String(inputs.GitHubClientSecret || '') !== '') {
      await updateOption('GitHubClientSecret', inputs.GitHubClientSecret);
    }
  };

  const submitLinuxDo = async () => {
    if (originInputs.LinuxDoClientId !== inputs.LinuxDoClientId) await updateOption('LinuxDoClientId', inputs.LinuxDoClientId);
    if (originInputs.LinuxDoClientSecret !== inputs.LinuxDoClientSecret && String(inputs.LinuxDoClientSecret || '') !== '') {
      await updateOption('LinuxDoClientSecret', inputs.LinuxDoClientSecret);
    }
    if (originInputs.LinuxDoMinLevel !== inputs.LinuxDoMinLevel) await updateOption('LinuxDoMinLevel', inputs.LinuxDoMinLevel);
  };

  const submitLark = async () => {
    if (originInputs.LarkClientId !== inputs.LarkClientId) await updateOption('LarkClientId', inputs.LarkClientId);
    if (originInputs.LarkClientSecret !== inputs.LarkClientSecret && String(inputs.LarkClientSecret || '') !== '') {
      await updateOption('LarkClientSecret', inputs.LarkClientSecret);
    }
  };

  const submitWeChat = async () => {
    if (originInputs.WeChatServerAddress !== inputs.WeChatServerAddress) {
      await updateOption('WeChatServerAddress', removeTrailingSlash(String(inputs.WeChatServerAddress || '')));
    }
    if (originInputs.WeChatAccountQRCodeImageURL !== inputs.WeChatAccountQRCodeImageURL) {
      await updateOption('WeChatAccountQRCodeImageURL', inputs.WeChatAccountQRCodeImageURL);
    }
    if (originInputs.WeChatServerToken !== inputs.WeChatServerToken && String(inputs.WeChatServerToken || '') !== '') {
      await updateOption('WeChatServerToken', inputs.WeChatServerToken);
    }
  };

  const submitTurnstile = async () => {
    if (originInputs.TurnstileSiteKey !== inputs.TurnstileSiteKey) await updateOption('TurnstileSiteKey', inputs.TurnstileSiteKey);
    if (originInputs.TurnstileSecretKey !== inputs.TurnstileSecretKey && String(inputs.TurnstileSecretKey || '') !== '') {
      await updateOption('TurnstileSecretKey', inputs.TurnstileSecretKey);
    }
  };

  const submitEmailDomainWhitelist = async () => {
    const value = emailDomainWhitelist.join(',');
    await updateOption('EmailDomainWhitelist', value);
  };

  const callbackBase = useMemo(() => (typeof window !== 'undefined' ? window.location.origin : ''), []);

  return (
    <Form layout="vertical">
      <Card
        title={t('setting_index.systemSettings.generalSettings.title')}
        extra={
          <Button type="primary" onClick={submitServerAddress} loading={loading}>
            {t('setting_index.systemSettings.generalSettings.updateServerAddress')}
          </Button>
        }
        style={{ marginBottom: 16 }}
      >
        <Form.Item label={t('setting_index.systemSettings.generalSettings.serverAddress')}>
          <Input
            value={inputs.ServerAddress || ''}
            onChange={(e) => setInputs((p) => ({ ...p, ServerAddress: e.target.value }))}
            placeholder={t('setting_index.systemSettings.generalSettings.serverAddressPlaceholder')}
          />
        </Form.Item>
      </Card>

      <Card title={t('setting_index.systemSettings.configureLoginRegister.title')} style={{ marginBottom: 16 }}>
        <Space direction="vertical" size={8}>
          <Checkbox checked={inputs.PasswordLoginEnabled === 'true'} onChange={() => handleToggle('PasswordLoginEnabled')} disabled={loading}>
            {t('setting_index.systemSettings.configureLoginRegister.passwordLogin')}
          </Checkbox>
          <Checkbox checked={inputs.PasswordRegisterEnabled === 'true'} onChange={() => handleToggle('PasswordRegisterEnabled')} disabled={loading}>
            {t('setting_index.systemSettings.configureLoginRegister.passwordRegister')}
          </Checkbox>
          <Checkbox checked={inputs.RegisterEnabled === 'true'} onChange={() => handleToggle('RegisterEnabled')} disabled={loading}>
            {t('setting_index.systemSettings.configureLoginRegister.registerEnabled') || 'Enable Register'}
          </Checkbox>
          <Checkbox checked={inputs.EmailVerificationEnabled === 'true'} onChange={() => handleToggle('EmailVerificationEnabled')} disabled={loading}>
            {t('setting_index.systemSettings.configureLoginRegister.emailVerification')}
          </Checkbox>
          <Checkbox checked={inputs.GitHubOAuthEnabled === 'true'} onChange={() => handleToggle('GitHubOAuthEnabled')} disabled={loading}>
            {t('setting_index.systemSettings.configureLoginRegister.gitHubOAuth')}
          </Checkbox>
          <Checkbox checked={inputs.LinuxDoOAuthEnabled === 'true'} onChange={() => handleToggle('LinuxDoOAuthEnabled')} disabled={loading}>
            {t('setting_index.systemSettings.configureLoginRegister.linuxDoOAuth') || 'LinuxDo OAuth'}
          </Checkbox>
          <Checkbox checked={inputs.LarkAuthEnabled === 'true'} onChange={() => handleToggle('LarkAuthEnabled')} disabled={loading}>
            {t('setting_index.systemSettings.configureLoginRegister.larkOAuth') || 'Lark OAuth'}
          </Checkbox>
          <Checkbox checked={inputs.OIDCAuthEnabled === 'true'} onChange={() => handleToggle('OIDCAuthEnabled')} disabled={loading}>
            {t('setting_index.systemSettings.configureLoginRegister.oidcOAuth') || 'OIDC OAuth'}
          </Checkbox>
          <Checkbox checked={inputs.WeChatAuthEnabled === 'true'} onChange={() => handleToggle('WeChatAuthEnabled')} disabled={loading}>
            {t('setting_index.systemSettings.configureLoginRegister.wechatOAuth') || 'WeChat Auth'}
          </Checkbox>
          <Checkbox checked={inputs.TurnstileCheckEnabled === 'true'} onChange={() => handleToggle('TurnstileCheckEnabled')} disabled={loading}>
            {t('setting_index.systemSettings.configureLoginRegister.turnstileCheck') || 'Enable Turnstile'}
          </Checkbox>
        </Space>
      </Card>

      <Card
        title={t('setting_index.systemSettings.configureSMTP.title')}
        extra={
          <Button type="primary" onClick={submitSMTP} loading={loading}>
            {t('setting_index.systemSettings.configureSMTP.saveButton')}
          </Button>
        }
        style={{ marginBottom: 16 }}
      >
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item label={t('setting_index.systemSettings.configureSMTP.server')}>
              <Input value={inputs.SMTPServer || ''} onChange={(e) => setInputs((p) => ({ ...p, SMTPServer: e.target.value }))} />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label={t('setting_index.systemSettings.configureSMTP.port')}>
              <Input value={inputs.SMTPPort || ''} onChange={(e) => setInputs((p) => ({ ...p, SMTPPort: e.target.value }))} />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item label={t('setting_index.systemSettings.configureSMTP.account')}>
              <Input value={inputs.SMTPAccount || ''} onChange={(e) => setInputs((p) => ({ ...p, SMTPAccount: e.target.value }))} />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label={t('setting_index.systemSettings.configureSMTP.from')}>
              <Input value={inputs.SMTPFrom || ''} onChange={(e) => setInputs((p) => ({ ...p, SMTPFrom: e.target.value }))} />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item label={t('setting_index.systemSettings.configureSMTP.token')}>
          <Input.Password value={inputs.SMTPToken || ''} onChange={(e) => setInputs((p) => ({ ...p, SMTPToken: e.target.value }))} />
        </Form.Item>
      </Card>

      <Card
        title={t('setting_index.systemSettings.configureGitHubOAuthApp.title')}
        extra={
          <Button type="primary" onClick={submitGitHub} loading={loading}>
            {t('setting_index.systemSettings.configureGitHubOAuthApp.saveButton')}
          </Button>
        }
        style={{ marginBottom: 16 }}
      >
        <Alert
          type="info"
          showIcon
          message={
            <span>
              Callback: <Text code>{`${callbackBase}/oauth/github`}</Text>
            </span>
          }
          style={{ marginBottom: 16 }}
        />
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item label={t('setting_index.systemSettings.configureGitHubOAuthApp.clientId')}>
              <Input value={inputs.GitHubClientId || ''} onChange={(e) => setInputs((p) => ({ ...p, GitHubClientId: e.target.value }))} />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label={t('setting_index.systemSettings.configureGitHubOAuthApp.clientSecret')}>
              <Input.Password
                value={inputs.GitHubClientSecret || ''}
                onChange={(e) => setInputs((p) => ({ ...p, GitHubClientSecret: e.target.value }))}
              />
            </Form.Item>
          </Col>
        </Row>
        <Checkbox checked={inputs.GitHubOldIdCloseEnabled === 'true'} onChange={() => handleToggle('GitHubOldIdCloseEnabled')} disabled={loading}>
          {t('setting_index.systemSettings.configureGitHubOAuthApp.oldIdClose') || 'Disable old GitHub id binding'}
        </Checkbox>
      </Card>

      <Card
        title={t('setting_index.systemSettings.configureLinuxDoOAuthApp.title')}
        extra={
          <Button type="primary" onClick={submitLinuxDo} loading={loading}>
            {t('setting_index.systemSettings.configureLinuxDoOAuthApp.saveButton')}
          </Button>
        }
        style={{ marginBottom: 16 }}
      >
        <Alert
          type="info"
          showIcon
          message={
            <span>
              Callback: <Text code>{`${callbackBase}/oauth/linuxdo`}</Text>
            </span>
          }
          style={{ marginBottom: 16 }}
        />
        <Row gutter={16}>
          <Col xs={24} md={8}>
            <Form.Item label={t('setting_index.systemSettings.configureLinuxDoOAuthApp.clientId')}>
              <Input value={inputs.LinuxDoClientId || ''} onChange={(e) => setInputs((p) => ({ ...p, LinuxDoClientId: e.target.value }))} />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item label={t('setting_index.systemSettings.configureLinuxDoOAuthApp.clientSecret')}>
              <Input.Password
                value={inputs.LinuxDoClientSecret || ''}
                onChange={(e) => setInputs((p) => ({ ...p, LinuxDoClientSecret: e.target.value }))}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item label={t('setting_index.systemSettings.configureLinuxDoOAuthApp.clientLinuxDoMinLevel')}>
              <Input value={inputs.LinuxDoMinLevel || 0} onChange={(e) => setInputs((p) => ({ ...p, LinuxDoMinLevel: e.target.value }))} />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      <Card
        title={t('setting_index.systemSettings.configureLarkOAuthApp.title')}
        extra={
          <Button type="primary" onClick={submitLark} loading={loading}>
            {t('setting_index.systemSettings.configureLarkOAuthApp.saveButton')}
          </Button>
        }
        style={{ marginBottom: 16 }}
      >
        <Alert
          type="info"
          showIcon
          message={
            <span>
              Callback: <Text code>{`${callbackBase}/oauth/lark`}</Text>
            </span>
          }
          style={{ marginBottom: 16 }}
        />
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item label={t('setting_index.systemSettings.configureLarkOAuthApp.clientId')}>
              <Input value={inputs.LarkClientId || ''} onChange={(e) => setInputs((p) => ({ ...p, LarkClientId: e.target.value }))} />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label={t('setting_index.systemSettings.configureLarkOAuthApp.clientSecret')}>
              <Input.Password
                value={inputs.LarkClientSecret || ''}
                onChange={(e) => setInputs((p) => ({ ...p, LarkClientSecret: e.target.value }))}
              />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      <Card
        title={t('setting_index.systemSettings.configureOIDCOAuthApp.title')}
        extra={
          <Button type="primary" onClick={submitOIDC} loading={loading}>
            {t('setting_index.systemSettings.configureOIDCOAuthApp.saveButton')}
          </Button>
        }
        style={{ marginBottom: 16 }}
      >
        <Alert
          type="info"
          showIcon
          message={
            <span>
              Callback: <Text code>{`${callbackBase}/oauth/oidc`}</Text>
            </span>
          }
          style={{ marginBottom: 16 }}
        />
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item label={t('setting_index.systemSettings.configureOIDCOAuthApp.clientId')}>
              <Input value={inputs.OIDCClientId || ''} onChange={(e) => setInputs((p) => ({ ...p, OIDCClientId: e.target.value }))} />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label={t('setting_index.systemSettings.configureOIDCOAuthApp.clientSecret')}>
              <Input.Password
                value={inputs.OIDCClientSecret || ''}
                onChange={(e) => setInputs((p) => ({ ...p, OIDCClientSecret: e.target.value }))}
              />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item label={t('setting_index.systemSettings.configureOIDCOAuthApp.issuer')}>
          <Input value={inputs.OIDCIssuer || ''} onChange={(e) => setInputs((p) => ({ ...p, OIDCIssuer: e.target.value }))} />
        </Form.Item>
        <Form.Item label={t('setting_index.systemSettings.configureOIDCOAuthApp.scopes')}>
          <Input value={inputs.OIDCScopes || ''} onChange={(e) => setInputs((p) => ({ ...p, OIDCScopes: e.target.value }))} />
        </Form.Item>
        <Form.Item label={t('setting_index.systemSettings.configureOIDCOAuthApp.usernameClaims')}>
          <Input value={inputs.OIDCUsernameClaims || ''} onChange={(e) => setInputs((p) => ({ ...p, OIDCUsernameClaims: e.target.value }))} />
        </Form.Item>
      </Card>

      <Card
        title={t('setting_index.systemSettings.configureWeChat.title')}
        extra={
          <Button type="primary" onClick={submitWeChat} loading={loading}>
            {t('setting_index.systemSettings.configureWeChat.saveButton') || 'Save'}
          </Button>
        }
        style={{ marginBottom: 16 }}
      >
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item label={t('setting_index.systemSettings.configureWeChat.serverAddress') || 'WeChat server address'}>
              <Input value={inputs.WeChatServerAddress || ''} onChange={(e) => setInputs((p) => ({ ...p, WeChatServerAddress: e.target.value }))} />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label={t('setting_index.systemSettings.configureWeChat.serverToken') || 'WeChat server token'}>
              <Input.Password value={inputs.WeChatServerToken || ''} onChange={(e) => setInputs((p) => ({ ...p, WeChatServerToken: e.target.value }))} />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item label={t('setting_index.systemSettings.configureWeChat.qrCode') || 'WeChat QR code URL'}>
          <Input
            value={inputs.WeChatAccountQRCodeImageURL || ''}
            onChange={(e) => setInputs((p) => ({ ...p, WeChatAccountQRCodeImageURL: e.target.value }))}
          />
        </Form.Item>
      </Card>

      <Card
        title={t('setting_index.systemSettings.configureTurnstile.title')}
        extra={
          <Button type="primary" onClick={submitTurnstile} loading={loading}>
            {t('setting_index.systemSettings.configureTurnstile.saveButton')}
          </Button>
        }
        style={{ marginBottom: 16 }}
      >
        <Alert
          type="info"
          showIcon
          message={
            <span>
              {t('setting_index.systemSettings.configureTurnstile.manage')}{' '}
              <a href="https://dash.cloudflare.com/?to=/:account/turnstile" target="_blank" rel="noreferrer">
                {t('setting_index.systemSettings.configureTurnstile.manageLink') || 'Cloudflare Turnstile'}
              </a>
            </span>
          }
          style={{ marginBottom: 16 }}
        />
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item label={t('setting_index.systemSettings.configureTurnstile.siteKey')}>
              <Input value={inputs.TurnstileSiteKey || ''} onChange={(e) => setInputs((p) => ({ ...p, TurnstileSiteKey: e.target.value }))} />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label={t('setting_index.systemSettings.configureTurnstile.secretKey')}>
              <Input.Password
                value={inputs.TurnstileSecretKey || ''}
                onChange={(e) => setInputs((p) => ({ ...p, TurnstileSecretKey: e.target.value }))}
              />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      <Card title={t('setting_index.systemSettings.configureEmailDomain.title') || 'Email domain restriction'} style={{ marginBottom: 16 }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Checkbox checked={inputs.EmailDomainRestrictionEnabled === 'true'} onChange={() => handleToggle('EmailDomainRestrictionEnabled')} disabled={loading}>
            {t('setting_index.systemSettings.configureEmailDomain.enable') || 'Enable restriction'}
          </Checkbox>
          <Form.Item label={t('setting_index.systemSettings.configureEmailDomain.whitelist') || 'Whitelist'}>
            <Select
              mode="tags"
              value={emailDomainWhitelist}
              onChange={(v) => setEmailDomainWhitelist(v.map(String))}
              placeholder="example.com"
              style={{ width: '100%' }}
            />
          </Form.Item>
          <Button onClick={submitEmailDomainWhitelist} loading={loading}>
            {t('setting_index.systemSettings.configureEmailDomain.saveWhitelist') || 'Save whitelist'}
          </Button>
        </Space>
      </Card>

      <Modal open={passwordWarningOpen} onCancel={() => setPasswordWarningOpen(false)} footer={null} title="Warning">
        <Alert
          type="warning"
          showIcon
          message={t('setting_index.systemSettings.passwordLoginWarning.title') || 'Password login cannot be disabled'}
          description={t('setting_index.systemSettings.passwordLoginWarning.desc') || 'Please keep at least one login method enabled.'}
        />
        <div style={{ marginTop: 16, textAlign: 'right' }}>
          <Button type="primary" onClick={() => setPasswordWarningOpen(false)}>
            OK
          </Button>
        </div>
      </Modal>
    </Form>
  );
}

