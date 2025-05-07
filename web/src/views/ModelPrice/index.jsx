import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import {
  Card,
  Stack,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  InputBase,
  Paper,
  IconButton,
  Fade,
  useMediaQuery,
  Avatar,
  ButtonBase,
  Tooltip
} from '@mui/material';
import { Icon } from '@iconify/react';
import { API } from 'utils/api';
import { showError, ValueFormatter, copy } from 'utils/common';
import { useTheme } from '@mui/material/styles';
import Label from 'ui-component/Label';
import ToggleButtonGroup from 'ui-component/ToggleButton';
import { useIsAdmin } from 'utils/common';
import { alpha } from '@mui/material/styles';

// ----------------------------------------------------------------------
export default function ModelPrice() {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const ownedby = useSelector((state) => state.siteInfo?.ownedby);

  const [rows, setRows] = useState([]);
  const [filteredRows, setFilteredRows] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [availableModels, setAvailableModels] = useState({});
  const [userGroupMap, setUserGroupMap] = useState({});
  const [selectedGroup, setSelectedGroup] = useState('default');
  const [selectedOwnedBy, setSelectedOwnedBy] = useState(1);
  const [unit, setUnit] = useState('K');
  const [onlyShowAvailable, setOnlyShowAvailable] = useState(false);
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
      .filter(([, model]) => !onlyShowAvailable || model.groups.includes(selectedGroup))
      .map(([modelName, model], index) => {
        const group = userGroupMap[selectedGroup];
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
          input: formatPrice(price.input, model.price.type),
          output: formatPrice(price.output, model.price.type),
          extraRatios: model.price?.extra_ratios,
          enable: price.enable
        };
      });

    const filtered = calculatedRows.filter((row) => row.model.toLowerCase().includes(searchQuery.toLowerCase()));
    setFilteredRows(filtered);
  }, [availableModels, userGroupMap, selectedGroup, selectedOwnedBy, t, unit, onlyShowAvailable]);

  useEffect(() => {
    const filtered = rows.filter((row) => row.model.toLowerCase().includes(searchQuery.toLowerCase()));
    setFilteredRows(filtered);
  }, [searchQuery, rows]);

  const handleOwnedByChange = (newValue) => {
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

  const toggleOnlyShowAvailable = () => {
    setOnlyShowAvailable((prev) => !prev);
  };

  const uniqueOwnedBy = [
    ...new Set(Object.values(availableModels).map((model) => JSON.stringify({ id: model.owned_by_id, name: model.owned_by })))
  ].map((item) => JSON.parse(item));
  // 根据id排序 升序
  uniqueOwnedBy.sort((a, b) => a.id - b.id);
  // uniqueOwnedBy id 为 0 的放在最后
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

  const clearSearch = () => {
    setSearchQuery('');
  };

  return (
    <Stack spacing={2} sx={{ backgroundColor: theme.palette.background.default, p: 1 }}>
      <Stack direction="column" spacing={1}>
        <Typography variant="h2">{t('modelpricePage.availableModels')}</Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Available Models
        </Typography>
      </Stack>

      <Card sx={{ p: 2 }}>
        <Stack spacing={2}>
          {/* <Typography variant="subtitle2" color="textSecondary">
            {t('modelpricePage.group')}
          </Typography> */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
              gap: 2
            }}
          >
            {Object.entries(userGroupMap).map(([key, group]) => (
              <Card
                key={key}
                onClick={() => handleGroupChange({ target: { value: key } })}
                sx={{
                  p: 2,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-in-out',
                  transform: selectedGroup === key ? 'scale(1.02)' : 'none',
                  border: (theme) => `1px solid ${selectedGroup === key ? theme.palette.primary.main : theme.palette.divider}`,
                  backgroundColor: (theme) => (selectedGroup === key ? theme.palette.primary.light : theme.palette.background.paper),
                  '&:hover': {
                    transform: 'scale(1.02)',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                  }
                }}
              >
                <Stack spacing={1.5}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6" color={selectedGroup === key ? 'primary.main' : 'text.primary'}>
                      {group.name}
                    </Typography>
                  </Stack>
                  <Stack spacing={1}>
                    <Typography variant="body2" color="text.secondary">
                      {t('modelpricePage.rate')}：{' '}
                      {group.ratio > 0 ? (
                        <Label color={group.ratio > 1 ? 'warning' : 'info'}>x{group.ratio}</Label>
                      ) : (
                        <Label color="success">{t('modelpricePage.free')}</Label>
                      )}
                    </Typography>
                  </Stack>
                </Stack>
              </Card>
            ))}
          </Box>
          <Stack direction="row" spacing={2} alignItems="center">
            <TextField
              placeholder={t('modelpricePage.search')}
              value={searchQuery}
              onChange={handleSearchChange}
              variant="outlined"
              size="small"
              sx={{ backgroundColor: theme.palette.background.paper }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                )
              }}
            />
            <ToggleButtonGroup value={unit} onChange={handleUnitChange} options={unitOptions} aria-label="unit toggle" />
          </Stack>
        </Stack>
      </Card>

      {/* 模型所属 */}
      <Box sx={{ width: '100%', backgroundColor: theme.palette.background.paper, p: 2 }}>
        <Tabs
          value={selectedOwnedBy}
          onChange={handleTabChange}
          textColor="inherit"
          indicatorColor="primary"
          variant="standard"
          sx={{
            '& .MuiTabs-flexContainer': {
              flexWrap: 'wrap',
              gap: 1
            },
            '& .MuiTabs-indicator': {
              display: 'none'
            },
            borderRadius: 0
          }}
        >
          {uniqueOwnedBy.map((ownedBy, index) => (
            <Tab
              key={index}
              value={ownedBy.id}
              icon={
                <Stack direction="row" alignItems="center" spacing={1}>
                  <IconWrapper url={getIconByName(ownedBy.name)} />
                  <span>{ownedBy.name}</span>
                </Stack>
              }
              sx={{
                p: 1,
                borderRadius: 0,
                transition: 'all 0.2s ease-in-out',
                '& .MuiTab-iconWrapper': {
                  margin: 0
                },
                '&:hover': {
                  backgroundColor: (theme) => theme.palette.action.hover,
                  transform: 'translateY(-1px)'
                },
                '&.Mui-selected': {
                  backgroundColor: (theme) => theme.palette.action.selected
                }
              }}
            />
          ))}
        </Tabs>
      </Box>

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell width="25%">{t('modelpricePage.model')}</TableCell>
                <TableCell width="10%">{t('modelpricePage.type')}</TableCell>
                <TableCell width="25%">{t('modelpricePage.pricing')}</TableCell>
                <TableCell width="25%">{t('modelpricePage.availableGroups')}</TableCell>
                <TableCell width="15%">{t('modelpricePage.other')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRows.length > 0 ? (
                filteredRows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>{row.model}</TableCell>
                      <TableCell>
                        {row.type === 'tokens' ? (
                          <Label color="primary">{t('modelpricePage.tokens')}</Label>
                        ) : (
                          <Label variant="outlined" color="primary">
                            {t('modelpricePage.times')}
                          </Label>
                        )}
                      </TableCell>
                      <TableCell>
                        <Stack spacing={1}>
                          {row.enable ? (
                            <>
                              <Box>
                                <Label color="primary" variant="outlined">
                                  {t('modelpricePage.inputMultiplier')}: {row.input}
                                </Label>
                              </Box>
                              <Box>
                                <Label color="primary" variant="outlined">
                                  {t('modelpricePage.outputMultiplier')}: {row.output}
                                </Label>
                              </Box>
                            </>
                          ) : (
                            <Box>
                              <Label color="warning">{t('modelpricePage.noneGroup')}</Label>
                            </Box>
                          )}
                        </Stack>
                      </TableCell>
                      {/* 可用分组 */}
                      <TableCell>
                        <Stack direction="row" spacing={1} flexWrap="wrap">
                          {row.userGroup.map((groupId) => {
                            const group = userGroupMap[groupId];
                            return group ? (
                              <Label
                                key={groupId}
                                color={groupId === selectedGroup ? 'primary' : 'info'}
                                variant={groupId === selectedGroup ? 'filled' : 'ghost'}
                                onClick={() => handleGroupChange({ target: { value: groupId } })}
                                sx={{
                                  cursor: 'pointer',
                                  '&:hover': {
                                    opacity: 0.8
                                  }
                                }}
                              >
                                {group.name}
                              </Label>
                            ) : null;
                          })}
                        </Stack>
                      </TableCell>
                      <TableCell>{getOther(t, row.extraRatios)}</TableCell>
                    </TableRow>
                  ))
                ): (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Stack spacing={1.5} alignItems="center">
                      <Icon icon="eva:search-outline" width={32} height={32} color={theme.palette.text.secondary} />
                      <Typography variant="body2" color="text.secondary">
                        {t('common.noData')}
                      </Typography>
                    </Stack>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Stack>
  );
}


function getOther(t, extraRatios) {
  if (!extraRatios) return '';

  return (
    <Stack direction="column" spacing={0.5}>
      {Object.entries(extraRatios).map(([key, value]) => (
        <Label key={key} color="primary" variant="ghost">
          {t(`modelpricePage.${key}`)}: {value}
        </Label>
      ))}
      {/* <Label color="primary" variant="outlined">
        {t('modelpricePage.inputAudioTokensRatio')}: {inputRatio}
      </Label>
      <Label color="primary" variant="ghost">
        {t('modelpricePage.outputAudioTokensRatio')}: {outputRatio}
      </Label> */}
    </Stack>
  );
}
