import axios from 'axios';
import { store } from '@/store';
import { LOGIN } from '@/store/actions';
import { showError } from './common';

const baseURL = import.meta.env.VITE_SERVER || '/';

export const API = axios.create({
  baseURL,
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('user');
      store.dispatch({ type: LOGIN, payload: null });
      // In Next.js we might want to use router.push, but here we are in a utility.
      // We can rely on the store update to trigger UI changes or redirect.
      if (typeof window !== 'undefined') {
         // window.location.href = '/login'; // Optional: force redirect
      }
    }

    if (error.response?.data?.message) {
      error.message = error.response.data.message;
    }

    showError(error);
    return Promise.reject(error);
  }
);

export const LoginCheckAPI = axios.create({
    baseURL,
});
