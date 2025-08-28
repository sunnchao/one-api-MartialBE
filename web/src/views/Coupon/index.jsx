import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Grid,
  IconButton,
  Tooltip,
  Switch,
  FormControlLabel,
  Alert,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Send as SendIcon,
  ExpandMore as ExpandMoreIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { API } from 'utils/api';
import { showError, showSuccess, showInfo } from 'utils/common';

// Tab面板组件
function TabPanel({ children, value, index, ...other }) {
  return (
    <div role="tabpanel" hidden={value !== index} id={`coupon-tabpanel-${index}`} aria-labelledby={`coupon-tab-${index}`} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const CouponManagement = () => {
  const [tabValue, setTabValue] = useState(0);

  // 优惠券模板相关状态
  const [templates, setTemplates] = useState([]);
  const [templateDialog, setTemplateDialog] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [templateForm, setTemplateForm] = useState({
    name: '',
    description: '',
    type: 'percentage',
    value: '',
    min_amount: '',
    max_discount: '',
    valid_days: 30,
    total_limit: '',
    user_limit: 1,
    source: 'admin',
    is_active: true
  });

  // 签到奖励相关状态
  const [checkinRewards, setCheckinRewards] = useState([]);
  const [rewardDialog, setRewardDialog] = useState(false);
  const [editingReward, setEditingReward] = useState(null);
  const [rewardForm, setRewardForm] = useState({
    day: '',
    reward_type: 'quota',
    quota_amount: '',
    coupon_id: '',
    multiplier_val: '',
    multiplier_day: '',
    probability: 1.0,
    description: '',
    is_enabled: true
  });

  // 批量发放相关状态
  const [batchDialog, setBatchDialog] = useState(false);
  const [batchForm, setBatchForm] = useState({
    template_id: '',
    user_ids: '',
    source: 'admin'
  });

  // 获取优惠券模板列表
  const fetchTemplates = async () => {
    try {
      const res = await API.get('/api/coupon/admin/templates');
      if (res.data.success) {
        setTemplates(res.data.data || []);
      }
    } catch (error) {
      showError('获取优惠券模板失败');
    }
  };

  // 获取签到奖励配置
  const fetchCheckinRewards = async () => {
    try {
      const res = await API.get('/api/coupon/checkin_rewards');
      if (res.data.success) {
        setCheckinRewards(res.data.data || []);
      }
    } catch (error) {
      showError('获取签到奖励配置失败');
    }
  };

  // 创建/更新优惠券模板
  const handleTemplateSubmit = async () => {
    try {
      const url = editingTemplate ? `/api/coupon/admin/templates/${editingTemplate.id}` : '/api/coupon/admin/templates';
      const method = editingTemplate ? 'PUT' : 'POST';

      const res = await API[method.toLowerCase()](url, templateForm);
      if (res.data.success) {
        showSuccess(editingTemplate ? '更新成功' : '创建成功');
        setTemplateDialog(false);
        resetTemplateForm();
        fetchTemplates();
      } else {
        showError(res.data.message);
      }
    } catch (error) {
      showError('操作失败');
    }
  };

  // 删除优惠券模板
  const handleDeleteTemplate = async (id) => {
    if (!window.confirm('确定要删除这个优惠券模板吗？')) return;

    try {
      const res = await API.delete(`/api/coupon/admin/templates/${id}`);
      if (res.data.success) {
        showSuccess('删除成功');
        fetchTemplates();
      } else {
        showError(res.data.message);
      }
    } catch (error) {
      showError('删除失败');
    }
  };

  // 创建/更新签到奖励
  const handleRewardSubmit = async () => {
    try {
      const url = editingReward ? `/api/coupon/admin/checkin_rewards/${editingReward.id}` : '/api/coupon/admin/checkin_rewards';
      const method = editingReward ? 'PUT' : 'POST';

      const res = await API[method.toLowerCase()](url, rewardForm);
      if (res.data.success) {
        showSuccess(editingReward ? '更新成功' : '创建成功');
        setRewardDialog(false);
        resetRewardForm();
        fetchCheckinRewards();
      } else {
        showError(res.data.message);
      }
    } catch (error) {
      showError('操作失败');
    }
  };

  // 批量发放优惠券
  const handleBatchIssue = async () => {
    try {
      const userIds = batchForm.user_ids
        .split(',')
        .map((id) => parseInt(id.trim()))
        .filter((id) => !isNaN(id));
      if (userIds.length === 0) {
        showError('请输入有效的用户ID');
        return;
      }

      const res = await API.post('/api/coupon/admin/batch_issue', {
        ...batchForm,
        user_ids: userIds
      });

      if (res.data.success) {
        const { success_count, fail_count } = res.data.data;
        showSuccess(`批量发放完成：成功 ${success_count} 个，失败 ${fail_count} 个`);
        setBatchDialog(false);
        resetBatchForm();
      } else {
        showError(res.data.message);
      }
    } catch (error) {
      showError('批量发放失败');
    }
  };

  // 重置表单
  const resetTemplateForm = () => {
    setTemplateForm({
      name: '',
      description: '',
      type: 'percentage',
      value: '',
      min_amount: '',
      max_discount: '',
      valid_days: 30,
      total_limit: '',
      user_limit: 1,
      source: 'admin',
      is_active: true
    });
    setEditingTemplate(null);
  };

  const resetRewardForm = () => {
    setRewardForm({
      day: '',
      reward_type: 'quota',
      quota_amount: '',
      coupon_id: '',
      multiplier_val: '',
      multiplier_day: '',
      probability: 1.0,
      description: '',
      is_enabled: true
    });
    setEditingReward(null);
  };

  const resetBatchForm = () => {
    setBatchForm({
      template_id: '',
      user_ids: '',
      source: 'admin'
    });
  };

  // 编辑模板
  const editTemplate = (template) => {
    setTemplateForm({ ...template });
    setEditingTemplate(template);
    setTemplateDialog(true);
  };

  // 编辑奖励
  const editReward = (reward) => {
    setRewardForm({ ...reward });
    setEditingReward(reward);
    setRewardDialog(true);
  };

  // 获取优惠券类型显示文本
  const getCouponTypeText = (type) => {
    switch (type) {
      case 'percentage':
        return '百分比折扣';
      case 'fixed':
        return '固定金额';
      case 'recharge':
        return '充值奖励';
      default:
        return type;
    }
  };

  // 获取奖励类型显示文本
  const getRewardTypeText = (type) => {
    switch (type) {
      case 'quota':
        return '额度奖励';
      case 'coupon':
        return '优惠券';
      case 'multiplier':
        return '倍率奖励';
      default:
        return type;
    }
  };

  useEffect(() => {
    fetchTemplates();
    fetchCheckinRewards();
  }, []);

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h4" gutterBottom>
        优惠券管理
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="优惠券模板" />
          <Tab label="签到奖励配置" />
          <Tab label="批量操作" />
        </Tabs>
      </Box>

      {/* 优惠券模板管理 */}
      <TabPanel value={tabValue} index={0}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">优惠券模板管理</Typography>
          <Box>
            <Button startIcon={<RefreshIcon />} onClick={fetchTemplates} sx={{ mr: 1 }}>
              刷新
            </Button>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setTemplateDialog(true)}>
              新建模板
            </Button>
          </Box>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>名称</TableCell>
                <TableCell>类型</TableCell>
                <TableCell>折扣值</TableCell>
                <TableCell>使用条件</TableCell>
                <TableCell>发放/使用</TableCell>
                <TableCell>状态</TableCell>
                <TableCell>操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {templates.map((template) => (
                <TableRow key={template.id}>
                  <TableCell>
                    <Box>
                      <Typography variant="subtitle2">{template.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {template.description}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip label={getCouponTypeText(template.type)} size="small" />
                  </TableCell>
                  <TableCell>
                    {template.type === 'percentage' ? `${template.value}%` : `$${template.value}`}
                    {template.max_discount > 0 && (
                      <Typography variant="caption" color="text.secondary" display="block">
                        最多减${template.max_discount}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    满${template.min_amount}可用
                    <Typography variant="caption" color="text.secondary" display="block">
                      有效期{template.valid_days}天
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {template.issued_count}/{template.total_limit || '无限制'}
                    <Typography variant="caption" color="text.secondary" display="block">
                      已使用: {template.used_count}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={template.is_active ? '启用' : '禁用'} color={template.is_active ? 'success' : 'default'} size="small" />
                  </TableCell>
                  <TableCell>
                    <Tooltip title="编辑">
                      <IconButton onClick={() => editTemplate(template)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="删除">
                      <IconButton onClick={() => handleDeleteTemplate(template.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* 签到奖励配置 */}
      <TabPanel value={tabValue} index={1}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">签到奖励配置</Typography>
          <Box>
            <Button startIcon={<RefreshIcon />} onClick={fetchCheckinRewards} sx={{ mr: 1 }}>
              刷新
            </Button>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setRewardDialog(true)}>
              新建奖励
            </Button>
          </Box>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>签到天数</TableCell>
                <TableCell>奖励类型</TableCell>
                <TableCell>奖励内容</TableCell>
                <TableCell>获得概率</TableCell>
                <TableCell>状态</TableCell>
                <TableCell>操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {checkinRewards
                .sort((a, b) => a.day - b.day)
                .map((reward) => (
                  <TableRow key={reward.id}>
                    <TableCell>第{reward.day}天</TableCell>
                    <TableCell>
                      <Chip label={getRewardTypeText(reward.reward_type)} size="small" />
                    </TableCell>
                    <TableCell>
                      {reward.reward_type === 'quota' && `${reward.quota_amount}额度`}
                      {reward.reward_type === 'coupon' && `优惠券ID: ${reward.coupon_id}`}
                      {reward.reward_type === 'multiplier' && `${reward.multiplier_val}倍率 持续${reward.multiplier_day}天`}
                      <Typography variant="caption" color="text.secondary" display="block">
                        {reward.description}
                      </Typography>
                    </TableCell>
                    <TableCell>{(reward.probability * 100).toFixed(1)}%</TableCell>
                    <TableCell>
                      <Chip label={reward.is_enabled ? '启用' : '禁用'} color={reward.is_enabled ? 'success' : 'default'} size="small" />
                    </TableCell>
                    <TableCell>
                      <Tooltip title="编辑">
                        <IconButton onClick={() => editReward(reward)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* 批量操作 */}
      <TabPanel value={tabValue} index={2}>
        <Typography variant="h6" gutterBottom>
          批量发放优惠券
        </Typography>

        <Card>
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>选择优惠券模板</InputLabel>
                  <Select value={batchForm.template_id} onChange={(e) => setBatchForm({ ...batchForm, template_id: e.target.value })}>
                    {templates
                      .filter((t) => t.is_active)
                      .map((template) => (
                        <MenuItem key={template.id} value={template.id}>
                          {template.name} - {getCouponTypeText(template.type)}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>发放来源</InputLabel>
                  <Select value={batchForm.source} onChange={(e) => setBatchForm({ ...batchForm, source: e.target.value })}>
                    <MenuItem value="admin">管理员发放</MenuItem>
                    <MenuItem value="activity">活动奖励</MenuItem>
                    <MenuItem value="compensation">补偿发放</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="用户ID列表"
                  placeholder="请输入用户ID，用逗号分隔，例如：1,2,3,4,5"
                  multiline
                  rows={3}
                  value={batchForm.user_ids}
                  onChange={(e) => setBatchForm({ ...batchForm, user_ids: e.target.value })}
                  helperText="输入要发放优惠券的用户ID，用逗号分隔"
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  startIcon={<SendIcon />}
                  onClick={() => setBatchDialog(true)}
                  disabled={!batchForm.template_id || !batchForm.user_ids}
                >
                  批量发放
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </TabPanel>

      {/* 优惠券模板编辑对话框 */}
      <Dialog open={templateDialog} onClose={() => setTemplateDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editingTemplate ? '编辑优惠券模板' : '新建优惠券模板'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="优惠券名称"
                value={templateForm.name}
                onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>优惠券类型</InputLabel>
                <Select value={templateForm.type} onChange={(e) => setTemplateForm({ ...templateForm, type: e.target.value })}>
                  <MenuItem value="percentage">百分比折扣</MenuItem>
                  <MenuItem value="fixed">固定金额减免</MenuItem>
                  <MenuItem value="recharge">充值奖励</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="描述"
                multiline
                rows={2}
                value={templateForm.description}
                onChange={(e) => setTemplateForm({ ...templateForm, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label={templateForm.type === 'percentage' ? '折扣百分比' : '金额'}
                type="number"
                value={templateForm.value}
                onChange={(e) => setTemplateForm({ ...templateForm, value: e.target.value })}
                helperText={templateForm.type === 'percentage' ? '例如：10 表示10%折扣' : '例如：5 表示$5'}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="最低消费金额"
                type="number"
                value={templateForm.min_amount}
                onChange={(e) => setTemplateForm({ ...templateForm, min_amount: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="最大折扣金额"
                type="number"
                value={templateForm.max_discount}
                onChange={(e) => setTemplateForm({ ...templateForm, max_discount: e.target.value })}
                helperText="仅百分比折扣有效，0表示无限制"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="有效天数"
                type="number"
                value={templateForm.valid_days}
                onChange={(e) => setTemplateForm({ ...templateForm, valid_days: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="总发放限制"
                type="number"
                value={templateForm.total_limit}
                onChange={(e) => setTemplateForm({ ...templateForm, total_limit: e.target.value })}
                helperText="0表示无限制"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="每用户限制"
                type="number"
                value={templateForm.user_limit}
                onChange={(e) => setTemplateForm({ ...templateForm, user_limit: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={templateForm.is_active}
                    onChange={(e) => setTemplateForm({ ...templateForm, is_active: e.target.checked })}
                  />
                }
                label="启用模板"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTemplateDialog(false)}>取消</Button>
          <Button onClick={handleTemplateSubmit} variant="contained" disabled={!templateForm.name || !templateForm.value}>
            {editingTemplate ? '更新' : '创建'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 签到奖励编辑对话框 */}
      <Dialog open={rewardDialog} onClose={() => setRewardDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editingReward ? '编辑签到奖励' : '新建签到奖励'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="签到天数"
                type="number"
                value={rewardForm.day}
                onChange={(e) => setRewardForm({ ...rewardForm, day: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>奖励类型</InputLabel>
                <Select value={rewardForm.reward_type} onChange={(e) => setRewardForm({ ...rewardForm, reward_type: e.target.value })}>
                  <MenuItem value="quota">额度奖励</MenuItem>
                  <MenuItem value="coupon">优惠券</MenuItem>
                  <MenuItem value="multiplier">倍率奖励</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {rewardForm.reward_type === 'quota' && (
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="额度数量"
                  type="number"
                  value={rewardForm.quota_amount}
                  onChange={(e) => setRewardForm({ ...rewardForm, quota_amount: e.target.value })}
                />
              </Grid>
            )}

            {rewardForm.reward_type === 'coupon' && (
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>优惠券模板</InputLabel>
                  <Select value={rewardForm.coupon_id} onChange={(e) => setRewardForm({ ...rewardForm, coupon_id: e.target.value })}>
                    {templates
                      .filter((t) => t.is_active)
                      .map((template) => (
                        <MenuItem key={template.id} value={template.id}>
                          {template.name}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              </Grid>
            )}

            {rewardForm.reward_type === 'multiplier' && (
              <>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label="倍率值"
                    type="number"
                    value={rewardForm.multiplier_val}
                    onChange={(e) => setRewardForm({ ...rewardForm, multiplier_val: e.target.value })}
                    helperText="例如：1.5"
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label="持续天数"
                    type="number"
                    value={rewardForm.multiplier_day}
                    onChange={(e) => setRewardForm({ ...rewardForm, multiplier_day: e.target.value })}
                  />
                </Grid>
              </>
            )}

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="获得概率"
                type="number"
                inputProps={{ min: 0, max: 1, step: 0.1 }}
                value={rewardForm.probability}
                onChange={(e) => setRewardForm({ ...rewardForm, probability: e.target.value })}
                helperText="0-1之间，1表示100%获得"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="奖励描述"
                value={rewardForm.description}
                onChange={(e) => setRewardForm({ ...rewardForm, description: e.target.value })}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={rewardForm.is_enabled}
                    onChange={(e) => setRewardForm({ ...rewardForm, is_enabled: e.target.checked })}
                  />
                }
                label="启用奖励"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRewardDialog(false)}>取消</Button>
          <Button onClick={handleRewardSubmit} variant="contained" disabled={!rewardForm.day}>
            {editingReward ? '更新' : '创建'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 批量发放确认对话框 */}
      <Dialog open={batchDialog} onClose={() => setBatchDialog(false)}>
        <DialogTitle>确认批量发放</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            请确认以下信息无误后执行批量发放操作
          </Alert>
          <Typography variant="body2" gutterBottom>
            <strong>优惠券模板：</strong>
            {templates.find((t) => t.id == batchForm.template_id)?.name || '未选择'}
          </Typography>
          <Typography variant="body2" gutterBottom>
            <strong>发放来源：</strong>
            {batchForm.source}
          </Typography>
          <Typography variant="body2" gutterBottom>
            <strong>目标用户：</strong>
            {batchForm.user_ids.split(',').length} 个用户
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBatchDialog(false)}>取消</Button>
          <Button onClick={handleBatchIssue} variant="contained" color="warning">
            确认发放
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CouponManagement;
