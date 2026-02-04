import {
  Edit3,
  LogOut,
  Mail,
  MapPin,
  Mountain,
  Sprout,
  User,
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Colors from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';

const soilTypes = [
  'Alluvial Soil',
  'Black Soil',
  'Red Soil',
  'Laterite Soil',
  'Desert Soil',
  'Mountain Soil',
];

const commonCrops = [
  'Wheat', 'Rice', 'Maize', 'Sugarcane', 'Cotton', 'Soybean',
  'Mustard', 'Gram', 'Barley', 'Jowar', 'Bajra', 'Arhar',
];

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, logout, updateUser } = useAuth();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editedName, setEditedName] = useState(user?.name || '');
  const [editedLocation, setEditedLocation] = useState(user?.location?.city || '');
  const [editedSoilType, setEditedSoilType] = useState(user?.soilType || '');
  const [editedCropHistory, setEditedCropHistory] = useState(
    user?.cropHistory?.join(', ') || ''
  );

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

  const handleSaveProfile = async () => {
    try {
      const cropHistoryArray = editedCropHistory
        .split(',')
        .map(crop => crop.trim())
        .filter(crop => crop.length > 0);

      console.log('Saving profile:', { name: editedName, soilType: editedSoilType, cropHistory: cropHistoryArray });

      await updateUser({
        name: editedName,
        location: { ...user?.location, city: editedLocation, latitude: user?.location?.latitude || 0, longitude: user?.location?.longitude || 0 },
        soilType: editedSoilType,
        cropHistory: cropHistoryArray,
      });

      console.log('Profile saved successfully');
      setEditModalVisible(false);
      
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    }
  };

  const ProfileItem = ({ 
    icon, 
    label, 
    value, 
    onPress 
  }: {
    icon: React.ReactNode;
    label: string;
    value: string;
    onPress?: () => void;
  }) => (
    <TouchableOpacity 
      style={styles.profileItem} 
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.profileItemLeft}>
        <View style={styles.profileItemIcon}>
          {icon}
        </View>
        <View>
          <Text style={styles.profileItemLabel}>{label}</Text>
          <Text style={styles.profileItemValue}>{value}</Text>
        </View>
      </View>
      {onPress && <Edit3 size={20} color={Colors.textLight} />}
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
        <Text style={styles.title}>Profile</Text>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <LogOut size={20} color={Colors.error} />
        </TouchableOpacity>
      </View>

      {/* Profile Card */}
      <View style={styles.profileCard}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <User size={40} color={Colors.primary} />
          </View>
          <Text style={styles.userName}>{user?.name}</Text>
          <Text style={styles.userRole}>Farmer</Text>
        </View>

        <TouchableOpacity
          style={styles.editButton}
          onPress={() => setEditModalVisible(true)}
        >
          <Edit3 size={16} color={Colors.secondary} />
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>


      {/* Edit Profile Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setEditModalVisible(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <TouchableOpacity onPress={handleSaveProfile}>
              <Text style={styles.modalSave}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                style={styles.input}
                value={editedName}
                onChangeText={setEditedName}
                placeholder="Enter your name"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Location (City)</Text>
              <TextInput
                style={styles.input}
                value={editedLocation}
                onChangeText={setEditedLocation}
                placeholder="Enter your city"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Soil Type</Text>
              <View style={styles.chipContainer}>
                {soilTypes.map((soil) => (
                  <TouchableOpacity
                    key={soil}
                    style={[
                      styles.chip,
                      editedSoilType === soil && styles.chipSelected,
                    ]}
                    onPress={() => setEditedSoilType(soil)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        editedSoilType === soil && styles.chipTextSelected,
                      ]}
                    >
                      {soil}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Crop History</Text>
              <Text style={styles.inputHint}>
                Enter crops separated by commas (e.g., Wheat, Rice, Maize)
              </Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={editedCropHistory}
                onChangeText={setEditedCropHistory}
                placeholder="Enter crops you have grown"
                multiline
                numberOfLines={3}
              />
              <View style={styles.chipContainer}>
                {commonCrops.map((crop) => (
                  <TouchableOpacity
                    key={crop}
                    style={styles.cropChip}
                    onPress={() => {
                      const crops = editedCropHistory
                        .split(',')
                        .map(c => c.trim())
                        .filter(c => c.length > 0);
                      
                      if (!crops.includes(crop)) {
                        setEditedCropHistory(
                          crops.length > 0 ? `${editedCropHistory}, ${crop}` : crop
                        );
                      }
                    }}
                  >
                    <Text style={styles.cropChipText}>{crop}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
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
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
  },
  logoutButton: {
    padding: 8,
  },
  profileCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  userRole: {
    fontSize: 16,
    color: Colors.textLight,
  },
  editButton: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editButtonText: {
    color: Colors.secondary,
    fontWeight: '600',
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
  profileItem: {
    backgroundColor: Colors.cardBg,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  profileItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  profileItemLabel: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 2,
  },
  profileItemValue: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
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
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textLight,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalCancel: {
    fontSize: 16,
    color: Colors.textLight,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  modalSave: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  inputHint: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.cardBg,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  chip: {
    backgroundColor: Colors.accent,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: 14,
    color: Colors.text,
  },
  chipTextSelected: {
    color: Colors.secondary,
  },
  cropChip: {
    backgroundColor: Colors.lightGreen,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  cropChipText: {
    fontSize: 12,
    color: Colors.darkGreen,
    fontWeight: '500',
  },
});