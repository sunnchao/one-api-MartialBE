import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Grid,
  Button,
  Card,
  CardContent,
  Fab,
  Zoom,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Checkbox,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Tooltip,
  useTheme
} from '@mui/material';
import {
  Add as AddIcon,
  Analytics as AnalyticsIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Settings as SettingsIcon,
  Refresh as RefreshIcon,
  Delete as DeleteIcon,
  Edit as EditIcon
} from '@mui/icons-material';

// 导入新组件
import EnhancedCouponCard from 'components/EnhancedCouponCard';
import CouponAnalytics from 'components/CouponAnalytics';
import CouponFilter from 'components/CouponFilter';
import { API } from 'utils/api';
import { showError, showSuccess, showInfo } from 'utils/common';

// Tab面板组件
function TabPanel({ children, value, index, ...other }) {
  return (
    <div role="tabpanel" hidden={value !== index} id={`enhanced-tabpanel-${index}`} aria-labelledby={`enhanced-tab-${index}`} {...other}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const EnhancedCouponManagement = () => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);

  // 数据状态
  const [templates, setTemplates] = useState([]);
  const [userCoupons, setUserCoupons] = useState([]);
  const [checkinRewards, setCheckinRewards] = useState([]);
  const [loading, setLoading] = useState(false);

  // UI状态
  const [selectedItems, setSelectedItems] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  // 对话框状态
  const [templateDialog, setTemplateDialog] = useState(false);
  const [batchDialog, setBatchDialog] = useState(false);
  const [exportDialog, setExportDialog] = useState(false);

  // 表单状态
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
    is_active: true
  });

  // 过滤和排序状态
  const [filters, setFilters] = useState({});
  const [filteredTemplates, setFilteredTemplates] = useState([]);

  // 获取数据
  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const res = await API.get('/api/coupon/admin/templates');
      if (res.data.success) {
        const data = res.data.data || [];
        setTemplates(data);
        applyFilters(data, filters);
      }
    } catch (error) {
      showSnackbar('获取优惠券模板失败', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserCoupons = async () => {
    try {
      const res = await API.get('/api/coupon/admin/user_coupons');
      if (res.data.success) {
        setUserCoupons(res.data.data || []);
      }
    } catch (error) {
      showSnackbar('获取用户优惠券失败', 'error');
    }
  };

  const fetchCheckinRewards = async () => {
    try {
      const res = await API.get('/api/coupon/checkin_rewards');
      if (res.data.success) {
        setCheckinRewards(res.data.data || []);
      }
    } catch (error) {
      showSnackbar('获取签到奖励失败', 'error');
    }
  };

  // 应用过滤器
  const applyFilters = (data, filterParams) => {
    let filtered = [...data];

    // 搜索过滤
    if (filterParams.search) {
      const searchTerm = filterParams.search.toLowerCase();
      filtered = filtered.filter(
        (item) => item.name.toLowerCase().includes(searchTerm) || item.description?.toLowerCase().includes(searchTerm)
      );
    }

    // 类型过滤
    if (filterParams.type && filterParams.type.length > 0) {
      filtered = filtered.filter((item) => filterParams.type.includes(item.type));
    }

    // 状态过滤
    if (filterParams.onlyAvailable) {
      filtered = filtered.filter((item) => item.is_active);
    }

    // 排序
    if (filterParams.sortBy) {
      filtered.sort((a, b) => {
        const aVal = a[filterParams.sortBy];
        const bVal = b[filterParams.sortBy];
        if (filterParams.sortOrder === 'desc') {
          return bVal > aVal ? 1 : -1;
        } else {
          return aVal > bVal ? 1 : -1;
        }
      });
    }

    setFilteredTemplates(filtered);
  };

  // 处理过滤器变化
  const handleFilterChange = (filterParams) => {
    setFilters(filterParams);
    applyFilters(templates, filterParams);
  };

  // 显示提示消息
  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  // 创建/更新模板
  const handleTemplateSubmit = async () => {
    try {
      const res = await API.post('/api/coupon/admin/templates', templateForm);
      if (res.data.success) {
        showSnackbar('创建成功', 'success');
        setTemplateDialog(false);
        resetTemplateForm();
        fetchTemplates();
      } else {
        showSnackbar(res.data.message, 'error');
      }
    } catch (error) {
      showSnackbar('操作失败', 'error');
    }
  };

  // 批量删除
  const handleBatchDelete = async () => {
    try {
      const res = await API.post('/api/coupon/admin/batch_delete', {
        template_ids: selectedItems
      });
      if (res.data.success) {
        showSnackbar(`成功删除 ${selectedItems.length} 个模板`, 'success');
        setSelectedItems([]);
        setBatchDialog(false);
        fetchTemplates();
      } else {
        showSnackbar(res.data.message, 'error');
      }
    } catch (error) {
      showSnackbar('批量删除失败', 'error');
    }
  };

  // 导出数据
  const handleExport = () => {
    const dataToExport = selectedItems.length > 0 ? templates.filter((t) => selectedItems.includes(t.id)) : filteredTemplates;

    const csvData = dataToExport.map((template) => ({
      name: template.name,
      type: template.type,
      value: template.value,
      minAmount: template.min_amount,
      maxDiscount: template.max_discount,
      validDays: template.valid_days,
      issuedCount: template.issued_count,
      usedCount: template.used_count,
      status: template.is_active ? '启用' : '禁用'
    }));

    // 简单的CSV导出
    const csv = [Object.keys(csvData[0]).join(','), ...csvData.map((row) => Object.values(row).join(','))].join('\n');

    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `优惠券模板_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    setExportDialog(false);
    showSnackbar('导出成功', 'success');
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
      is_active: true
    });
  };

  // 切换选择
  const toggleSelection = (id) => {
    setSelectedItems((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  // 全选/取消全选
  const toggleSelectAll = () => {
    if (selectedItems.length === filteredTemplates.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredTemplates.map((t) => t.id));
    }
  };

  useEffect(() => {
    fetchTemplates();
    fetchUserCoupons();
    fetchCheckinRewards();
  }, []);

  return (
    <Box sx={{ width: '100%', position: 'relative' }}>
      {/* 页面标题 */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom fontWeight="bold">
            🎫 增强版优惠券管理
          </Typography>
          <Typography variant="body1" color="text.secondary">
            高级功能：批量操作、数据分析、智能过滤
          </Typography>
        </Box>

        {/* 快速操作按钮 */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button startIcon={<RefreshIcon />} onClick={fetchTemplates} disabled={loading}>
            刷新
          </Button>
          <Button startIcon={<DownloadIcon />} onClick={() => setExportDialog(true)}>
            导出
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setTemplateDialog(true)}>
            新建模板
          </Button>
        </Box>
      </Box>

      {/* 标签页 */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="模板管理" icon={<SettingsIcon />} iconPosition="start" />
          <Tab label="数据分析" icon={<AnalyticsIcon />} iconPosition="start" />
          <Tab label="用户优惠券" icon={<AddIcon />} iconPosition="start" />
        </Tabs>
      </Box>

      {/* 模板管理 */}
      <TabPanel value={tabValue} index={0}>
        {/* 过滤器 */}
        <CouponFilter
          onFilterChange={handleFilterChange}
          onViewModeChange={setViewMode}
          totalCount={templates.length}
          filteredCount={filteredTemplates.length}
        />

        {/* 批量操作栏 */}
        {selectedItems.length > 0 && (
          <Card sx={{ mb: 3, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
            <CardContent sx={{ py: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">已选择 {selectedItems.length} 个模板</Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button variant="contained" color="error" startIcon={<DeleteIcon />} onClick={() => setBatchDialog(true)}>
                    批量删除
                  </Button>
                  <Button variant="outlined" onClick={() => setSelectedItems([])}>
                    取消选择
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* 模板列表 */}
        {viewMode === 'grid' ? (
          <Grid container spacing={3}>
            {filteredTemplates.map((template) => (
              <Grid item xs={12} sm={6} md={4} key={template.id}>
                <Box sx={{ position: 'relative' }}>
                  <Checkbox
                    checked={selectedItems.includes(template.id)}
                    onChange={() => toggleSelection(template.id)}
                    sx={{
                      position: 'absolute',
                      top: 8,
                      left: 8,
                      zIndex: 2,
                      bgcolor: 'background.paper',
                      borderRadius: '50%'
                    }}
                  />
                  <EnhancedCouponCard
                    coupon={{
                      ...template,
                      code: `TPL-${template.id}`,
                      status: template.is_active ? 1 : 3,
                      expire_time: Date.now() + template.valid_days * 24 * 60 * 60 * 1000
                    }}
                    selected={selectedItems.includes(template.id)}
                    onSelect={() => toggleSelection(template.id)}
                    onCopy={async (code) => {
                      await navigator.clipboard.writeText(code);
                      showSnackbar('模板ID已复制', 'success');
                    }}
                    animated={true}
                    variant="default"
                  />
                </Box>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Card>
            <List>
              <ListItem>
                <ListItemIcon>
                  <Checkbox
                    checked={selectedItems.length === filteredTemplates.length && filteredTemplates.length > 0}
                    indeterminate={selectedItems.length > 0 && selectedItems.length < filteredTemplates.length}
                    onChange={toggleSelectAll}
                  />
                </ListItemIcon>
                <ListItemText primary="模板名称" secondary="类型 | 值 | 状态" primaryTypographyProps={{ fontWeight: 'bold' }} />
              </ListItem>
              {filteredTemplates.map((template) => (
                <ListItem key={template.id} divider>
                  <ListItemIcon>
                    <Checkbox checked={selectedItems.includes(template.id)} onChange={() => toggleSelection(template.id)} />
                  </ListItemIcon>
                  <ListItemText
                    primary={template.name}
                    secondary={`${template.type} | ${template.value} | ${template.is_active ? '启用' : '禁用'}`}
                  />
                  <Tooltip title="编辑">
                    <IconButton>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="删除">
                    <IconButton color="error">
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </ListItem>
              ))}
            </List>
          </Card>
        )}
      </TabPanel>

      {/* 数据分析 */}
      <TabPanel value={tabValue} index={1}>
        <CouponAnalytics />
      </TabPanel>

      {/* 用户优惠券 */}
      <TabPanel value={tabValue} index={2}>
        <Typography variant="h6" gutterBottom>
          用户优惠券管理
        </Typography>
        <Typography color="text.secondary">此功能正在开发中，敬请期待...</Typography>
      </TabPanel>

      {/* 浮动操作按钮 */}
      <Zoom in={tabValue === 0}>
        <Fab
          color="primary"
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 1000
          }}
          onClick={() => setTemplateDialog(true)}
        >
          <AddIcon />
        </Fab>
      </Zoom>

      {/* 模板创建对话框 */}
      <Dialog open={templateDialog} onClose={() => setTemplateDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>创建优惠券模板</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="模板名称"
                value={templateForm.name}
                onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>类型</InputLabel>
                <Select value={templateForm.type} onChange={(e) => setTemplateForm({ ...templateForm, type: e.target.value })} label="类型">
                  <MenuItem value="percentage">百分比折扣</MenuItem>
                  <MenuItem value="fixed">固定金额</MenuItem>
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
                label="优惠值"
                type="number"
                value={templateForm.value}
                onChange={(e) => setTemplateForm({ ...templateForm, value: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="最低金额"
                type="number"
                value={templateForm.min_amount}
                onChange={(e) => setTemplateForm({ ...templateForm, min_amount: e.target.value })}
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
          <Button onClick={handleTemplateSubmit} variant="contained">
            创建
          </Button>
        </DialogActions>
      </Dialog>

      {/* 批量删除确认对话框 */}
      <Dialog open={batchDialog} onClose={() => setBatchDialog(false)}>
        <DialogTitle>确认批量删除</DialogTitle>
        <DialogContent>
          <Typography>确定要删除选中的 {selectedItems.length} 个优惠券模板吗？此操作不可撤销。</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBatchDialog(false)}>取消</Button>
          <Button onClick={handleBatchDelete} color="error" variant="contained">
            确认删除
          </Button>
        </DialogActions>
      </Dialog>

      {/* 导出对话框 */}
      <Dialog open={exportDialog} onClose={() => setExportDialog(false)}>
        <DialogTitle>导出优惠券数据</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            {selectedItems.length > 0 ? `导出选中的 ${selectedItems.length} 个模板` : `导出当前筛选的 ${filteredTemplates.length} 个模板`}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            数据将以CSV格式导出，包含模板的基本信息和统计数据。
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExportDialog(false)}>取消</Button>
          <Button onClick={handleExport} variant="contained" startIcon={<DownloadIcon />}>
            导出
          </Button>
        </DialogActions>
      </Dialog>

      {/* 提示消息 */}
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EnhancedCouponManagement;
