import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import AuthNavigator from './AuthNavigator';
import AppNavigator from './AppNavigator';

const RootNavigator = () => {
  const { isLoading, userToken } = useAuth();

  if (isLoading) {
    return null; // Atau tampilkan splash screen
  }

  return (
    <NavigationContainer>
      {userToken ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

export default RootNavigator; 