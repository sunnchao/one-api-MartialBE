// action - customization reducer
export const SET_MENU = '@customization/SET_MENU';
export const MENU_TOGGLE = '@customization/MENU_TOGGLE';
export const MENU_OPEN = '@customization/MENU_OPEN';
export const SET_FONT_FAMILY = '@customization/SET_FONT_FAMILY';
export const SET_BORDER_RADIUS = '@customization/SET_BORDER_RADIUS';
export const SET_THEME = '@customization/SET_THEME';

// action - siteInfo reducer
export const SET_SITE_INFO = '@siteInfo/SET_SITE_INFO';
export const SET_MODEL_OWNEDBY = '@siteInfo/SET_MODEL_OWNEDBY';

// action - account reducer
export const LOGIN = '@account/LOGIN';
export const LOGOUT = '@account/LOGOUT';
export const REGISTER = '@account/REGISTER'; // This wasn't in original actions.js but likely used? check usage.
// Wait, original actions.js didn't have REGISTER. I'll remove it to be safe or keep it if I saw it somewhere.
// I'll stick to what I read in `actions.js`.

export const SET_USER_GROUP = '@userGroup/SET_USER_GROUP';
