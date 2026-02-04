
import {
  MapPin,
  RefreshCw,
  Search,
  TrendingDown,
  TrendingUp,
  Filter,
  DollarSign
} from 'lucide-react-native';
import React, { useState, useEffect } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { logUserActivity } from '@/utils/sessionManager';
import { api } from '@/utils/api';

// Use same interface structure as API response logic
interface MarketPrice {
  id: string;
  crop: string;
  variety: string;
  market: string;
  district: string;
  state: string;
  // min/max/modal are actually just mapped to the single price in backend/routes/market.js
  // We will use modalPrice as the display price
  minPrice: number;
  maxPrice: number;
  modalPrice: number;
  date: string;
  trend: 'up' | 'down' | 'stable';
  changePercentage: number;
}

export default function MarketPriceScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [prices, setPrices] = useState<MarketPrice[]>([]);
  const [filteredPrices, setFilteredPrices] = useState<MarketPrice[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'trending-up' | 'trending-down'>('all');

  useEffect(() => {
    loadMarketPrices();
  }, []);

  useEffect(() => {
    filterPrices();
  }, [searchQuery, selectedFilter, prices]);

  const loadMarketPrices = async () => {
    setLoading(true);
    try {
      const data = await api.get('/market-prices');
      if (data.prices && data.prices.length > 0) {
        setPrices(data.prices);
      } else {
        setPrices([]);
      }
      if (user) {
        await logUserActivity(user.id, 'market-check', 'Viewed market prices');
      }
    } catch (error) {
      console.error('Error loading market prices:', error);
      Alert.alert('Error', 'Failed to load market prices');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const data = await api.get('/market-prices');
      if (data.prices && data.prices.length > 0) {
        setPrices(data.prices);
        Alert.alert('Updated', 'Market prices have been refreshed!');
      } else {
        Alert.alert('Info', 'No market prices available.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh prices.');
    } finally {
      setRefreshing(false);
    }
  };

  const filterPrices = () => {
    let result = prices;

    // Filter by Trend
    if (selectedFilter === 'trending-up') {
      result = result.filter(p => p.trend === 'up');
    } else if (selectedFilter === 'trending-down') {
      result = result.filter(p => p.trend === 'down');
    }

    // Filter by Search
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        price =>
          price.crop.toLowerCase().includes(query) ||
          price.variety.toLowerCase().includes(query) ||
          price.market.toLowerCase().includes(query) ||
          price.district.toLowerCase().includes(query) ||
          price.state.toLowerCase().includes(query)
      );
    }

    setFilteredPrices(result);
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp size={16} color={Colors.primary} />;
      case 'down': return <TrendingDown size={16} color={Colors.error} />;
      default: return <DollarSign size={16} color={Colors.textLight} />;
    }
  };

  const PriceCard = ({ item }: { item: MarketPrice }) => (
    <View style={styles.priceCard}>
      <View style={styles.cardHeader}>
        <View style={styles.cropInfo}>
          <Text style={styles.cropName}>{item.crop}</Text>
          {item.variety ? <Text style={styles.variety}>{item.variety}</Text> : null}
        </View>
        <View style={styles.trendBadge}>
          {getTrendIcon(item.trend)}
          <Text style={[styles.trendText, { 
            color: item.trend === 'up' ? Colors.primary : item.trend === 'down' ? Colors.error : Colors.textLight 
          }]}>
            {item.changePercentage ? `${item.changePercentage}%` : item.trend}
          </Text>
        </View>
      </View>

      <View style={styles.priceRow}>
        <Text style={styles.priceLabel}>Price:</Text>
        <Text style={styles.priceValue}>₹{item.modalPrice.toLocaleString()}</Text> 
        <Text style={styles.unitText}> / quintal</Text>
      </View>

      <View style={styles.locationRow}>
        <MapPin size={14} color={Colors.textLight} />
        <Text style={styles.locationText}>
          {item.market}, {item.district}, {item.state}
        </Text>
      </View>

      <View style={styles.metaRow}>
        <Text style={styles.dateText}>
          Date: {new Date(item.date).toLocaleDateString()}
        </Text>
      </View>
    </View>
  );

  const FilterButton = ({ filter, label }: { filter: typeof selectedFilter, label: string }) => (
    <TouchableOpacity
      style={[styles.filterButton, selectedFilter === filter && styles.filterButtonActive]}
      onPress={() => setSelectedFilter(filter)}
    >
      <Text style={[styles.filterButtonText, selectedFilter === filter && styles.filterButtonTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <Text style={styles.title}>Market Prices</Text>
        <Text style={styles.subtitle}>Live rates from local mandis</Text>
        <View style={styles.locationBadge}>
          <MapPin size={14} color={Colors.secondary} />
          <Text style={styles.locationBadgeText}>
            {user?.location?.city || 'All'} Markets
          </Text>
        </View>
      </View>  

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color={Colors.textLight} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search crops or markets..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
          <RefreshCw size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.filtersContainer}>
        <FilterButton filter="all" label="All" />
        <FilterButton filter="trending-up" label="Rising" />
        <FilterButton filter="trending-down" label="Falling" />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredPrices}
          renderItem={PriceCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
             styles.listContainer,
             { paddingBottom: insets.bottom + 20 }
          ]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No prices found.</Text>
            </View>
          }
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { padding: 20, backgroundColor: Colors.primary },
  title: { fontSize: 28, fontWeight: '700', color: Colors.secondary, marginBottom: 4 },
  subtitle: { fontSize: 16, color: Colors.secondary, opacity: 0.9, marginBottom: 8 },
  locationBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.2)', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6, alignSelf: 'flex-start', gap: 4 },
  locationBadgeText: { fontSize: 12, color: Colors.secondary, fontWeight: '600' },
  searchContainer: { flexDirection: 'row', padding: 20, gap: 12 },
  searchInputContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.cardBg, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, gap: 12, borderWidth: 1, borderColor: Colors.border },
  searchInput: { flex: 1, fontSize: 16, color: Colors.text },
  refreshButton: { backgroundColor: Colors.cardBg, borderRadius: 12, padding: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  filtersContainer: { flexDirection: 'row', paddingHorizontal: 20, paddingBottom: 20, gap: 12 },
  filterButton: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: Colors.cardBg, borderWidth: 1, borderColor: Colors.border },
  filterButtonActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterButtonText: { fontSize: 14, color: Colors.text, fontWeight: '500' },
  filterButtonTextActive: { color: Colors.secondary },
  listContainer: { padding: 20 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  priceCard: { backgroundColor: Colors.cardBg, borderRadius: 16, padding: 16, marginBottom: 16, elevation: 3, shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  cropInfo: { flex: 1 },
  cropName: { fontSize: 18, fontWeight: '700', color: Colors.text },
  variety: { fontSize: 14, color: Colors.textLight },
  trendBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.accent, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  trendText: { fontSize: 12, fontWeight: '600' },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 8 },
  priceLabel: { fontSize: 14, color: Colors.textLight, marginRight: 8 },
  priceValue: { fontSize: 20, fontWeight: '700', color: Colors.primary },
  unitText: { fontSize: 14, color: Colors.textLight },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  locationText: { fontSize: 14, color: Colors.textLight },
  metaRow: { marginTop: 4 },
  dateText: { fontSize: 12, color: Colors.textLight },
  emptyContainer: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 16, color: Colors.textLight },
});