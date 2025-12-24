'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Modal, Typography, Spin, QRCode, Button, Result, Space } from 'antd';
import { API } from '@/utils/api';
import { showError } from '@/utils/common';

const { Text, Link } = Typography;

type PayResponse =
  | {
      type: 1;
      trade_no: string;
      data: { method: string; url: string; params: Record<string, string> };
    }
  | { type: 2; trade_no: string; data: { url: string } };

function openPayUrl(method: string, url: string, params: Record<string, string>) {
  const form = document.createElement('form');
  form.method = method;
  form.action = url;
  form.target = '_blank';
  for (const key in params) {
    const input = document.createElement('input');
    input.name = key;
    input.value = String(params[key]);
    form.appendChild(input);
  }
  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);
}

export default function PayModal({
  open,
  onClose,
  amount,
  uuid,
  onPaid,
}: {
  open: boolean;
  onClose: () => void;
  amount: number;
  uuid?: string;
  onPaid?: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('正在拉起支付中...');
  const [redirect, setRedirect] = useState<{ method: string; url: string; params: Record<string, string> } | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const aliveRef = useRef(true);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    setLoading(false);
    setMessage('正在拉起支付中...');
    setRedirect(null);
    setQrCodeUrl(null);
    setSuccess(false);
  }, []);

  const pollOrderStatus = useCallback(
    (tradeNo: string) => {
      clearTimer();
      intervalRef.current = window.setInterval(async () => {
        try {
          const res = await API.get(`/api/user/order/status`, { params: { trade_no: tradeNo } });
          if (!aliveRef.current) return;
          if (res.data?.success) {
            clearTimer();
            setMessage('支付成功');
            setLoading(false);
            setSuccess(true);
            setQrCodeUrl(null);
            onPaid?.();
          }
        } catch {
          // ignore polling errors
        }
      }, 3000);
    },
    [clearTimer, onPaid],
  );

  const canStart = useMemo(() => open && uuid && amount > 0, [open, uuid, amount]);

  useEffect(() => {
    aliveRef.current = true;
    return () => {
      aliveRef.current = false;
      clearTimer();
    };
  }, [clearTimer]);

  useEffect(() => {
    if (!open) {
      clearTimer();
      reset();
      return;
    }
    if (!canStart) return;

    (async () => {
      setLoading(true);
      setMessage('正在拉起支付中...');
      try {
        const response = await API.post('/api/user/order', { uuid, amount: Number(amount) });
        if (!aliveRef.current) return;

        if (!response.data?.success) {
          showError(response.data?.message || '请求失败');
          setLoading(false);
          onClose();
          return;
        }

        const payload = response.data?.data as PayResponse;
        if (payload?.type === 1) {
          setMessage('等待支付中...');
          setRedirect(payload.data);
          openPayUrl(payload.data.method, payload.data.url, payload.data.params);
        } else if (payload?.type === 2) {
          setQrCodeUrl(payload.data.url);
          setLoading(false);
          setMessage('请扫码支付');
        } else {
          showError('支付返回数据异常');
          setLoading(false);
          onClose();
          return;
        }

        pollOrderStatus((payload as any).trade_no);
      } catch (e: any) {
        if (!aliveRef.current) return;
        showError(e?.message || '请求失败');
        setLoading(false);
        onClose();
      }
    })();
  }, [amount, canStart, clearTimer, onClose, open, pollOrderStatus, reset, uuid]);

  return (
    <Modal
      open={open}
      title="支付"
      onCancel={() => {
        clearTimer();
        reset();
        onClose();
      }}
      footer={null}
      destroyOnClose
      maskClosable={false}
    >
      <div style={{ minHeight: 320, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {success ? (
          <Result status="success" title="支付成功" />
        ) : (
          <Space direction="vertical" align="center" size="middle" style={{ width: '100%' }}>
            {loading && <Spin />}
            {qrCodeUrl && <QRCode value={qrCodeUrl} size={220} />}
            <Text style={{ fontSize: 16 }}>{message}</Text>

            {redirect && (
              <Text type="secondary">
                如果没有自动跳转，请点击{' '}
                <Link onClick={() => openPayUrl(redirect.method, redirect.url, redirect.params)}>这里跳转</Link>
              </Text>
            )}

            {qrCodeUrl?.startsWith('https://qr.alipay.com') && (
              <Button type="primary" onClick={() => window.open(qrCodeUrl, '_blank')}>
                打开支付宝
              </Button>
            )}
          </Space>
        )}
      </div>
    </Modal>
  );
}

