import React from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import { AuthProvider } from './context/AuthContext';
import RootNavigator from './navigation/RootNavigator';

export default function App() {
  return (
    <AuthProvider>
      <PaperProvider>
        <RootNavigator />
      </PaperProvider>
    </AuthProvider>
  );
}
