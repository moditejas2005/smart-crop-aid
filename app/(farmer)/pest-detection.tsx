import * as ImagePicker from 'expo-image-picker';
import { Camera, Image as ImageIcon, Leaf } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  Platform
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Colors from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import type { PestDetection } from '@/types';
import { api, API_BASE_URL } from '@/utils/api';

const SERVER_URL = API_BASE_URL.replace(/\/api$/, '');

export default function PestDetectionScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [detections, setDetections] = useState<PestDetection[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [cropType, setCropType] = useState<string>('');

  useEffect(() => {
    loadPestHistory();
  }, [user]);

  const loadPestHistory = async () => {
    if (!user) return;
    
    try {
      const reports = await api.get(`/pests?user_id=${user.id}`);
      
      if (reports && reports.length > 0) {
        const detections: PestDetection[] = reports.map((r: any) => {
            let aiData: any = {};
            try {
                aiData = r.ai_analysis ? JSON.parse(r.ai_analysis) : {};
            } catch (e) {}

            let imageUri = r.image_url;
            if (imageUri && imageUri.startsWith('/uploads')) {
                imageUri = `${SERVER_URL}${imageUri}`;
            }

            return {
                id: r.id,
                userId: r.user_id,
                imageUri: imageUri,
                pestName: r.pest_name || 'Unknown',
                affectedCrop: r.description ? r.description.replace('Detected in ', '') : 'Unknown',
                confidence: r.confidence || 0,
                severity: r.severity || 'low',
                treatment: r.treatment_recommended || '',
                prevention: aiData.prevention || '',
                timestamp: r.created_at,
                detectionMethod: 'ai',
                plantData: aiData.plantData
            };
        });
        setDetections(detections);
      } else {
         const { getPestHistory } = await import('@/utils/sessionManager');
         const history = await getPestHistory(user.id);
         setDetections(history);
      }

    } catch (error) {
      console.error('Error loading pest history:', error);
       try {
        const { getPestHistory } = await import('@/utils/sessionManager');
        const history = await getPestHistory(user.id);
        setDetections(history);
       } catch (localError) {}
    }
  };

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please grant camera roll permissions to upload images.'
      );
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
      analyzeImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please grant camera permissions to take photos.'
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
      analyzeImage(result.assets[0].uri);
    }
  };

  const validateLeafImage = async (imageUri: string): Promise<boolean> => {
    try {
      return new Promise((resolve) => {
        Alert.alert(
          'Image Validation',
          'Please confirm this is a photo of a plant leaf or crop.',
          [
            { text: 'Not a Leaf', style: 'cancel', onPress: () => resolve(false) },
            { text: 'Yes, It\'s a Leaf', onPress: () => resolve(true) },
          ]
        );
      });
    } catch (error) {
      console.error('Error validating image:', error);
      return false;
    }
  };

  const analyzeImage = async (imageUri: string) => {
    const isValidLeaf = await validateLeafImage(imageUri);
    if (!isValidLeaf) {
      setSelectedImage(null);
      return;
    }

    setLoading(true);
    
    try {
      // 1. Upload Image to Backend
      let imageUrl = imageUri;
      if (user) {
        console.log('Uploading image to server...');
        const formData = new FormData();
        formData.append('image', {
          uri: imageUri,
          name: `pest_${Date.now()}.jpg`,
          type: 'image/jpeg',
        } as any);

        try {
           const uploadResponse = await api.post('/upload', formData);
           imageUrl = uploadResponse.url; // Relative path usually
           console.log('Image uploaded to:', imageUrl);
        } catch (uploadError) {
          console.error('Image upload failed:', uploadError);
          Alert.alert('Upload Warning', 'Failed to upload image. Saving locally only.');
        }
      }

      // 2. Mock AI Analysis
      const { analyzeImageForPests } = await import('@/utils/pestDetection');
      const result = await analyzeImageForPests(imageUri, cropType || undefined);
      
      if (imageUrl !== imageUri) {
         result.imageUri = imageUrl;
      }
      
      // 3. Save to Database (or local for guests)
      if (user) {
        result.userId = user.id;
        try {
          console.log('Saving pest report to database...');
          
          await api.post('/pests', {
             user_id: user.id,
             image_url: result.imageUri,
             pest_name: result.pestName,
             confidence: result.confidence,
             severity: result.severity,
             description: `Detected in ${result.affectedCrop}`,
             ai_analysis: JSON.stringify({
                cause: result.cause || 'Unknown cause',
                treatment: result.treatment,
                prevention: result.prevention,
                plantData: result.plantData
             }),
             treatment_recommended: result.treatment,
             location: user.location ? { lat: user.location.latitude, lng: user.location.longitude } : null
          });
          console.log('Report saved!');
        } catch (dbError) {
          console.error('Database save failed:', dbError);
          const { savePestDetection } = await import('@/utils/sessionManager');
          await savePestDetection(user.id, result);
        }
      } else {
         // Guest users - save to local storage
         console.log('Guest user - saving to local storage');
         const { savePestDetection } = await import('@/utils/sessionManager');
         await savePestDetection('guest', result);
      }
      
      // Update UI state with full URL for display if needed
      if (result.imageUri.startsWith('/uploads')) {
          result.imageUri = `${SERVER_URL}${result.imageUri}`;
      }

      setDetections(prev => [result, ...prev]);
      setSelectedImage(null);
      setCropType('');
      
      if (user) {
         Alert.alert('Success', 'Pest report saved!');
      }

    } catch (error) {
      console.error('Error getting analysis:', error);
      Alert.alert('Error', 'Failed to analyze image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  };

  const DetectionCard = ({ item }: { item: PestDetection }) => (
    <View style={styles.detectionCard}>
      <Image source={{ uri: item.imageUri }} style={styles.detectionImage} />
      <View style={styles.detectionContent}>
        <View style={styles.detectionHeader}>
          <Text style={styles.pestName}>{item.pestName}</Text>
          <View style={styles.confidenceBadge}>
            <Text style={styles.confidenceText}>{item.confidence}%</Text>
          </View>
        </View>
        <Text style={styles.affectedCrop}>Affected Crop: {item.affectedCrop}</Text>
        <Text style={styles.timestamp}>{formatDate(item.timestamp)}</Text>
        <View style={styles.treatmentSection}>
          <Text style={styles.sectionTitle}>Treatment:</Text>
          <Text style={styles.sectionContent}>{item.treatment}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <Text style={styles.title}>Pest Detection</Text>
        <Text style={styles.subtitle}>Upload crop leaf images for AI analysis</Text>
      </View>

      {!loading && (
        <View style={styles.infoCard}>
          <Leaf size={20} color={Colors.primary} />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>📸 Photo Guidelines</Text>
            <Text style={styles.infoText}>
              • Take clear photos of plant leaves{'\n'}
              • Ensure good lighting{'\n'}
              • Focus on damaged or diseased areas
            </Text>
          </View>
        </View>
      )}

      {loading && (
        <View style={styles.loadingContainer}>
          <View style={styles.loadingCard}>
            {selectedImage && (
              <Image source={{ uri: selectedImage }} style={styles.analyzingImage} />
            )}
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Analyzing image...</Text>
          </View>
        </View>
      )}

      {!loading && (
        <>
          <View style={styles.cropInputContainer}>
            <View style={styles.cropInputWrapper}>
              <Leaf size={20} color={Colors.primary} />
              <TextInput
                style={styles.cropInput}
                placeholder="Enter crop name (optional)"
                value={cropType}
                onChangeText={setCropType}
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButton} onPress={takePhoto}>
              <Camera size={24} color={Colors.secondary} />
              <Text style={styles.actionButtonText}>Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={pickImage}>
              <ImageIcon size={24} color={Colors.secondary} />
              <Text style={styles.actionButtonText}>Upload Image</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.detectionsContainer}>
            <Text style={styles.detectionsTitle}>
              Recent Detections ({detections.length})
            </Text>
            {detections.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No detections yet.</Text>
              </View>
            ) : (
              <FlatList
                data={detections}
                renderItem={DetectionCard}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
              />
            )}
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { padding: 20, backgroundColor: Colors.primary },
  title: { fontSize: 28, fontWeight: '700', color: Colors.secondary, marginBottom: 4 },
  subtitle: { fontSize: 16, color: Colors.secondary, opacity: 0.9 },
  infoCard: { flexDirection: 'row', backgroundColor: Colors.accent, margin: 20, marginBottom: 10, padding: 16, borderRadius: 12, borderLeftWidth: 4, borderLeftColor: Colors.primary, gap: 12 },
  infoContent: { flex: 1 },
  infoTitle: { fontSize: 14, fontWeight: '600', color: Colors.text, marginBottom: 6 },
  infoText: { fontSize: 12, color: Colors.textLight, lineHeight: 18 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  loadingCard: { backgroundColor: Colors.cardBg, borderRadius: 16, padding: 24, alignItems: 'center', elevation: 5 },
  analyzingImage: { width: 200, height: 150, borderRadius: 12, marginBottom: 20 },
  loadingText: { fontSize: 18, fontWeight: '600', color: Colors.text, marginTop: 16 },
  actionButtons: { flexDirection: 'row', padding: 20, gap: 12 },
  actionButton: { flex: 1, backgroundColor: Colors.primary, borderRadius: 12, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  actionButtonText: { color: Colors.secondary, fontSize: 16, fontWeight: '600' },
  detectionsContainer: { flex: 1, padding: 20 },
  detectionsTitle: { fontSize: 20, fontWeight: '700', color: Colors.text, marginBottom: 16 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyStateText: { fontSize: 16, color: Colors.textLight },
  detectionCard: { backgroundColor: Colors.cardBg, borderRadius: 16, marginBottom: 16, overflow: 'hidden', elevation: 3 },
  detectionImage: { width: '100%', height: 200 },
  detectionContent: { padding: 16 },
  detectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  pestName: { fontSize: 18, fontWeight: '700', color: Colors.text },
  confidenceBadge: { backgroundColor: Colors.primary, borderRadius: 12, paddingHorizontal: 8, paddingVertical: 4 },
  confidenceText: { fontSize: 12, fontWeight: '600', color: Colors.secondary },
  affectedCrop: { fontSize: 14, color: Colors.textLight, marginBottom: 4 },
  timestamp: { fontSize: 12, color: Colors.textLight, marginBottom: 16 },
  treatmentSection: { marginBottom: 12 },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: Colors.text, marginBottom: 4 },
  sectionContent: { fontSize: 14, color: Colors.textLight, lineHeight: 20 },
  cropInputContainer: { padding: 20, paddingBottom: 10 },
  cropInputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.cardBg, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, borderWidth: 1, borderColor: Colors.border, gap: 12 },
  cropInput: { flex: 1, fontSize: 16, color: Colors.text },
});