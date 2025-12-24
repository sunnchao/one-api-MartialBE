'use client';

import React, { useEffect, useCallback, createContext } from 'react';
import { API } from '@/utils/api';
import { showNotice, showError } from '@/utils/common';
import { SET_SITE_INFO, SET_MODEL_OWNEDBY } from '@/store/actions';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import i18n from '@/i18n';

export const LoadStatusContext = createContext<any>(null);

export const StatusProvider = ({ children }: { children: React.ReactNode }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const loadStatus = useCallback(async () => {
    let system_name = '';
    try {
      const res = await API.get('/api/status');
      const { success, data } = res.data;
      if (success) {
        if (!data.chat_link) {
          delete data.chat_link;
        }
        
        const storedLanguage = localStorage.getItem('appLanguage') || data.language || 'zh_CN';
        localStorage.setItem('default_language', storedLanguage);
        if (i18n.language !== storedLanguage) {
             i18n.changeLanguage(storedLanguage);
        }

        localStorage.setItem('siteInfo', JSON.stringify(data));
        localStorage.setItem('quota_per_unit', data.quota_per_unit);
        localStorage.setItem('display_in_currency', data.display_in_currency);
        
        dispatch({ type: SET_SITE_INFO, payload: data });
        
        if (data.system_name) {
          system_name = data.system_name;
        }
      } else {
        const backupSiteInfo = localStorage.getItem('siteInfo');
        if (backupSiteInfo) {
          const data = JSON.parse(backupSiteInfo);
          if (data.system_name) {
            system_name = data.system_name;
          }
          dispatch({
            type: SET_SITE_INFO,
            payload: data
          });
        }
      }
    } catch (error) {
      // showError(t('common.unableServer')); // Suppress error on init to avoid noise if server is down
      console.error(error);
    }

    if (system_name) {
      document.title = system_name;
    }
  }, [dispatch, t]);

  const loadOwnedby = useCallback(async () => {
    try {
      const res = await API.get('/api/model_ownedby');
      const { success, data } = res.data;
      if (success) {
        dispatch({ type: SET_MODEL_OWNEDBY, payload: data });
      }
    } catch (error) {
       console.error(error);
    }
  }, [dispatch]);

  useEffect(() => {
    loadStatus();
    loadOwnedby();
  }, [loadStatus, loadOwnedby]);

  return <LoadStatusContext.Provider value={loadStatus}>{children}</LoadStatusContext.Provider>;
};

export default StatusProvider;
