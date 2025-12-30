import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';

// material-ui
import { useTheme } from '@mui/material/styles';
import {
  Box,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Divider,
  Stack,
  Chip,
  CircularProgress,
  Button
} from '@mui/material';

// project imports
import { API } from 'utils/api';

// ==============================|| PACKAGES MENU ||============================== //

const PackagesMenu = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const open = Boolean(anchorEl);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const res = await API.get('/api/user/packages/plans');
      if (res.data.success) {
        setPlans(res.data.data || []);
      } else {
        setPlans([]);
      }
    } catch (error) {
      console.error('获取套餐信息失败:', error);
      setPlans([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleViewAll = () => {
    handleClose();
    navigate('/panel/subscriptions');
  };

  const handlePlanClick = (plan) => {
    handleClose();
    navigate('/panel/subscriptions', { state: { selectedPlan: plan } });
  };

  const formatPrice = (plan) => {
    const durationText = plan.is_unlimited_time ? '永久' : getDurationText(plan);
    return `$${plan.price} ${plan.currency}/${durationText}`;
  };

  const getDurationText = (plan) => {
    const unit = plan.duration_unit || 'month';
    const value = plan.duration_value || plan.duration_months || 1;
    const unitMap = {
      day: '天',
      week: '周',
      month: '月',
      quarter: '季度'
    };
    return value > 1 ? `${value}${unitMap[unit] || '月'}` : unitMap[unit] || '月';
  };

  return (
    <>
      <IconButton
        size="medium"
        color="inherit"
        aria-label="packages menu"
        aria-controls={open ? 'packages-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
        sx={{
          width: '38px',
          height: '38px',
          borderRadius: '0',
          backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
          '&:hover': {
            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)'
          },
          transition: 'background-color 0.2s ease-in-out'
        }}
      >
        <Icon
          icon="solar:box-minimalistic-bold-duotone"
          width="22px"
          height="22px"
          color={theme.palette.mode === 'dark' ? theme.palette.text.secondary : theme.palette.text.primary}
        />
      </IconButton>

      <Menu
        id="packages-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'packages-button'
        }}
        PaperProps={{
          elevation: 3,
          sx: {
            minWidth: 320,
            maxWidth: 400,
            maxHeight: 480,
            overflow: 'auto',
            mt: 1.5,
            borderRadius: 2,
            '& .MuiMenuItem-root': {
              px: 2,
              py: 1.5
            }
          }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {/* Header */}
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="h6" fontWeight={600}>
            {t('packages.menu.title')}
          </Typography>
        </Box>
        <Divider />

        {/* Loading State */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress size={24} />
          </Box>
        )}

        {/* Empty State */}
        {!loading && plans.length === 0 && (
          <Box sx={{ px: 2, py: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              {t('packages.menu.noPlan')}
            </Typography>
          </Box>
        )}

        {/* Plans List */}
        {!loading &&
          plans
            .filter((plan) => plan.show_in_portal !== false && plan.is_active)
            .slice(0, 5)
            .map((plan) => (
              <MenuItem
                key={plan.id}
                onClick={() => handlePlanClick(plan)}
                sx={{
                  display: 'block',
                  '&:hover': {
                    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)'
                  }
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.5}>
                  <Typography variant="subtitle1" fontWeight={500}>
                    {plan.name}
                  </Typography>
                  <Chip
                    label={plan.service_type}
                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={{ fontSize: '0.7rem', height: 20 }}
                  />
                </Stack>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="primary" fontWeight={600}>
                    {formatPrice(plan)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {plan.total_quota?.toLocaleString()} 额度
                  </Typography>
                </Stack>
                {plan.description && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      display: 'block',
                      mt: 0.5,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {plan.description}
                  </Typography>
                )}
              </MenuItem>
            ))}

        {/* View All Button */}
        {!loading && plans.length > 0 && (
          <>
            <Divider />
            <Box sx={{ p: 1.5 }}>
              <Button fullWidth variant="contained" size="small" onClick={handleViewAll} startIcon={<Icon icon="solar:arrow-right-linear" />}>
                {t('packages.menu.viewAll')}
              </Button>
            </Box>
          </>
        )}
      </Menu>
    </>
  );
};

export default PackagesMenu;
