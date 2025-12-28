import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, User, Bug, TrendingUp, Sprout } from 'lucide-react-native';
import React from 'react';
import { Platform, View } from 'react-native';

import Colors from '@/constants/colors';
import Chatbot from '@/components/Chatbot';
import HomeScreen from './home';
import ProfileScreen from './profile';
import PestDetectionScreen from './pest-detection';
import MarketPriceScreen from './market-price';
import CropRecommendationScreen from './crop-recommendation';

const Tab = createBottomTabNavigator();

function TabScreenWrapper({ children, context }: { children: React.ReactNode; context?: 'pest' | 'crop' | 'general' }) {
  return (
    <View style={{ flex: 1 }}>
      {children}
      <Chatbot context={context} />
    </View>
  );
}

export default function FarmerLayout() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textLight,
        tabBarStyle: {
          backgroundColor: Colors.secondary,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          paddingBottom: Platform.OS === 'ios' ? 20 : 10,
          paddingTop: 10,
          height: Platform.OS === 'ios' ? 90 : 70,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 4,
        },
      }}
    >
      <Tab.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      >
        {() => (
          <TabScreenWrapper context="general">
            <HomeScreen />
          </TabScreenWrapper>
        )}
      </Tab.Screen>
      <Tab.Screen
        name="pest-detection"
        options={{
          title: 'Pest Detection',
          tabBarIcon: ({ color, size }) => <Bug size={size} color={color} />,
        }}
      >
        {() => (
          <TabScreenWrapper context="pest">
            <PestDetectionScreen />
          </TabScreenWrapper>
        )}
      </Tab.Screen>
      <Tab.Screen
        name="crop-recommendation"
        options={{
          title: 'Crops',
          tabBarIcon: ({ color, size }) => <Sprout size={size} color={color} />,
        }}
      >
        {() => (
          <TabScreenWrapper context="crop">
            <CropRecommendationScreen />
          </TabScreenWrapper>
        )}
      </Tab.Screen>
      <Tab.Screen
        name="market-price"
        options={{
          title: 'Market',
          tabBarIcon: ({ color, size }) => <TrendingUp size={size} color={color} />,
        }}
      >
        {() => (
          <TabScreenWrapper context="general">
            <MarketPriceScreen />
          </TabScreenWrapper>
        )}
      </Tab.Screen>
      <Tab.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      >
        {() => (
          <TabScreenWrapper context="general">
            <ProfileScreen />
          </TabScreenWrapper>
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
}