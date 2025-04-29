// contexts/User/index.jsx
import React, { useEffect, useCallback, createContext, useState } from 'react';
import useLogin from 'hooks/useLogin';
import { useSelector } from 'react-redux';
import { CircularProgress, Box } from '@mui/material';

export const UserContext = createContext();

// eslint-disable-next-line
const UserProvider = ({ children }) => {
  const [isUserLoaded, setIsUserLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const account = useSelector((state) => state.account);
  // const [userGroup, setUserGroup] = useState({});
  const { loadUser: loadUserAction, loadUserGroup: loadUserGroupAction } = useLogin();

  const loadUser = useCallback(async () => {
    try {
      setIsLoading(true);
      const userData = await loadUserAction();
      // Only mark as loaded when we actually have user data or definitively know it's not available
      setIsUserLoaded(true);
      setIsLoading(false);
      return userData;
    } catch (error) {
      console.error('Error loading user:', error);
      // Still mark as loaded so the app can redirect to login if needed
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

  // Show loading spinner when we're still waiting on user data
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return <UserContext.Provider value={{ loadUser, isUserLoaded, loadUserGroup }}> {children} </UserContext.Provider>;
};

export default UserProvider;
