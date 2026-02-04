// Centralized Error Handling Utility

export enum ErrorType {
  NETWORK = 'NETWORK',
  AUTHENTICATION = 'AUTHENTICATION',
  VALIDATION = 'VALIDATION',
  PERMISSION = 'PERMISSION',
  NOT_FOUND = 'NOT_FOUND',
  SERVER = 'SERVER',
  UNKNOWN = 'UNKNOWN',
}

export interface AppError {
  type: ErrorType;
  message: string;
  originalError?: any;
  code?: string;
  timestamp: Date;
}

/**
 * Create a standardized error object
 */
export const createError = (
  type: ErrorType,
  message: string,
  originalError?: any,
  code?: string
): AppError => {
  return {
    type,
    message,
    originalError,
    code,
    timestamp: new Date(),
  };
};

/**
 * Parse authentication errors into user-friendly messages
 */
export const parseAuthError = (error: any): AppError => {
  const errorMessage = error?.message?.toLowerCase() || '';
  
  if (errorMessage.includes('user not found') || errorMessage.includes('no account')) {
    return createError(
      ErrorType.AUTHENTICATION,
      'No account found with this email address',
      error
    );
  }
  
  if (errorMessage.includes('wrong password') || errorMessage.includes('incorrect password')) {
    return createError(
      ErrorType.AUTHENTICATION,
      'Incorrect password. Please try again',
      error
    );
  }
  
  if (errorMessage.includes('email already') || errorMessage.includes('already exists')) {
    return createError(
      ErrorType.VALIDATION,
      'An account with this email already exists',
      error
    );
  }
  
  if (errorMessage.includes('weak password')) {
    return createError(
      ErrorType.VALIDATION,
      'Password is too weak. Please use a stronger password',
      error
    );
  }
  
  if (errorMessage.includes('invalid email')) {
    return createError(
      ErrorType.VALIDATION,
      'Invalid email address format',
      error
    );
  }
  
  if (errorMessage.includes('too many') || errorMessage.includes('rate limit')) {
    return createError(
      ErrorType.PERMISSION,
      'Too many failed attempts. Please try again later',
      error
    );
  }
  
  if (errorMessage.includes('network')) {
    return createError(
      ErrorType.NETWORK,
      'Network error. Please check your internet connection',
      error
    );
  }
  
  if (errorMessage.includes('permission')) {
    return createError(
      ErrorType.PERMISSION,
      'You do not have permission to perform this action',
      error
    );
  }
  
  if (errorMessage.includes('not found')) {
    return createError(
      ErrorType.NOT_FOUND,
      'The requested resource was not found',
      error
    );
  }
  
  if (errorMessage.includes('unavailable')) {
    return createError(
      ErrorType.SERVER,
      'Service temporarily unavailable. Please try again',
      error
    );
  }
  
  return createError(
    ErrorType.UNKNOWN,
    error?.message || 'An unexpected error occurred',
    error
  );
};

/**
 * Parse network/API errors
 */
export const parseNetworkError = (error: any): AppError => {
  if (!error.response) {
    return createError(
      ErrorType.NETWORK,
      'Network error. Please check your internet connection',
      error
    );
  }

  const status = error.response?.status;
  
  switch (status) {
    case 400:
      return createError(
        ErrorType.VALIDATION,
        'Invalid request. Please check your input',
        error,
        '400'
      );
    
    case 401:
      return createError(
        ErrorType.AUTHENTICATION,
        'Authentication required. Please log in',
        error,
        '401'
      );
    
    case 403:
      return createError(
        ErrorType.PERMISSION,
        'You do not have permission to access this resource',
        error,
        '403'
      );
    
    case 404:
      return createError(
        ErrorType.NOT_FOUND,
        'Resource not found',
        error,
        '404'
      );
    
    case 429:
      return createError(
        ErrorType.PERMISSION,
        'Too many requests. Please slow down',
        error,
        '429'
      );
    
    case 500:
    case 502:
    case 503:
      return createError(
        ErrorType.SERVER,
        'Server error. Please try again later',
        error,
        status.toString()
      );
    
    default:
      return createError(
        ErrorType.UNKNOWN,
        error.response?.data?.message || 'An error occurred',
        error,
        status?.toString()
      );
  }
};

/**
 * Log error for debugging (can be extended to send to error tracking service)
 */
export const logError = (error: AppError): void => {
  console.error('Error occurred:', {
    type: error.type,
    message: error.message,
    code: error.code,
    timestamp: error.timestamp,
    originalError: error.originalError,
  });

  // TODO: Send to error tracking service (e.g., Sentry)
  // if (process.env.NODE_ENV === 'production') {
  //   Sentry.captureException(error.originalError || error);
  // }
};

/**
 * Handle error and return user-friendly message
 */
export const handleError = (error: any): string => {
  let appError: AppError;

  // Determine error type and parse accordingly
  if (error?.response || error?.request) {
    appError = parseNetworkError(error);
  } else if (error instanceof Error) {
    // Check if it's an authentication error
    const errorMsg = error.message.toLowerCase();
    if (errorMsg.includes('auth') || errorMsg.includes('login') || 
        errorMsg.includes('password') || errorMsg.includes('email')) {
      appError = parseAuthError(error);
    } else {
      appError = createError(ErrorType.UNKNOWN, error.message, error);
    }
  } else {
    appError = createError(
      ErrorType.UNKNOWN,
      'An unexpected error occurred',
      error
    );
  }

  logError(appError);
  return appError.message;
};

/**
 * Async error wrapper for try-catch blocks
 */
export const asyncErrorHandler = async <T>(
  fn: () => Promise<T>,
  errorCallback?: (error: string) => void
): Promise<T | null> => {
  try {
    return await fn();
  } catch (error) {
    const errorMessage = handleError(error);
    if (errorCallback) {
      errorCallback(errorMessage);
    }
    return null;
  }
};

/**
 * Retry logic for failed operations
 */
export const retryOperation = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> => {
  let lastError: any;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      if (attempt < maxRetries) {
        console.log(`Retry attempt ${attempt}/${maxRetries} after ${delayMs}ms`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
        delayMs *= 2; // Exponential backoff
      }
    }
  }

  throw lastError;
};

/**
 * Validate response data
 */
export const validateResponse = <T>(
  data: any,
  validator: (data: any) => boolean,
  errorMessage: string = 'Invalid response data'
): T => {
  if (!validator(data)) {
    throw createError(ErrorType.VALIDATION, errorMessage, data);
  }
  return data as T;
};
