import { useSelector } from 'react-redux';

import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, StyledEngineProvider } from '@mui/material';
import { I18nextProvider } from 'react-i18next';
// routing
import Routes from 'routes';

// defaultTheme
import themes from 'themes';

// project imports
import NavigationScroll from 'layout/NavigationScroll';
import PackyThemeProvider from 'components/PackyThemeProvider';

// auth
import UserProvider from 'contexts/UserContext';
import StatusProvider from 'contexts/StatusContext';
import { NoticeProvider, NoticeDialogs } from 'ui-component/notice';
import { SnackbarProvider } from 'notistack';
import CopySnackbar from 'ui-component/Snackbar';

// locales
import i18n from 'i18n/i18n';

// ==============================|| APP ||============================== //

const App = () => {
  const customization = useSelector((state) => state.customization);

  return (
    <StyledEngineProvider injectFirst>
      <PackyThemeProvider>
        <ThemeProvider theme={themes(customization)}>
          <CssBaseline />
          <NavigationScroll>
            <SnackbarProvider
              autoHideDuration={5000}
              maxSnack={3}
              anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
              Components={{ copy: CopySnackbar }}
            >
              <StatusProvider>
                <I18nextProvider i18n={i18n}>
                  <NoticeProvider>
                    <UserProvider>
                      <Routes />
                      <NoticeDialogs />
                    </UserProvider>
                  </NoticeProvider>
                </I18nextProvider>
              </StatusProvider>
            </SnackbarProvider>
          </NavigationScroll>
        </ThemeProvider>
      </PackyThemeProvider>
    </StyledEngineProvider>
  );
};

export default App;
