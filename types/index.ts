export type UserRole = 'farmer' | 'admin';

// User interface with all required properties

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  is_banned?: boolean;
  location?: {
    latitude: number;
    longitude: number;
    city: string;
  };
  soilType?: string;
  cropHistory?: string[];
  profileImage?: string;
  createdAt: string;
}

export interface WeatherData {
  city: string;
  temperature: number;
  humidity: number;
  condition: string;
  windSpeed: number;
  icon: string;
}

export interface CropRecommendation {
  name: string;
  duration: string;
  expectedYield: string;
  idealSeason: string;
  confidence: number;
}

export interface PestDetection {
  id: string;
  pestName: string;
  affectedCrop: string;
  treatment: string;
  prevention: string;
  cause?: string;  // Cause of the disease/pest
  imageUri: string;
  timestamp: string;
  confidence: number;
  severity: 'low' | 'medium' | 'high';
  detectionMethod: 'ai' | 'manual';
  userId?: string;
  plantData?: {
    id: number;
    common_name: string;
    scientific_name: string;
    family: string;
    genus: string;
    image_url?: string;
    edible: boolean;
    vegetable: boolean;
  };
  growingConditions?: string[];
}

export interface ChatMessage {
  id: string;
  message: string;
  isUser: boolean;
  timestamp: string;
  type: 'text' | 'pest-detection' | 'crop-recommendation';
  data?: any;
}

export interface ChatSession {
  id: string;
  userId: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface CropRecommendationRequest {
  soilType: 'clay' | 'sandy' | 'loamy' | 'silt' | 'peat' | 'chalk';
  waterAvailability: 'low' | 'medium' | 'high';
  season: 'spring' | 'summer' | 'monsoon' | 'winter';
  location?: {
    latitude: number;
    longitude: number;
    city: string;
  };
}

export interface EnhancedCropRecommendation extends CropRecommendation {
  soilSuitability: number;
  waterRequirement: 'low' | 'medium' | 'high';
  profitability: number;
  riskLevel: 'low' | 'medium' | 'high';
  marketDemand: number;
  seasonalTips: string[];
}

export interface UserActivity {
  id: string;
  userId: string;
  type: 'login' | 'pest-detection' | 'crop-recommendation' | 'chat' | 'market-check';
  details: string;
  timestamp: string;
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  pestDetections: number;
  cropRecommendations: number;
  chatInteractions: number;
  marketChecks: number;
}

export interface FertilizerAdvice {
  cropName: string;
  fertilizerType: string;
  quantity: string;
  applicationMethod: string;
  timing: string;
  irrigation: {
    frequency: string;
    amount: string;
    method: string;
  };
}

export interface MarketPrice {
  id?: string;
  crop: string;
  variety: string;
  market: string;
  district: string;
  state: string;
  minPrice: number;
  maxPrice: number;
  modalPrice: number;
  date: string;
  trend?: 'up' | 'down' | 'stable';
  changePercentage?: number;
}
