export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'account' | 'feature' | 'farming' | 'dev';
}

export const KISAN_FAQ_DATA: FAQItem[] = [
  // App & Account Issues
  {
    id: 'login-issue',
    category: 'account',
    question: "I cannot log in to my account.",
    answer: "Please ensure you are using the correct email and password. If you forgot your password, currently you need to contact admin. Check your internet connection."
  },
  {
    id: 'profile-update',
    category: 'account',
    question: "My profile information is incorrect.",
    answer: "Go to the 'Profile' tab and click on the 'Edit' button or tap directly on the information you want to change. Save your changes to update them instantly."
  },
  {
    id: 'network-fail',
    category: 'account',
    question: "The app says 'Network Request Failed'.",
    answer: "This usually means your internet connection is unstable or our server is down. Please check your WiFi/Data and pull down to refresh the page."
  },
  {
    id: 'lang-change',
    category: 'account',
    question: "How do I change my language?",
    answer: "Currently, the app is available in English. Hindi and other regional support is coming soon!"
  },

  // Feature Troubleshooting
  {
    id: 'crop-empty',
    category: 'feature',
    question: "The Crop Recommendations list is empty.",
    answer: "This happens if your Soil Type or Season is not set correctly. Go to Profile -> Edit and ensure 'Soil Type' is selected. Also, try refreshing the Home screen."
  },
  {
    id: 'pest-fail',
    category: 'feature',
    question: "Pest Detection is not working.",
    answer: "1. Ensure you have given camera permissions.\n2. If you are offline, the simulation mode will run.\n3. For accurate results, ensure the image is clear and focused on the affected leaf."
  },
  {
    id: 'weather-wrong',
    category: 'feature',
    question: "The Weather information looks wrong.",
    answer: "If you haven't granted location permissions or added an API key, we show demo weather (Delhi). Ensure your Location Services are ON."
  },
  {
    id: 'market-empty',
    category: 'feature',
    question: "Market Prices are not loading.",
    answer: "Market prices are updated daily. If the list is empty, it means no data is available for today. Try again later."
  },

  // Farming Help (General)
  {
    id: 'soil-test',
    category: 'farming',
    question: "How do I determine my soil type?",
    answer: "You can visit a nearby Krishi Vigyan Kendra (KVK) for a soil test. Visually: 'Clay' is sticky when wet, 'Sandy' is gritty, 'Loamy' is a mix."
  },
  {
    id: 'water-time',
    category: 'farming',
    question: "What is the best time to water crops?",
    answer: "Early morning or late evening is best to prevent water evaporation. Avoid watering during peak sunny hours."
  },
  {
    id: 'report-pest',
    category: 'farming',
    question: "How do I report a new pest?",
    answer: "Use the 'Pest Detection' feature to take a photo. If the AI doesn't recognize it, consult a local expert."
  }
];

export const getFAQByCategory = (category: string) => {
  if (category === 'all') return KISAN_FAQ_DATA;
  return KISAN_FAQ_DATA.filter(item => item.category === category);
};

export const searchFAQ = (query: string) => {
  const lowerQuery = query.toLowerCase();
  return KISAN_FAQ_DATA.filter(item => 
    item.question.toLowerCase().includes(lowerQuery) || 
    item.answer.toLowerCase().includes(lowerQuery)
  );
};
