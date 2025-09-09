import React from 'react';
import { Box, Typography, keyframes } from '@mui/material';
import { useTheme } from '@mui/material/styles';

// 旋转动画
const spin = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

// 脉冲动画
const pulse = keyframes`
  0%, 100% {
    opacity: 0.4;
  }
  50% {
    opacity: 1;
  }
`;

// 渐变动画
const shimmer = keyframes`
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
`;

const LoadingSpinner = ({
  size = 48,
  thickness = 4,
  color = 'primary',
  variant = 'circular',
  showText = true,
  text = 'Loading...',
  fullScreen = false
}) => {
  const theme = useTheme();

  const getColor = () => {
    if (color === 'primary') return theme.palette.primary.main;
    if (color === 'secondary') return theme.palette.secondary.main;
    return color;
  };

  const CircularLoader = () => (
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius: '50%',
        border: `${thickness}px solid transparent`,
        borderTop: `${thickness}px solid ${getColor()}`,
        animation: `${spin} 1s linear infinite`,
        position: 'relative',
        '&::after': {
          content: '""',
          position: 'absolute',
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          border: `${thickness}px solid transparent`,
          borderBottom: `${thickness}px solid ${getColor()}`,
          top: -thickness,
          left: -thickness,
          animation: `${spin} 1.5s linear infinite reverse`,
          opacity: 0.3
        }
      }}
    />
  );

  const DotsLoader = () => (
    <Box sx={{ display: 'flex', gap: 1 }}>
      {[0, 1, 2].map((index) => (
        <Box
          key={index}
          sx={{
            width: size / 4,
            height: size / 4,
            backgroundColor: getColor(),
            borderRadius: '50%',
            animation: `${pulse} 1.4s ease-in-out infinite`,
            animationDelay: `${index * 0.16}s`
          }}
        />
      ))}
    </Box>
  );

  const BarsLoader = () => (
    <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'flex-end', height: size }}>
      {[0, 1, 2, 3, 4].map((index) => (
        <Box
          key={index}
          sx={{
            width: size / 8,
            backgroundColor: getColor(),
            borderRadius: 1,
            animation: `${pulse} 1.2s ease-in-out infinite`,
            animationDelay: `${index * 0.1}s`,
            height: `${30 + (index % 3) * 20}%`,
            transformOrigin: 'bottom'
          }}
        />
      ))}
    </Box>
  );

  const ShimmerLoader = () => (
    <Box
      sx={{
        width: size * 2,
        height: size / 4,
        borderRadius: 2,
        background: `linear-gradient(90deg, 
          ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} 25%, 
          ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'} 50%, 
          ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} 75%)`,
        backgroundSize: '200% 100%',
        animation: `${shimmer} 1.5s ease-in-out infinite`
      }}
    />
  );

  const renderLoader = () => {
    switch (variant) {
      case 'dots':
        return <DotsLoader />;
      case 'bars':
        return <BarsLoader />;
      case 'shimmer':
        return <ShimmerLoader />;
      default:
        return <CircularLoader />;
    }
  };

  const LoaderContent = () => (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        ...(fullScreen && {
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(10px)',
          zIndex: 9999
        })
      }}
    >
      {renderLoader()}
      {showText && (
        <Typography
          variant="body2"
          sx={{
            color: theme.palette.text.secondary,
            fontWeight: 500,
            letterSpacing: '0.5px'
          }}
        >
          {text}
        </Typography>
      )}
    </Box>
  );

  return <LoaderContent />;
};

// PackyCode 风格的页面加载器
export const PackyPageLoader = ({ isLoading, children }) => {
  const theme = useTheme();

  if (isLoading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background:
            theme.palette.mode === 'dark'
              ? 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)'
              : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <LoadingSpinner variant="circular" size={48} thickness={3} color="primary" showText={true} text="Loading..." />
        </Box>
      </Box>
    );
  }

  return children;
};

export default LoadingSpinner;
