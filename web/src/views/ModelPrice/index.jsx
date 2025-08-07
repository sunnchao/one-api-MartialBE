import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import {
  Card,
  Stack,
  Typography,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  InputBase,
  IconButton,
  Avatar,
  Box,
  Chip,
  Divider,
  Grid,
  Paper,
  FormControlLabel,
  Switch
} from '@mui/material';
import { Icon } from '@iconify/react';
import { API } from 'utils/api';
import { showError, ValueFormatter, copy } from 'utils/common';
import { useTheme } from '@mui/material/styles';
import IconWrapper from 'ui-component/IconWrapper';
import ToggleButtonGroup from 'ui-component/ToggleButton';
import { useIsAdmin } from 'utils/common';
import { alpha } from '@mui/material/styles';

// ----------------------------------------------------------------------
export default function ModelPrice() {
  const { t } = useTranslation();
  const theme = useTheme();
  const ownedby = useSelector((state) => state.siteInfo?.ownedby);

  const [filteredRows, setFilteredRows] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [availableModels, setAvailableModels] = useState({});
  const [userGroupMap, setUserGroupMap] = useState({});
  const [selectedGroup, setSelectedGroup] = useState('default');
  const [selectedOwnedBy, setSelectedOwnedBy] = useState(1);
  const [unit, setUnit] = useState('K');
  const [hideUnavailable, setHideUnavailable] = useState(false);
  const userIsAdmin = useIsAdmin();

  const unitOptions = [
    { value: 'K', label: 'K' },
    { value: 'M', label: 'M' }
  ];

  const fetchAvailableModels = useCallback(async () => {
    try {
      const res = await API.get('/api/available_model');
      const { success, message, data } = res.data;
      if (success) {
        setAvailableModels(data);
        setSelectedOwnedBy(1);
      } else {
        showError(message);
      }
    } catch (error) {
      console.error(error);
    }
  }, []);

  const fetchUserGroupMap = useCallback(async () => {
    try {
      const res = await API.get(userIsAdmin ? '/api/user_group_map_by_admin' : '/api/user_group_map');
      const { success, message, data } = res.data;
      if (success) {
        setUserGroupMap(data);
      } else {
        showError(message);
      }
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    fetchAvailableModels();
    fetchUserGroupMap();
  }, [fetchAvailableModels, fetchUserGroupMap]);

  useEffect(() => {
    if (!availableModels || !userGroupMap || !selectedGroup) return;

    const calculatedRows = Object.entries(availableModels)
      .filter(([, model]) => model.owned_by_id === selectedOwnedBy)
      .map(([modelName, model], index) => {
        const group = userGroupMap[selectedGroup];
        const originalPrice = {
          input: model?.price.input,
          output: model?.price.output
        };

        const price =
          group && model.groups.includes(selectedGroup)
            ? {
                input: group?.ratio * model?.price.input,
                output: group?.ratio * model?.price.output,
                enable: true
              }
            : { input: t('modelpricePage.noneGroup'), output: t('modelpricePage.noneGroup'), enable: false };

        const formatPrice = (value, type) => {
          if (typeof value === 'number') {
            let nowUnit = '';
            let isM = unit === 'M';
            if (type === 'times') {
              isM = false;
            }
            if (type === 'tokens') {
              nowUnit = `/ 1${unit}`;
            }
            return ValueFormatter(value, true, isM) + nowUnit;
          }
          return value;
        };

        return {
          id: index + 1,
          model: modelName,
          provider: model.owned_by,
          userGroup: model.groups,
          type: model.price.type,
          originalInput: formatPrice(originalPrice.input, model.price.type),
          originalOutput: formatPrice(originalPrice.output, model.price.type),
          input: formatPrice(price.input, model.price.type),
          output: formatPrice(price.output, model.price.type),
          ratio: group?.ratio || 1,
          extraRatios: model.price?.extra_ratios,
          enable: price.enable
        };
      });

    let filtered = calculatedRows.filter((row) => row.model.toLowerCase().includes(searchQuery.toLowerCase()));

    // 如果启用了隐藏不可用模型，则过滤掉不可用的模型
    if (hideUnavailable) {
      filtered = filtered.filter((row) => row.enable);
    }

    setFilteredRows(filtered);
  }, [availableModels, userGroupMap, selectedGroup, selectedOwnedBy, t, unit, searchQuery, hideUnavailable]);

  const handleTabChange = (event, newValue) => {
    setSelectedOwnedBy(newValue);
  };

  const handleGroupChange = (groupKey) => {
    setSelectedGroup(groupKey);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleUnitChange = (event, newUnit) => {
    if (newUnit !== null) {
      setUnit(newUnit);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  const handleHideUnavailableChange = (event) => {
    setHideUnavailable(event.target.checked);
  };

  const uniqueOwnedBy = [
    ...new Set(Object.values(availableModels).map((model) => JSON.stringify({ id: model.owned_by_id, name: model.owned_by })))
  ].map((item) => JSON.parse(item));
  uniqueOwnedBy.sort((a, b) => a.id - b.id);
  const zeroId = uniqueOwnedBy.find((item) => item.id === 0);
  if (zeroId) {
    uniqueOwnedBy.splice(uniqueOwnedBy.indexOf(zeroId), 1);
    uniqueOwnedBy.push(zeroId);
  }

  const getIconByName = (name) => {
    if (name === 'all') return null;
    const owner = ownedby.find((item) => item.name === name);
    return owner?.icon;
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: theme.palette.mode === 'dark' ? '#0a0a0a' : '#f8fafc',
        p: { xs: 2, md: 4 }
      }}
    >
      {/* 页面标题区域 */}
      <Paper
        elevation={0}
        sx={{
          p: 4,
          mb: 2,
          backgroundColor: theme.palette.background.paper,
          borderRadius: 0,
          border: `1px solid ${theme.palette.divider}`,
          borderLeft: `4px solid ${theme.palette.primary.main}`
        }}
      >
        <Stack spacing={2}>
          <Typography
            variant="h4"
            fontWeight={700}
            sx={{
              color: theme.palette.text.primary,
              letterSpacing: '-0.025em'
            }}
          >
            模型价格详情
          </Typography>
          {/* <Typography
            variant="body1"
            sx={{
              color: theme.palette.text.secondary,
              fontSize: '1.1rem',
              lineHeight: 1.6
            }}
          >
            清晰展示原始价格与用户组倍率计算后的最终价格
          </Typography> */}
        </Stack>
      </Paper>

      {/* 用户组选择区域 */}
      <Paper
        elevation={0}
        sx={{
          p: 4,
          mb: 2,
          backgroundColor: theme.palette.background.paper,
          borderRadius: 0,
          border: `1px solid ${theme.palette.divider}`
        }}
      >
        <Typography variant="h6" fontWeight={600} sx={{ mb: 3, color: theme.palette.text.primary }}>
          选择用户组
        </Typography>

        <Grid container spacing={2}>
          {Object.entries(userGroupMap).map(([key, group]) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={key}>
              <Card
                onClick={() => handleGroupChange(key)}
                sx={{
                  height: '100%',
                  cursor: 'pointer',
                  borderRadius: 0,
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  border: `2px solid ${selectedGroup === key ? theme.palette.primary.main : theme.palette.divider}`,
                  backgroundColor: selectedGroup === key ? alpha(theme.palette.primary.main, 0.05) : theme.palette.background.paper,
                  transform: selectedGroup === key ? 'translateY(-2px)' : 'none',
                  boxShadow: selectedGroup === key ? `0 8px 24px ${alpha(theme.palette.primary.main, 0.15)}` : '0 2px 4px rgba(0,0,0,0.05)',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.15)}`,
                    borderColor: theme.palette.primary.main
                  }
                }}
              >
                <Box sx={{ p: 2 }}>
                  <Stack spacing={2} alignItems="center" textAlign="center">
                    <Typography
                      variant="h6"
                      fontWeight={600}
                      sx={{
                        color: selectedGroup === key ? theme.palette.primary.main : theme.palette.text.primary,
                        fontSize: '1.1rem'
                      }}
                    >
                      {group.name}
                    </Typography>

                    <Box>
                      {group.ratio > 0 ? (
                        <Chip
                          label={`${group.ratio}x 倍率`}
                          size="medium"
                          sx={{
                            borderRadius: 0,
                            fontSize: '14px',
                            height: 'auto',
                            backgroundColor: group.ratio > 1 ? theme.palette.primary.main : theme.palette.primary.main,
                            color: theme.palette.common.white,
                            '& .MuiChip-label': {
                              px: 1
                            }
                          }}
                        />
                      ) : (
                        <Chip
                          label="免费使用"
                          size="medium"
                          sx={{
                            borderRadius: 0,
                            fontWeight: 600,
                            fontSize: '0.9rem',
                            px: 2,
                            py: 1,
                            height: 'auto',
                            backgroundColor: theme.palette.success.main,
                            color: theme.palette.common.white,
                            '& .MuiChip-label': {
                              px: 1
                            }
                          }}
                        />
                      )}
                    </Box>
                  </Stack>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* 搜索和筛选工具栏 */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 2,
          backgroundColor: theme.palette.background.paper,
          borderRadius: 0,
          border: `1px solid ${theme.palette.divider}`
        }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={3}
          alignItems={{ xs: 'stretch', md: 'center' }}
          justifyContent="space-between"
        >
          {/* 搜索框 */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              width: { xs: '100%', md: 400 },
              border: `2px solid ${theme.palette.divider}`,
              borderRadius: 0,
              backgroundColor: theme.palette.background.default,
              transition: 'border-color 0.2s ease',
              '&:hover': {
                borderColor: theme.palette.primary.light
              },
              '&:focus-within': {
                borderColor: theme.palette.primary.main,
                boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.1)}`
              }
            }}
          >
            <Box sx={{ p: 1.5, display: 'flex', alignItems: 'center' }}>
              <Icon icon="eva:search-fill" width={20} height={20} color={theme.palette.text.secondary} />
            </Box>
            <InputBase
              sx={{
                flex: 1,
                px: 1,
                '& input': {
                  padding: '8px 0',
                  fontSize: '1rem'
                }
              }}
              placeholder="搜索模型名称..."
              value={searchQuery}
              onChange={handleSearchChange}
            />
            {searchQuery && (
              <IconButton
                onClick={clearSearch}
                sx={{
                  p: 1.5,
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.1)
                  }
                }}
              >
                <Icon icon="eva:close-fill" width={18} height={18} />
              </IconButton>
            )}
          </Box>

          {/* 控制选项组 */}
          <Stack direction="row" alignItems="center" spacing={4}>
            {/* 单位选择 */}
            <Stack direction="row" alignItems="center" spacing={2}>
              <Typography
                variant="body2"
                fontWeight={600}
                sx={{
                  color: theme.palette.text.primary,
                  fontSize: '0.95rem',
                  minWidth: 'fit-content'
                }}
              >
                计费单位:
              </Typography>
              <ToggleButtonGroup
                value={unit}
                onChange={handleUnitChange}
                options={unitOptions}
                size="medium"
                sx={{
                  '& .MuiToggleButtonGroup-grouped': {
                    borderRadius: '0 !important',
                    border: `2px solid ${theme.palette.divider}`,
                    px: 3,
                    py: 1,
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    '&.Mui-selected': {
                      backgroundColor: theme.palette.primary.main,
                      color: theme.palette.primary.contrastText,
                      borderColor: theme.palette.primary.main,
                      '&:hover': {
                        backgroundColor: theme.palette.primary.dark
                      }
                    },
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      borderColor: theme.palette.primary.light
                    }
                  }
                }}
              />
            </Stack>

            {/* 隐藏不可用模型开关 */}
            <FormControlLabel
              control={
                <Switch
                  checked={hideUnavailable}
                  onChange={handleHideUnavailableChange}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: theme.palette.primary.main,
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.1)
                      }
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: theme.palette.primary.main
                    }
                  }}
                />
              }
              label={
                <Typography
                  variant="body2"
                  fontWeight={600}
                  sx={{
                    color: theme.palette.text.primary,
                    fontSize: '0.95rem'
                  }}
                >
                  隐藏不可用模型
                </Typography>
              }
            />
          </Stack>
        </Stack>
      </Paper>

      {/* 提供商标签页 */}
      <Paper
        elevation={0}
        sx={{
          mb: 2,
          backgroundColor: theme.palette.background.paper,
          borderRadius: 0,
          border: `1px solid ${theme.palette.divider}`,
          overflow: 'hidden'
        }}
      >
        <Tabs
          value={selectedOwnedBy}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            backgroundColor: alpha(theme.palette.primary.main, 0.02),
            borderBottom: `1px solid ${theme.palette.divider}`,
            '& .MuiTabs-flexContainer': {
              minHeight: 60
            },
            '& .MuiTabs-indicator': {
              height: 4,
              borderRadius: 0,
              backgroundColor: theme.palette.primary.main
            }
          }}
        >
          {uniqueOwnedBy.map((ownedBy, index) => (
            <Tab
              key={index}
              value={ownedBy.id}
              label={
                <Stack direction="row" alignItems="center" spacing={2}>
                  <IconWrapper url={getIconByName(ownedBy.name)} />
                  <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.95rem' }}>
                    {ownedBy.name}
                  </Typography>
                </Stack>
              }
              sx={{
                px: 3,
                py: 2,
                minHeight: 60,
                borderRadius: 0,
                textTransform: 'none',
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.05)
                },
                '&.Mui-selected': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.08),
                  color: theme.palette.primary.main
                }
              }}
            />
          ))}
        </Tabs>
      </Paper>

      {/* 价格表格 */}
      <Paper
        elevation={0}
        sx={{
          backgroundColor: theme.palette.background.paper,
          borderRadius: 0,
          border: `1px solid ${theme.palette.divider}`,
          overflow: 'hidden'
        }}
      >
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow
                sx={{
                  backgroundColor: alpha(theme.palette.primary.main, 0.08),
                  '& th': {
                    borderBottom: `2px solid ${theme.palette.divider}`
                  }
                }}
              >
                <TableCell
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    py: 2.5,
                    color: theme.palette.text.primary,
                    textAlign: 'center',
                    minWidth: 200
                  }}
                >
                  模型名称
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    py: 2.5,
                    color: theme.palette.text.primary,
                    textAlign: 'center',
                    minWidth: 120
                  }}
                >
                  提供商
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    py: 2.5,
                    color: theme.palette.text.primary,
                    textAlign: 'center',
                    minWidth: 150
                  }}
                >
                  可用分组
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    py: 2.5,
                    color: theme.palette.text.primary,
                    textAlign: 'center',
                    minWidth: 100
                  }}
                >
                  计费类型
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    py: 2.5,
                    color: theme.palette.text.primary,
                    textAlign: 'center',
                    minWidth: 280
                  }}
                >
                  <Stack spacing={1} alignItems="center">
                    <span>价格详情</span>
                    <Chip
                      label={`倍率: ${userGroupMap[selectedGroup]?.ratio || 1}x`}
                      size="small"
                      sx={{
                        borderRadius: 0,
                        fontWeight: 600,
                        fontSize: '0.8rem',
                        backgroundColor: userGroupMap[selectedGroup]?.ratio > 1 ? theme.palette.warning.main : theme.palette.success.main,
                        color: theme.palette.common.white
                      }}
                    />
                  </Stack>
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    py: 2.5,
                    color: theme.palette.text.primary,
                    textAlign: 'center',
                    minWidth: 120
                  }}
                >
                  其他信息
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRows.length > 0 ? (
                filteredRows.map((row) => (
                  <TableRow
                    key={row.id}
                    sx={{
                      '&:nth-of-type(odd)': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.02)
                      },
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.05)
                      },
                      transition: 'background-color 0.2s ease'
                    }}
                  >
                    {/* 模型名称 */}
                    <TableCell sx={{ py: 3, textAlign: 'center' }}>
                      <Stack direction="row" alignItems="center" justifyContent="center" spacing={1}>
                        <Typography
                          variant="body2"
                          fontWeight={600}
                          sx={{
                            color: theme.palette.text.primary,
                            fontSize: '0.9rem'
                          }}
                        >
                          {row.model}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => copy(row.model)}
                          sx={{
                            p: 0.5,
                            '&:hover': {
                              backgroundColor: alpha(theme.palette.primary.main, 0.1)
                            }
                          }}
                        >
                          <Icon icon="eva:copy-outline" width={16} height={16} />
                        </IconButton>
                      </Stack>
                    </TableCell>

                    {/* 提供商 */}
                    <TableCell sx={{ py: 3, textAlign: 'center' }}>
                      <Stack direction="row" alignItems="center" justifyContent="center" spacing={1}>
                        <Avatar
                          src={getIconByName(row.provider)}
                          alt={row.provider}
                          sx={{
                            width: 24,
                            height: 24,
                            backgroundColor: theme.palette.background.paper,
                            '.MuiAvatar-img': {
                              objectFit: 'contain',
                              padding: '2px'
                            }
                          }}
                        >
                          {row.provider?.charAt(0).toUpperCase()}
                        </Avatar>
                        <Typography
                          variant="body2"
                          sx={{
                            fontSize: '0.9rem',
                            fontWeight: 500
                          }}
                        >
                          {row.provider}
                        </Typography>
                      </Stack>
                    </TableCell>

                    {/* 可用分组 */}
                    <TableCell sx={{ py: 3, textAlign: 'center' }}>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, justifyContent: 'center', maxWidth: 120 }}>
                        {row.userGroup && row.userGroup.length > 0 ? (
                          row.userGroup.map((group) => (
                            <Chip
                              key={group}
                              label={userGroupMap[group]?.name || group}
                              size="small"
                              onClick={() => handleGroupChange(group)}
                              sx={{
                                borderRadius: 0,
                                fontSize: '0.7rem',
                                fontWeight: 600,
                                height: 22,
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                backgroundColor:
                                  selectedGroup === group ? theme.palette.primary.main : alpha(theme.palette.primary.main, 0.1),
                                color: selectedGroup === group ? theme.palette.common.white : theme.palette.primary.main,
                                border: `1px solid ${selectedGroup === group ? theme.palette.primary.main : theme.palette.primary.light}`,
                                '&:hover': {
                                  backgroundColor: theme.palette.primary.main,
                                  color: theme.palette.common.white,
                                  transform: 'translateY(-1px)',
                                  boxShadow: `0 4px 8px ${alpha(theme.palette.primary.main, 0.3)}`
                                }
                              }}
                            />
                          ))
                        ) : (
                          <Typography
                            variant="body2"
                            sx={{
                              color: theme.palette.text.secondary,
                              fontSize: '0.8rem',
                              fontStyle: 'italic'
                            }}
                          >
                            无可用分组
                          </Typography>
                        )}
                      </Box>
                    </TableCell>

                    {/* 计费类型 */}
                    <TableCell sx={{ py: 3, textAlign: 'center' }}>
                      <Chip
                        label={row.type === 'tokens' ? '按Token计费' : '按次计费'}
                        size="small"
                        sx={{
                          borderRadius: 0,
                          fontWeight: 600,
                          fontSize: '0.8rem',
                          backgroundColor: row.type === 'tokens' ? theme.palette.primary.main : theme.palette.secondary.main,
                          color: theme.palette.common.white
                        }}
                      />
                    </TableCell>

                    {/* 价格详情 - 合并列 */}
                    <TableCell sx={{ py: 3 }}>
                      {row.enable ? (
                        <Stack spacing={2} alignItems="center">
                          {/* 输入价格流程 */}
                          <Box sx={{ textAlign: 'center', width: '100%' }}>
                            <Typography
                              variant="caption"
                              sx={{ color: theme.palette.text.secondary, fontSize: '0.75rem', mb: 1, display: 'block' }}
                            >
                              输入价格
                            </Typography>
                            <Stack direction="row" alignItems="center" justifyContent="center" spacing={1.5}>
                              <Typography
                                variant="body2"
                                fontWeight={500}
                                sx={{
                                  color: theme.palette.text.secondary,
                                  fontSize: '0.85rem',
                                  fontFamily: 'monospace',
                                  minWidth: 60,
                                  textAlign: 'right'
                                }}
                              >
                                {row.originalInput}
                              </Typography>
                              <Icon icon="eva:arrow-right-fill" width={16} height={16} color={theme.palette.text.secondary} />
                              <Chip
                                label={`${row.ratio}x`}
                                size="small"
                                sx={{
                                  borderRadius: 0,
                                  fontSize: '0.7rem',
                                  fontWeight: 600,
                                  height: 20,
                                  backgroundColor: row.ratio > 1 ? theme.palette.warning.main : theme.palette.success.main,
                                  color: theme.palette.common.white,
                                  minWidth: 35
                                }}
                              />
                              <Icon icon="eva:arrow-right-fill" width={16} height={16} color={theme.palette.primary.main} />
                              <Typography
                                variant="body2"
                                fontWeight={700}
                                sx={{
                                  color: theme.palette.primary.main,
                                  fontSize: '0.9rem',
                                  fontFamily: 'monospace',
                                  minWidth: 60,
                                  textAlign: 'left'
                                }}
                              >
                                {row.input}
                              </Typography>
                            </Stack>
                          </Box>

                          <Divider sx={{ width: '80%', borderColor: theme.palette.divider }} />

                          {/* 输出价格流程 */}
                          <Box sx={{ textAlign: 'center', width: '100%' }}>
                            <Typography
                              variant="caption"
                              sx={{ color: theme.palette.text.secondary, fontSize: '0.75rem', mb: 1, display: 'block' }}
                            >
                              输出价格
                            </Typography>
                            <Stack direction="row" alignItems="center" justifyContent="center" spacing={1.5}>
                              <Typography
                                variant="body2"
                                fontWeight={500}
                                sx={{
                                  color: theme.palette.text.secondary,
                                  fontSize: '0.85rem',
                                  fontFamily: 'monospace',
                                  minWidth: 60,
                                  textAlign: 'right'
                                }}
                              >
                                {row.originalOutput}
                              </Typography>
                              <Icon icon="eva:arrow-right-fill" width={16} height={16} color={theme.palette.text.secondary} />
                              <Chip
                                label={`${row.ratio}x`}
                                size="small"
                                sx={{
                                  borderRadius: 0,
                                  fontSize: '0.7rem',
                                  fontWeight: 600,
                                  height: 20,
                                  backgroundColor: row.ratio > 1 ? theme.palette.warning.main : theme.palette.success.main,
                                  color: theme.palette.common.white,
                                  minWidth: 35
                                }}
                              />
                              <Icon icon="eva:arrow-right-fill" width={16} height={16} color={theme.palette.primary.main} />
                              <Typography
                                variant="body2"
                                fontWeight={700}
                                sx={{
                                  color: theme.palette.primary.main,
                                  fontSize: '0.9rem',
                                  fontFamily: 'monospace',
                                  minWidth: 60,
                                  textAlign: 'left'
                                }}
                              >
                                {row.output}
                              </Typography>
                            </Stack>
                          </Box>
                        </Stack>
                      ) : (
                        <Box sx={{ textAlign: 'center', py: 3 }}>
                          <Typography
                            variant="body2"
                            sx={{
                              color: theme.palette.error.main,
                              fontSize: '0.9rem',
                              fontWeight: 600
                            }}
                          >
                            当前分组不可用
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              color: theme.palette.text.secondary,
                              fontSize: '0.8rem'
                            }}
                          >
                            请选择其他分组
                          </Typography>
                        </Box>
                      )}
                    </TableCell>

                    {/* 其他信息 */}
                    <TableCell sx={{ py: 3, textAlign: 'center' }}>{getOther(t, row.extraRatios)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} sx={{ py: 8, textAlign: 'center' }}>
                    <Stack spacing={2} alignItems="center">
                      <Icon icon="eva:search-outline" width={48} height={48} color={theme.palette.text.secondary} />
                      <Typography
                        variant="h6"
                        sx={{
                          color: theme.palette.text.secondary,
                          fontWeight: 500
                        }}
                      >
                        未找到匹配的模型
                      </Typography>
                      <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                        请尝试调整搜索条件或选择其他用户组
                      </Typography>
                    </Stack>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}

function getOther(t, extraRatios) {
  if (!extraRatios || Object.keys(extraRatios).length === 0) {
    return (
      <Typography
        variant="body2"
        sx={{
          color: '#9ca3af',
          fontSize: '0.8rem',
          fontStyle: 'italic'
        }}
      >
        -
      </Typography>
    );
  }

  return (
    <Stack spacing={0.5} alignItems="center">
      {Object.entries(extraRatios).map(([key, value]) => (
        <Chip
          key={key}
          label={`${t(`modelpricePage.${key}`)}: ${value}`}
          size="small"
          variant="outlined"
          sx={{
            borderRadius: 0,
            fontSize: '0.75rem',
            fontWeight: 500,
            borderColor: '#e5e7eb',
            color: '#6b7280',
            '& .MuiChip-label': {
              px: 1
            }
          }}
        />
      ))}
    </Stack>
  );
}
