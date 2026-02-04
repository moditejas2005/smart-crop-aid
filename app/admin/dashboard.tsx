import {
    BarChart3,
    Bug,
    DollarSign,
    LogOut,
    RefreshCw,
    Sprout,
    TrendingUp,
    Users
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import Colors from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import type { AdminStats, UserActivity } from '@/types';
import { api } from '@/utils/api';

export default function AdminDashboard() {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const router = useRouter(); // Added router usage if needed
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      if (!user) return;
      
      const data = await api.get('/admin/stats');
      
      setStats(data.stats);
      setActivities(data.activities);
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      Alert.alert('Error', 'Failed to load real data from database');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: logout },
      ]
    );
  };

  const StatCard = ({ 
    icon, 
    title, 
    value, 
    subtitle, 
    color = Colors.primary 
  }: {
    icon: React.ReactNode;
    title: string;
    value: string;
    subtitle: string;
    color?: string;
  }) => (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: color }]}>
        {icon}
      </View>
      <View style={styles.statContent}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
        <Text style={styles.statSubtitle}>{subtitle}</Text>
      </View>
    </View>
  );

  const ActionCard = ({ 
    icon, 
    title, 
    description, 
    onPress 
  }: {
    icon: React.ReactNode;
    title: string;
    description: string;
    onPress: () => void;
  }) => (
    <TouchableOpacity style={styles.actionCard} onPress={onPress}>
      <View style={styles.actionIcon}>
        {icon}
      </View>
      <View style={styles.actionContent}>
        <Text style={styles.actionTitle}>{title}</Text>
        <Text style={styles.actionDescription}>{description}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back!</Text>
          <Text style={styles.userName}>{user?.name}</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.refreshButton} onPress={loadDashboardData}>
            <RefreshCw size={20} color={Colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <LogOut size={20} color={Colors.error} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Statistics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Overview</Text>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Loading dashboard data...</Text>
          </View>
        ) : (
          <View style={styles.statsGrid}>
            <StatCard
              icon={<Users size={24} color={Colors.secondary} />}
              title="Total Users"
              value={stats?.totalUsers.toString() || '0'}
              subtitle={`${stats?.activeUsers || 0} active users`}
              color={Colors.primary}
            />
            <StatCard
              icon={<Bug size={24} color={Colors.secondary} />}
              title="Pest Detections"
              value={stats?.pestDetections.toString() || '0'}
              subtitle="AI-powered detections"
              color={Colors.warning}
            />
            <StatCard
              icon={<Sprout size={24} color={Colors.secondary} />}
              title="Crop Recommendations"
              value={stats?.cropRecommendations.toString() || '0'}
              subtitle="Personalized suggestions"
              color={Colors.buttonGreen}
            />
            <StatCard
              icon={<Sprout size={24} color={Colors.secondary} />}
              title="Recommendations"
              value={stats?.chatInteractions.toString() || '0'}
              subtitle="Saved to database"
              color={Colors.darkGreen}
            />
          </View>
        )}
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Management</Text>
        <ActionCard
          icon={<Users size={24} color={Colors.primary} />}
          title="User Management"
          description="View and manage farmer accounts"
          onPress={() => router.push('/admin/users' as any)}
        />
        <ActionCard
          icon={<Sprout size={24} color={Colors.primary} />}
          title="Crop Database"
          description="Manage crop recommendations and data"
          onPress={() => router.push('/admin/crops' as any)}
        />
        <ActionCard
          icon={<Bug size={24} color={Colors.primary} />}
          title="Pest & Disease Info"
          description="View all pest detection reports"
          onPress={() => router.push('/admin/pest-reports' as any)}
        />
        <ActionCard
          icon={<Sprout size={24} color={Colors.primary} />}
          title="Recommendations"
          description="View saved crop recommendations"
          onPress={() => router.push('/admin/recommendations' as any)}
        />
        <ActionCard
          icon={<DollarSign size={24} color={Colors.primary} />}
          title="Market Prices"
          description="Add and manage market prices"
          onPress={() => router.push('/admin/market-prices' as any)}
        />
      </View>

      {/* Recent Activity */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent User Activity</Text>
        {activities.length > 0 ? (
          <View style={styles.activityList}>
            {activities.map((activity) => (
              <View key={activity.id} style={styles.activityItem}>
                <View style={styles.activityDot} />
                <View style={styles.activityContent}>
                  <Text style={styles.activityText}>
                    {activity.details}
                  </Text>
                  <Text style={styles.activityTime}>
                    {new Date(activity.timestamp).toLocaleString()}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyActivity}>
            <Text style={styles.emptyActivityText}>No recent activity</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 16,
    color: Colors.textLight,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 4,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  refreshButton: {
    padding: 8,
  },
  logoutButton: {
    padding: 8,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.textLight,
  },
  emptyActivity: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: Colors.cardBg,
    borderRadius: 12,
  },
  emptyActivityText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.textLight,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 16,
    padding: 16,
    width: '48%',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statContent: {
    alignItems: 'flex-start',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  statSubtitle: {
    fontSize: 12,
    color: Colors.textLight,
  },
  actionCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 14,
    color: Colors.textLight,
  },
  activityList: {
    backgroundColor: Colors.cardBg,
    borderRadius: 12,
    padding: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    marginTop: 6,
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 14,
    color: Colors.text,
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
    color: Colors.textLight,
  },
});