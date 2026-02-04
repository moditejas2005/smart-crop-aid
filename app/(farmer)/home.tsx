import {
  Cloud,
  Droplets,
  Leaf,
  MapPin,
  Sprout,
  Sun,
  Thermometer,
  Wind,
  Bug,
  TrendingUp,
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import Colors from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import type { WeatherData, CropRecommendation } from '@/types';
import { fetchWeather } from '@/utils/weather';
import { getCropsForConditions } from '@/utils/cropRecommendation';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const router = useRouter();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [recommendations, setRecommendations] = useState<CropRecommendation[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Get current time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Map user soil type to recommendation engine soil type
  const mapSoilType = (userSoil: string = ''): string => {
    const soilMap: Record<string, string> = {
      'Alluvial Soil': 'loamy',
      'Black Soil': 'clay',
      'Red Soil': 'loamy',
      'Laterite Soil': 'loamy',
      'Desert Soil': 'sandy',
      'Mountain Soil': 'silt'
    };
    return soilMap[userSoil] || 'loamy'; // Default to loamy
  };

  const loadData = async () => {
    try {
      setLoading(true);
      
      // 1. Fetch Weather
      // Use user location or default to Delhi
      const lat = user?.location?.latitude || 28.6139;
      const lon = user?.location?.longitude || 77.2090;
      const weatherData = await fetchWeather(lat, lon);
      setWeather(weatherData);

      // 2. Fetch Recommendations
      // Map user soil to engine format
      const mappedSoil = mapSoilType(user?.soilType);
      
      // Basic recommendation based on season (month) and soil
      // Current month determination
      const month = new Date().getMonth(); // 0-11
      let currentSeason = 'winter';
      if (month >= 2 && month <= 5) currentSeason = 'summer';
      else if (month >= 6 && month <= 9) currentSeason = 'monsoon';
      
      // Get crops suitable for this soil and season (approximation)
      const crops = getCropsForConditions(mappedSoil, 'medium');
      
      // Take top 3 suited for soil
      setRecommendations(crops.slice(0, 3).map(c => ({
         name: c.name,
         duration: c.duration,
         expectedYield: c.expectedYield,
         idealSeason: c.idealSeason,
         confidence: c.profitability // mapping profitability to confidence for display
      })));

    } catch (error) {
      console.error('Home data load error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
  };

  const QuickActionCard = ({ 
    icon, 
    title, 
    subtitle, 
    onPress, 
    color = Colors.primary 
  }: {
    icon: React.ReactNode;
    title: string;
    subtitle: string;
    onPress: () => void;
    color?: string;
  }) => (
    <TouchableOpacity style={styles.quickActionCard} onPress={onPress}>
      <View style={[styles.quickActionIcon, { backgroundColor: color }]}>
        {icon}
      </View>
      <Text style={styles.quickActionTitle}>{title}</Text>
      <Text style={styles.quickActionSubtitle}>{subtitle}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 },
      ]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome!</Text>
          <Text style={styles.userName}>{user?.name}</Text>
          <Text style={styles.subGreeting}>{getGreeting()}</Text>
        </View>
        <View style={styles.locationContainer}>
          <MapPin size={16} color={Colors.textLight} />
          <Text style={styles.location}>{user?.location?.city || 'Delhi'}</Text>
        </View>
      </View>

      {/* Weather Card */}
      <View style={styles.weatherCard}>
        <View style={styles.weatherHeader}>
          <Text style={styles.weatherTitle}>Today's Weather</Text>
          <Text style={styles.weatherIcon}>{weather ? getGreeting() === 'Good Evening' ? '🌙' : '☀️' : '...'}</Text>
        </View>
        
        {loading && !weather ? (
           <ActivityIndicator color={Colors.primary} />
        ) : (
          <View style={styles.weatherContent}>
            <View style={styles.temperatureContainer}>
              <Text style={styles.temperature}>{weather?.temperature || '--'}°C</Text>
              <Text style={styles.condition}>{weather?.condition || 'Loading...'}</Text>
            </View>
            <View style={styles.weatherDetails}>
              <View style={styles.weatherDetail}>
                <Droplets size={16} color={Colors.primary} />
                <Text style={styles.weatherDetailText}>{weather?.humidity || '--'}%</Text>
              </View>
              <View style={styles.weatherDetail}>
                <Wind size={16} color={Colors.primary} />
                <Text style={styles.weatherDetailText}>{weather?.windSpeed || '--'} km/h</Text>
              </View>
            </View>
          </View>
        )}
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          <QuickActionCard
            icon={<Sprout size={24} color={Colors.secondary} />}
            title="Crop Recommendations"
            subtitle="Get personalized advice"
            onPress={() => router.push('/(farmer)/crop-recommendation' as any)}
            color={Colors.primary}
          />
          <QuickActionCard
            icon={<Bug size={24} color={Colors.secondary} />}
            title="Pest Detection"
            subtitle="Scan your crops"
            onPress={() => router.push('/(farmer)/pest-detection' as any)}
            color={Colors.warning}
          />
          <QuickActionCard
            icon={<TrendingUp size={24} color={Colors.secondary} />}
            title="Market Prices"
            subtitle="Check latest rates"
            onPress={() => router.push('/(farmer)/market-price' as any)}
            color={Colors.buttonGreen}
          />
          <QuickActionCard
            icon={<Sun size={24} color={Colors.secondary} />}
            title="Weather Info"
            subtitle="Current conditions"
            onPress={() => Alert.alert('Weather', 'Weather details are shown in the card above!')}
            color={Colors.darkGreen}
          />
        </View>
      </View>

      {/* Crop Recommendations */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recommended Crops</Text>
        {recommendations.length > 0 ? (
          recommendations.map((crop, index) => (
            <View key={index} style={styles.cropCard}>
              <View style={styles.cropHeader}>
                <Text style={styles.cropName}>{crop.name}</Text>
                <View style={styles.confidenceBadge}>
                  <Text style={styles.confidenceText}>{crop.confidence}%</Text>
                </View>
              </View>
              <View style={styles.cropDetails}>
                <View style={styles.cropDetail}>
                  <Text style={styles.cropDetailLabel}>Duration:</Text>
                  <Text style={styles.cropDetailValue}>{crop.duration}</Text>
                </View>
                <View style={styles.cropDetail}>
                  <Text style={styles.cropDetailLabel}>Expected Yield:</Text>
                  <Text style={styles.cropDetailValue}>{crop.expectedYield}</Text>
                </View>
                <View style={styles.cropDetail}>
                  <Text style={styles.cropDetailLabel}>Season:</Text>
                  <Text style={styles.cropDetailValue}>{crop.idealSeason}</Text>
                </View>
              </View>
            </View>
          ))
        ) : (
          <Text style={{color: Colors.textLight, fontStyle: 'italic'}}>
            Update your profile Soil Type to see recommendations here.
          </Text>
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
    fontSize: 28,
    fontWeight: '800',
    color: Colors.primary,
    fontFamily: 'System',
    letterSpacing: 0.5,
  },
  userName: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 2,
  },
  subGreeting: {
    fontSize: 14,
    color: Colors.textLight,
    marginTop: 2,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  location: {
    fontSize: 14,
    color: Colors.textLight,
  },
  weatherCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  weatherHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  weatherTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  weatherIcon: {
    fontSize: 32,
  },
  weatherContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  temperatureContainer: {
    flex: 1,
  },
  temperature: {
    fontSize: 36,
    fontWeight: '700',
    color: Colors.primary,
  },
  condition: {
    fontSize: 16,
    color: Colors.textLight,
    marginTop: 4,
  },
  weatherDetails: {
    gap: 12,
  },
  weatherDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  weatherDetailText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: '48%',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickActionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  quickActionSubtitle: {
    fontSize: 12,
    color: Colors.textLight,
    textAlign: 'center',
  },
  cropCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 12,
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cropName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  confidenceBadge: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  confidenceText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.secondary,
  },
  cropDetails: {
    gap: 8,
  },
  cropDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cropDetailLabel: {
    fontSize: 14,
    color: Colors.textLight,
  },
  cropDetailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
  },
});