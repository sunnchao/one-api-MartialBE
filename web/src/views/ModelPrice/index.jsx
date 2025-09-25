import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { Card, Stack, Typography, Tabs, Tab, InputBase, Avatar, Box, Chip, Grid, CardContent, IconButton, Tooltip } from '@mui/material';
import { Icon } from '@iconify/react';
import { API } from 'utils/api';
import { showError, ValueFormatter } from 'utils/common';
import { getSupportedEndpoints, getEndpointColor } from 'utils/endpointUtils';
import { useTheme } from '@mui/material/styles';
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
  const [unit] = useState('K');
  const [hideUnavailable] = useState(false);
  const userIsAdmin = useIsAdmin();

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

        const price = group
          ? {
              input: group.ratio * model?.price.input,
              output: group.ratio * model?.price.output,
              enable: model.groups.includes(selectedGroup),
              ratio: group.ratio
            }
          : {
              input: model?.price.input,
              output: model?.price.output,
              enable: false,
              ratio: 1
            };

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
          endPoints: model.end_points,
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
        backgroundColor: theme.palette.mode === 'dark' ? '#121212' : '#f5f5f5',
        p: { xs: 2, md: 3 }
      }}
    >
      {/* 搜索框 */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          mb: 4,
          mt: 2
        }}
      >
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            maxWidth: 500,
            backgroundColor: theme.palette.background.paper,
            borderRadius: 0,
            border: `1px solid ${theme.palette.divider}`,
            '&:focus-within': {
              borderColor: theme.palette.primary.main,
              boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.1)}`
            }
          }}
        >
          <InputBase
            sx={{
              width: '100%',
              px: 2,
              py: 1.5,
              '& input': {
                fontSize: '1rem'
              }
            }}
            placeholder="搜索提供商模型名称"
            value={searchQuery}
            onChange={handleSearchChange}
            startAdornment={
              <Icon icon="eva:search-fill" width={20} height={20} color={theme.palette.text.secondary} style={{ marginRight: 8 }} />
            }
          />
        </Box>
      </Box>

      {/* 用户分组选择器 */}
      {Object.keys(userGroupMap).length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="h6"
            sx={{
              mb: 2,
              color: theme.palette.text.primary,
              fontWeight: 600,
              fontSize: '16px'
            }}
          >
            选择用户分组
          </Typography>
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              ml: -2, // 负的左边距来抵消子元素的左边距
              '& > *': {
                ml: 2, // 给每个子元素添加左边距
                mb: 2 // 给每个子元素添加底部间距
              }
            }}
          >
            {Object.entries(userGroupMap).map(([key, group]) => (
              <Box
                key={key}
                onClick={() => handleGroupChange(key)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  px: 3,
                  py: 1.5,
                  borderRadius: 1,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  border: `2px solid ${selectedGroup === key ? theme.palette.primary.main : theme.palette.divider}`,
                  backgroundColor: selectedGroup === key ? alpha(theme.palette.primary.main, 0.08) : theme.palette.background.paper,
                  width: 200,
                  '&:hover': {
                    borderColor: theme.palette.primary.main,
                    backgroundColor: alpha(theme.palette.primary.main, 0.05)
                  }
                }}
              >
                {/* 左侧图标 */}
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    backgroundColor: selectedGroup === key ? theme.palette.primary.main : alpha(theme.palette.primary.main, 0.1),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <Icon
                    icon="ph:users-three-bold"
                    width={20}
                    height={20}
                    color={selectedGroup === key ? 'white' : theme.palette.primary.main}
                  />
                </Box>

                {/* 右侧信息 */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    variant="body1"
                    fontWeight={600}
                    sx={{
                      color: selectedGroup === key ? theme.palette.primary.main : theme.palette.text.primary,
                      fontSize: '16px',
                      mb: 0.5
                    }}
                  >
                    {group.name}
                  </Typography>

                  <Chip
                    label={group.ratio > 0 ? `${group.ratio}x 倍率` : '免费使用'}
                    size="small"
                    sx={{
                      backgroundColor: group.ratio > 0 ? alpha(theme.palette.info.main, 0.1) : alpha(theme.palette.success.main, 0.1),
                      color: group.ratio > 0 ? theme.palette.info.main : theme.palette.success.main,
                      fontWeight: 500,
                      fontSize: '0.75rem',
                      height: 22
                    }}
                  />
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {/* 提供商标签页 */}
      <Box sx={{ mb: 3 }}>
        <Tabs
          value={selectedOwnedBy}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            backgroundColor: theme.palette.background.paper,
            borderRadius: 1,
            border: `1px solid ${theme.palette.divider}`,
            py: 1,
            px: 1,
            '& .MuiTabs-indicator': {
              height: 3,
              backgroundColor: theme.palette.primary.main,
              borderRadius: '3px 3px 0 0'
            }
          }}
        >
          {uniqueOwnedBy.map((ownedBy, index) => (
            <Tab
              key={index}
              value={ownedBy.id}
              label={
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Avatar
                    src={getIconByName(ownedBy.name)}
                    sx={{
                      width: 20,
                      height: 20,
                      backgroundColor: 'transparent'
                    }}
                  >
                    {ownedBy.name.charAt(0).toUpperCase()}
                  </Avatar>
                  <Typography variant="body2" fontWeight={500}>
                    {ownedBy.name}
                  </Typography>
                </Stack>
              }
              sx={{
                px: 2,
                py: 1.5,
                minHeight: 'auto',
                textTransform: 'none',
                '&.Mui-selected': {
                  color: theme.palette.primary.main
                }
              }}
            />
          ))}
        </Tabs>
      </Box>

      {/* 模型卡片网格 */}
      <Grid container spacing={3}>
        {filteredRows.length > 0 ? (
          filteredRows.map((row) => (
            <Grid item xs={12} sm={6} md={4} lg={3} xl={2.4} key={row.id}>
              <Card
                sx={{
                  height: '100%',
                  backgroundColor: theme.palette.background.paper,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 1,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.1)}`
                  }
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  {/* 头部：图标 + 模型名称 */}
                  <Stack direction="row" alignItems="flex-start" spacing={2} sx={{ mb: 2 }}>
                    <Avatar
                      src={getIconByName(row.provider)}
                      sx={{
                        width: 40,
                        height: 40,
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                        flexShrink: 0,
                        '.MuiAvatar-img': {
                          objectFit: 'contain',
                          padding: '4px'
                        }
                      }}
                    >
                      <Icon icon="ph:cube-bold" width={24} height={24} color={theme.palette.primary.main} />
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 0.5 }}>
                        <Typography
                          variant="h6"
                          fontWeight={600}
                          sx={{
                            fontSize: '1rem',
                            color: theme.palette.text.primary,
                            flex: 1,
                            lineHeight: 1.3,
                            wordBreak: 'break-all'
                          }}
                        >
                          {row.model}
                        </Typography>
                        <Tooltip title="复制模型名称" arrow>
                          <IconButton
                            size="small"
                            onClick={() => {
                              navigator.clipboard.writeText(row.model);
                            }}
                            sx={{
                              p: 0.5,
                              opacity: 0.7,
                              flexShrink: 0,
                              mt: -0.5,
                              '&:hover': {
                                opacity: 1,
                                backgroundColor: alpha(theme.palette.primary.main, 0.1)
                              }
                            }}
                          >
                            <Icon icon="eva:copy-outline" width={16} height={16} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                  </Stack>

                  {/* 提供商名称 */}
                  <Typography
                    variant="body2"
                    sx={{
                      color: theme.palette.text.secondary,
                      fontSize: '0.875rem',
                      mb: 2,
                      fontWeight: 500
                    }}
                  >
                    {row.provider}
                  </Typography>

                  {/* 价格信息 */}
                  <Box sx={{ mb: 2, minHeight: 80, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <Box>
                      {row.type === 'times' ? (
                        <>
                          {row.ratio !== 1 && (
                            <Typography
                              variant="body2"
                              sx={{
                                color: theme.palette.text.secondary,
                                mb: 0.5,
                                textDecoration: 'line-through',
                                fontSize: '0.8rem'
                              }}
                            >
                              原价: {row.originalInput}
                            </Typography>
                          )}
                          <Typography
                            variant="body2"
                            sx={{
                              color: theme.palette.text.primary,
                              fontWeight: 600,
                              mb: 1
                            }}
                          >
                            价格: {row.input}
                          </Typography>
                        </>
                      ) : (
                        <>
                          {row.ratio !== 1 && (
                            <Typography
                              variant="body2"
                              sx={{
                                color: theme.palette.text.secondary,
                                mb: 0.5,
                                textDecoration: 'line-through',
                                fontSize: '0.75rem'
                              }}
                            >
                              原价 - 输入: {row.originalInput} | 输出: {row.originalOutput}
                            </Typography>
                          )}
                          <Typography
                            variant="body2"
                            sx={{
                              color: theme.palette.text.primary,
                              fontWeight: 600,
                              mb: 0.5
                            }}
                          >
                            输入: {row.input}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              color: theme.palette.text.primary,
                              fontWeight: 600
                            }}
                          >
                            输出: {row.output}
                          </Typography>
                        </>
                      )}
                    </Box>

                    {/* 显示倍率信息 */}
                    {row.ratio !== 1 && (
                      <Typography
                        variant="body2"
                        sx={{
                          color: theme.palette.primary.main,
                          fontWeight: 600,
                          mt: 1,
                          fontSize: '0.85rem'
                        }}
                      >
                        当前倍率: {row.ratio}x
                      </Typography>
                    )}
                  </Box>

                  {/* 计费类型和可用性状态 */}
                  <Box sx={{ mb: 2 }}>
                    <Stack direction="row" spacing={1} sx={{ mb: 1, flexWrap: 'wrap', gap: 1 }}>
                      <Chip
                        label={row.type === 'times' ? '按次计费' : '按量计费'}
                        size="small"
                        sx={{
                          backgroundColor:
                            row.type === 'times' ? alpha(theme.palette.warning.main, 0.2) : alpha(theme.palette.success.main, 0.2),
                          color: row.type === 'times' ? theme.palette.warning.dark : theme.palette.success.dark,
                          fontWeight: 500
                        }}
                      />
                      <Chip
                        label={row.enable ? '当前分组可用' : '当前分组不可用'}
                        size="small"
                        sx={{
                          backgroundColor: row.enable ? theme.palette.success.light : theme.palette.error.light,
                          color: row.enable ? theme.palette.success.dark : theme.palette.error.dark,
                          fontWeight: 500
                        }}
                      />
                    </Stack>

                    {/* 支持的分组信息 */}
                    {row.userGroup && row.userGroup.length > 0 && (
                      <Box>
                        <Typography
                          variant="caption"
                          sx={{
                            color: theme.palette.text.secondary,
                            display: 'block',
                            mb: 0.5,
                            fontSize: '0.75rem'
                          }}
                        >
                          支持分组:
                        </Typography>
                        <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
                          {row.userGroup.map((group) => (
                            <Chip
                              key={group}
                              label={userGroupMap[group]?.name || group}
                              size="small"
                              onClick={() => handleGroupChange(group)}
                              variant={selectedGroup === group ? 'filled' : 'outlined'}
                              sx={{
                                fontSize: '12px',
                                height: 26,
                                cursor: 'pointer',
                                ...(selectedGroup === group
                                  ? {
                                      backgroundColor: theme.palette.primary.main,
                                      color: 'white',
                                      '&:hover': {
                                        backgroundColor: theme.palette.text.primary
                                      }
                                    }
                                  : {
                                      borderColor: theme.palette.primary.main,
                                      color: theme.palette.primary.main,
                                      '&:hover': {
                                        backgroundColor: theme.palette.primary.main,
                                        color: 'white'
                                      }
                                    })
                              }}
                            />
                          ))}
                        </Stack>
                      </Box>
                    )}
                  </Box>

                  {/* 支持的端点信息 */}
                  {row.endPoints && row.endPoints.length > 0 && (
                    <Box>
                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontSize: '0.75rem' }}>
                        支持端点:
                      </Typography>
                      <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                        {getSupportedEndpoints(row.endPoints).map((endpointType) => {
                          const colorConfig = getEndpointColor(endpointType);
                          return (
                            <Chip
                              key={endpointType}
                              label={endpointType}
                              size="small"
                              sx={{
                                backgroundColor: colorConfig.backgroundColor,
                                color: colorConfig.color,
                                fontWeight: 500,
                                fontSize: '0.75rem',
                                height: 24
                              }}
                            />
                          );
                        })}
                      </Stack>
                    </Box>
                  )}
                </CardContent>

                {/* <CardActions sx={{ px: 3, pb: 3, pt: 0 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    sx={{
                      borderRadius: 1,
                      textTransform: 'none',
                      fontWeight: 500,
                      flex: 1
                    }}
                  >
                    控制计费
                  </Button>
                </CardActions> */}
              </Card>
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Box
              sx={{
                textAlign: 'center',
                py: 8,
                backgroundColor: theme.palette.background.paper,
                borderRadius: 0,
                border: `1px solid ${theme.palette.divider}`
              }}
            >
              <Icon icon="eva:search-outline" width={64} height={64} color={theme.palette.text.secondary} />
              <Typography
                variant="h6"
                sx={{
                  mt: 2,
                  mb: 1,
                  color: theme.palette.text.secondary
                }}
              >
                未找到匹配的模型
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: theme.palette.text.secondary
                }}
              >
                请尝试调整搜索条件
              </Typography>
            </Box>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}
