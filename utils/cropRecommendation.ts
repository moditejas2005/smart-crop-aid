import type { CropRecommendationRequest, EnhancedCropRecommendation } from '@/types';

// Comprehensive crop database with soil and water requirements
const CROP_DATABASE = [
  {
    name: 'Rice',
    duration: '120-150 days',
    expectedYield: '4-6 tons/hectare',
    idealSeason: 'Monsoon',
    soilTypes: ['clay', 'loamy'],
    waterRequirement: 'high' as const,
    profitability: 75,
    riskLevel: 'low' as const,
    marketDemand: 90,
    seasonalTips: [
      'Plant during monsoon for adequate water supply',
      'Ensure proper drainage to prevent waterlogging',
      'Use certified seeds for better yield',
      'Apply organic manure before transplanting'
    ],
  },
  {
    name: 'Wheat',
    duration: '110-130 days',
    expectedYield: '3-5 tons/hectare',
    idealSeason: 'Winter',
    soilTypes: ['loamy', 'clay', 'silt'],
    waterRequirement: 'medium' as const,
    profitability: 70,
    riskLevel: 'low' as const,
    marketDemand: 95,
    seasonalTips: [
      'Sow in November-December for optimal growth',
      'Ensure 4-5 irrigations during crop cycle',
      'Apply balanced fertilizers for better grain quality',
      'Harvest when moisture content is 12-14%'
    ],
  },
  {
    name: 'Tomato',
    duration: '90-120 days',
    expectedYield: '25-40 tons/hectare',
    idealSeason: 'Winter',
    soilTypes: ['loamy', 'sandy'],
    waterRequirement: 'medium' as const,
    profitability: 85,
    riskLevel: 'medium' as const,
    marketDemand: 80,
    seasonalTips: [
      'Provide support structures for climbing varieties',
      'Maintain consistent soil moisture',
      'Regular pruning increases fruit quality',
      'Harvest when fruits are firm and fully colored'
    ],
  },
  {
    name: 'Cotton',
    duration: '180-200 days',
    expectedYield: '1.5-2.5 tons/hectare',
    idealSeason: 'Summer',
    soilTypes: ['clay', 'loamy'],
    waterRequirement: 'high' as const,
    profitability: 80,
    riskLevel: 'high' as const,
    marketDemand: 85,
    seasonalTips: [
      'Ensure deep plowing before sowing',
      'Monitor for bollworm and other pests regularly',
      'Provide adequate irrigation during flowering',
      'Harvest when bolls are fully opened'
    ],
  },
  {
    name: 'Sugarcane',
    duration: '300-365 days',
    expectedYield: '70-100 tons/hectare',
    idealSeason: 'Spring',
    soilTypes: ['loamy', 'clay'],
    waterRequirement: 'high' as const,
    profitability: 90,
    riskLevel: 'medium' as const,
    marketDemand: 88,
    seasonalTips: [
      'Plant healthy seed canes with 2-3 buds',
      'Ensure regular irrigation throughout growth',
      'Apply organic matter to improve soil health',
      'Harvest at optimal maturity for maximum sugar content'
    ],
  },
  {
    name: 'Maize',
    duration: '90-120 days',
    expectedYield: '5-8 tons/hectare',
    idealSeason: 'Summer',
    soilTypes: ['loamy', 'sandy', 'silt'],
    waterRequirement: 'medium' as const,
    profitability: 75,
    riskLevel: 'low' as const,
    marketDemand: 82,
    seasonalTips: [
      'Sow after soil temperature reaches 15°C',
      'Ensure adequate spacing between plants',
      'Apply nitrogen fertilizer in split doses',
      'Harvest when kernels reach physiological maturity'
    ],
  },
  {
    name: 'Potato',
    duration: '90-120 days',
    expectedYield: '20-35 tons/hectare',
    idealSeason: 'Winter',
    soilTypes: ['sandy', 'loamy'],
    waterRequirement: 'medium' as const,
    profitability: 85,
    riskLevel: 'medium' as const,
    marketDemand: 90,
    seasonalTips: [
      'Use certified seed potatoes for planting',
      'Ensure proper hilling to prevent greening',
      'Monitor for late blight disease',
      'Harvest when plants start yellowing'
    ],
  },
  {
    name: 'Onion',
    duration: '120-150 days',
    expectedYield: '15-25 tons/hectare',
    idealSeason: 'Winter',
    soilTypes: ['loamy', 'sandy', 'silt'],
    waterRequirement: 'medium' as const,
    profitability: 80,
    riskLevel: 'medium' as const,
    marketDemand: 85,
    seasonalTips: [
      'Transplant seedlings at 6-8 weeks old',
      'Avoid overwatering during bulb formation',
      'Stop irrigation 2-3 weeks before harvest',
      'Cure bulbs properly for better storage'
    ],
  },
];

