// material-ui
import logoLight from 'assets/images/logo.svg';
import logoDark from 'assets/images/logo-white.svg';
import { useSelector } from 'react-redux';
import { useTheme } from '@mui/material/styles';
import { Button, Typography } from '@mui/material';

/**
 * if you want to use image instead of <svg> uncomment following.
 *
 * import logoDark from 'assets/images/logo-dark.svg';
 * import logo from 'assets/images/logo.svg';
 *
 */

// ==============================|| LOGO SVG ||============================== //

const Logo = () => {
  const siteInfo = useSelector((state) => state.siteInfo);
  const theme = useTheme();
  const logo = theme.palette.mode === 'light' ? logoLight : logoDark;

  return (
    <>
      <img
        src={siteInfo.logo || logo}
        alt={siteInfo.system_name}
        height="40"
        style={{
          borderRadius: '50%'
        }}
      />
      <Button size="large" variant="h6">
        <Typography variant="h5">{siteInfo.system_name}</Typography>
      </Button>
    </>
  );
};

export default Logo;
