// 监控设置
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Checkbox,
  TextField,
  Button,
  InputAdornment,
  OutlinedInput,
  InputLabel,
  Chip,
  Stack,
  Divider,
  Alert
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { API } from 'utils/api';
import { showError, showSuccess } from 'utils/common';

// 事件类型映射
const EVENT_MAPPING = {
  balanceWarning: 'balance_warning',
  promotionNotice: 'sale_push',
  failureAlert: 'system_push',
  systemAnnouncement: 'system_push',
  modelPriceChange: 'price_push'
};

// 新增通用 Chip 渲染组件
const RenderChips = ({ items, selected, onItemClick, onItemDelete, disabled = () => false, translationPrefix }) => {
  const { t } = useTranslation();
  return (
    <Grid container spacing={1}>
      {items.map((item) => {
        const isSelected = selected(item);
        const isDisabled = disabled(item);

        return (
          <Grid item key={item.id}>
            <Chip
              variant={isSelected ? 'filled' : 'outlined'}
              color="primary"
              label={t(`${translationPrefix}${item.labelKey}`)}
              onClick={!isDisabled ? () => onItemClick(item) : null}
              onDelete={isSelected ? () => onItemDelete(item) : null}
              disabled={isDisabled}
              sx={{
                borderRadius: 0,
                '& .MuiChip-deleteIcon': { color: 'inherit' },
                '&.Mui-disabled': { opacity: 0.6 }
              }}
            />
          </Grid>
        );
      })}
    </Grid>
  );
};

const Monitoring = ({ inputs, setInputs, turnstileToken, turnstileEnabled }) => {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState([]);
  const [activeNotification, setActiveNotification] = useState(null);

  // 初始化默认配置
  const getDefaultConfig = (type) => ({
    notify_type: type,
    subscription_events: ['balance_warning'],
    push_options: {
      balance_warning: {
        threshold: 1,
        notify_content: inputs.email || ''
      }
    }
  });

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const res = await API.get('/api/user/notifications');
        const { success, data } = res.data;

        if (success) {
          // 处理空数据情况
          const validData = Array.isArray(data) ? data : [];
          setNotifications(validData);

          // 设置默认选中第一个配置
          if (validData.length > 0) {
            setActiveNotification(validData[0]);
          } else {
            // 没有配置时创建默认配置
            const defaultConfig = getDefaultConfig('email');
            setNotifications([defaultConfig]);
            setActiveNotification(defaultConfig);
          }
        }
      } catch (error) {
        console.error('Failed to load notifications', error);
        showError(t('common.loadFailed'));
      }
    };

    loadNotifications();
  }, []);

  // 处理事件选择变化
  const handleEventChange = (eventKey, checked) => {
    const updatedEvents = checked
      ? [...activeNotification.subscription_events, EVENT_MAPPING[eventKey]]
      : activeNotification.subscription_events.filter((e) => e !== EVENT_MAPPING[eventKey]);

    setActiveNotification((prev) => ({
      ...prev,
      subscription_events: [...new Set(updatedEvents)] // 去重
    }));
  };

  // 处理通知方式切换
  const handleMethodChange = (method) => {
    const existing = notifications.find((n) => n.notify_type === method);
    if (existing) {
      setActiveNotification(existing);
    } else {
      const newConfig = getDefaultConfig(method);
      setNotifications((prev) => [...prev, newConfig]);
      setActiveNotification(newConfig);
    }
  };

  // 删除通知方式
  const handleEventDelete = (method) => {
    setNotifications((prev) => prev.filter((n) => n.notify_type !== method));
    setActiveNotification(null);
  };

  // 保存配置
  const saveNotifications = async () => {
    try {
      // 过滤无效配置
      const validConfigs = notifications.filter((n) => n.subscription_events?.length > 0 && n.push_options?.balance_warning?.threshold > 0);

      const res = await API.put('/api/user/notifications', validConfigs);
      const { success, message } = res.data;

      if (success) {
        showSuccess(message);
        setNotifications(validConfigs);
      } else {
        showError(message);
      }
    } catch (error) {
      showError(message);
    }
  };

  return (
    <Card>
      <Grid container spacing={2}>
        {/* 通知方式选择 */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            {t('monitoring.settings.notificationMethod')}
          </Typography>
          <RenderChips
            items={['email', 'wechat', 'dingTalk', 'feishu', 'webhook', 'telegram'].map((method) => ({
              id: method,
              labelKey: method,
              value: method
            }))}
            selected={(item) => activeNotification?.notify_type === item.value}
            onItemClick={(item) => handleMethodChange(item.value)}
            onItemDelete={(item) => handleEventDelete(item.value)}
            disabled={(item) => item.value !== 'email'}
            translationPrefix="monitoring.settings."
          />
        </Grid>

        {/* 事件订阅 */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            {t('monitoring.settings.subscriptionEvents')}
          </Typography>
          <RenderChips
            items={Object.entries(EVENT_MAPPING).map(([frontendKey, backendKey]) => ({
              id: frontendKey,
              labelKey: frontendKey,
              value: backendKey
            }))}
            selected={(item) => activeNotification?.subscription_events?.includes(item.value)}
            onItemClick={(item) => handleEventChange(item.labelKey, !activeNotification?.subscription_events?.includes(item.value))}
            onItemDelete={(item) => handleEventChange(item.labelKey, false)}
            disabled={(item) => item.value !== 'balance_warning'}
            translationPrefix="monitoring.settings."
          />
        </Grid>

        {/* 配置详情 */}
        {activeNotification?.notify_type === 'email' && (
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label={t('monitoring.settings.emailAddress')}
              value={activeNotification.push_options?.balance_warning?.notify_content || ''}
              onChange={(e) =>
                setActiveNotification((prev) => ({
                  ...prev,
                  push_options: {
                    ...prev.push_options,
                    balance_warning: {
                      ...prev.push_options?.balance_warning,
                      notify_content: e.target.value
                    }
                  }
                }))
              }
              helperText={t('monitoring.settings.leaveEmptyToUseAccountEmail')}
            />
          </Grid>
        )}

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            type="number"
            label={t('monitoring.settings.warningThreshold')}
            value={activeNotification?.push_options?.balance_warning?.threshold || 1}
            onChange={(e) =>
              setActiveNotification((prev) => ({
                ...prev,
                push_options: {
                  ...prev.push_options,
                  balance_warning: {
                    ...prev.push_options?.balance_warning,
                    threshold: Math.max(0, parseFloat(e.target.value)) // 确保非负
                  }
                }
              }))
            }
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>
            }}
          />
        </Grid>

        <Grid item xs={12}>
          <Button variant="contained" onClick={saveNotifications} disabled={!activeNotification?.subscription_events?.length}>
            {t('monitoring.settings.save')}
          </Button>
        </Grid>
      </Grid>
    </Card>
  );
};

export default Monitoring;
