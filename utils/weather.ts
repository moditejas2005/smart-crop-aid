import type { WeatherData } from '@/types';

const WEATHER_API_KEY = process.env.EXPO_PUBLIC_WEATHER_API_KEY || 'c549b661de993046021994bfeeb2a1f3';
const WEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5/weather?q={city name},{state code},{country code}&appid={API key}';

function getLocationBasedFallback(lat: number, lon: number): WeatherData {
  const locations: Record<string, WeatherData> = {
    'delhi': {
      city: '[DEMO] Delhi',
      temperature: 28,
      humidity: 65,
      condition: 'Clear',
      windSpeed: 12,
      icon: '01d',
    },
    'mumbai': {
      city: '[DEMO] Mumbai',
      temperature: 32,
      humidity: 78,
      condition: 'Clouds',
      windSpeed: 15,
      icon: '02d',
    },
    'bangalore': {
      city: '[DEMO] Bangalore',
      temperature: 26,
      humidity: 60,
      condition: 'Clear',
      windSpeed: 8,
      icon: '01d',
    },
    'pune': {
      city: '[DEMO] Pune',
      temperature: 29,
      humidity: 55,
      condition: 'Clear',
      windSpeed: 10,
      icon: '01d',
    },
  };

  if (lat >= 28 && lat <= 29 && lon >= 76 && lon <= 78) return locations.delhi;
  if (lat >= 18 && lat <= 19 && lon >= 72 && lon <= 73) return locations.mumbai;
  if (lat >= 12 && lat <= 13 && lon >= 77 && lon <= 78) return locations.bangalore;
  if (lat >= 18 && lat <= 19 && lon >= 73 && lon <= 74) return locations.pune;

  return {
    city: '[DEMO] Your Location',
    temperature: 27,
    humidity: 62,
    condition: 'Clear',
    windSpeed: 11,
    icon: '01d',
  };
}

export async function fetchWeather(lat: number, lon: number): Promise<WeatherData> {
  if (WEATHER_API_KEY === 'c549b661de993046021994bfeeb2a1f3') {
    console.log('[Weather] Using demo mode - no API key provided');
    console.log('[Weather] To use real weather data, add EXPO_PUBLIC_WEATHER_API_KEY to your environment');
    console.log('[Weather] Get your free API key at: https://openweathermap.org/api');
    return getLocationBasedFallback(lat, lon);
  }

  try {
    const url = `${WEATHER_BASE_URL}?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`;
    console.log('[Weather] Fetching weather for:', { lat, lon });
    
    const response = await fetch(url);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Weather] API Error:', response.status, errorText);
      
      if (response.status === 401) {
        console.warn('[Weather] Invalid API key. Using fallback data.');
        console.warn('[Weather] Get a valid API key at: https://openweathermap.org/api');
      }
      
      throw new Error(`Weather API Error: ${response.status}`);
    }

    const data = await response.json();
    console.log('[Weather] Successfully fetched weather for:', data.name);

    return {
      city: data.name,
      temperature: Math.round(data.main.temp),
      humidity: data.main.humidity,
      condition: data.weather[0].main,
      windSpeed: Math.round(data.wind.speed * 3.6),
      icon: data.weather[0].icon,
    };
  } catch (error) {
    console.error('[Weather] Fetch error:', error);
    console.log('[Weather] Using location-based fallback data');
    return getLocationBasedFallback(lat, lon);
  }
}
