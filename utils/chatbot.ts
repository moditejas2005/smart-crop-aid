import type { ChatMessage } from '@/types';
import { getPestInfo, getCommonPests } from './pestDetection';
import { getCropInfo, getCropsForConditions } from './cropRecommendation';
import { generateAIResponse, type BytezMessage } from './bytezApi';

// Chatbot knowledge base
const KNOWLEDGE_BASE = {
  greetings: [
    "Hello! I'm your Smart Crop Assistant. How can I help you today?",
    "Hi there! I'm here to help with your farming questions. What would you like to know?",
    "Welcome! I can assist you with pest identification, crop recommendations, and farming advice. How may I help?",
  ],
  
  pestQuestions: [
    'pest', 'disease', 'insect', 'bug', 'damage', 'spots', 'yellowing', 'wilting', 'infection'
  ],
  
  cropQuestions: [
    'crop', 'plant', 'grow', 'cultivation', 'farming', 'seed', 'harvest', 'yield'
  ],
  
  soilQuestions: [
    'soil', 'fertilizer', 'nutrition', 'ph', 'organic', 'compost', 'manure'
  ],
  
  weatherQuestions: [
    'weather', 'rain', 'irrigation', 'water', 'drought', 'flood', 'temperature'
  ],
  
  marketQuestions: [
    'price', 'market', 'sell', 'profit', 'cost', 'economics', 'income'
  ],
};

// Predefined responses for common questions
const RESPONSES = {
  pestIdentification: [
    "I can help you identify pests! Please describe the symptoms you're seeing on your crops, or use the pest detection feature to upload an image.",
    "For pest identification, look for these common signs: yellowing leaves, holes in leaves, sticky substances, or unusual spots. What symptoms are you observing?",
    "Common pests include aphids, caterpillars, and whiteflies. Can you describe what you're seeing on your plants?",
  ],
  
  cropAdvice: [
    "I'd be happy to help with crop recommendations! What's your soil type and water availability?",
    "For the best crop advice, I need to know your location, soil type, and current season. Can you provide these details?",
    "Different crops thrive in different conditions. Tell me about your farm's soil and water resources for personalized recommendations.",
  ],
  
  soilManagement: [
    "Good soil health is crucial for farming success. Regular soil testing, organic matter addition, and proper drainage are key factors.",
    "Healthy soil should have good structure, adequate nutrients, and beneficial microorganisms. Consider adding compost or well-rotted manure.",
    "Soil pH affects nutrient availability. Most crops prefer slightly acidic to neutral pH (6.0-7.0). Regular testing helps maintain optimal conditions.",
  ],
  
  weatherTips: [
    "Weather monitoring is essential for farming. Check forecasts regularly and plan irrigation accordingly.",
    "During dry spells, focus on water conservation techniques like mulching and drip irrigation.",
    "Extreme weather can stress crops. Ensure proper drainage for heavy rains and adequate water storage for dry periods.",
  ],
  
  marketAdvice: [
    "Market prices fluctuate based on supply, demand, and seasonal factors. Check local market rates regularly.",
    "Consider value addition through processing or direct marketing to consumers for better profits.",
    "Diversifying crops can help reduce market risks and ensure steady income throughout the year.",
  ],
  
  generalFarming: [
    "Successful farming requires planning, proper timing, and continuous learning. Stay updated with latest agricultural practices.",
    "Integrated pest management, soil health maintenance, and water conservation are pillars of sustainable farming.",
    "Keep detailed records of your farming activities, expenses, and yields to make informed decisions.",
  ],
};

// Analyze user message and determine intent
const analyzeIntent = (message: string): string => {
  const lowerMessage = message.toLowerCase();
  
  if (KNOWLEDGE_BASE.pestQuestions.some(keyword => lowerMessage.includes(keyword))) {
    return 'pest';
  }
  if (KNOWLEDGE_BASE.cropQuestions.some(keyword => lowerMessage.includes(keyword))) {
    return 'crop';
  }
  if (KNOWLEDGE_BASE.soilQuestions.some(keyword => lowerMessage.includes(keyword))) {
    return 'soil';
  }
  if (KNOWLEDGE_BASE.weatherQuestions.some(keyword => lowerMessage.includes(keyword))) {
    return 'weather';
  }
  if (KNOWLEDGE_BASE.marketQuestions.some(keyword => lowerMessage.includes(keyword))) {
    return 'market';
  }
  
  return 'general';
};

