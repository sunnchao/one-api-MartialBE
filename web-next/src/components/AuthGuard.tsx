'use client';

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useContext } from 'react';
import { UserContext } from '@/contexts/UserContext';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const account = useSelector((state: any) => state.account);
  const { isUserLoaded } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (isUserLoaded && !account.user) {
      navigate('/login', { replace: true });
    }
  }, [account.user, navigate, isUserLoaded]);

  if (!isUserLoaded) return null;

  return <>{children}</>;
}
