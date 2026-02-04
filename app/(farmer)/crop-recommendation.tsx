import { AlertCircle, Calendar, Droplets, Mountain, Sprout, TrendingUp } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Colors from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import type { CropRecommendationRequest, EnhancedCropRecommendation } from '@/types';
import { getCropRecommendations } from '@/utils/cropRecommendation';
import { logUserActivity } from '@/utils/sessionManager';
import { api } from '@/utils/api';

const SOIL_TYPES = [
  { id: 'clay', name: 'Clay Soil', description: 'Heavy, nutrient-rich soil' },
  { id: 'sandy', name: 'Sandy Soil', description: 'Light, well-draining soil' },
  { id: 'loamy', name: 'Loamy Soil', description: 'Balanced, fertile soil' },
  { id: 'silt', name: 'Silt Soil', description: 'Fine particles, good fertility' },
  { id: 'peat', name: 'Peat Soil', description: 'Organic, acidic soil' },
  { id: 'chalk', name: 'Chalk Soil', description: 'Alkaline, free-draining soil' },
];

const WATER_LEVELS = [
  { id: 'low', name: 'Low Water', description: 'Limited irrigation, rain-fed' },
  { id: 'medium', name: 'Medium Water', description: 'Moderate irrigation available' },
  { id: 'high', name: 'High Water', description: 'Abundant water supply' },
];

const SEASONS = [
  { id: 'spring', name: 'Spring', description: 'March - May' },
  { id: 'summer', name: 'Summer', description: 'June - August' },
  { id: 'monsoon', name: 'Monsoon', description: 'July - September' },
  { id: 'winter', name: 'Winter', description: 'October - February' },
];