// Generate contextual response
const generateResponse = (intent: string, message: string): string => {
  const lowerMessage = message.toLowerCase();
  
  switch (intent) {
    case 'pest':
      // Check for specific pest names
      const pestInfo = getPestInfo(message);
      if (pestInfo) {
        return `${pestInfo.name} commonly affects ${pestInfo.crops.join(', ')}. Treatment: ${pestInfo.treatment}. Prevention: ${pestInfo.prevention}`;
      }
      
      // Check for crop-specific pest questions
      const cropMatch = lowerMessage.match(/\b(rice|wheat|tomato|cotton|maize|potato|onion)\b/);
      if (cropMatch) {
        const crop = cropMatch[1];
        const commonPests = getCommonPests(crop);
        if (commonPests.length > 0) {
          return `Common pests in ${crop} include: ${commonPests.map(p => p.name).join(', ')}. Would you like detailed information about any specific pest?`;
        }
      }
      
      return RESPONSES.pestIdentification[Math.floor(Math.random() * RESPONSES.pestIdentification.length)];
      
    case 'crop':
      // Check for specific crop information
      const cropInfo = getCropInfo(message);
      if (cropInfo) {
        return `${cropInfo.name}: Duration: ${cropInfo.duration}, Expected yield: ${cropInfo.expectedYield}, Ideal season: ${cropInfo.idealSeason}, Suitable soil: ${cropInfo.soilTypes.join(', ')}, Water requirement: ${cropInfo.waterRequirement}`;
      }
      
      return RESPONSES.cropAdvice[Math.floor(Math.random() * RESPONSES.cropAdvice.length)];
      
    case 'soil':
      return RESPONSES.soilManagement[Math.floor(Math.random() * RESPONSES.soilManagement.length)];
      
    case 'weather':
      return RESPONSES.weatherTips[Math.floor(Math.random() * RESPONSES.weatherTips.length)];
      
    case 'market':
      return RESPONSES.marketAdvice[Math.floor(Math.random() * RESPONSES.marketAdvice.length)];
      
    default:
      return RESPONSES.generalFarming[Math.floor(Math.random() * RESPONSES.generalFarming.length)];
  }
};

// Counter for unique message IDs
let messageIdCounter = 0;

// Main chatbot function with AI integration
export const getChatbotResponse = async (
  message: string,
  conversationHistory: ChatMessage[] = [],
  useAI: boolean = true // Default to true, using Bytez API
): Promise<ChatMessage> => {
  const lowerMessage = message.toLowerCase().trim();
  
  // Handle greetings with fallback
  if (['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening'].some(greeting => 
    lowerMessage.includes(greeting))) {
    return {
      id: `${Date.now()}-${messageIdCounter++}`,
      message: KNOWLEDGE_BASE.greetings[Math.floor(Math.random() * KNOWLEDGE_BASE.greetings.length)],
      isUser: false,
      timestamp: new Date().toISOString(),
      type: 'text',
    };
  }
  
  // Handle thanks
  if (['thank', 'thanks', 'appreciate'].some(word => lowerMessage.includes(word))) {
    return {
      id: `${Date.now()}-${messageIdCounter++}`,
      message: "You're welcome! I'm here to help with any other farming questions you might have.",
      isUser: false,
      timestamp: new Date().toISOString(),
      type: 'text',
    };
  }
  
  // Try AI response first if enabled
  if (useAI) {
    try {
      // Convert chat history to Bytez format
      const aiHistory: BytezMessage[] = conversationHistory
        .slice(-6) // Keep last 6 messages for context
        .map(msg => ({
          role: msg.isUser ? 'user' as const : 'assistant' as const,
          content: msg.message,
        }));

      const aiResponse = await generateAIResponse(message, aiHistory);
      
      return {
        id: `${Date.now()}-${messageIdCounter++}`,
        message: aiResponse,
        isUser: false,
        timestamp: new Date().toISOString(),
        type: 'text',
      };
    } catch (error) {
      console.warn('AI response failed, falling back to rule-based:', error);
      // Fall through to rule-based response
    }
  }
  
  // Fallback to rule-based response
  const intent = analyzeIntent(message);
  const response = generateResponse(intent, message);
  
  return {
    id: `${Date.now()}-${messageIdCounter++}`,
    message: response,
    isUser: false,
    timestamp: new Date().toISOString(),
    type: 'text',
  };
};

// Get quick suggestions based on context
export const getQuickSuggestions = (context: 'pest' | 'crop' | 'general'): string[] => {
  switch (context) {
    case 'pest':
      return [
        "What are common pests in rice?",
        "How to treat aphids?",
        "Symptoms of leaf blight",
        "Organic pest control methods",
      ];
    case 'crop':
      return [
        "Best crops for clay soil",
        "Winter season crops",
        "High profit crops",
        "Crops for low water areas",
      ];
    default:
      return [
        "How to improve soil health?",
        "Weather impact on crops",
        "Market price trends",
        "Sustainable farming practices",
      ];
  }
};