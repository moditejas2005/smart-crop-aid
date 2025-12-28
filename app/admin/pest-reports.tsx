import {
  AlertTriangle,
  Bug,
  ChevronLeft,
  RefreshCw,
  Search,
  User
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
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

interface PestReport {
  id: string;
  user_id: string;
  image_url: string;
  pest_name: string;
  confidence: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  ai_analysis: string;
  treatment_recommended: string;
  treatment_status: string;
  created_at: string;
  user_name: string;
  user_email: string;
  crop_name: string;
}

export default function PestReportsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [reports, setReports] = useState<PestReport[]>([]);
  const [filteredReports, setFilteredReports] = useState<PestReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadReports();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredReports(reports);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredReports(
        reports.filter(
          r =>
            r.pest_name?.toLowerCase().includes(query) ||
            r.user_name?.toLowerCase().includes(query) ||
            r.crop_name?.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, reports]);

  const loadReports = async () => {
    setLoading(true);
    try {
      const data = await api.get('/admin/pest-reports');
      setReports(data.reports);
      setFilteredReports(data.reports);
    } catch (error) {
      console.error('Error loading pest reports:', error);
      Alert.alert('Error', 'Failed to load pest reports');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return '#dc2626';
      case 'high':
        return Colors.error;
      case 'medium':
        return Colors.warning;
      case 'low':
        return Colors.buttonGreen;
      default:
        return Colors.textLight;
    }
  };

  const renderReportCard = ({ item }: { item: PestReport }) => (
    <View style={styles.reportCard}>
      <View style={styles.reportHeader}>
        {item.image_url ? (
          <Image source={{ uri: item.image_url }} style={styles.reportImage} />
        ) : (
          <View style={[styles.reportImage, styles.noImage]}>
            <Bug size={32} color={Colors.textLight} />
          </View>
        )}
        <View style={styles.reportInfo}>
          <Text style={styles.pestName}>{item.pest_name || 'Unknown Pest'}</Text>
          <View style={styles.severityRow}>
            <AlertTriangle size={14} color={getSeverityColor(item.severity)} />
            <Text style={[styles.severityText, { color: getSeverityColor(item.severity) }]}>
              {item.severity?.toUpperCase() || 'N/A'}
            </Text>
            <Text style={styles.confidenceText}>
              {item.confidence ? `${(item.confidence * 100).toFixed(0)}% confidence` : ''}
            </Text>
          </View>
          <View style={styles.userRow}>
            <User size={14} color={Colors.textLight} />
            <Text style={styles.userName}>{item.user_name || 'Unknown User'}</Text>
          </View>
          {item.crop_name && (
            <Text style={styles.cropName}>Crop: {item.crop_name}</Text>
          )}
        </View>
      </View>

      {item.description && (
        <View style={styles.descriptionSection}>
          <Text style={styles.sectionLabel}>Description:</Text>
          <Text style={styles.descriptionText} numberOfLines={2}>
            {item.description}
          </Text>
        </View>
      )}

      {item.treatment_recommended && (
        <View style={styles.treatmentSection}>
          <Text style={styles.sectionLabel}>Treatment:</Text>
          <Text style={styles.treatmentText} numberOfLines={2}>
            {item.treatment_recommended}
          </Text>
        </View>
      )}

      <View style={styles.reportMeta}>
        <Text style={styles.metaText}>
          {new Date(item.created_at).toLocaleString()}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: item.treatment_status === 'completed' ? Colors.buttonGreen : Colors.warning }]}>
          <Text style={styles.statusText}>{item.treatment_status || 'pending'}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Pest Reports</Text>
        <TouchableOpacity onPress={loadReports} style={styles.refreshButton}>
          <RefreshCw size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Search size={20} color={Colors.textLight} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by pest, user, or crop..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{reports.length}</Text>
          <Text style={styles.statLabel}>Total Reports</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: Colors.error }]}>
            {reports.filter(r => r.severity === 'high' || r.severity === 'critical').length}
          </Text>
          <Text style={styles.statLabel}>High Severity</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading pest reports...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredReports}
          renderItem={renderReportCard}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Bug size={48} color={Colors.textLight} />
              <Text style={styles.emptyText}>No pest reports found</Text>
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
  reportCard: {
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
  reportHeader: {
    flexDirection: 'row',
  },
  reportImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 12,
  },
  noImage: {
    backgroundColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reportInfo: {
    flex: 1,
  },
  pestName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  severityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  severityText: {
    fontSize: 12,
    fontWeight: '700',
  },
  confidenceText: {
    fontSize: 12,
    color: Colors.textLight,
    marginLeft: 8,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  userName: {
    fontSize: 14,
    color: Colors.textLight,
  },
  cropName: {
    fontSize: 12,
    color: Colors.primary,
    marginTop: 2,
  },
  descriptionSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  descriptionText: {
    fontSize: 14,
    color: Colors.textLight,
    lineHeight: 20,
  },
  treatmentSection: {
    marginTop: 8,
  },
  treatmentText: {
    fontSize: 14,
    color: Colors.buttonGreen,
    lineHeight: 20,
  },
  reportMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  metaText: {
    fontSize: 12,
    color: Colors.textLight,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.secondary,
    textTransform: 'capitalize',
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
