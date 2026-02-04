import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ChatSession, PestDetection, UserActivity, AdminStats } from '@/types';

const CHAT_SESSION_KEY = '@chat_session_';
const PEST_HISTORY_KEY = '@pest_history_';
const USER_ACTIVITY_KEY = '@user_activity_';
const ADMIN_STATS_KEY = '@admin_stats';

// Chat session management
export const getChatSession = async (userId: string): Promise<ChatSession | null> => {
  try {
    const sessionData = await AsyncStorage.getItem(`${CHAT_SESSION_KEY}${userId}`);
    return sessionData ? JSON.parse(sessionData) : null;
  } catch (error) {
    console.error('Error getting chat session:', error);
    return null;
  }
};

export const saveChatSession = async (session: ChatSession): Promise<void> => {
  try {
    await AsyncStorage.setItem(
      `${CHAT_SESSION_KEY}${session.userId}`,
      JSON.stringify(session)
    );
  } catch (error) {
    console.error('Error saving chat session:', error);
  }
};

export const clearChatSession = async (userId: string): Promise<void> => {
  try {
    await AsyncStorage.removeItem(`${CHAT_SESSION_KEY}${userId}`);
  } catch (error) {
    console.error('Error clearing chat session:', error);
  }
};

// Pest detection history management
export const getPestHistory = async (userId: string): Promise<PestDetection[]> => {
  try {
    const historyData = await AsyncStorage.getItem(`${PEST_HISTORY_KEY}${userId}`);
    return historyData ? JSON.parse(historyData) : [];
  } catch (error) {
    console.error('Error getting pest history:', error);
    return [];
  }
};

export const savePestDetection = async (userId: string, detection: PestDetection): Promise<void> => {
  try {
    const history = await getPestHistory(userId);
    const updatedHistory = [detection, ...history].slice(0, 50); // Keep last 50 detections
    await AsyncStorage.setItem(
      `${PEST_HISTORY_KEY}${userId}`,
      JSON.stringify(updatedHistory)
    );
    
    // Log activity
    await logUserActivity(userId, 'pest-detection', `Detected ${detection.pestName} in ${detection.affectedCrop}`);
  } catch (error) {
    console.error('Error saving pest detection:', error);
  }
};

export const clearPestHistory = async (userId: string): Promise<void> => {
  try {
    await AsyncStorage.removeItem(`${PEST_HISTORY_KEY}${userId}`);
  } catch (error) {
    console.error('Error clearing pest history:', error);
  }
};

// User activity logging
export const logUserActivity = async (
  userId: string,
  type: UserActivity['type'],
  details: string
): Promise<void> => {
  try {
    const activity: UserActivity = {
      id: Date.now().toString(),
      userId,
      type,
      details,
      timestamp: new Date().toISOString(),
    };
    
    const existingActivities = await getUserActivities(userId);
    const updatedActivities = [activity, ...existingActivities].slice(0, 100); // Keep last 100 activities
    
    await AsyncStorage.setItem(
      `${USER_ACTIVITY_KEY}${userId}`,
      JSON.stringify(updatedActivities)
    );
    
    // Update admin stats
    await updateAdminStats(type);
  } catch (error) {
    console.error('Error logging user activity:', error);
  }
};

export const getUserActivities = async (userId: string): Promise<UserActivity[]> => {
  try {
    const activitiesData = await AsyncStorage.getItem(`${USER_ACTIVITY_KEY}${userId}`);
    return activitiesData ? JSON.parse(activitiesData) : [];
  } catch (error) {
    console.error('Error getting user activities:', error);
    return [];
  }
};

export const clearUserActivities = async (userId: string): Promise<void> => {
  try {
    await AsyncStorage.removeItem(`${USER_ACTIVITY_KEY}${userId}`);
  } catch (error) {
    console.error('Error clearing user activities:', error);
  }
};

// Admin statistics management
export const getAdminStats = async (): Promise<AdminStats> => {
  try {
    const statsData = await AsyncStorage.getItem(ADMIN_STATS_KEY);
    if (statsData) {
      return JSON.parse(statsData);
    }
    
    // Return default stats if none exist
    return {
      totalUsers: 0,
      activeUsers: 0,
      pestDetections: 0,
      cropRecommendations: 0,
      chatInteractions: 0,
      marketChecks: 0,
    };
  } catch (error) {
    console.error('Error getting admin stats:', error);
    return {
      totalUsers: 0,
      activeUsers: 0,
      pestDetections: 0,
      cropRecommendations: 0,
      chatInteractions: 0,
      marketChecks: 0,
    };
  }
};

export const updateAdminStats = async (activityType: UserActivity['type']): Promise<void> => {
  try {
    const stats = await getAdminStats();
    
    switch (activityType) {
      case 'pest-detection':
        stats.pestDetections += 1;
        break;
      case 'crop-recommendation':
        stats.cropRecommendations += 1;
        break;
      case 'chat':
        stats.chatInteractions += 1;
        break;
      case 'market-check':
        stats.marketChecks += 1;
        break;
      case 'login':
        stats.activeUsers += 1;
        break;
    }
    
    await AsyncStorage.setItem(ADMIN_STATS_KEY, JSON.stringify(stats));
  } catch (error) {
    console.error('Error updating admin stats:', error);
  }
};

export const incrementUserCount = async (): Promise<void> => {
  try {
    const stats = await getAdminStats();
    stats.totalUsers += 1;
    await AsyncStorage.setItem(ADMIN_STATS_KEY, JSON.stringify(stats));
  } catch (error) {
    console.error('Error incrementing user count:', error);
  }
};

// Session cleanup on logout
export const clearAllUserData = async (userId: string): Promise<void> => {
  try {
    await Promise.all([
      clearChatSession(userId),
      clearPestHistory(userId),
      clearUserActivities(userId),
    ]);
  } catch (error) {
    console.error('Error clearing user data:', error);
  }
};

// Get all user data for admin dashboard
export const getAllUserActivities = async (): Promise<UserActivity[]> => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const activityKeys = keys.filter(key => key.startsWith(USER_ACTIVITY_KEY));
    
    const allActivities: UserActivity[] = [];
    
    for (const key of activityKeys) {
      const activitiesData = await AsyncStorage.getItem(key);
      if (activitiesData) {
        const activities = JSON.parse(activitiesData);
        allActivities.push(...activities);
      }
    }
    
    // Sort by timestamp (newest first)
    return allActivities.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  } catch (error) {
    console.error('Error getting all user activities:', error);
    return [];
  }
};