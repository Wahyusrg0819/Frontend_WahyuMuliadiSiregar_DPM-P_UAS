import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    loadStoredData();
  }, []);

  const loadStoredData = async () => {
    try {
      const [token, user] = await Promise.all([
        AsyncStorage.getItem('userToken'),
        AsyncStorage.getItem('userData'),
      ]);

      if (token && user) {
        setUserToken(token);
        setUserData(JSON.parse(user));
        // Set default axios header
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error loading auth data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post('http://172.20.10.3:5000/api/auth/login', {
        email,
        password,
      });

      const { token, user } = response.data;

      // Simpan di storage
      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('userData', JSON.stringify(user));

      // Update state
      setUserToken(token);
      setUserData(user);

      // Set default axios header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Terjadi kesalahan saat login'
      };
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await axios.post('http://172.20.10.3:5000/api/auth/register', {
        name,
        email,
        password,
      });

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Terjadi kesalahan saat registrasi'
      };
    }
  };

  const logout = async () => {
    try {
      // Hapus dari storage
      await AsyncStorage.multiRemove(['userToken', 'userData']);

      // Reset state
      setUserToken(null);
      setUserData(null);

      // Hapus default axios header
      delete axios.defaults.headers.common['Authorization'];
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const value = {
    isLoading,
    userToken,
    userData,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 