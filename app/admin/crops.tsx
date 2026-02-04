import {
  Calendar,
  ChevronLeft,
  Droplets,
  Leaf,
  RefreshCw,
  Search,
  Sprout,
  User
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

interface Crop {
  id: string;
  user_id: string;
  crop_name: string;
  variety: string;
  planting_date: string;
  expected_harvest_date: string;
  actual_harvest_date: string;
  status: 'recommended' | 'planted' | 'growing' | 'harvested' | 'failed';
  area: number;
  soil_type: string;
  irrigation_type: string;
  notes: string;
  yield_amount: number;
  yield_unit: string;
  created_at: string;
  user_name: string;
  user_email: string;
}

export default function CropsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [crops, setCrops] = useState<Crop[]>([]);
  const [filteredCrops, setFilteredCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadCrops();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredCrops(crops);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredCrops(
        crops.filter(
          c =>
            c.crop_name?.toLowerCase().includes(query) ||
            c.user_name?.toLowerCase().includes(query) ||
            c.variety?.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, crops]);

  const loadCrops = async () => {
    setLoading(true);
    try {
      const data = await api.get('/admin/crops');
      setCrops(data.crops);
      setFilteredCrops(data.crops);
    } catch (error) {
      console.error('Error loading crops:', error);
      Alert.alert('Error', 'Failed to load crops');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'harvested':
        return Colors.buttonGreen;
      case 'growing':
        return Colors.primary;
      case 'planted':
        return '#3b82f6';
      case 'recommended':
        return Colors.warning;
      case 'failed':
        return Colors.error;
      default:
        return Colors.textLight;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'harvested':
        return <Leaf size={14} color={Colors.secondary} />;
      case 'growing':
        return <Sprout size={14} color={Colors.secondary} />;
      default:
        return <Sprout size={14} color={Colors.secondary} />;
    }
  };

  const renderCropCard = ({ item }: { item: Crop }) => (
    <View style={styles.cropCard}>
      <View style={styles.cropHeader}>
        <View style={[styles.cropIcon, { backgroundColor: getStatusColor(item.status) }]}>
          <Sprout size={24} color={Colors.secondary} />
        </View>
        <View style={styles.cropInfo}>
          <Text style={styles.cropName}>{item.crop_name}</Text>
          {item.variety && (
            <Text style={styles.varietyText}>Variety: {item.variety}</Text>
          )}
          <View style={styles.userRow}>
            <User size={14} color={Colors.textLight} />
            <Text style={styles.userName}>{item.user_name || 'Unknown User'}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          {getStatusIcon(item.status)}
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>

      <View style={styles.detailsGrid}>
        {item.planting_date && (
          <View style={styles.detailItem}>
            <Calendar size={16} color={Colors.primary} />
            <View>
              <Text style={styles.detailLabel}>Planted</Text>
              <Text style={styles.detailValue}>
                {new Date(item.planting_date).toLocaleDateString()}
              </Text>
            </View>
          </View>
        )}
        {item.expected_harvest_date && (
          <View style={styles.detailItem}>
            <Calendar size={16} color={Colors.buttonGreen} />
            <View>
              <Text style={styles.detailLabel}>Expected Harvest</Text>
              <Text style={styles.detailValue}>
                {new Date(item.expected_harvest_date).toLocaleDateString()}
              </Text>
            </View>
          </View>
        )}
        {item.soil_type && (
          <View style={styles.detailItem}>
            <Leaf size={16} color={Colors.warning} />
            <View>
              <Text style={styles.detailLabel}>Soil Type</Text>
              <Text style={styles.detailValue}>{item.soil_type}</Text>
            </View>
          </View>
        )}
        {item.irrigation_type && (
          <View style={styles.detailItem}>
            <Droplets size={16} color={'#3b82f6'} />
            <View>
              <Text style={styles.detailLabel}>Irrigation</Text>
              <Text style={styles.detailValue}>{item.irrigation_type}</Text>
            </View>
          </View>
        )}
      </View>

      {item.area && (
        <View style={styles.areaRow}>
          <Text style={styles.areaText}>Area: {item.area} acres</Text>
          {item.yield_amount && (
            <Text style={styles.yieldText}>
              Yield: {item.yield_amount} {item.yield_unit || 'kg'}
            </Text>
          )}
        </View>
      )}

      <View style={styles.cropMeta}>
        <Text style={styles.metaText}>
          Added: {new Date(item.created_at).toLocaleDateString()}
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
        <Text style={styles.title}>Crop Recommendations</Text>
        <TouchableOpacity onPress={loadCrops} style={styles.refreshButton}>
          <RefreshCw size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Search size={20} color={Colors.textLight} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by crop, user, or variety..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{crops.length}</Text>
          <Text style={styles.statLabel}>Total Crops</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: Colors.primary }]}>
            {crops.filter(c => c.status === 'growing').length}
          </Text>
          <Text style={styles.statLabel}>Growing</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: Colors.buttonGreen }]}>
            {crops.filter(c => c.status === 'harvested').length}
          </Text>
          <Text style={styles.statLabel}>Harvested</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading crops...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredCrops}
          renderItem={renderCropCard}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Sprout size={48} color={Colors.textLight} />
              <Text style={styles.emptyText}>No crops found</Text>
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
  cropCard: {
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
  cropHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  cropIcon: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cropInfo: {
    flex: 1,
  },
  cropName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  varietyText: {
    fontSize: 14,
    color: Colors.textLight,
    marginTop: 2,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  userName: {
    fontSize: 14,
    color: Colors.textLight,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.secondary,
    textTransform: 'capitalize',
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: '45%',
  },
  detailLabel: {
    fontSize: 11,
    color: Colors.textLight,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.text,
  },
  areaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  areaText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  yieldText: {
    fontSize: 14,
    color: Colors.buttonGreen,
    fontWeight: '500',
  },
  cropMeta: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  metaText: {
    fontSize: 12,
    color: Colors.textLight,
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
