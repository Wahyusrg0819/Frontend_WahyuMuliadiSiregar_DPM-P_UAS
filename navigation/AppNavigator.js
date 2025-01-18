import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { IconButton } from 'react-native-paper';
import { Platform } from 'react-native';

// Screens
import DashboardScreen from '../screens/DashboardScreen';
import TransactionScreen from '../screens/TransactionScreen';
import AddTransactionScreen from '../screens/AddTransactionScreen';
import ProfileScreen from '../screens/ProfileScreen';
import FamilyScreen from '../screens/FamilyScreen';
import SettingScreen from '../screens/SettingScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#144272',
        tabBarInactiveTintColor: '#64748B',
        tabBarStyle: {
          height: Platform.OS === 'ios' ? 88 : 65,
          paddingHorizontal: 5,
          paddingTop: 5,
          paddingBottom: Platform.OS === 'ios' ? 25 : 10,
          backgroundColor: 'white',
          position: 'absolute',
          borderTopWidth: 0,
          elevation: 20,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: -4,
          },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        },
        tabBarItemStyle: {
          paddingVertical: 5,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          paddingBottom: 5,
        },
        tabBarIconStyle: {
          marginTop: 5,
        }
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <IconButton 
              icon="view-dashboard" 
              size={size - 2} 
              iconColor={color}
              style={{ margin: 0 }}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Transactions"
        component={TransactionScreen}
        options={{
          title: 'Transaksi',
          tabBarIcon: ({ color, size }) => (
            <IconButton 
              icon="format-list-bulleted" 
              size={size - 2} 
              iconColor={color}
              style={{ margin: 0 }}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Family"
        component={FamilyScreen}
        options={{
          title: 'Keluarga',
          tabBarIcon: ({ color, size }) => (
            <IconButton 
              icon="account-group" 
              size={size - 2} 
              iconColor={color}
              style={{ margin: 0 }}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, size }) => (
            <IconButton 
              icon="account" 
              size={size - 2} 
              iconColor={color}
              style={{ margin: 0 }}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="MainTabs"
        component={MainTabs}
      />
      <Stack.Screen
        name="AddTransaction"
        component={AddTransactionScreen}
      />
      <Stack.Screen
        name="Settings"
        component={SettingScreen}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator; 