export default function CropRecommendationScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [selectedSoil, setSelectedSoil] = useState<string>('');
  const [selectedWater, setSelectedWater] = useState<string>('');
  const [selectedSeason, setSelectedSeason] = useState<string>('');
  const [recommendations, setRecommendations] = useState<EnhancedCropRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const handleGetRecommendations = async () => {
    if (!selectedSoil || !selectedWater || !selectedSeason) {
      console.log('Missing selections');
      return;
    }

    setLoading(true);
    console.log('Getting crop recommendations with AI...');

    try {
      const request: CropRecommendationRequest = {
        soilType: selectedSoil as any,
        waterAvailability: selectedWater as any,
        season: selectedSeason as any,
        location: user?.location, // Optional for guest users
      };

      const results = await getCropRecommendations(request, true); // Enable AI (Phase 3 Fix)
      setRecommendations(results);
      setShowResults(true);

      // Save recommendations to database (user_id is optional)
      try {
        await api.post('/recommendations', {
          user_id: user?.id || null,  // null for guests
          soil_type: selectedSoil,
          water_level: selectedWater,
          season: selectedSeason,
          recommendations: results
        });
        console.log('Recommendations saved to database');
      } catch (saveError) {
        // Don't block user experience if save fails
        console.log('Could not save recommendations:', saveError);
      }

      // Log activity only if user is logged in
      if (user) {
        await logUserActivity(
          user.id,
          'crop-recommendation',
          `Requested recommendations for ${selectedSoil} soil, ${selectedWater} water, ${selectedSeason} season`
        );
      } else {
        console.log('Guest user - activity not logged');
      }

      console.log('Recommendations loaded successfully');
    } catch (error) {
      console.error('Error getting recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedSoil('');
    setSelectedWater('');
    setSelectedSeason('');
    setRecommendations([]);
    setShowResults(false);
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return Colors.buttonGreen;
      case 'medium': return Colors.warning;
      case 'high': return Colors.error;
      default: return Colors.textLight;
    }
  };

  const getWaterIcon = (requirement: string) => {
    switch (requirement) {
      case 'low': return <Droplets size={16} color={Colors.buttonGreen} />;
      case 'medium': return <Droplets size={16} color={Colors.warning} />;
      case 'high': return <Droplets size={16} color={Colors.primary} />;
      default: return <Droplets size={16} color={Colors.textLight} />;
    }
  };

  const SelectionCard = ({
    title,
    options,
    selected,
    onSelect,
    icon
  }: {
    title: string;
    options: any[];
    selected: string;
    onSelect: (id: string) => void;
    icon: React.ReactNode;
  }) => (
    <View style={styles.selectionCard}>
      <View style={styles.selectionHeader}>
        {icon}
        <Text style={styles.selectionTitle}>{title}</Text>
      </View>
      <View style={styles.optionsGrid}>
        {options.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.optionButton,
              selected === option.id && styles.selectedOption
            ]}
            onPress={() => onSelect(option.id)}
          >
            <Text style={[
              styles.optionName,
              selected === option.id && styles.selectedOptionText
            ]}>
              {option.name}
            </Text>
            <Text style={[
              styles.optionDescription,
              selected === option.id && styles.selectedOptionDescription
            ]}>
              {option.description}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const RecommendationCard = ({ item }: { item: EnhancedCropRecommendation }) => (
    <View style={styles.recommendationCard}>
      <View style={styles.recommendationHeader}>
        <View style={styles.cropInfo}>
          <Text style={styles.cropName}>{item.name}</Text>
          <View style={styles.confidenceBadge}>
            <Text style={styles.confidenceText}>{item.confidence}% Match</Text>
          </View>
        </View>
        <View style={styles.riskBadge}>
          <AlertCircle size={14} color={getRiskColor(item.riskLevel)} />
          <Text style={[styles.riskText, { color: getRiskColor(item.riskLevel) }]}>
            {item.riskLevel.toUpperCase()} RISK
          </Text>
        </View>
      </View>

      <View style={styles.cropDetails}>
        <View style={styles.detailRow}>
          <Calendar size={16} color={Colors.textLight} />
          <Text style={styles.detailText}>Duration: {item.duration}</Text>
        </View>
        <View style={styles.detailRow}>
          <TrendingUp size={16} color={Colors.textLight} />
          <Text style={styles.detailText}>Yield: {item.expectedYield}</Text>
        </View>
        <View style={styles.detailRow}>
          {getWaterIcon(item.waterRequirement)}
          <Text style={styles.detailText}>Water: {item.waterRequirement}</Text>
        </View>
      </View>

      <View style={styles.metricsRow}>
        <View style={styles.metric}>
          <Text style={styles.metricValue}>{item.soilSuitability}%</Text>
          <Text style={styles.metricLabel}>Soil Match</Text>
        </View>
        <View style={styles.metric}>
          <Text style={styles.metricValue}>{item.profitability}%</Text>
          <Text style={styles.metricLabel}>Profitability</Text>
        </View>
        <View style={styles.metric}>
          <Text style={styles.metricValue}>{item.marketDemand}%</Text>
          <Text style={styles.metricLabel}>Market Demand</Text>
        </View>
      </View>

      <View style={styles.tipsSection}>
        <Text style={styles.tipsTitle}>Seasonal Tips:</Text>
        {item.seasonalTips.slice(0, 2).map((tip, index) => (
          <Text key={index} style={styles.tipText}>• {tip}</Text>
        ))}
      </View>
    </View>
  );

  if (showResults) {
    return (
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
          <Text style={styles.title}>Crop Recommendations</Text>
          <Text style={styles.subtitle}>
            Based on your soil and water conditions
          </Text>
          <TouchableOpacity style={styles.backButton} onPress={resetForm}>
            <Text style={styles.backButtonText}>New Search</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={recommendations}
          renderItem={RecommendationCard}
          keyExtractor={(item) => item.name}
          contentContainerStyle={[
            styles.recommendationsList,
            { paddingBottom: insets.bottom + 20 }
          ]}
          showsVerticalScrollIndicator={false}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <Text style={styles.title}>Crop Recommendations</Text>
        <Text style={styles.subtitle}>
          Get personalized crop suggestions based on your conditions
        </Text>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        <SelectionCard
          title="Soil Type"
          options={SOIL_TYPES}
          selected={selectedSoil}
          onSelect={setSelectedSoil}
          icon={<Mountain size={20} color={Colors.primary} />}
        />

        <SelectionCard
          title="Water Availability"
          options={WATER_LEVELS}
          selected={selectedWater}
          onSelect={setSelectedWater}
          icon={<Droplets size={20} color={Colors.primary} />}
        />

        <SelectionCard
          title="Growing Season"
          options={SEASONS}
          selected={selectedSeason}
          onSelect={setSelectedSeason}
          icon={<Calendar size={20} color={Colors.primary} />}
        />

        <TouchableOpacity
          style={[
            styles.getRecommendationsButton,
            {
              opacity: selectedSoil && selectedWater && selectedSeason ? 1 : 0.5
            }
          ]}
          onPress={handleGetRecommendations}
          disabled={!selectedSoil || !selectedWater || !selectedSeason || loading}
        >
          {loading ? (
            <ActivityIndicator color={Colors.secondary} />
          ) : (
            <>
              <Sprout size={20} color={Colors.secondary} />
              <Text style={styles.buttonText}>Get Recommendations</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: 20,
    backgroundColor: Colors.primary,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.secondary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.secondary,
    opacity: 0.9,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
  },
  backButtonText: {
    color: Colors.secondary,
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  selectionCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  selectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginLeft: 8,
  },
  optionsGrid: {
    gap: 12,
  },
  optionButton: {
    backgroundColor: Colors.accent,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedOption: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  optionName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  selectedOptionText: {
    color: Colors.secondary,
  },
  optionDescription: {
    fontSize: 14,
    color: Colors.textLight,
  },
  selectedOptionDescription: {
    color: Colors.secondary,
    opacity: 0.9,
  },
  getRecommendationsButton: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 20,
  },
  buttonText: {
    color: Colors.secondary,
    fontSize: 18,
    fontWeight: '700',
  },
  recommendationsList: {
    padding: 20,
  },
  recommendationCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recommendationHeader: {
    marginBottom: 16,
  },
  cropInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cropName: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    flex: 1,
  },
  confidenceBadge: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  confidenceText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.secondary,
  },
  riskBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  riskText: {
    fontSize: 12,
    fontWeight: '600',
  },
  cropDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: Colors.text,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    paddingVertical: 12,
    backgroundColor: Colors.accent,
    borderRadius: 12,
  },
  metric: {
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
  },
  metricLabel: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 2,
  },
  tipsSection: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 16,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  tipText: {
    fontSize: 13,
    color: Colors.textLight,
    lineHeight: 18,
    marginBottom: 4,
  },
});