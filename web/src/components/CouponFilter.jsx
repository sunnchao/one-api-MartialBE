import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Button,
  ButtonGroup,
  IconButton,
  Tooltip,
  Collapse,
  Card,
  CardContent,
  Typography,
  Slider,
  Switch,
  FormControlLabel,
  Autocomplete,
  DatePicker,
  Divider,
  Badge,
  useTheme
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Sort as SortIcon,
  ViewList as ViewListIcon,
  ViewModule as ViewModuleIcon,
  TuneIcon
} from '@mui/icons-material';
import { zhCN } from 'date-fns/locale';

const CouponFilter = ({ onFilterChange, onSortChange, onViewModeChange, totalCount = 0, filteredCount = 0, initialFilters = {} }) => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // grid | list
  const [filters, setFilters] = useState({
    search: '',
    type: [],
    status: [],
    source: [],
    valueRange: [0, 1000],
    dateRange: [null, null],
    expiringSoon: false,
    onlyAvailable: false,
    ...initialFilters
  });
  const [sortBy, setSortBy] = useState('created_time');
  const [sortOrder, setSortOrder] = useState('desc');

  // 预定义选项
  const typeOptions = [
    { value: 'percentage', label: '百分比折扣', color: 'success' },
    { value: 'fixed', label: '固定金额', color: 'info' },
    { value: 'recharge', label: '充值奖励', color: 'warning' }
  ];

  const statusOptions = [
    { value: 1, label: '可用', color: 'success' },
    { value: 2, label: '已使用', color: 'default' },
    { value: 3, label: '已过期', color: 'error' }
  ];

  const sourceOptions = [
    { value: 'admin', label: '管理员发放', color: 'primary' },
    { value: 'checkin', label: '签到奖励', color: 'secondary' },
    { value: 'activity', label: '活动奖励', color: 'info' },
    { value: 'invite', label: '邀请奖励', color: 'success' },
    { value: 'compensation', label: '补偿发放', color: 'warning' }
  ];

  const sortOptions = [
    { value: 'created_time', label: '创建时间' },
    { value: 'expire_time', label: '过期时间' },
    { value: 'value', label: '优惠额度' },
    { value: 'min_amount', label: '使用门槛' },
    { value: 'name', label: '名称' },
    { value: 'usage_count', label: '使用次数' }
  ];

  // 应用过滤器
  useEffect(() => {
    const filterParams = {
      ...filters,
      sortBy,
      sortOrder
    };
    onFilterChange?.(filterParams);
  }, [filters, sortBy, sortOrder, onFilterChange]);

  // 处理单个过滤器变化
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value
    }));
  };

  // 处理多选过滤器
  const handleMultiSelectChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value
    }));
  };

  // 清除所有过滤器
  const clearAllFilters = () => {
    setFilters({
      search: '',
      type: [],
      status: [],
      source: [],
      valueRange: [0, 1000],
      dateRange: [null, null],
      expiringSoon: false,
      onlyAvailable: false
    });
  };

  // 切换排序顺序
  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    onSortChange?.(sortBy, sortOrder === 'asc' ? 'desc' : 'asc');
  };

  // 切换视图模式
  const toggleViewMode = () => {
    const newMode = viewMode === 'grid' ? 'list' : 'grid';
    setViewMode(newMode);
    onViewModeChange?.(newMode);
  };

  // 获取活跃过滤器数量
  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.type.length > 0) count++;
    if (filters.status.length > 0) count++;
    if (filters.source.length > 0) count++;
    if (filters.valueRange[0] > 0 || filters.valueRange[1] < 1000) count++;
    if (filters.dateRange[0] || filters.dateRange[1]) count++;
    if (filters.expiringSoon) count++;
    if (filters.onlyAvailable) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={zhCN}>
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ pb: 2 }}>
          {/* 主要搜索和操作栏 */}
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
            {/* 搜索框 */}
            <TextField
              fullWidth
              placeholder="搜索优惠券名称、描述或代码..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
                endAdornment: filters.search && (
                  <IconButton size="small" onClick={() => handleFilterChange('search', '')}>
                    <ClearIcon />
                  </IconButton>
                )
              }}
              sx={{ maxWidth: 400 }}
            />

            {/* 快速过滤器 */}
            <FormControlLabel
              control={
                <Switch
                  checked={filters.onlyAvailable}
                  onChange={(e) => handleFilterChange('onlyAvailable', e.target.checked)}
                  size="small"
                />
              }
              label="仅显示可用"
              sx={{ whiteSpace: 'nowrap' }}
            />

            {/* 操作按钮 */}
            <Box sx={{ display: 'flex', gap: 1, ml: 'auto' }}>
              {/* 视图切换 */}
              <Tooltip title={viewMode === 'grid' ? '列表视图' : '网格视图'}>
                <IconButton onClick={toggleViewMode}>{viewMode === 'grid' ? <ViewListIcon /> : <ViewModuleIcon />}</IconButton>
              </Tooltip>

              {/* 排序 */}
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>排序</InputLabel>
                <Select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    onSortChange?.(e.target.value, sortOrder);
                  }}
                  label="排序"
                >
                  {sortOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Tooltip title={`按${sortOrder === 'asc' ? '升序' : '降序'}排列`}>
                <IconButton onClick={toggleSortOrder}>
                  <SortIcon sx={{ transform: sortOrder === 'desc' ? 'rotate(180deg)' : 'none' }} />
                </IconButton>
              </Tooltip>

              {/* 高级过滤器切换 */}
              <Badge badgeContent={activeFiltersCount} color="primary">
                <Button
                  variant={expanded ? 'contained' : 'outlined'}
                  startIcon={<TuneIcon />}
                  endIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  onClick={() => setExpanded(!expanded)}
                >
                  高级过滤
                </Button>
              </Badge>
            </Box>
          </Box>

          {/* 结果统计 */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2" color="text.secondary">
              显示 {filteredCount} / {totalCount} 个优惠券
            </Typography>
            {activeFiltersCount > 0 && (
              <Button size="small" startIcon={<ClearIcon />} onClick={clearAllFilters} color="error">
                清除过滤器
              </Button>
            )}
          </Box>

          {/* 高级过滤器面板 */}
          <Collapse in={expanded}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>
              高级过滤选项
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* 第一行：类型和状态 */}
              <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                <FormControl sx={{ minWidth: 200 }}>
                  <InputLabel>优惠券类型</InputLabel>
                  <Select
                    multiple
                    value={filters.type}
                    onChange={(e) => handleMultiSelectChange('type', e.target.value)}
                    label="优惠券类型"
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => {
                          const option = typeOptions.find((opt) => opt.value === value);
                          return <Chip key={value} label={option?.label} size="small" color={option?.color} variant="outlined" />;
                        })}
                      </Box>
                    )}
                  >
                    {typeOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        <Chip label={option.label} size="small" color={option.color} variant="outlined" sx={{ mr: 1 }} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl sx={{ minWidth: 200 }}>
                  <InputLabel>状态</InputLabel>
                  <Select
                    multiple
                    value={filters.status}
                    onChange={(e) => handleMultiSelectChange('status', e.target.value)}
                    label="状态"
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => {
                          const option = statusOptions.find((opt) => opt.value === value);
                          return <Chip key={value} label={option?.label} size="small" color={option?.color} variant="outlined" />;
                        })}
                      </Box>
                    )}
                  >
                    {statusOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        <Chip label={option.label} size="small" color={option.color} variant="outlined" sx={{ mr: 1 }} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl sx={{ minWidth: 200 }}>
                  <InputLabel>来源</InputLabel>
                  <Select
                    multiple
                    value={filters.source}
                    onChange={(e) => handleMultiSelectChange('source', e.target.value)}
                    label="来源"
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => {
                          const option = sourceOptions.find((opt) => opt.value === value);
                          return <Chip key={value} label={option?.label} size="small" color={option?.color} variant="outlined" />;
                        })}
                      </Box>
                    )}
                  >
                    {sourceOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        <Chip label={option.label} size="small" color={option.color} variant="outlined" sx={{ mr: 1 }} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              {/* 第二行：数值范围和特殊过滤器 */}
              <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', alignItems: 'center' }}>
                <Box sx={{ minWidth: 300 }}>
                  <Typography variant="body2" gutterBottom>
                    优惠金额范围：${filters.valueRange[0]} - ${filters.valueRange[1]}
                  </Typography>
                  <Slider
                    value={filters.valueRange}
                    onChange={(e, value) => handleFilterChange('valueRange', value)}
                    valueLabelDisplay="auto"
                    min={0}
                    max={1000}
                    step={10}
                    marks={[
                      { value: 0, label: '$0' },
                      { value: 250, label: '$250' },
                      { value: 500, label: '$500' },
                      { value: 750, label: '$750' },
                      { value: 1000, label: '$1000+' }
                    ]}
                  />
                </Box>

                <FormControlLabel
                  control={<Switch checked={filters.expiringSoon} onChange={(e) => handleFilterChange('expiringSoon', e.target.checked)} />}
                  label="即将过期 (7天内)"
                />
              </Box>

              {/* 第三行：日期范围 */}
              <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                {/* TODO: 实际项目中这里需要使用DatePicker组件 */}
                <TextField
                  label="创建日期 - 开始"
                  type="date"
                  value={filters.dateRange[0] ? filters.dateRange[0].toISOString().split('T')[0] : ''}
                  onChange={(e) => {
                    const date = e.target.value ? new Date(e.target.value) : null;
                    handleFilterChange('dateRange', [date, filters.dateRange[1]]);
                  }}
                  InputLabelProps={{ shrink: true }}
                  sx={{ minWidth: 200 }}
                />

                <TextField
                  label="创建日期 - 结束"
                  type="date"
                  value={filters.dateRange[1] ? filters.dateRange[1].toISOString().split('T')[0] : ''}
                  onChange={(e) => {
                    const date = e.target.value ? new Date(e.target.value) : null;
                    handleFilterChange('dateRange', [filters.dateRange[0], date]);
                  }}
                  InputLabelProps={{ shrink: true }}
                  sx={{ minWidth: 200 }}
                />
              </Box>
            </Box>
          </Collapse>
        </CardContent>
      </Card>
    </LocalizationProvider>
  );
};

export default CouponFilter;
