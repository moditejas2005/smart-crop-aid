import { Stack } from 'expo-router';
import React from 'react';

import Colors from '@/constants/colors';

export default function AdminLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.primary,
        },
        headerTintColor: Colors.secondary,
        headerTitleStyle: {
          fontWeight: '700',
        },
      }}
    >
      <Stack.Screen 
        name="dashboard" 
        options={{ 
          title: 'Admin Dashboard',
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="users" 
        options={{ 
          title: 'User Management',
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="pest-reports" 
        options={{ 
          title: 'Pest Reports',
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="crops" 
        options={{ 
          title: 'Crop Recommendations',
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="chat-messages" 
        options={{ 
          title: 'Chat Messages',
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="market-prices" 
        options={{ 
          title: 'Market Prices',
          headerShown: false,
        }} 
      />
    </Stack>
  );
}