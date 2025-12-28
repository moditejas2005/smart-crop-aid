// API Client for Smart Crop Aid Backend
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Determine Base URL
// Android Emulator: 10.0.2.2 points to localhost of the host machine.
// iOS Simulator: localhost points to host.
// Physical Device: Needs your computer's local IP (e.g., 192.168.1.X).
const DEV_API_URL = Platform.select({
  android: 'http://10.81.211.94:3000/api',
  ios: 'http://10.81.211.94:3000/api',
  default: 'http://localhost:3000/api', // Web
});

// Use EXPO_PUBLIC_API_URL if defined (Production), otherwise fallback to local DEV_API_URL
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || DEV_API_URL;
const BASE_URL = API_BASE_URL;

console.log('API Base URL:', BASE_URL);

interface ApiRequestOptions extends RequestInit {
  token?: string;
}

class ApiClient {
  private async getHeaders(token?: string) {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    } else {
      const storedToken = await AsyncStorage.getItem('auth_token');
      if (storedToken) {
        headers['Authorization'] = `Bearer ${storedToken}`;
      }
    }

    return headers;
  }

  async get(endpoint: string, options: ApiRequestOptions = {}) {
    const headers = await this.getHeaders(options.token);
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      method: 'GET',
      headers,
    });
    return this.handleResponse(response);
  }

  async post(endpoint: string, body: any, options: ApiRequestOptions = {}) {
    const headers = await this.getHeaders(options.token);
    
    // If body is FormData, let browser/RN set Content-Type with boundary
    if (body instanceof FormData) {
      delete (headers as any)['Content-Type'];
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      method: 'POST',
      headers,
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
    return this.handleResponse(response);
  }

  async put(endpoint: string, body: any, options: ApiRequestOptions = {}) {
    const headers = await this.getHeaders(options.token);
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      method: 'PUT',
      headers,
      body: JSON.stringify(body),
    });
    return this.handleResponse(response);
  }

  async delete(endpoint: string, options: ApiRequestOptions = {}) {
    const headers = await this.getHeaders(options.token);
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      method: 'DELETE',
      headers,
    });
    return this.handleResponse(response);
  }

  private async handleResponse(response: Response) {
    const contentType = response.headers.get('content-type');
    console.log(`API Response: ${response.status} ${response.url}`);
    console.log('Content-Type:', contentType);

    const text = await response.text();
    console.log('Raw Body:', text.slice(0, 500)); // Log first 500 chars

    let data;
    const isJson = contentType && contentType.includes('application/json');

    if (isJson) {
        try {
            data = text ? JSON.parse(text) : {};
        } catch (e) {
            console.error('JSON Parse Error for body:', text);
            throw new Error(`Invalid JSON response from server: ${text.slice(0, 50)}...`);
        }
    } else {
        data = text;
    }

    if (!response.ok) {
      const error = (typeof data === 'object' && data.error) || response.statusText || 'Unknown API Error';
      throw new Error(error);
    }
    return data;
  }
}

export const api = new ApiClient();
