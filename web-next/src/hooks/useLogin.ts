import { API, LoginCheckAPI } from '@/utils/api';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { LOGIN, SET_USER_GROUP } from '@/store/actions';
import { useNavigate } from 'react-router-dom';
import { showSuccess } from '@/utils/common';
import { useTranslation } from 'react-i18next';

const useLogin = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const loadUser = useCallback(async () => {
    try {
      const res = await LoginCheckAPI.get('/api/user/self');
      const { success, data } = res.data;
      if (success) {
        dispatch({ type: LOGIN, payload: data });
        return data;
      }
      return null;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }, [dispatch]);

  const loadUserGroup = useCallback(() => {
    try {
      API.get('/api/user_group_map').then((res) => {
        const { success, data } = res.data;
        if (success) {
          dispatch({ type: SET_USER_GROUP, payload: data });
        }
      });
    } catch (error) {
      console.error(error);
    }
    return [];
  }, [dispatch]);

  const login = async (username: string, password: string, turnstileToken: string) => {
    try {
      const res = await API.post(`/api/user/login?turnstile=${turnstileToken}`, {
        username,
        password
      });
      const { success, message } = res.data;
      if (success) {
        await loadUser();
        loadUserGroup();
        navigate('/panel/dashboard');
      }
      return { success, message };
    } catch (err) {
      return { success: false, message: '' };
    }
  };

  const githubLogin = async (code: string, state: string) => {
    try {
      const affCode = localStorage.getItem('aff');
      const res = await API.get(`/api/oauth/github?code=${code}&state=${state}&aff=${affCode}`);
      const { success, message } = res.data;
      if (success) {
        if (message === 'bind') {
          showSuccess(t('common.bindOk') || 'Bind successfully');
          navigate('/panel/dashboard');
        } else {
          await loadUser();
          loadUserGroup();
          showSuccess(t('common.loginOk') || 'Logged in successfully');
          navigate('/panel/dashboard');
        }
      }
      return { success, message };
    } catch (err) {
      return { success: false, message: '' };
    }
  };

  const linuxDoLogin = async (code: string, state: string) => {
    try {
      const affCode = localStorage.getItem('aff');
      const res = await API.get(`/api/oauth/linuxdo?code=${code}&state=${state}&aff=${affCode}`);
      const { success, message, data } = res.data;
      if (success) {
        if (message === 'bind') {
          showSuccess(t('common.bindOk') || 'Bind successfully');
          navigate('/panel/dashboard');
        } else {
          dispatch({ type: LOGIN, payload: data });
          localStorage.setItem('user', JSON.stringify(data));
          showSuccess(t('common.loginOk') || 'Logged in successfully');
          navigate('/panel/dashboard');
        }
      }
      return { success, message };
    } catch (err) {
      return { success: false, message: '' };
    }
  };

  const oidcLogin = async (code: string, state: string) => {
    try {
      const affCode = localStorage.getItem('aff');
      const res = await API.get(`/api/oauth/oidc?code=${code}&state=${state}&aff=${affCode}`);
      const { success, message } = res.data;
      if (success) {
        if (message === 'bind') {
          showSuccess(t('common.bindOk') || 'Bind successfully');
          navigate('/panel/dashboard');
        } else {
          await loadUser();
          loadUserGroup();
          showSuccess(t('common.loginOk') || 'Logged in successfully');
          navigate('/panel/dashboard');
        }
      }
      return { success, message };
    } catch (err) {
      return { success: false, message: '' };
    }
  };

  const larkLogin = async (code: string, state: string) => {
    try {
      const affCode = localStorage.getItem('aff');
      const res = await API.get(`/api/oauth/lark?code=${code}&state=${state}&aff=${affCode}`);
      const { success, message } = res.data;
      if (success) {
        if (message === 'bind') {
          showSuccess(t('common.bindOk') || 'Bind successfully');
          navigate('/panel/dashboard');
        } else {
          await loadUser();
          loadUserGroup();
          showSuccess(t('common.loginOk') || 'Logged in successfully');
          navigate('/panel/dashboard');
        }
      }
      return { success, message };
    } catch (err) {
      return { success: false, message: '' };
    }
  };

  const wechatLogin = async (code: string) => {
    try {
      const affCode = localStorage.getItem('aff');
      const res = await API.get(`/api/oauth/wechat?code=${code}&aff=${affCode}`);
      const { success, message } = res.data;
      if (success) {
        await loadUser();
        loadUserGroup();
        showSuccess(t('common.loginOk') || 'Logged in successfully');
        navigate('/panel/dashboard');
      }
      return { success, message };
    } catch (err) {
      return { success: false, message: '' };
    }
  };

  const logout = async () => {
    await API.get('/api/user/logout');
    localStorage.removeItem('user');
    dispatch({ type: LOGIN, payload: null });
    navigate('/');
  };

  return { login, logout, githubLogin, linuxDoLogin, wechatLogin, larkLogin, oidcLogin, loadUser, loadUserGroup };
};

export default useLogin;
