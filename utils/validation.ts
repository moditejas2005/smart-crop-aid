// Form validation utilities

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

// Email validation
export const validateEmail = (email: string): ValidationResult => {
  if (!email || email.trim() === '') {
    return { isValid: false, error: 'Email is required' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }

  return { isValid: true };
};

// Password validation
export const validatePassword = (password: string): ValidationResult => {
  if (!password || password.trim() === '') {
    return { isValid: false, error: 'Password is required' };
  }

  if (password.length < 8) {
    return { isValid: false, error: 'Password must be at least 8 characters long' };
  }

  if (!/[A-Z]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one uppercase letter' };
  }

  if (!/[a-z]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one lowercase letter' };
  }

  if (!/[0-9]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one number' };
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one special character' };
  }

  return { isValid: true };
};

// Name validation
export const validateName = (name: string): ValidationResult => {
  if (!name || name.trim() === '') {
    return { isValid: false, error: 'Name is required' };
  }

  if (name.trim().length < 2) {
    return { isValid: false, error: 'Name must be at least 2 characters long' };
  }

  if (name.trim().length > 50) {
    return { isValid: false, error: 'Name must not exceed 50 characters' };
  }

  const nameRegex = /^[a-zA-Z\s'-]+$/;
  if (!nameRegex.test(name)) {
    return { isValid: false, error: 'Name can only contain letters, spaces, hyphens, and apostrophes' };
  }

  return { isValid: true };
};

// Location validation
export const validateLocation = (location: { latitude: number; longitude: number; city: string } | null): ValidationResult => {
  if (!location) {
    return { isValid: false, error: 'Location is required. Please enable location services.' };
  }

  if (!location.city || location.city === 'Unknown') {
    return { isValid: false, error: 'Unable to determine your location. Please try again.' };
  }

  return { isValid: true };
};

// Confirm password validation
export const validateConfirmPassword = (password: string, confirmPassword: string): ValidationResult => {
  if (!confirmPassword || confirmPassword.trim() === '') {
    return { isValid: false, error: 'Please confirm your password' };
  }

  if (password !== confirmPassword) {
    return { isValid: false, error: 'Passwords do not match' };
  }

  return { isValid: true };
};

// Phone number validation (optional)
export const validatePhoneNumber = (phone: string): ValidationResult => {
  if (!phone || phone.trim() === '') {
    return { isValid: true }; // Optional field
  }

  const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
  if (!phoneRegex.test(phone)) {
    return { isValid: false, error: 'Please enter a valid phone number' };
  }

  return { isValid: true };
};

// Comprehensive login validation
export const validateLoginForm = (email: string, password: string): { isValid: boolean; errors: { email?: string; password?: string } } => {
  const errors: { email?: string; password?: string } = {};

  const emailValidation = validateEmail(email);
  if (!emailValidation.isValid) {
    errors.email = emailValidation.error;
  }

  if (!password || password.trim() === '') {
    errors.password = 'Password is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// Comprehensive signup validation
export const validateSignupForm = (
  name: string,
  email: string,
  password: string,
  confirmPassword: string,
  location: { latitude: number; longitude: number; city: string } | null
): { isValid: boolean; errors: { name?: string; email?: string; password?: string; confirmPassword?: string; location?: string } } => {
  const errors: { name?: string; email?: string; password?: string; confirmPassword?: string; location?: string } = {};

  const nameValidation = validateName(name);
  if (!nameValidation.isValid) {
    errors.name = nameValidation.error;
  }

  const emailValidation = validateEmail(email);
  if (!emailValidation.isValid) {
    errors.email = emailValidation.error;
  }

  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    errors.password = passwordValidation.error;
  }

  const confirmPasswordValidation = validateConfirmPassword(password, confirmPassword);
  if (!confirmPasswordValidation.isValid) {
    errors.confirmPassword = confirmPasswordValidation.error;
  }

  const locationValidation = validateLocation(location);
  if (!locationValidation.isValid) {
    errors.location = locationValidation.error;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// Password strength indicator
export const getPasswordStrength = (password: string): { strength: 'weak' | 'medium' | 'strong' | 'very-strong'; score: number } => {
  let score = 0;

  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;

  if (score <= 2) return { strength: 'weak', score };
  if (score <= 4) return { strength: 'medium', score };
  if (score <= 5) return { strength: 'strong', score };
  return { strength: 'very-strong', score };
};