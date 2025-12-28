// Alternative Bytez API implementation with multiple endpoint attempts
const BYTEZ_API_KEY = 'c092a3f024965f8270f3f57514041fa1';
const MODEL_ID = 'Qwen/Qwen3-0.6B';

export interface BytezMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
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

// Try multiple API endpoints
const API_ENDPOINTS = [
  'https://api.bytez.com/run',
  'https://api.bytez.com/v1/chat/completions',
  'https://bytez.com/api/run',
];

export const generateAIResponse = async (
  userMessage: string,
  conversationHistory: BytezMessage[] = []
): Promise<string> => {
  const messages: BytezMessage[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...conversationHistory,
    { role: 'user', content: userMessage },
  ];

  // Try each endpoint
  for (const endpoint of API_ENDPOINTS) {
    try {
      console.log(`Trying endpoint: ${endpoint}`);
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${BYTEZ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: MODEL_ID,
          input: messages,
          messages: messages, // Try both formats
          temperature: 0.7,
          max_tokens: 500,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`Success with ${endpoint}:`, data);
        
        // Try different response formats
        if (data.output) return data.output;
        if (data.choices?.[0]?.message?.content) return data.choices[0].message.content;
        if (data.response) return data.response;
        if (typeof data === 'string') return data;
      } else {
        const errorText = await response.text();
        console.warn(`Failed ${endpoint}: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.warn(`Error with ${endpoint}:`, error);
    }
  }

  throw new Error('All Bytez API endpoints failed');
};
