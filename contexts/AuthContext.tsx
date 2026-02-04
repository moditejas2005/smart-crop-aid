import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '@/utils/api';
import { handleError } from '@/utils/errorHandler';
import { sanitizeInput, isValidEmail } from '@/utils/inputValidation';
import type { User } from '@/types';
import { Alert } from 'react-native';

function createContextHook<T>(factory: () => T) {
  const Context = createContext<T | undefined>(undefined);

  const Provider: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
    const value = factory();
    return <Context.Provider value={value as T}>{children}</Context.Provider>;
  };

  const useHook = () => {
    const ctx = useContext(Context);
    if (ctx === undefined) {
      throw new Error('useAuth must be used within its Provider');
    }
    return ctx;
  };

  return [Provider, useHook] as const;
}

export default createContextHook;

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (!token) {
        setIsLoading(false);
        return;
      }

      const userData = await api.get('/auth/profile');
      
      const userProfile: User = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        phone: userData.phone,
        location: userData.location ? {
          latitude: userData.farm_lat || 0,
          longitude: userData.farm_lng || 0,
          city: userData.location,
        } : undefined,
        soilType: userData.soilType,
        cropHistory: userData.cropHistory,
        profileImage: userData.profile_image_url,
        createdAt: userData.created_at,
      };
      
      setUser(userProfile);
    } catch (error) {
      console.error('Failed to load user:', error);
      // If token is invalid, clear it
      await AsyncStorage.removeItem('auth_token');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = useCallback(async (email: string, password: string) => {
    try {
      const cleanEmail = sanitizeInput(email).toLowerCase();
      if (!isValidEmail(cleanEmail)) throw new Error('Invalid email format');

      const response = await api.post('/auth/login', { email: cleanEmail, password });
      
      await AsyncStorage.setItem('auth_token', response.token);
      
      const userData = response.user;
      const userProfile: User = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        location: userData.location ? {
           // Backend might not return full location details on login unless we fetch profile or adjust backend
           // For now assuming basic info
           latitude: 0,
           longitude: 0,
           city: userData.location
        } : undefined,
        soilType: userData.soil_type,
        cropHistory: Array.isArray(userData.crop_history) 
          ? userData.crop_history 
          : (typeof userData.crop_history === 'string' ? JSON.parse(userData.crop_history || '[]') : []),
        profileImage: userData.profile_image_url,
        createdAt: new Date().toISOString()
      };

      setUser(userProfile);
      
      if (userProfile.role === 'admin') {
        router.replace('/admin/dashboard' as any);
      } else {
        router.replace('/(farmer)/home' as any);
      }

    } catch (error: any) {
      const errorMessage = handleError(error);
      throw new Error(errorMessage);
    }
  }, [router]);

  const signup = useCallback(async (
    name: string,
    email: string,
    password: string,
    location: { latitude: number; longitude: number; city: string },
    soilType?: string,
    cropHistory?: string[]
  ) => {
    try {
      const cleanName = sanitizeInput(name);
      const cleanEmail = sanitizeInput(email).toLowerCase().trim();

      if (!isValidEmail(cleanEmail)) throw new Error('Invalid email format');

      const response = await api.post('/auth/signup', {
        name: cleanName,
        email: cleanEmail,
        password,
        location,
        soilType,
        cropHistory
      });

      await AsyncStorage.setItem('auth_token', response.token);
      
      // Auto login after signup
      const userData = response.user;
       const userProfile: User = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        location: {
           latitude: location.latitude,
           longitude: location.longitude,
           city: location.city
        },
        soilType: userData.soil_type,
        cropHistory: userData.crop_history || [],
        profileImage: undefined,
        createdAt: new Date().toISOString()
      };
      
      setUser(userProfile);
      router.replace('/(farmer)/home' as any);

    } catch (error: any) {
      const errorMessage = handleError(error);
      throw new Error(errorMessage);
    }
  }, [router]);

  const logout = useCallback(async () => {
    try {
      await AsyncStorage.removeItem('auth_token');
      setUser(null);
      router.replace('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, [router]);

  const updateUser = useCallback(async (updates: Partial<User>) => {
    try {
      if (!user) return;
      
      const response = await api.put('/auth/profile', {
        name: updates.name,
        location: updates.location?.city ?? (typeof updates.location === 'string' ? updates.location : undefined),
        soilType: updates.soilType,
        cropHistory: updates.cropHistory
      });
      
      console.log('Update User Response:', response);

      // Update local user state immediately with returned data
      const updatedUser: User = {
        ...user,
        name: response.name,
        location: {
           latitude: user.location?.latitude || 0,
           longitude: user.location?.longitude || 0,
           city: response.location ?? user.location?.city ?? ''
        },
        soilType: response.soilType,
        cropHistory: response.cropHistory,
      };

      setUser(updatedUser);
      
      return updatedUser;
    } catch (error) {
      console.error('Update user error:', error);
      throw error;
    }
  }, [user]);

  return useMemo(() => ({
    user,
    isLoading,
    login,
    signup,
    logout,
    updateUser,
    isAuthenticated: !!user,
  }), [user, isLoading, login, signup, logout, updateUser]);
});
