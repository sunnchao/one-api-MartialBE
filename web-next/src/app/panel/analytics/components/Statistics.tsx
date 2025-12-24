'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Row, Col } from 'antd';
import DataCard from './DataCard';
import { showError, renderQuota } from '@/utils/common';
import { API } from '@/utils/api';
import { useTranslation } from 'react-i18next';

export default function Statistics() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [userStatistics, setUserStatistics] = useState<any>({});
  const [channelStatistics, setChannelStatistics] = useState({
    active: 0,
    disabled: 0,
    test_disabled: 0,
    total: 0
  });
  const [rechargeStatistics, setRechargeStatistics] = useState({
    total: '0',
    Redemption: '0',
    Oder: '0',
    OderContent: ''
  });

  const processUserStatistics = (data: any) => {
    const newData = { ...data };
    newData.total_quota = renderQuota(data.total_quota);
    newData.total_used_quota = renderQuota(data.total_used_quota);
    newData.total_direct_user = data.total_user - data.total_inviter_user;
    setUserStatistics(newData);
  };

  const processChannelStatistics = (data: any[]) => {
    let active = 0;
    let disabled = 0;
    let test_disabled = 0;
    let total = 0;

    data.forEach((item) => {
      if (item.status === 1) {
        active = item.total_channels;
      } else if (item.status === 2) {
        disabled = item.total_channels;
      } else if (item.status === 3) {
        test_disabled = item.total_channels;
      }
      total += item.total_channels;
    });

    setChannelStatistics({ active, disabled, test_disabled, total });
  };

  const processRechargeStatistics = (redemptionData: any[], orderData: any[]) => {
    let redemptionTotal = 0;
    let orderTotal = 0;
    let orderMap: Record<string, number> = {};

    if (redemptionData) {
      redemptionData.forEach((item) => {
        redemptionTotal += item.quota;
      });
    }

    if (orderData) {
      orderData.forEach((item) => {
        orderTotal += item.quota; // Assuming quota is what we want to sum for total value in system currency
        // But original code sums `quota` for total, but `money` for orderMap breakdown
        if (!orderMap[item.order_currency]) {
          orderMap[item.order_currency] = 0;
        }
        orderMap[item.order_currency] += item.money;
      });
    }

    let orderContent = '';
    for (let key in orderMap) {
      orderContent += `${key}: ${orderMap[key]} `;
    }

    setRechargeStatistics({
      total: renderQuota(redemptionTotal + orderTotal),
      Redemption: renderQuota(redemptionTotal),
      Oder: renderQuota(orderTotal),
      OderContent: orderContent
    });
  };

  const fetchStatistics = useCallback(async () => {
    try {
      const res = await API.get('/api/analytics/statistics');
      const { success, message, data } = res.data;
      if (success) {
        if (data.user_statistics) {
          processUserStatistics(data.user_statistics);
        }

        if (data.channel_statistics) {
          processChannelStatistics(data.channel_statistics);
        }

        if (data.redemption_statistic || data.order_statistics) {
          processRechargeStatistics(data?.redemption_statistic, data?.order_statistics);
        }
      } else {
        showError(message);
      }
    } catch (error) {
      console.log(error);
    } finally {
        setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} sm={12} lg={6}>
        <DataCard
          isLoading={loading}
          title={String(t('analytics_index.totalUserSpending'))}
          content={userStatistics?.total_used_quota || '0'}
          subContent={`${t('analytics_index.totalUserBalance')}：${userStatistics?.total_quota || '0'}`}
        />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <DataCard
          isLoading={loading}
          title={String(t('analytics_index.totalUsers'))}
          content={userStatistics?.total_user || '0'}
          subContent={
            <>
              {t('analytics_index.directRegistration')}：{userStatistics?.total_direct_user || '0'} <br />
              {t('analytics_index.invitationRegistration')}：{userStatistics?.total_inviter_user || '0'}
            </>
          }
        />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <DataCard
          isLoading={loading}
          title={String(t('analytics_index.channelCount'))}
          content={channelStatistics.total}
          subContent={
            <>
              {t('analytics_index.active')}：{channelStatistics.active} / {t('analytics_index.disabled')}：{channelStatistics.disabled}{' '}
              <br />
              {t('analytics_index.testDisabled')}：{channelStatistics.test_disabled}
            </>
          }
        />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <DataCard
          isLoading={loading}
          title={String(t('充值统计'))} // Original Chinese text from component
          content={rechargeStatistics.total}
          subContent={
            <>
              兑换码: {rechargeStatistics.Redemption} <br /> 订单: {rechargeStatistics.Oder} / {rechargeStatistics.OderContent}
            </>
          }
        />
      </Col>
    </Row>
  );
}
