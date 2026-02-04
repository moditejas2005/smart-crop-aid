import {
  Ban,
  CheckCircle,
  ChevronLeft,
  Mail,
  MapPin,
  RefreshCw,
  Search,
  Shield,
  User,
  UserX
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import Colors from '@/constants/colors';
import { api } from '@/utils/api';

interface AdminUser {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: 'farmer' | 'admin';
  is_banned: boolean;
  location?: string;
  created_at: string;
  last_active: string;
}

export default function UsersScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredUsers(users);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredUsers(
        users.filter(
          u =>
            u.name.toLowerCase().includes(query) ||
            u.email.toLowerCase().includes(query) ||
            u.location?.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, users]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await api.get('/admin/users');
      setUsers(data.users);
      setFilteredUsers(data.users);
    } catch (error) {
      console.error('Error loading users:', error);
      Alert.alert('Error', 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleBanUser = async (user: AdminUser) => {
    Alert.alert(
      'Ban User',
      `Are you sure you want to ban ${user.name}? They will not be able to login.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Ban',
          style: 'destructive',
          onPress: async () => {
            setActionLoading(user.id);
            try {
              await api.put(`/admin/users/${user.id}/ban`, {});
              setUsers(prev =>
                prev.map(u => (u.id === user.id ? { ...u, is_banned: true } : u))
              );
              Alert.alert('Success', `${user.name} has been banned`);
            } catch (error) {
              console.error('Error banning user:', error);
              Alert.alert('Error', 'Failed to ban user');
            } finally {
              setActionLoading(null);
            }
          }
        }
      ]
    );
  };

  const handleUnbanUser = async (user: AdminUser) => {
    Alert.alert(
      'Unban User',
      `Are you sure you want to unban ${user.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unban',
          onPress: async () => {
            setActionLoading(user.id);
            try {
              await api.put(`/admin/users/${user.id}/unban`, {});
              setUsers(prev =>
                prev.map(u => (u.id === user.id ? { ...u, is_banned: false } : u))
              );
              Alert.alert('Success', `${user.name} has been unbanned`);
            } catch (error) {
              console.error('Error unbanning user:', error);
              Alert.alert('Error', 'Failed to unban user');
            } finally {
              setActionLoading(null);
            }
          }
        }
      ]
    );
  };

  const renderUserCard = ({ item }: { item: AdminUser }) => (
    <View style={[styles.userCard, item.is_banned && styles.bannedCard]}>
      <View style={styles.userHeader}>
        <View style={[styles.avatar, item.is_banned && styles.bannedAvatar]}>
          {item.is_banned ? (
            <UserX size={24} color={Colors.error} />
          ) : (
            <User size={24} color={Colors.primary} />
          )}
        </View>
        <View style={styles.userInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.userName}>{item.name}</Text>
            {item.role === 'admin' && (
              <View style={styles.adminBadge}>
                <Shield size={12} color={Colors.secondary} />
                <Text style={styles.adminBadgeText}>Admin</Text>
              </View>
            )}
            {item.is_banned && (
              <View style={styles.bannedBadge}>
                <Ban size={12} color={Colors.secondary} />
                <Text style={styles.bannedBadgeText}>Banned</Text>
              </View>
            )}
          </View>
          <View style={styles.emailRow}>
            <Mail size={14} color={Colors.textLight} />
            <Text style={styles.userEmail}>{item.email}</Text>
          </View>
          {item.location && typeof item.location === 'string' && (
            <View style={styles.locationRow}>
              <MapPin size={14} color={Colors.textLight} />
              <Text style={styles.userLocation}>{item.location}</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.userMeta}>
        <Text style={styles.metaText}>
          Joined: {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'N/A'}
        </Text>
        <Text style={styles.metaText}>
          Last Active: {item.last_active ? new Date(item.last_active).toLocaleDateString() : 'N/A'}
        </Text>
      </View>

      {item.role !== 'admin' && (
        <View style={styles.actionButtons}>
          {actionLoading === item.id ? (
            <ActivityIndicator size="small" color={Colors.primary} />
          ) : item.is_banned ? (
            <TouchableOpacity
              style={styles.unbanButton}
              onPress={() => handleUnbanUser(item)}
            >
              <CheckCircle size={18} color={Colors.secondary} />
              <Text style={styles.unbanButtonText}>Unban User</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.banButton}
              onPress={() => handleBanUser(item)}
            >
              <Ban size={18} color={Colors.secondary} />
              <Text style={styles.banButtonText}>Ban User</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>User Management</Text>
        <TouchableOpacity onPress={loadUsers} style={styles.refreshButton}>
          <RefreshCw size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Search size={20} color={Colors.textLight} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search users..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{users.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {users.filter(u => !u.is_banned).length}
          </Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: Colors.error }]}>
            {users.filter(u => u.is_banned).length}
          </Text>
          <Text style={styles.statLabel}>Banned</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading users...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredUsers}
          renderItem={renderUserCard}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <User size={48} color={Colors.textLight} />
              <Text style={styles.emptyText}>No users found</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  refreshButton: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBg,
    margin: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    marginHorizontal: 16,
    backgroundColor: Colors.cardBg,
    borderRadius: 12,
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.textLight,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  userCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bannedCard: {
    borderWidth: 1,
    borderColor: Colors.error,
    opacity: 0.85,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  bannedAvatar: {
    backgroundColor: '#fee2e2',
  },
  userInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    gap: 4,
  },
  adminBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.secondary,
  },
  bannedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.error,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    gap: 4,
  },
  bannedBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.secondary,
  },
  emailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 6,
  },
  userEmail: {
    fontSize: 14,
    color: Colors.textLight,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 6,
  },
  userLocation: {
    fontSize: 14,
    color: Colors.textLight,
  },
  userMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  metaText: {
    fontSize: 12,
    color: Colors.textLight,
  },
  actionButtons: {
    marginTop: 12,
    alignItems: 'center',
  },
  banButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.error,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  banButtonText: {
    color: Colors.secondary,
    fontWeight: '600',
    fontSize: 14,
  },
  unbanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.buttonGreen,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  unbanButtonText: {
    color: Colors.secondary,
    fontWeight: '600',
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.textLight,
  },
});
