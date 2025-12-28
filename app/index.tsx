import { MapPin, Sprout, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Colors from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { 
  validateLoginForm, 
  validateSignupForm, 
  getPasswordStrength 
} from '@/utils/validation';

export default function AuthScreen() {
  const insets = useSafeAreaInsets();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [soilType, setSoilType] = useState('');
  const [cropHistory, setCropHistory] = useState('');
  const [location, setLocation] = useState<{ latitude: number; longitude: number; city: string } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const { login, signup } = useAuth();

  const getLocation = async () => {
    setLocationLoading(true);
    try {
      if (Platform.OS === 'web') {
        setLocation({ latitude: 28.6139, longitude: 77.2090, city: 'Delhi' });
        return;
      }
      
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocation({ latitude: 28.6139, longitude: 77.2090, city: 'Delhi' });
        return;
      }

      const pos = await Location.getCurrentPositionAsync({});
      const geocode = await Location.reverseGeocodeAsync({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      });
      
      const city = geocode[0]?.city || geocode[0]?.district || 'Unknown';
      setLocation({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        city,
      });
    } catch (error) {
      console.error('Location error:', error);
      setLocation({ latitude: 28.6139, longitude: 77.2090, city: 'Delhi' });
    } finally {
      setLocationLoading(false);
    }
  };

  const handleAuth = async () => {
    // Clear previous errors
    setErrors({});

    if (isLogin) {
      // Validate login form
      const validation = validateLoginForm(email, password);
      if (!validation.isValid) {
        setErrors(validation.errors);
        return;
      }
    } else {
      // Validate signup form
      const validation = validateSignupForm(name, email, password, confirmPassword, location);
      if (!validation.isValid) {
        setErrors(validation.errors);
        return;
      }
    }

    setLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(name, email, password, location!);
        Alert.alert('Success', 'Account created successfully!');
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      Alert.alert('Authentication Failed', error.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = !isLogin && password ? getPasswordStrength(password) : null;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.primary, Colors.darkGreen]}
        style={styles.gradient}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={[
              styles.scrollContent,
              { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 },
            ]}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <Sprout size={60} color={Colors.secondary} />
              </View>
              <Text style={styles.title}>Smart Crop Advisory</Text>
              <Text style={styles.subtitle}>Your Digital Farm Assistant</Text>
            </View>

            <View style={styles.formCard}>
              {!isLogin && (
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Full Name</Text>
                  <TextInput
                    style={[styles.input, errors.name && styles.inputError]}
                    placeholder="Enter your name"
                    value={name}
                    onChangeText={(text) => {
                      setName(text);
                      if (errors.name) setErrors({ ...errors, name: '' });
                    }}
                    autoCapitalize="words"
                  />
                  {errors.name && (
                    <View style={styles.errorContainer}>
                      <AlertCircle size={14} color={Colors.error} />
                      <Text style={styles.errorText}>{errors.name || ''}</Text>
                    </View>
                  )}
                </View>
              )}

              {!isLogin && (
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Location</Text>
                  <TouchableOpacity
                    style={[styles.locationButton, errors.location && styles.inputError]}
                    onPress={getLocation}
                    disabled={locationLoading}
                  >
                    {locationLoading ? (
                      <ActivityIndicator color={Colors.primary} size="small" />
                    ) : (
                      <>
                        <MapPin size={20} color={Colors.primary} />
                        <Text style={styles.locationButtonText}>
                          {location ? location.city : 'Get Location'}
                        </Text>
                        {location && <CheckCircle size={16} color={Colors.buttonGreen} />}
                      </>
                    )}
                  </TouchableOpacity>
                  {location && (
                    <Text style={styles.locationHint}>
                      Lat: {location.latitude.toFixed(4)}, Lon: {location.longitude.toFixed(4)}
                    </Text>
                  )}
                  {errors.location && (
                    <View style={styles.errorContainer}>
                      <AlertCircle size={14} color={Colors.error} />
                      <Text style={styles.errorText}>{errors.location || ''}</Text>
                    </View>
                  )}
                </View>
              )}

              {!isLogin && (
                <>
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Soil Type (Optional)</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                      {['Alluvial Soil', 'Black Soil', 'Red Soil', 'Laterite Soil', 'Desert Soil', 'Mountain Soil'].map((type) => (
                        <TouchableOpacity
                          key={type}
                          style={[
                            styles.chip,
                            soilType === type && styles.chipActive,
                          ]}
                          onPress={() => setSoilType(type)}
                        >
                          <Text
                            style={[
                              styles.chipText,
                              soilType === type && styles.chipTextActive,
                            ]}
                          >
                            {type}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Crop History (Optional)</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g. Wheat, Rice, Cotton"
                      value={cropHistory}
                      onChangeText={setCropHistory}
                      autoCapitalize="words"
                    />
                    <Text style={styles.hintText}>Separate crops with comma</Text>
                  </View>
                </>
              )}

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={[styles.input, errors.email && styles.inputError]}
                  placeholder="Enter your email"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (errors.email) setErrors({ ...errors, email: '' });
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {errors.email && (
                  <View style={styles.errorContainer}>
                    <AlertCircle size={14} color={Colors.error} />
                    <Text style={styles.errorText}>{errors.email || ''}</Text>
                  </View>
                )}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Password</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={[styles.passwordInput, errors.password && styles.inputError]}
                    placeholder="Enter your password"
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      if (errors.password) setErrors({ ...errors, password: '' });
                    }}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff size={20} color={Colors.textLight} />
                    ) : (
                      <Eye size={20} color={Colors.textLight} />
                    )}
                  </TouchableOpacity>
                </View>
                {errors.password && (
                  <View style={styles.errorContainer}>
                    <AlertCircle size={14} color={Colors.error} />
                    <Text style={styles.errorText}>{errors.password || ''}</Text>
                  </View>
                )}
                {!isLogin && passwordStrength && password.length > 0 && (
                  <View style={styles.passwordStrengthContainer}>
                    <View style={styles.passwordStrengthBar}>
                      <View
                        style={[
                          styles.passwordStrengthFill,
                          {
                            width: `${(passwordStrength.score / 6) * 100}%`,
                            backgroundColor:
                              passwordStrength.strength === 'weak'
                                ? Colors.error
                                : passwordStrength.strength === 'medium'
                                ? Colors.warning
                                : passwordStrength.strength === 'strong'
                                ? Colors.buttonGreen
                                : Colors.primary,
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.passwordStrengthText}>
                      Password strength: {passwordStrength.strength.replace('-', ' ')}
                    </Text>
                  </View>
                )}
              </View>

              {!isLogin && (
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Confirm Password</Text>
                  <View style={styles.passwordContainer}>
                    <TextInput
                      style={[styles.passwordInput, errors.confirmPassword && styles.inputError]}
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChangeText={(text) => {
                        setConfirmPassword(text);
                        if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' });
                      }}
                      secureTextEntry={!showConfirmPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                    <TouchableOpacity
                      style={styles.eyeIcon}
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={20} color={Colors.textLight} />
                      ) : (
                        <Eye size={20} color={Colors.textLight} />
                      )}
                    </TouchableOpacity>
                  </View>
                  {errors.confirmPassword && (
                    <View style={styles.errorContainer}>
                      <AlertCircle size={14} color={Colors.error} />
                      <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                    </View>
                  )}
                </View>
              )}

              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleAuth}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={Colors.secondary} />
                ) : (
                  <Text style={styles.submitText}>
                    {isLogin ? 'Login' : 'Sign Up'}
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.switchButton}
                onPress={() => setIsLogin(!isLogin)}
              >
                <Text style={styles.switchText}>
                  {isLogin
                    ? "Don't have an account? Sign Up"
                    : 'Already have an account? Login'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  gradient: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: Colors.secondary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.secondary,
    opacity: 0.9,
  },
  formCard: {
    backgroundColor: Colors.secondary,
    borderRadius: 20,
    padding: 24,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  locationButton: {
    backgroundColor: Colors.accent,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  locationButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  locationHint: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 6,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.accent,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 8,
  },
  submitText: {
    color: Colors.secondary,
    fontSize: 18,
    fontWeight: '700' as const,
  },
  switchButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  switchText: {
    color: Colors.textLight,
    fontSize: 14,
  },
  inputError: {
    borderColor: Colors.error,
    borderWidth: 1,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 4,
  },
  errorText: {
    fontSize: 12,
    color: Colors.error,
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    backgroundColor: Colors.accent,
    borderRadius: 12,
    padding: 16,
    paddingRight: 50,
    fontSize: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    top: 16,
  },
  passwordStrengthContainer: {
    marginTop: 8,
  },
  passwordStrengthBar: {
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  passwordStrengthFill: {
    height: '100%',
    borderRadius: 2,
  },
  passwordStrengthText: {
    fontSize: 11,
    color: Colors.textLight,
    marginTop: 4,
    textTransform: 'capitalize',
  },
  chipScroll: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.accent,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: 14,
    color: Colors.text,
  },
  chipTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  hintText: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 4,
    marginLeft: 4,
  },
});
