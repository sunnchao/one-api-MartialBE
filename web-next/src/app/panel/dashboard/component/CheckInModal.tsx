'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Modal, Typography, Button, Space, message, Spin } from 'antd';
import Turnstile from 'react-turnstile';
import { API } from '@/utils/api';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

const { Paragraph } = Typography;

interface CheckInModalProps {
  visible: boolean;
  onClose: () => void;
  refreshCoupons?: () => void;
  refreshCheckins?: () => void;
}

const CheckInModal: React.FC<CheckInModalProps> = ({ visible, onClose, refreshCoupons, refreshCheckins }) => {
  const { t } = useTranslation();
  const siteInfo = useSelector((state: any) => state.siteInfo);

  const [turnstileToken, setTurnstileToken] = useState('');
  const [loading, setLoading] = useState(false);

  const turnstileEnabled = useMemo(() => Boolean(siteInfo?.turnstile_check), [siteInfo?.turnstile_check]);
  const turnstileSiteKey = useMemo(() => String(siteInfo?.turnstile_site_key || ''), [siteInfo?.turnstile_site_key]);

  useEffect(() => {
    if (visible) setTurnstileToken('');
  }, [visible]);

  const handleTurnstileLoad = (_widgetId: string, boundTurnstile: any) => {
    try {
      boundTurnstile?.execute?.();
    } catch {
      // ignore
    }
  };

  const handleCheckIn = async () => {
    if (turnstileEnabled && !turnstileToken) {
      message.info(t('registerForm.verificationInfo') || t('registerForm.turnstileError') || 'Turnstile is verifying...');
      return;
    }

    setLoading(true);
    try {
        const res = await API.post(`/api/user/checkin?turnstile=${turnstileToken}`);
        const { success, message: msg } = res.data;
        if (success) {
            message.success(msg);
            onClose();
            refreshCheckins?.();
            refreshCoupons?.();
        } else {
            message.error(msg);
        }
    } catch (e) {
        // message.error('Checkin failed');
    } finally {
        setLoading(false);
    }
  };

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      title={t('registerForm.verificationInfo') || 'Environment Check'}
      footer={[
        <Button key="cancel" onClick={onClose}>
          {t('common.cancel') || 'Cancel'}
        </Button>,
        <Button 
           key="submit" 
           type="primary" 
           loading={loading} 
           onClick={handleCheckIn}
           disabled={turnstileEnabled && !turnstileToken}
        >
          {t('checkin.checkInNow') || t('common.submit') || 'Check In'}
        </Button>
      ]}
    >
      <Space direction="vertical" style={{ width: '100%' }}>
         <Paragraph>
            {t('checkin.tip') || 'Daily check-in rewards are based on yesterday\'s usage.'}
         </Paragraph>
         
        {turnstileEnabled ? (
          turnstileSiteKey ? (
            <div style={{ minHeight: 65, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Turnstile
                sitekey={turnstileSiteKey}
                size="invisible"
                appearance="execute"
                execution="execute"
                onLoad={handleTurnstileLoad}
                onVerify={(token) => setTurnstileToken(token)}
                onExpire={() => setTurnstileToken('')}
                onError={() => setTurnstileToken('')}
              />
              {!turnstileToken && (
                <Space>
                  <Spin />
                  <span>{t('registerForm.verificationInfo') || 'Verifying...'}</span>
                </Space>
              )}
            </div>
          ) : (
            <div style={{ minHeight: 65, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Space>
                <Spin />
                <span>{t('registerForm.verificationInfo') || 'Verifying...'}</span>
              </Space>
            </div>
          )
        ) : null}
      </Space>
    </Modal>
  );
};

export default CheckInModal;
