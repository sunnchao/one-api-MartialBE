import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Grid, Card, CardContent, 
  Button, Box, Chip, LinearProgress, Alert, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField,
  Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, IconButton, Tooltip, Stack, Divider,
  CircularProgress, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import {
  Star as StarIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  Cancel as CancelIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { API } from 'utils/api';
import { showError, showSuccess, showInfo } from 'utils/common';
import { useTranslation } from 'react-i18next';

const ClaudeCodeSubscription = () => {
  const { t } = useTranslation();
  const [subscription, setSubscription] = useState(null);
  const [plans, setPlans] = useState([]);
  const [apiKeys, setApiKeys] = useState([]);
  const [usageStats, setUsageStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [createKeyDialog, setCreateKeyDialog] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [purchaseDialog, setPurchaseDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('stripe');
  const [newApiKey, setNewApiKey] = useState('');

  // 获取用户订阅状态
  const fetchSubscription = async () => {
    try {
      const res = await API.get('/api/user/claude-code/subscription');
      if (res.data.success) {
        setSubscription(res.data.data);
      } else {
        setSubscription(null);
      }
    } catch (error) {
      console.error('获取订阅信息失败:', error);
      setSubscription(null);
    }
  };

  // 获取可用套餐
  const fetchPlans = async () => {
    try {
      const res = await API.get('/api/user/claude-code/plans');
      if (res.data.success) {
        setPlans(res.data.data);
      }
    } catch (error) {
      showError('获取套餐信息失败');
    }
  };

  // 获取API Keys
  const fetchApiKeys = async () => {
    try {
      const res = await API.get('/api/user/claude-code/api-keys');
      if (res.data.success) {
        setApiKeys(res.data.data);
      }
    } catch (error) {
      console.error('获取API Keys失败:', error);
    }
  };

  // 获取使用统计
  const fetchUsageStats = async () => {
    try {
      const res = await API.get('/api/user/claude-code/usage-stats');
      if (res.data.success) {
        setUsageStats(res.data.data);
      }
    } catch (error) {
      console.error('获取使用统计失败:', error);
    }
  };

  // 购买订阅
  const purchaseSubscription = async () => {
    if (!selectedPlan) return;
    
    setLoading(true);
    try {
      const res = await API.post('/api/user/claude-code/purchase', {
        plan_type: selectedPlan.type,
        payment_method: paymentMethod
      });
      
      if (res.data.success) {
        showSuccess('订单创建成功！正在跳转到支付页面...');
        // 跳转到支付页面
        if (res.data.payment_url) {
          window.open(res.data.payment_url, '_blank');
        }
        setPurchaseDialog(false);
        // 延迟刷新，等待用户完成支付
        setTimeout(() => {
          fetchSubscription();
        }, 3000);
      } else {
        showError(res.data.message);
      }
    } catch (error) {
      showError('购买失败');
    } finally {
      setLoading(false);
    }
  };

  // 创建API Key
  const createApiKey = async () => {
    if (!newKeyName.trim()) {
      showError('请输入API Key名称');
      return;
    }

    setLoading(true);
    try {
      const res = await API.post('/api/user/claude-code/api-keys', {
        name: newKeyName
      });
      
      if (res.data.success) {
        showSuccess('API Key创建成功！');
        setNewApiKey(res.data.data.key);
        setNewKeyName('');
        fetchApiKeys();
      } else {
        showError(res.data.message);
      }
    } catch (error) {
      showError('创建失败');
    } finally {
      setLoading(false);
    }
  };

  // 删除API Key
  const deleteApiKey = async (keyId) => {
    if (!window.confirm('确定要删除这个API Key吗？删除后将无法恢复！')) {
      return;
    }

    try {
      const res = await API.delete(`/api/user/claude-code/api-keys/${keyId}`);
      if (res.data.success) {
        showSuccess('删除成功');
        fetchApiKeys();
      } else {
        showError(res.data.message);
      }
    } catch (error) {
      showError('删除失败');
    }
  };

  // 取消订阅
  const cancelSubscription = async () => {
    if (!window.confirm('确定要取消订阅吗？订阅将在到期时失效。')) {
      return;
    }

    try {
      const res = await API.post('/api/user/claude-code/cancel');
      if (res.data.success) {
        showSuccess('订阅已取消');
        fetchSubscription();
      } else {
        showError(res.data.message);
      }
    } catch (error) {
      showError('取消失败');
    }
  };

  // 复制API Key到剪贴板
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      showSuccess('已复制到剪贴板');
    });
  };

  useEffect(() => {
    fetchSubscription();
    fetchPlans();
    fetchApiKeys();
    fetchUsageStats();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'expired': return 'error';
      case 'cancelled': return 'warning';
      case 'pending': return 'info';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return '活跃';
      case 'expired': return '已过期';
      case 'cancelled': return '已取消';
      case 'pending': return '待支付';
      default: return '未知';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <CheckCircleIcon />;
      case 'expired': return <WarningIcon />;
      case 'cancelled': return <CancelIcon />;
      case 'pending': return <InfoIcon />;
      default: return <InfoIcon />;
    }
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const usagePercentage = subscription 
    ? (subscription.used_requests_this_month / subscription.max_requests_per_month) * 100
    : 0;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={4}>
        <Typography variant="h2" gutterBottom>
          Claude Code 订阅管理
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={() => {
            fetchSubscription();
            fetchApiKeys();
            fetchUsageStats();
          }}
        >
          刷新
        </Button>
      </Stack>

      {/* 当前订阅状态 */}
      {subscription ? (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h5">当前订阅</Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                {getStatusIcon(subscription.status)}
                <Chip 
                  label={getStatusText(subscription.status)} 
                  color={getStatusColor(subscription.status)}
                />
              </Stack>
            </Box>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">套餐类型</Typography>
                    <Typography variant="h6">{subscription.plan_type}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">订阅期间</Typography>
                    <Typography variant="body1">
                      {formatDate(subscription.start_time)} - {formatDate(subscription.end_time)}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">价格</Typography>
                    <Typography variant="h6" color="primary">
                      ${subscription.price} {subscription.currency}/月
                    </Typography>
                  </Box>
                </Stack>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      本月使用量: {subscription.used_requests_this_month} / {subscription.max_requests_per_month}
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={Math.min(usagePercentage, 100)}
                      sx={{ 
                        height: 8, 
                        borderRadius: 4,
                        backgroundColor: 'rgba(0,0,0,0.1)',
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 4,
                          backgroundColor: usagePercentage > 80 ? 'error.main' : 'primary.main'
                        }
                      }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      已使用 {usagePercentage.toFixed(1)}%
                    </Typography>
                  </Box>
                  
                  {subscription.status === 'active' && (
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      onClick={cancelSubscription}
                      startIcon={<CancelIcon />}
                    >
                      取消订阅
                    </Button>
                  )}
                </Stack>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      ) : (
        <Alert severity="info" sx={{ mb: 4 }}>
          您当前没有有效的 Claude Code 订阅，请选择合适的套餐开始使用。
        </Alert>
      )}

      {/* API Keys 管理 */}
      {subscription && subscription.status === 'active' && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h5">API Keys 管理</Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setCreateKeyDialog(true)}
              >
                创建 API Key
              </Button>
            </Box>

            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>名称</TableCell>
                    <TableCell>状态</TableCell>
                    <TableCell>使用次数</TableCell>
                    <TableCell>最后使用</TableCell>
                    <TableCell>创建时间</TableCell>
                    <TableCell align="center">操作</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {apiKeys.map((key) => (
                    <TableRow key={key.id}>
                      <TableCell>{key.name}</TableCell>
                      <TableCell>
                        <Chip 
                          label={key.status === 1 ? '活跃' : '禁用'} 
                          color={key.status === 1 ? 'success' : 'error'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{key.usage_count}</TableCell>
                      <TableCell>
                        {key.last_used_time ? formatDate(key.last_used_time) : '从未使用'}
                      </TableCell>
                      <TableCell>{formatDate(key.created_time)}</TableCell>
                      <TableCell align="center">
                        <Tooltip title="删除">
                          <IconButton 
                            size="small"
                            color="error"
                            onClick={() => deleteApiKey(key.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                  {apiKeys.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        <Typography color="text.secondary">
                          暂无API Key，点击上方按钮创建
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* 可用套餐 */}
      <Typography variant="h4" gutterBottom sx={{ mt: 4 }}>
        选择订阅套餐
      </Typography>
      
      <Grid container spacing={3}>
        {plans.map((plan) => (
          <Grid item xs={12} md={4} key={plan.id}>
            <Card 
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                border: plan.type === 'pro' ? 2 : 1,
                borderColor: plan.type === 'pro' ? 'primary.main' : 'divider',
                position: 'relative',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: (theme) => theme.shadows[8]
                }
              }}
            >
              {plan.type === 'pro' && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: -10,
                    right: 16,
                    zIndex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: 'primary.main',
                    color: 'primary.contrastText',
                    borderRadius: '12px',
                    px: 1,
                    py: 0.5
                  }}
                >
                  <StarIcon sx={{ fontSize: 16, mr: 0.5 }} />
                  <Typography variant="caption" fontWeight="bold">推荐</Typography>
                </Box>
              )}
              
              <CardContent sx={{ flexGrow: 1, p: 3 }}>
                <Typography variant="h5" gutterBottom align="center">
                  {plan.name}
                </Typography>
                <Box textAlign="center" mb={2}>
                  <Typography variant="h3" color="primary" component="span">
                    ${plan.price}
                  </Typography>
                  <Typography variant="h6" color="text.secondary" component="span">
                    /{plan.currency}/月
                  </Typography>
                </Box>
                
                <Typography variant="body2" color="text.secondary" paragraph align="center">
                  {plan.description}
                </Typography>
                
                <Divider sx={{ my: 2 }} />
                
                <Stack spacing={1.5}>
                  <Box display="flex" alignItems="center">
                    <CheckCircleIcon color="success" sx={{ fontSize: 20, mr: 1 }} />
                    <Typography variant="body2">
                      每月 {plan.max_requests_per_month.toLocaleString()} 次请求
                    </Typography>
                  </Box>
                  
                  <Box display="flex" alignItems="center">
                    <CheckCircleIcon color="success" sx={{ fontSize: 20, mr: 1 }} />
                    <Typography variant="body2">
                      最多 {plan.max_client_count} 个设备
                    </Typography>
                  </Box>
                  
                  {/* 功能特性 */}
                  {plan.features && plan.features.Data && Object.entries(plan.features.Data).map(([key, value]) => (
                    value === true && (
                      <Box key={key} display="flex" alignItems="center">
                        <CheckCircleIcon color="success" sx={{ fontSize: 20, mr: 1 }} />
                        <Typography variant="body2">{key}</Typography>
                      </Box>
                    )
                  ))}
                </Stack>
              </CardContent>
              
              <Box sx={{ p: 3, pt: 0 }}>
                <Button
                  fullWidth
                  variant={plan.type === 'pro' ? 'contained' : 'outlined'}
                  size="large"
                  disabled={loading || (subscription?.plan_type === plan.type && subscription?.status === 'active')}
                  onClick={() => {
                    setSelectedPlan(plan);
                    setPurchaseDialog(true);
                  }}
                  sx={{ 
                    py: 1.5,
                    fontSize: '1rem',
                    fontWeight: 600
                  }}
                >
                  {subscription?.plan_type === plan.type && subscription?.status === 'active' 
                    ? '当前套餐' 
                    : '选择此套餐'}
                </Button>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* 创建API Key对话框 */}
      <Dialog open={createKeyDialog} onClose={() => setCreateKeyDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>创建 API Key</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="API Key 名称"
            fullWidth
            variant="outlined"
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            placeholder="例如：我的开发环境"
          />
          
          {newApiKey && (
            <Alert severity="success" sx={{ mt: 2 }}>
              <Typography variant="body2" gutterBottom>
                <strong>API Key 创建成功！请妥善保存，离开此页面后将无法再次查看：</strong>
              </Typography>
              <Box 
                sx={{ 
                  backgroundColor: 'rgba(0,0,0,0.05)', 
                  p: 1, 
                  borderRadius: 1, 
                  mt: 1,
                  cursor: 'pointer'
                }}
                onClick={() => copyToClipboard(newApiKey)}
              >
                <Typography variant="code" sx={{ wordBreak: 'break-all' }}>
                  {newApiKey}
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary">
                点击上方文本框可复制到剪贴板
              </Typography>
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setCreateKeyDialog(false);
            setNewKeyName('');
            setNewApiKey('');
          }}>
            {newApiKey ? '关闭' : '取消'}
          </Button>
          {!newApiKey && (
            <Button 
              onClick={createApiKey} 
              variant="contained"
              disabled={loading}
            >
              {loading ? <CircularProgress size={20} /> : '创建'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* 购买确认对话框 */}
      <Dialog open={purchaseDialog} onClose={() => setPurchaseDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>确认购买</DialogTitle>
        <DialogContent>
          {selectedPlan && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedPlan.name}
              </Typography>
              <Typography variant="body1" gutterBottom>
                价格：${selectedPlan.price} {selectedPlan.currency}/月
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                {selectedPlan.description}
              </Typography>
              
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel>支付方式</InputLabel>
                <Select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  label="支付方式"
                >
                  <MenuItem value="stripe">Stripe (信用卡)</MenuItem>
                  <MenuItem value="alipay">支付宝</MenuItem>
                  <MenuItem value="wxpay">微信支付</MenuItem>
                </Select>
              </FormControl>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPurchaseDialog(false)}>取消</Button>
          <Button 
            onClick={purchaseSubscription} 
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} /> : '确认购买'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ClaudeCodeSubscription;
