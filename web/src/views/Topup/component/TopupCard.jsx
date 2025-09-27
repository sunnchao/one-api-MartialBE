import {
  Typography,
  Stack,
  OutlinedInput,
  InputAdornment,
  Button,
  InputLabel,
  FormControl,
  useMediaQuery,
  TextField,
  Box,
  Grid,
  Divider,
  Badge
} from '@mui/material';
import { Alert, Space, Tag } from 'antd';
import { GiftOutlined } from '@ant-design/icons';
import { IconBuildingBank } from '@tabler/icons-react';
import { useTheme } from '@mui/material/styles';
import SubCard from 'ui-component/cards/SubCard';
import UserCard from 'ui-component/cards/UserCard';
import AnimateButton from 'ui-component/extended/AnimateButton';
import { useSelector } from 'react-redux';
import PayDialog from './PayDialog';

import { API } from 'utils/api';
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { showError, showInfo, showSuccess, renderQuota, trims } from 'utils/common';
import { useTranslation } from 'react-i18next';

const TopupCard = () => {
  const { t } = useTranslation(); // Translation hook
  const theme = useTheme();
  const [redemptionCode, setRedemptionCode] = useState('');
  const [userQuota, setUserQuota] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [payment, setPayment] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [amount, setAmount] = useState(0);
  const [discountTotal, setDiscountTotal] = useState(0);
  const [open, setOpen] = useState(false);
  const [disabledPay, setDisabledPay] = useState(false);
  const [showNationalDayPromo, setShowNationalDayPromo] = useState(true); // 国庆活动显示控制
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, milliseconds: 0 }); // 倒计时状态
  const matchDownSM = useMediaQuery(theme.breakpoints.down('md'));
  const siteInfo = useSelector((state) => state.siteInfo);
  const RechargeDiscount = useMemo(() => {
    if (siteInfo.RechargeDiscount === '') {
      return {};
    }
    try {
      return JSON.parse(siteInfo.RechargeDiscount);
    } catch (e) {
      return {};
    }
  }, [siteInfo.RechargeDiscount]);

  // 检查是否在国庆活动期间
  const checkNationalDayPromo = () => {
    // 检查活动开关
    if (!siteInfo.NationalDayPromoEnabled) return false;

    const now = new Date();

    // 解析配置的开始和结束时间
    try {
      const startDate = new Date(siteInfo.NationalDayPromoStartDate);
      const endDate = new Date(siteInfo.NationalDayPromoEndDate + 'T23:59:59');

      return now >= startDate && now <= endDate;
    } catch (e) {
      return false;
    }
  };

  // 计算国庆活动的额外奖励金额 - 阶梯奖励
  const calculateNationalDayBonus = (baseAmount) => {
    if (!showNationalDayPromo) return 0;

    // 阶梯奖励配置：充 10 块送 1，充 50 送 8，充 100 送 18，充 500 送 108
    if (baseAmount >= 500) return 108;
    if (baseAmount >= 100) return 18;
    if (baseAmount >= 50) return 8;
    if (baseAmount >= 10) return 1;

    return 0; // 小于10不赠送
  };

  // 计算倒计时
  const calculateCountdown = useCallback(() => {
    if (!siteInfo.NationalDayPromoEndDate) return null;

    try {
      const now = new Date();
      const endDate = new Date(siteInfo.NationalDayPromoEndDate + 'T23:59:59');
      const timeDiff = endDate.getTime() - now.getTime();

      if (timeDiff <= 0) {
        // 活动已结束
        setShowNationalDayPromo(false);
        return { days: 0, hours: 0, minutes: 0, seconds: 0, milliseconds: 0 };
      }

      const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
      const milliseconds = Math.floor((timeDiff % 1000) / 10);

      return { days, hours, minutes, seconds, milliseconds };
    } catch (e) {
      return null;
    }
  }, [siteInfo.NationalDayPromoEndDate]);

  // 获取活动时间显示文本
  const getPromoDateText = () => {
    if (!siteInfo.NationalDayPromoStartDate || !siteInfo.NationalDayPromoEndDate) {
      return '活动期间';
    }

    const startDate = new Date(siteInfo.NationalDayPromoStartDate);
    const endDate = new Date(siteInfo.NationalDayPromoEndDate);

    const formatDate = (date) => {
      return `${date.getMonth() + 1}月${date.getDate()}日`;
    };

    return `活动期间（${formatDate(startDate)}-${formatDate(endDate)}）`;
  };
  const topUp = async () => {
    if (redemptionCode === '') {
      showInfo(t('topupCard.inputPlaceholder'));
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await API.post('/api/user/topup', {
        key: trims(redemptionCode)
      });
      const { success, message, data } = res.data;
      if (success) {
        showSuccess('充值成功！');
        setUserQuota((quota) => {
          return quota + data;
        });
        setRedemptionCode('');
      } else {
        showError(message);
      }
    } catch (err) {
      showError('请求失败');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePay = () => {
    if (!selectedPayment) {
      showError(t('topupCard.selectPaymentMethod'));
      return;
    }

    if (amount <= 0 || amount < siteInfo.PaymentMinAmount) {
      showError(`${t('topupCard.amountMinLimit')} ${siteInfo.PaymentMinAmount}`);
      return;
    }

    if (amount > 1000000) {
      showError(t('topupCard.amountMaxLimit'));
      return;
    }

    // 判读金额是否是正整数
    if (!/^[1-9]\d*$/.test(amount)) {
      showError(t('topupCard.positiveIntegerAmount'));
      return;
    }

    setDisabledPay(true);
    setOpen(true);
  };

  const onClosePayDialog = () => {
    setOpen(false);
    setDisabledPay(false);
  };

  const getPayment = async () => {
    try {
      let res = await API.get(`/api/user/payment`);
      const { success, data } = res.data;
      if (success) {
        if (data.length > 0) {
          data.sort((a, b) => b.sort - a.sort);
          setPayment(data);
          setSelectedPayment(data[0]);
        }
      }
    } catch (error) {
      return;
    }
  };

  const openTopUpLink = () => {
    if (!siteInfo.top_up_link) {
      showError(t('topupCard.adminSetupRequired'));
      return;
    }
    window.open(siteInfo.top_up_link, '_blank');
  };

  const getUserQuota = async () => {
    try {
      let res = await API.get(`/api/user/self`);
      const { success, message, data } = res.data;
      if (success) {
        setUserQuota(data.quota);
      } else {
        showError(message);
      }
    } catch (error) {
      return;
    }
  };

  const handlePaymentSelect = (payment) => {
    setSelectedPayment(payment);
  };

  const handleAmountChange = (event) => {
    const value = event.target.value;
    if (value === '') {
      setAmount('');
      return;
    }
    handleSetAmount(value);
  };

  const handleSetAmount = (amount) => {
    amount = Number(amount);
    setAmount(amount);
    handleDiscountTotal(amount);
  };

  const calculateFee = () => {
    if (!selectedPayment) return 0;

    if (selectedPayment.fixed_fee > 0) {
      return Number(selectedPayment.fixed_fee); //固定费率不计算折扣
    }
    const discount = RechargeDiscount[amount] || 1; // 如果没有折扣，则默认为1（即没有折扣）
    let newAmount = amount * discount; //折后价格
    return parseFloat(selectedPayment.percent_fee * Number(newAmount)).toFixed(2);
  };

  const calculateTotal = () => {
    if (amount === 0) return 0;
    const discount = RechargeDiscount[amount] || 1; // 如果没有折扣，则默认为1（即没有折扣）
    let newAmount = amount * discount; //折后价格
    let total = Number(newAmount) + Number(calculateFee());
    if (selectedPayment && selectedPayment.currency === 'CNY') {
      total = parseFloat((total * siteInfo.PaymentUSDRate).toFixed(2));
    }
    return total;
  };

  const handleDiscountTotal = (amount) => {
    if (amount === 0) return 0;
    // 如果金额在RechargeDiscount中，则应用折扣,手续费和货币换算汇率不算在折扣内
    const discount = RechargeDiscount[amount] || 1; // 如果没有折扣，则默认为1（即没有折扣）
    console.log(amount, discount);
    setDiscountTotal(amount * discount);
  };

  useEffect(() => {
    getPayment().then();
    getUserQuota().then();

    // 等待 siteInfo 加载完成后再检查活动状态
    if (siteInfo.NationalDayPromoEnabled !== undefined) {
      setShowNationalDayPromo(checkNationalDayPromo());
    }
  }, [siteInfo.NationalDayPromoEnabled, siteInfo.NationalDayPromoStartDate, siteInfo.NationalDayPromoEndDate]);

  // 倒计时定时器
  useEffect(() => {
    if (!showNationalDayPromo) return;

    const timer = setInterval(() => {
      const newCountdown = calculateCountdown();
      if (newCountdown) {
        setCountdown(newCountdown);
        // 检查活动是否结束
        if (newCountdown.days === 0 && newCountdown.hours === 0 && newCountdown.minutes === 0 && newCountdown.seconds === 0) {
          setShowNationalDayPromo(false);
        }
      }
    }, 10);

    // 立即计算一次倒计时
    const initialCountdown = calculateCountdown();
    if (initialCountdown) {
      setCountdown(initialCountdown);
    }

    return () => clearInterval(timer);
  }, [showNationalDayPromo, calculateCountdown]);

  return (
    <UserCard>
      <Stack direction="row" alignItems="center" justifyContent="center" spacing={2} paddingTop={'20px'}>
        <IconBuildingBank color={theme.palette.primary.main} />
        <Typography variant="h4">{t('topupCard.currentQuota')}</Typography>
        <Typography variant="h4">{renderQuota(userQuota)}</Typography>
      </Stack>

      {/* 国庆活动横幅 */}
      {showNationalDayPromo && (
        <>
          {/* 添加CSS动画样式 */}
          <style jsx>{`
            @keyframes pulse {
              0% {
                transform: scale(1);
                box-shadow: 0 4px 12px rgba(255, 107, 107, 0.4);
              }
              50% {
                transform: scale(1.02);
                box-shadow: 0 6px 16px rgba(255, 107, 107, 0.6);
              }
              100% {
                transform: scale(1);
                box-shadow: 0 4px 12px rgba(255, 107, 107, 0.4);
              }
            }

            @keyframes flash {
              0%,
              100% {
                opacity: 1;
              }
              50% {
                opacity: 0.7;
              }
            }

            .countdown-timer {
              animation: pulse 2s infinite;
            }

            .seconds-flash {
              animation: flash 1s ease-in-out;
            }
          `}</style>
          <Alert
            message={
              <Space align="center" style={{ width: '100%', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#d4380d' }}>🎊 国庆盛典，充值有惊喜！</span>
                {/* 倒计时显示 - 与Dashboard保持一致的样式 */}
                <Box
                  component="span"
                  sx={{
                    ml: 2,
                    px: 2,
                    py: 0.5,
                    backgroundColor: 'rgba(25, 118, 210, 0.1)',
                    borderRadius: '16px',
                    fontSize: '0.8em',
                    border: '1px solid rgba(25, 118, 210, 0.2)',
                    color: '#1565c0',
                    display: { xs: 'none', md: 'inline-block' },
                    fontFamily: 'monospace',
                    fontWeight: 'bold'
                  }}
                >
                  ⏰ 活动倒计时: {countdown.days}天 {countdown.hours.toString().padStart(2, '0')}:
                  {countdown.minutes.toString().padStart(2, '0')}:{countdown.seconds.toString().padStart(2, '0')}.
                  {countdown.milliseconds.toString().padStart(2, '0')}
                </Box>
              </Space>
            }
            description={
              <Space direction="vertical" size={4} style={{ width: '100%' }}>
                <Space align="center">
                  <Typography variant="body2" style={{ color: '#8c8c8c' }}>
                    {getPromoDateText()}阶梯奖励
                  </Typography>
                  <Tag color="volcano" style={{ fontWeight: 'bold', fontSize: '12px' }}>
                    充10送1 充50送8 充100送18 充500送108
                  </Tag>
                </Space>
                <Typography variant="body2" style={{ color: '#8c8c8c', fontSize: '12px' }}>
                  例如：充值 $100 = 获得 ${100 + calculateNationalDayBonus(100)} 额度
                </Typography>
              </Space>
            }
            type="success"
            showIcon={false}
            style={{
              marginTop: '16px',
              marginBottom: '16px',
              backgroundColor: '#fff2e8',
              border: '1px solid #ffbb96',
              borderRadius: '8px'
            }}
          />
        </>
      )}

      {payment.length > 0 && (
        <SubCard
          sx={{
            marginTop: '40px'
          }}
          title={t('topupCard.onlineTopup')}
        >
          <Typography variant="body2" color="error" sx={{ mb: 2 }}>
            {t('topupCard.invoiceAndRefundWarning')}
          </Typography>
          <Stack spacing={2}>
            {payment.map((item, index) => (
              <AnimateButton key={index}>
                <Button
                  disableElevation
                  fullWidth
                  size="large"
                  variant="outlined"
                  onClick={() => handlePaymentSelect(item)}
                  sx={{
                    ...theme.typography.LoginButton,
                    border: selectedPayment === item ? `1px solid ${theme.palette.primary.main}` : '1px solid transparent'
                  }}
                >
                  <Box sx={{ mr: { xs: 1, sm: 2, width: 20 }, display: 'flex', alignItems: 'center' }}>
                    <img src={item.icon} alt="github" width={25} height={25} style={{ marginRight: matchDownSM ? 8 : 16 }} />
                  </Box>
                  {item.name}
                </Button>
              </AnimateButton>
            ))}
            <Grid container spacing={2}>
              {Object.entries(RechargeDiscount).map(([key, value]) => (
                <Grid item key={key}>
                  <Badge badgeContent={value !== 1 ? `${value * 10}折` : null} color="error">
                    <Button
                      variant="outlined"
                      onClick={() => handleSetAmount(key)}
                      sx={{
                        border: amount === Number(key) ? `1px solid ${theme.palette.primary.main}` : '1px solid transparent'
                      }}
                    >
                      ${key}
                    </Button>
                  </Badge>
                </Grid>
              ))}
            </Grid>
            <TextField label={t('topupCard.amount')} type="number" onChange={handleAmountChange} value={amount} />
            <Divider />
            <Grid container direction="row" justifyContent="flex-end" spacing={2}>
              <Grid item xs={6} md={9}>
                <Typography variant="h6" style={{ textAlign: 'right', fontSize: '0.875rem' }}>
                  {t('topupCard.topupAmount')}:{' '}
                </Typography>
              </Grid>
              <Grid item xs={6} md={3}>
                ${Number(amount)}
              </Grid>
              {discountTotal !== amount && (
                <>
                  <Grid item xs={6} md={9}>
                    <Typography variant="h6" style={{ textAlign: 'right', fontSize: '0.875rem' }}>
                      {t('topupCard.discountedPrice')}:{' '}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    ${discountTotal}
                  </Grid>
                </>
              )}
              {selectedPayment && (selectedPayment.percent_fee > 0 || selectedPayment.fixed_fee > 0) && (
                <>
                  <Grid item xs={6} md={9}>
                    <Typography variant="h6" style={{ textAlign: 'right', fontSize: '0.875rem' }}>
                      {t('topupCard.fee')}:{' '}
                      {selectedPayment &&
                        (selectedPayment.fixed_fee > 0
                          ? '(固定)'
                          : selectedPayment.percent_fee > 0
                            ? `(${selectedPayment.percent_fee * 100}%)`
                            : '')}{' '}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    ${calculateFee()}
                  </Grid>
                </>
              )}
              {showNationalDayPromo && amount > 0 && (
                <>
                  <Grid item xs={6} md={9}>
                    <Space align="center" style={{ justifyContent: 'flex-end', width: '100%' }}>
                      <GiftOutlined style={{ color: '#fa541c' }} />
                      <Typography variant="h6" style={{ fontSize: '0.875rem', color: '#fa541c', margin: 0 }}>
                        国庆奖励:{' '}
                      </Typography>
                    </Space>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Tag color="volcano" style={{ fontWeight: 'bold', margin: 0 }}>
                      +${calculateNationalDayBonus(amount)}
                    </Tag>
                  </Grid>
                </>
              )}

              <Grid item xs={6} md={9}>
                <Typography variant="h6" style={{ textAlign: 'right', fontSize: '0.875rem' }}>
                  {t('topupCard.actualAmountToPay')}:{' '}
                </Typography>
              </Grid>
              <Grid item xs={6} md={3}>
                {calculateTotal()}{' '}
                {selectedPayment &&
                  (selectedPayment.currency === 'CNY'
                    ? `CNY (${t('topupCard.exchangeRate')}: ${siteInfo.PaymentUSDRate})`
                    : selectedPayment.currency)}
              </Grid>
            </Grid>
            <Divider />
            <Button variant="contained" onClick={handlePay} disabled={disabledPay}>
              {t('topupCard.topup')}
            </Button>
          </Stack>
          <PayDialog open={open} onClose={onClosePayDialog} amount={amount} uuid={selectedPayment.uuid} />
        </SubCard>
      )}

      <SubCard
        sx={{
          marginTop: '40px'
        }}
        title={t('topupCard.redemptionCodeTopup')}
      >
        <FormControl fullWidth variant="outlined">
          <InputLabel htmlFor="key">{t('topupCard.inputLabel')}</InputLabel>
          <OutlinedInput
            id="key"
            label={t('topupCard.inputLabel')}
            type="text"
            value={redemptionCode}
            onChange={(e) => setRedemptionCode(e.target.value)}
            name="key"
            placeholder={t('topupCard.inputPlaceholder')}
            endAdornment={
              <InputAdornment position="end">
                <Button variant="contained" onClick={topUp} disabled={isSubmitting}>
                  {isSubmitting ? t('topupCard.exchangeButton.submitting') : t('topupCard.exchangeButton.default')}
                </Button>
              </InputAdornment>
            }
            aria-describedby="helper-text-channel-quota-label"
          />
        </FormControl>

        {siteInfo.top_up_link && (
          <Stack justifyContent="center" alignItems={'center'} spacing={3} paddingTop={'20px'}>
            <Typography variant={'h4'} color={theme.palette.grey[700]}>
              {t('topupCard.noRedemptionCodeText')}
            </Typography>
            <Button variant="contained" onClick={openTopUpLink}>
              {t('topupCard.getRedemptionCode')}
            </Button>
          </Stack>
        )}
      </SubCard>
    </UserCard>
  );
};

export default TopupCard;
