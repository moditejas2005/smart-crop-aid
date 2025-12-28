import {
  Calendar,
  ChevronLeft,
  Droplets,
  Mountain,
  RefreshCw,
  Search
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

interface Recommendation {
  id: string;
  user_id: string | null;
  soil_type: string;
  water_level: string;
  season: string;
  recommendations: any[];
  created_at: string;
  user_name: string | null;
  user_email: string | null;
}

export default function RecommendationsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [filteredRecommendations, setFilteredRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadRecommendations();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredRecommendations(recommendations);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredRecommendations(
        recommendations.filter(
          r =>
            r.soil_type?.toLowerCase().includes(query) ||
            r.season?.toLowerCase().includes(query) ||
            r.user_name?.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, recommendations]);

  const loadRecommendations = async () => {
    setLoading(true);
    try {
      const data = await api.get('/admin/recommendations');
      setRecommendations(data.recommendations);
      setFilteredRecommendations(data.recommendations);
    } catch (error) {
      console.error('Error loading recommendations:', error);
      Alert.alert('Error', 'Failed to load recommendations');
    } finally {
      setLoading(false);
    }
  };

  const renderRecommendationCard = ({ item }: { item: Recommendation }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>
            {item.user_name || 'Guest User'}
          </Text>
          {item.user_email && (
            <Text style={styles.userEmail}>{item.user_email}</Text>
          )}
        </View>
        <Text style={styles.timestamp}>
          {new Date(item.created_at).toLocaleDateString()}
        </Text>
      </View>

      <View style={styles.conditionsRow}>
        <View style={styles.conditionBadge}>
          <Mountain size={14} color={Colors.primary} />
          <Text style={styles.conditionText}>{item.soil_type}</Text>
        </View>
        <View style={styles.conditionBadge}>
          <Droplets size={14} color={Colors.primary} />
          <Text style={styles.conditionText}>{item.water_level}</Text>
        </View>
        <View style={styles.conditionBadge}>
          <Calendar size={14} color={Colors.primary} />
          <Text style={styles.conditionText}>{item.season}</Text>
        </View>
      </View>

      <View style={styles.recommendationsSection}>
        <Text style={styles.recommendationsLabel}>
          Recommended Crops ({item.recommendations?.length || 0}):
        </Text>
        <Text style={styles.cropsList}>
          {item.recommendations?.slice(0, 3).map(r => r.name).join(', ') || 'N/A'}
          {(item.recommendations?.length || 0) > 3 && '...'}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Recommendations</Text>
        <TouchableOpacity onPress={loadRecommendations} style={styles.refreshButton}>
          <RefreshCw size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Search size={20} color={Colors.textLight} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by soil, season, or user..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{recommendations.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: Colors.primary }]}>
            {recommendations.filter(r => r.user_id).length}
          </Text>
          <Text style={styles.statLabel}>From Users</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: Colors.warning }]}>
            {recommendations.filter(r => !r.user_id).length}
          </Text>
          <Text style={styles.statLabel}>From Guests</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading recommendations...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredRecommendations}
          renderItem={renderRecommendationCard}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No recommendations found</Text>
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
    fontSize: 20,
    fontWeight: '700',
    color: Colors.primary,
  },
  statLabel: {
    fontSize: 10,
    color: Colors.textLight,
    marginTop: 4,
    textAlign: 'center',
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
  card: {
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  userInfo: {},
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  userEmail: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 2,
  },
  timestamp: {
    fontSize: 12,
    color: Colors.textLight,
  },
  conditionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  conditionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accent,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  conditionText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.text,
    textTransform: 'capitalize',
  },
  recommendationsSection: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 12,
  },
  recommendationsLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textLight,
    marginBottom: 4,
  },
  cropsList: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textLight,
  },
});
