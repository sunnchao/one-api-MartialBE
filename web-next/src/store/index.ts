import { combineReducers, legacy_createStore as createStore } from 'redux';
import customizationReducer from './customizationReducer';
import accountReducer from './accountReducer';
import siteInfoReducer from './siteInfoReducer';

const reducer = combineReducers({
  customization: customizationReducer,
  account: accountReducer,
  siteInfo: siteInfoReducer
});

const store = createStore(reducer);
const persister = 'Free';

export { store, persister };
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
