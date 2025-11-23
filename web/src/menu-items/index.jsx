import Setting from './setting';
import Dashboard from './dashboard';
import Billing from './billing';
import usage from './usage';
import AICode from './ai-code';
// import Coupon from './coupon';
// import ClaudeCode from './claude-code';
// ==============================|| MENU ITEMS ||============================== //

const menuItems = {
  items: [
    Dashboard,
    AICode,
    //  ClaudeCode,
    // Coupon,
    Setting,
    Billing,
    usage
  ]
};

export default menuItems;
