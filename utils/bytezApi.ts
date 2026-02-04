// Bytez AI API integration for chatbot responses
const BYTEZ_API_BASE = process.env.EXPO_PUBLIC_BYTEZ_API_BASE || 'https://api.bytez.com';
const BYTEZ_API_KEY = process.env.EXPO_PUBLIC_BYTEZ_API_KEY || 'c092a3f024965f8270f3f57514041fa1';
const MODEL_ID = process.env.EXPO_PUBLIC_BYTEZ_MODEL_ID || 'Qwen/Qwen3-0.6B';

// Validate API key is configured
// if (!BYTEZ_API_KEY) {
//   console.warn('⚠️ EXPO_PUBLIC_BYTEZ_API_KEY is not configured in .env file');
//   console.warn('Chatbot features will use fallback responses');
// }

export interface BytezMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface BytezRequest {
  model: string;
  messages: BytezMessage[];
  temperature?: number;
  max_tokens?: number;
}

export interface BytezResponse {
  id: string;
  model: string;
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
}

// System prompt for agricultural assistant
const SYSTEM_PROMPT = `You are an expert agricultural AI assistant for Smart Crop Aid, a farming advisory platform. Your role is to help farmers with:

1. Pest and disease identification and treatment
2. Crop recommendations based on soil, water, and climate
3. Growing conditions and best practices
4. Market insights and pricing information
5. Sustainable farming techniques
6. Seasonal planting advice

Provide clear, practical, and actionable advice. Use simple language that farmers can understand. When discussing treatments or chemicals, always mention safety precautions. Be encouraging and supportive.

Keep responses concise (2-3 paragraphs max) unless the user asks for detailed information.`;

// Generate AI response using Bytez API
export const generateAIResponse = async (
  userMessage: string,
  conversationHistory: BytezMessage[] = []
): Promise<string> => {
  try {
    // Build messages array with system prompt and conversation history
    const messages: BytezMessage[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...conversationHistory,
      { role: 'user', content: userMessage },
    ];

    const requestBody: BytezRequest = {
      model: MODEL_ID,
      messages,
      temperature: 0.7,
      max_tokens: 500,
    };

    console.log('Calling Bytez API:', `${BYTEZ_API_BASE}/run`);

    const response = await fetch(`${BYTEZ_API_BASE}/run`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${BYTEZ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL_ID,
        input: messages,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      console.error('Bytez API error response:', errorText);
      throw new Error(`Bytez API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Bytez API response:', data);

    // Handle different response formats
    if (data.output) {
      return data.output;
    } else if (data.choices && data.choices.length > 0) {
      return data.choices[0].message.content;
    } else if (typeof data === 'string') {
      return data;
    }

    throw new Error('No response from AI model');
  } catch (error) {
    console.error('Error generating AI response:', error);
    throw error;
  }
};

// Check if API is working
export const validateAPIKey = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${BYTEZ_API_BASE}/run`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${BYTEZ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL_ID,
        input: [{ role: 'user', content: 'test' }],
      }),
    });
    return response.ok;
  } catch (error) {
    console.error('Error validating API key:', error);
    return false;
  }
};
