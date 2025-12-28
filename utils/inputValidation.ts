// Input Validation and Sanitization Utilities

/**
 * Sanitize user input to prevent XSS attacks
 */
export const sanitizeInput = (input: string): string => {
  if (!input) return '';
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove < and > to prevent HTML injection
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, ''); // Remove event handlers like onclick=
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 * Requirements: At least 8 characters, 1 uppercase, 1 lowercase, 1 number
 */
export const isValidPassword = (password: string): { valid: boolean; message: string } => {
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long' };
  }
  
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter' };
  }
  
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter' };
  }
  
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number' };
  }
  
  return { valid: true, message: 'Password is strong' };
};

/**
 * Validate phone number (basic validation)
 */
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
  return phoneRegex.test(phone);
};

/**
 * Sanitize filename to prevent directory traversal
 */
export const sanitizeFilename = (filename: string): string => {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace special chars with underscore
    .replace(/\.{2,}/g, '.') // Remove multiple dots
    .substring(0, 255); // Limit length
};

/**
 * Validate and sanitize URL
 */
export const isValidUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
};

/**
 * Sanitize numeric input
 */
export const sanitizeNumber = (input: string | number): number | null => {
  const num = typeof input === 'string' ? parseFloat(input) : input;
  return isNaN(num) ? null : num;
};

/**
 * Validate crop name (alphanumeric with spaces and hyphens)
 */
export const isValidCropName = (name: string): boolean => {
  const cropNameRegex = /^[a-zA-Z0-9\s-]{2,50}$/;
  return cropNameRegex.test(name);
};

/**
 * Validate location coordinates
 */
export const isValidCoordinates = (lat: number, lng: number): boolean => {
  return (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
};

/**
 * Rate limiting helper - tracks API calls per user
 */
class RateLimiter {
  private calls: Map<string, number[]> = new Map();
  private maxCalls: number;
  private timeWindow: number; // in milliseconds

  constructor(maxCalls: number = 10, timeWindowMinutes: number = 1) {
    this.maxCalls = maxCalls;
    this.timeWindow = timeWindowMinutes * 60 * 1000;
  }

  /**
   * Check if user has exceeded rate limit
   */
  isRateLimited(userId: string): boolean {
    const now = Date.now();
    const userCalls = this.calls.get(userId) || [];
    
    // Remove old calls outside time window
    const recentCalls = userCalls.filter(time => now - time < this.timeWindow);
    
    if (recentCalls.length >= this.maxCalls) {
      return true;
    }
    
    // Add current call
    recentCalls.push(now);
    this.calls.set(userId, recentCalls);
    
    return false;
  }

  /**
   * Get remaining calls for user
   */
  getRemainingCalls(userId: string): number {
    const now = Date.now();
    const userCalls = this.calls.get(userId) || [];
    const recentCalls = userCalls.filter(time => now - time < this.timeWindow);
    return Math.max(0, this.maxCalls - recentCalls.length);
  }

  /**
   * Reset rate limit for user
   */
  reset(userId: string): void {
    this.calls.delete(userId);
  }
}

// Export rate limiter instances for different features
export const chatRateLimiter = new RateLimiter(20, 1); // 20 messages per minute
export const apiRateLimiter = new RateLimiter(30, 1); // 30 API calls per minute
export const authRateLimiter = new RateLimiter(5, 5); // 5 auth attempts per 5 minutes

/**
 * Validate file upload
 */
export const validateFileUpload = (
  file: { size: number; type: string; name: string },
  options: {
    maxSize?: number; // in bytes
    allowedTypes?: string[];
  } = {}
): { valid: boolean; message: string } => {
  const { maxSize = 5 * 1024 * 1024, allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'] } = options;

  if (file.size > maxSize) {
    return {
      valid: false,
      message: `File size exceeds ${maxSize / (1024 * 1024)}MB limit`,
    };
  }

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      message: `File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(', ')}`,
    };
  }

  return { valid: true, message: 'File is valid' };
};

/**
 * Escape special characters for database queries
 */
export const escapeSpecialChars = (str: string): string => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};
