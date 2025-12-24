'use client';

import React, { useEffect } from 'react';
import { Modal, Form, Input, Typography, Image } from 'antd';
import { useTranslation } from 'react-i18next';

const { Paragraph, Text } = Typography;

export interface WechatModalProps {
  open: boolean;
  onClose: () => void;
  qrCode?: string;
  wechatLogin: (code: string) => Promise<{ success: boolean; message: string }>;
}

export default function WechatModal({ open, onClose, qrCode, wechatLogin }: WechatModalProps) {
  const { t } = useTranslation();
  const [form] = Form.useForm<{ code: string }>();

  useEffect(() => {
    if (!open) form.resetFields();
  }, [open, form]);

  const onOk = async () => {
    const values = await form.validateFields();
    const { success, message } = await wechatLogin(values.code);
    if (success) onClose();
    else form.setFields([{ name: 'code', errors: [message || t('error.unknownError') || 'Unknown error'] }]);
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      onOk={onOk}
      title={t('login.wechatVerificationCodeLogin')}
      okText={t('common.submit')}
      cancelText={t('common.cancel') || 'Cancel'}
      destroyOnClose
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        {qrCode ? (
          <Image
            src={qrCode}
            alt={t('login.qrCode') || 'QR Code'}
            style={{ maxWidth: 300, maxHeight: 300 }}
            preview={false}
          />
        ) : (
          <Text type="secondary">{t('login.qrCode') || 'QR Code'}</Text>
        )}

        <Paragraph type="secondary" style={{ textAlign: 'center', marginBottom: 0 }}>
          {t('login.wechatLoginInfo')}
        </Paragraph>

        <Form form={form} layout="vertical" style={{ width: '100%' }}>
          <Form.Item
            name="code"
            label={t('common.verificationCode')}
            rules={[{ required: true, message: t('login.codeRequired') }]}
          >
            <Input placeholder={t('common.verificationCode')} autoComplete="one-time-code" />
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
}