// Calculate soil suitability score
const calculateSoilSuitability = (cropSoilTypes: string[], requestedSoil: string): number => {
  if (cropSoilTypes.includes(requestedSoil)) {
    return 90 + Math.random() * 10; // 90-100% for ideal soil
  }

  // Check compatibility with similar soil types
  const soilCompatibility: { [key: string]: string[] } = {
    'loamy': ['silt', 'sandy'],
    'clay': ['loamy'],
    'sandy': ['loamy', 'silt'],
    'silt': ['loamy', 'sandy'],
    'peat': ['loamy'],
    'chalk': ['sandy'],
  };

  const compatible = soilCompatibility[requestedSoil] || [];
  const hasCompatible = cropSoilTypes.some(soil => compatible.includes(soil));

  if (hasCompatible) {
    return 60 + Math.random() * 20; // 60-80% for compatible soil
  }

  return 30 + Math.random() * 20; // 30-50% for less suitable soil
};

// Calculate water compatibility score
const calculateWaterCompatibility = (cropWaterReq: string, availableWater: string): number => {
  const waterLevels = { 'low': 1, 'medium': 2, 'high': 3 };
  const cropLevel = waterLevels[cropWaterReq as keyof typeof waterLevels];
  const availableLevel = waterLevels[availableWater as keyof typeof waterLevels];

  if (cropLevel === availableLevel) {
    return 95 + Math.random() * 5; // 95-100% for perfect match
  } else if (Math.abs(cropLevel - availableLevel) === 1) {
    return 70 + Math.random() * 20; // 70-90% for close match
  } else {
    return 40 + Math.random() * 20; // 40-60% for poor match
  }
};

// Get season-appropriate crops
const getSeasonalCrops = (season: string) => {
  const seasonMap: { [key: string]: string[] } = {
    'spring': ['Sugarcane', 'Maize', 'Cotton'],
    'summer': ['Cotton', 'Maize', 'Sugarcane'],
    'monsoon': ['Rice', 'Cotton', 'Sugarcane'],
    'winter': ['Wheat', 'Tomato', 'Potato', 'Onion'],
  };

  return seasonMap[season] || [];
};



// Get specific crop information
export const getCropRecommendations = async (
  request: CropRecommendationRequest,
  useAI: boolean = false // AI Disabled by request
): Promise<EnhancedCropRecommendation[]> => {
  const { soilType, waterAvailability, season, location } = request;
  const seasonalCrops = getSeasonalCrops(season);

  // Filter and score crops
  const recommendations = CROP_DATABASE.map(crop => {
    const soilSuitability = calculateSoilSuitability(crop.soilTypes, soilType);
    const waterCompatibility = calculateWaterCompatibility(crop.waterRequirement, waterAvailability);
    const seasonalBonus = seasonalCrops.includes(crop.name) ? 20 : 0;

    // Calculate overall confidence score
    const confidence = Math.round(
      (soilSuitability * 0.4 + waterCompatibility * 0.4 + seasonalBonus + crop.marketDemand * 0.2) / 1.6
    );

    return {
      ...crop,
      confidence: Math.min(confidence, 100),
      soilSuitability: Math.round(soilSuitability),
      seasonalTips: crop.seasonalTips,
    };
  })
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 5); // Return top 5 recommendations

  // AI Enhancement removed as per user request (errors)
  // if (useAI) { ... }

  return recommendations;
};

// Get specific crop information
export const getCropInfo = (cropName: string) => {
  return CROP_DATABASE.find(crop =>
    crop.name.toLowerCase().includes(cropName.toLowerCase())
  );
};

// Get crops suitable for specific conditions
export const getCropsForConditions = (soilType: string, waterLevel: string) => {
  return CROP_DATABASE.filter(crop => {
    const soilMatch = crop.soilTypes.includes(soilType);
    const waterMatch = crop.waterRequirement === waterLevel;
    return soilMatch || waterMatch;
  });
};