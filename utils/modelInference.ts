// Flask API configuration for Keras model inference
// Flask API configuration for Keras model inference
// Use EXPO_PUBLIC_ML_API_URL if defined (Production), otherwise fallback to local IP
const DEV_ML_URL = 'http://10.81.211.94:5000';
const API_BASE_URL = process.env.EXPO_PUBLIC_ML_API_URL || DEV_ML_URL;
const API_ENDPOINTS = {
  health: '/api/health',
  predict: '/api/predict',
  classes: '/api/classes',
  diseaseInfo: '/api/disease-info'
};

// Model configuration
const IMAGE_SIZE = 160; // Your model uses 160x160 input size
const NUM_CLASSES = 38; // Based on your PEST_DATABASE entries

// Class names mapping (should match your model's training classes)
const CLASS_NAMES = [
  'Apple___Apple_scab',
  'Apple___Black_rot',
  'Apple___Cedar_apple_rust',
  'Apple___healthy',
  'Background_without_leaves',
  'Blueberry___healthy',
  'Cherry___Powdery_mildew',
  'Cherry___healthy',
  'Corn___Cercospora_leaf_spot Gray_leaf_spot',
  'Corn___Common_rust',
  'Corn___Northern_Leaf_Blight',
  'Corn___healthy',
  'Grape___Black_rot',
  'Grape___Esca_(Black_Measles)',
  'Grape___Leaf_blight_(Isariopsis_Leaf_Spot)',
  'Grape___healthy',
  'Orange___Haunglongbing_(Citrus_greening)',
  'Peach___Bacterial_spot',
  'Peach___healthy',
  'Pepper,_bell___Bacterial_spot',
  'Pepper,_bell___healthy',
  'Potato___Early_blight',
  'Potato___Late_blight',
  'Potato___healthy',
  'Raspberry___healthy',
  'Soybean___healthy',
  'Squash___Powdery_mildew',
  'Strawberry___Leaf_scorch',
  'Strawberry___healthy',
  'Tomato___Bacterial_spot',
  'Tomato___Early_blight',
  'Tomato___Late_blight',
  'Tomato___Leaf_Mold',
  'Tomato___Septoria_leaf_spot',
  'Tomato___Spider_mites Two-spotted_spider_mite',
  'Tomato___Target_Spot',
  'Tomato___Tomato_Yellow_Leaf_Curl_Virus',
  'Tomato___Tomato_mosaic_virus',
  'Tomato___healthy'
];

let apiAvailable = false;

/**
 * Check if the Flask API server is available
 */
export const loadModel = async (): Promise<boolean> => {
  try {
    console.log('Checking Flask API server availability...');
    
    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.health}`, {
      method: 'GET',
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      const data = await response.json();
      apiAvailable = data.model_loaded === true;
      console.log('Flask API server is available:', data);
      return apiAvailable;
    } else {
      console.log('Flask API server responded with error:', response.status);
      apiAvailable = false;
      return false;
    }
  } catch (error: any) {
    if (error.name === 'AbortError' || error.message.includes('Aborted')) {
        console.log('Flask API unavailable (Timeout). Switching to Offline Simulation Mode.');
    } else {
        console.log('Flask API unavailable:', error.message);
    }
    apiAvailable = false;
    return false;
  }
};

/**
 * Convert image URI to base64 for API transmission
 */
const imageToBase64 = async (imageUri: string): Promise<string> => {
  try {
    if (imageUri.startsWith('data:')) {
      // Already base64
      return imageUri;
    }
    
    if (imageUri.startsWith('file://') || imageUri.startsWith('http')) {
      // For React Native, we need to read the file and convert to base64
      // This is a simplified version - you might need expo-file-system for local files
      const response = await fetch(imageUri);
      const blob = await response.blob();
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    }
    
    throw new Error('Unsupported image URI format');
  } catch (error) {
    console.error('Image conversion failed:', error);
    throw new Error('Failed to convert image to base64');
  }
};

/**
 * Run inference using the Flask API
 */
export const predictPestDisease = async (imageUri: string): Promise<{
  pestName: string;
  confidence: number;
  affectedCrop: string;
} | null> => {
  try {
    // Check if API is available
    const isApiAvailable = await loadModel();
    
    if (!isApiAvailable) {
      console.log('Flask API not available, skipping prediction');
      return null;
    }
    
    console.log('Converting image for API transmission...');
    const base64Image = await imageToBase64(imageUri);
    
    console.log('Sending prediction request to Flask API...');
    
    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.predict}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageBase64: base64Image
      }),
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Prediction failed');
    }
    
    const prediction = result.prediction;
    
    console.log('Flask API prediction completed:', prediction);
    
    return {
      pestName: prediction.pestName,
      confidence: prediction.confidence,
      affectedCrop: prediction.affectedCrop
    };
    
  } catch (error) {
    console.error('Flask API prediction failed:', error);
    return null;
  }
};

/**
 * Check if Flask API is available and ready
 */
export const isModelReady = (): boolean => {
  return apiAvailable;
};

/**
 * Get available disease classes from API
 */
export const getAvailableClasses = async (): Promise<string[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.classes}`);
    if (response.ok) {
      const data = await response.json();
      return data.classes;
    }
  } catch (error) {
    console.error('Failed to fetch classes:', error);
  }
  return [];
};

/**
 * Get detailed disease information from API
 */
export const getDiseaseInfo = async (classIndex: number): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.diseaseInfo}/${classIndex}`);
    if (response.ok) {
      const data = await response.json();
      return data.diseaseInfo;
    }
  } catch (error) {
    console.error('Failed to fetch disease info:', error);
  }
  return null;
};

/**
 * Reset API connection status
 */
export const disposeModel = (): void => {
  apiAvailable = false;
  console.log('API connection reset');
};