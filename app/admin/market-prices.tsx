import {
  ChevronLeft,
  DollarSign,
  Edit2,
  MapPin,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  TrendingDown,
  TrendingUp,
  X
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
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

interface MarketPriceAdmin {
  id: string;
  crop_name: string;
  variety: string;
  price: number;
  unit: string;
  market_name: string;
  location: string;
  region: string;
  date: string;
  trend: 'up' | 'down' | 'stable';
  change_percentage: number;
  created_at: string;
  updated_at: string;
}

interface PriceFormData {
  crop_name: string;
  variety: string;
  price: string;
  unit: string;
  market_name: string;
  location: string;
  region: string;
  date: string;
  trend: 'up' | 'down' | 'stable';
  change_percentage: string;
}

const initialFormData: PriceFormData = {
  crop_name: '',
  variety: '',
  price: '',
  unit: 'per quintal',
  market_name: '',
  location: '',
  region: '',
  date: new Date().toISOString().split('T')[0],
  trend: 'stable',
  change_percentage: '0'
};

export default function MarketPricesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [prices, setPrices] = useState<MarketPriceAdmin[]>([]);
  const [filteredPrices, setFilteredPrices] = useState<MarketPriceAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPrice, setEditingPrice] = useState<MarketPriceAdmin | null>(null);
  const [formData, setFormData] = useState<PriceFormData>(initialFormData);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPrices();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredPrices(prices);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredPrices(
        prices.filter(
          p =>
            p.crop_name.toLowerCase().includes(query) ||
            p.variety?.toLowerCase().includes(query) ||
            p.market_name?.toLowerCase().includes(query) ||
            p.location?.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, prices]);

  const loadPrices = async () => {
    setLoading(true);
    try {
      const data = await api.get('/market-prices/admin');
      setPrices(data.prices);
      setFilteredPrices(data.prices);
    } catch (error) {
      console.error('Error loading market prices:', error);
      Alert.alert('Error', 'Failed to load market prices');
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingPrice(null);
    setFormData(initialFormData);
    setModalVisible(true);
  };

  const openEditModal = (price: MarketPriceAdmin) => {
    setEditingPrice(price);
    setFormData({
      crop_name: price.crop_name,
      variety: price.variety || '',
      price: price.price.toString(),
      unit: price.unit,
      market_name: price.market_name || '',
      location: price.location || '',
      region: price.region || '',
      date: price.date ? new Date(price.date).toISOString().split('T')[0] : '',
      trend: price.trend || 'stable',
      change_percentage: price.change_percentage?.toString() || '0'
    });
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!formData.crop_name.trim() || !formData.price.trim()) {
      Alert.alert('Error', 'Crop name and price are required');
      return;
    }

    setSaving(true);
    try {
      const priceData = {
        crop_name: formData.crop_name,
        variety: formData.variety || null,
        price: parseFloat(formData.price),
        unit: formData.unit,
        market_name: formData.market_name || null,
        location: formData.location || null,
        region: formData.region || null,
        date: formData.date,
        trend: formData.trend,
        change_percentage: parseFloat(formData.change_percentage) || 0
      };

      if (editingPrice) {
        await api.put(`/market-prices/admin/${editingPrice.id}`, priceData);
        Alert.alert('Success', 'Market price updated');
      } else {
        await api.post('/market-prices/admin', priceData);
        Alert.alert('Success', 'Market price created');
      }

      setModalVisible(false);
      loadPrices();
    } catch (error) {
      console.error('Error saving market price:', error);
      Alert.alert('Error', 'Failed to save market price');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (price: MarketPriceAdmin) => {
    Alert.alert(
      'Delete Price',
      `Are you sure you want to delete ${price.crop_name} price?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/market-prices/admin/${price.id}`);
              Alert.alert('Success', 'Market price deleted');
              loadPrices();
            } catch (error) {
              console.error('Error deleting price:', error);
              Alert.alert('Error', 'Failed to delete price');
            }
          }
        }
      ]
    );
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp size={16} color={Colors.primary} />;
      case 'down':
        return <TrendingDown size={16} color={Colors.error} />;
      default:
        return <DollarSign size={16} color={Colors.textLight} />;
    }
  };

  const renderPriceCard = ({ item }: { item: MarketPriceAdmin }) => (
    <View style={styles.priceCard}>
      <View style={styles.cardHeader}>
        <View style={styles.cropInfo}>
          <Text style={styles.cropName}>{item.crop_name}</Text>
          {item.variety && <Text style={styles.variety}>{item.variety}</Text>}
        </View>
        <View style={styles.trendBadge}>
          {getTrendIcon(item.trend)}
          <Text style={[styles.trendText, { color: item.trend === 'up' ? Colors.primary : item.trend === 'down' ? Colors.error : Colors.textLight }]}>
            {item.change_percentage ? `${item.change_percentage}%` : item.trend}
          </Text>
        </View>
      </View>

      <View style={styles.priceRow}>
        <Text style={styles.priceLabel}>Price:</Text>
        <Text style={styles.priceValue}>₹{item.price} {item.unit}</Text>
      </View>

      {item.market_name && (
        <View style={styles.locationRow}>
          <MapPin size={14} color={Colors.textLight} />
          <Text style={styles.locationText}>
            {item.market_name}{item.location ? `, ${item.location}` : ''}{item.region ? `, ${item.region}` : ''}
          </Text>
        </View>
      )}

      <View style={styles.metaRow}>
        <Text style={styles.dateText}>
          Date: {item.date ? new Date(item.date).toLocaleDateString() : 'N/A'}
        </Text>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => openEditModal(item)}
        >
          <Edit2 size={16} color={Colors.secondary} />
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDelete(item)}
        >
          <Trash2 size={16} color={Colors.secondary} />
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Market Prices</Text>
        <TouchableOpacity onPress={loadPrices} style={styles.refreshButton}>
          <RefreshCw size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.toolbar}>
        <View style={styles.searchContainer}>
          <Search size={20} color={Colors.textLight} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search prices..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
          <Plus size={20} color={Colors.secondary} />
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{prices.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: Colors.primary }]}>
            {prices.filter(p => p.trend === 'up').length}
          </Text>
          <Text style={styles.statLabel}>Rising</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: Colors.error }]}>
            {prices.filter(p => p.trend === 'down').length}
          </Text>
          <Text style={styles.statLabel}>Falling</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading prices...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredPrices}
          renderItem={renderPriceCard}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <DollarSign size={48} color={Colors.textLight} />
              <Text style={styles.emptyText}>No market prices found</Text>
              <TouchableOpacity style={styles.emptyAddButton} onPress={openAddModal}>
                <Plus size={16} color={Colors.secondary} />
                <Text style={styles.emptyAddButtonText}>Add First Price</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}

      {/* Add/Edit Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <KeyboardAvoidingView 
          style={[styles.modalContainer, { paddingTop: insets.top }]}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <X size={24} color={Colors.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {editingPrice ? 'Edit Price' : 'Add Price'}
            </Text>
            <TouchableOpacity onPress={handleSave} disabled={saving}>
              {saving ? (
                <ActivityIndicator size="small" color={Colors.primary} />
              ) : (
                <Text style={styles.saveButtonText}>Save</Text>
              )}
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.formContainer}
            contentContainerStyle={{ paddingBottom: 100 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Crop Name *</Text>
              <TextInput
                style={styles.formInput}
                value={formData.crop_name}
                onChangeText={(text) => setFormData(prev => ({ ...prev, crop_name: text }))}
                placeholder="e.g., Wheat, Rice, Tomato"
              />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Variety</Text>
              <TextInput
                style={styles.formInput}
                value={formData.variety}
                onChangeText={(text) => setFormData(prev => ({ ...prev, variety: text }))}
                placeholder="e.g., Basmati, Sharbati"
              />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Price (₹) *</Text>
              <TextInput
                style={styles.formInput}
                value={formData.price}
                onChangeText={(text) => setFormData(prev => ({ ...prev, price: text }))}
                placeholder="e.g., 2500"
                keyboardType="decimal-pad"
              />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Unit</Text>
              <TextInput
                style={styles.formInput}
                value={formData.unit}
                onChangeText={(text) => setFormData(prev => ({ ...prev, unit: text }))}
                placeholder="e.g., per quintal, per kg"
              />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Market Name</Text>
              <TextInput
                style={styles.formInput}
                value={formData.market_name}
                onChangeText={(text) => setFormData(prev => ({ ...prev, market_name: text }))}
                placeholder="e.g., Azadpur Mandi"
              />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>District</Text>
              <TextInput
                style={styles.formInput}
                value={formData.location}
                onChangeText={(text) => setFormData(prev => ({ ...prev, location: text }))}
                placeholder="e.g., Delhi"
              />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>State</Text>
              <TextInput
                style={styles.formInput}
                value={formData.region}
                onChangeText={(text) => setFormData(prev => ({ ...prev, region: text }))}
                placeholder="e.g., Delhi"
              />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Date</Text>
              <TextInput
                style={styles.formInput}
                value={formData.date}
                onChangeText={(text) => setFormData(prev => ({ ...prev, date: text }))}
                placeholder="YYYY-MM-DD"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Trend</Text>
              <View style={styles.trendButtons}>
                {(['up', 'stable', 'down'] as const).map((trend) => (
                  <TouchableOpacity
                    key={trend}
                    style={[
                      styles.trendButton,
                      formData.trend === trend && styles.trendButtonActive
                    ]}
                    onPress={() => setFormData(prev => ({ ...prev, trend }))}
                  >
                    {trend === 'up' && <TrendingUp size={16} color={formData.trend === trend ? Colors.secondary : Colors.primary} />}
                    {trend === 'down' && <TrendingDown size={16} color={formData.trend === trend ? Colors.secondary : Colors.error} />}
                    {trend === 'stable' && <DollarSign size={16} color={formData.trend === trend ? Colors.secondary : Colors.textLight} />}
                    <Text style={[styles.trendButtonText, formData.trend === trend && styles.trendButtonTextActive]}>
                      {trend.charAt(0).toUpperCase() + trend.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Change %</Text>
              <TextInput
                style={styles.formInput}
                value={formData.change_percentage}
                onChangeText={(text) => setFormData(prev => ({ ...prev, change_percentage: text }))}
                placeholder="e.g., 5.5"
                keyboardType="decimal-pad"
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
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
  toolbar: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBg,
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
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  addButtonText: {
    color: Colors.secondary,
    fontWeight: '600',
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
  priceCard: {
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
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cropInfo: {
    flex: 1,
  },
  cropName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  variety: {
    fontSize: 14,
    color: Colors.textLight,
    marginTop: 2,
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.accent,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '600',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: Colors.textLight,
    marginRight: 8,
  },
  priceValue: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  locationText: {
    fontSize: 14,
    color: Colors.textLight,
  },
  metaRow: {
    marginBottom: 12,
  },
  dateText: {
    fontSize: 12,
    color: Colors.textLight,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  editButtonText: {
    color: Colors.secondary,
    fontWeight: '600',
    fontSize: 14,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.error,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  deleteButtonText: {
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
    marginBottom: 16,
  },
  emptyAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  emptyAddButtonText: {
    color: Colors.secondary,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
  formContainer: {
    padding: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: Colors.cardBg,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.text,
  },
  trendButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  trendButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.cardBg,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingVertical: 12,
    gap: 6,
  },
  trendButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  trendButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
  },
  trendButtonTextActive: {
    color: Colors.secondary,
  },
});
