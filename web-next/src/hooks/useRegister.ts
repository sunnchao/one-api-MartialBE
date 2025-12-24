import { API } from '@/utils/api';
import { useNavigate } from 'react-router-dom';
import { showSuccess, showError } from '@/utils/common';
import { useTranslation } from 'react-i18next';

const useRegister = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const register = async (input: any, turnstile: string) => {
    try {
      let affCode = localStorage.getItem('aff');
      if (affCode) {
        input = { ...input, aff_code: affCode };
      }

      const res = await API.post(`/api/user/register?turnstile=${turnstile}`, input);
      const { success, message } = res.data;
      if (success) {
        showSuccess(t('common.registerOk'));
        navigate('/login');
      }
      return { success, message };
    } catch (err: any) {
      // API error handling is usually done in interceptors but we return failure here
      return { success: false, message: err.message || '' };
    }
  };

  const sendVerificationCode = async (email: string, turnstile: string) => {
    try {
      const res = await API.get(`/api/verification?email=${email}&turnstile=${turnstile}`);
      const { success, message } = res.data;
      if (success) {
        showSuccess(t('common.registerTip'));
      }
      return { success, message };
    } catch (err: any) {
      return { success: false, message: err.message || '' };
    }
  };

  return { register, sendVerificationCode };
};

export default useRegister;
