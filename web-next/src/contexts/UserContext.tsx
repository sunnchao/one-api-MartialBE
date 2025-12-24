'use client';

import React, { useEffect, useCallback, createContext, useState, ReactNode } from 'react';
import useLogin from '@/hooks/useLogin';
import { useSelector } from 'react-redux';
import { Spin } from 'antd';

interface UserContextType {
  loadUser: () => Promise<any>;
  isUserLoaded: boolean;
  loadUserGroup: () => void;
}

export const UserContext = createContext<UserContextType>({} as UserContextType);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [isUserLoaded, setIsUserLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const account = useSelector((state: any) => state.account);
  const { loadUser: loadUserAction, loadUserGroup: loadUserGroupAction } = useLogin();

  const loadUser = useCallback(async () => {
    try {
      setIsLoading(true);
      const userData = await loadUserAction();
      setIsUserLoaded(true);
      setIsLoading(false);
      return userData;
    } catch (error) {
      console.error('Error loading user:', error);
      setIsUserLoaded(true);
      setIsLoading(false);
      return null;
    }
  }, [loadUserAction]);

  const loadUserGroup = useCallback(() => {
    loadUserGroupAction();
  }, [loadUserGroupAction]);

  useEffect(() => {
    loadUser();
    loadUserGroup();
  }, [loadUser, loadUserGroup]);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  return <UserContext.Provider value={{ loadUser, isUserLoaded, loadUserGroup }}>{children}</UserContext.Provider>;
};

export default UserProvider;
