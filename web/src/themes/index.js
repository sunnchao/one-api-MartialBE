import { createTheme } from '@mui/material/styles';

// assets
import colors from 'assets/scss/_themes-vars.module.scss';

// project imports
import componentStyleOverrides from './compStyleOverride';
import themePalette from './palette';
import themeTypography from './typography';
import { varAlpha, createGradient } from './utils';

// 创建自定义渐变背景色
const customGradients = {
  primary: createGradient(colors.primaryMain, colors.primaryDark),
  secondary: createGradient(colors.secondaryMain, colors.secondaryDark)
};

/**
 * Represent theme style and structure as per Material-UI
 * @param {JsonObject} customization customization parameter object
 */

export const theme = (customization) => {
  const color = colors;
  const options = customization.theme === 'light' ? GetLightOption() : GetDarkOption();
  const themeOption = {
    colors: color,
    gradients: customGradients,
    ...options,
    customization
  };

  const themeOptions = {
    direction: 'ltr',
    palette: themePalette(themeOption),
    mixins: {
      toolbar: {
        minHeight: '48px',
        padding: '8px 16px',
        '@media (min-width: 600px)': {
          minHeight: '48px'
        }
      }
    },
    shape: {
      borderRadius: themeOption?.customization?.borderRadius ?? colors.borderRadius ?? 8
    },
    typography: themeTypography(themeOption),
    breakpoints: {
      values: {
        xs: 0,
        sm: 600,
        md: 960,
        lg: 1280,
        xl: 1920
      }
    },
    zIndex: {
      modal: 1300,
      snackbar: 1400,
      tooltip: 1500
    }
  };

  const themes = createTheme(themeOptions);
  themes.components = componentStyleOverrides(themeOption);

  return themes;
};

export default theme;

function GetDarkOption() {
  const color = colors;
  const surface = color.darkLevel1;
  return {
    mode: 'dark',
    heading: color.darkTextTitle,
    paper: color.darkPaper,
    backgroundDefault: color.darkBackground,
    background: surface,
    darkTextPrimary: color.darkTextPrimary,
    darkTextSecondary: color.darkTextSecondary,
    textDark: color.darkTextPrimary,
    menuSelected: color.darkPrimaryMain,
    menuSelectedBack: varAlpha(color.darkPrimary200, 0.16),
    divider: varAlpha(color.darkTextSecondary, 0.24),
    borderColor: varAlpha(color.darkTextSecondary, 0.24),
    menuButton: varAlpha(color.darkTextSecondary, 0.12),
    menuButtonColor: color.darkTextPrimary,
    menuChip: surface,
    headBackgroundColor: color.darkLevel2,
    headBackgroundColorHover: varAlpha(color.darkLevel2, 0.16),
    tableBorderBottom: varAlpha(color.darkTextSecondary, 0.32),
    borderRadius: color.borderRadius ?? 8
  };
}

function GetLightOption() {
  const color = colors;
  return {
    mode: 'light',
    heading: color.primaryMain,
    paper: '#ffffff',
    backgroundDefault: '#f8fafc',
    background: '#ffffff',
    darkTextPrimary: color.primaryMain,
    darkTextSecondary: color.grey600,
    textDark: color.primaryMain,
    menuSelected: color.primaryMain,
    menuSelectedBack: varAlpha(color.primary200, 0.12),
    divider: color.grey200,
    borderColor: color.grey200,
    menuButton: varAlpha(color.primary200, 0.16),
    menuButtonColor: color.primaryMain,
    menuChip: color.secondaryLight,
    headBackgroundColor: '#f8fafc',
    headBackgroundColorHover: '#ffffff',
    tableBorderBottom: color.tableBorderBottom,
    borderRadius: color.borderRadius ?? 8
  };
}
