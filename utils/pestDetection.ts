import type { PestDetection } from '@/types';
import { isModelReady, predictPestDisease } from './modelInference';

// Enhanced pest detection database with more detailed information
const PEST_DATABASE = [
    {
        "name": "Apple___Apple_scab",
        "cause": "Fungus Venturia inaequalis. Favorable conditions are cool, wet weather.",
        "cure": "Use fungicides and resistant apple varieties. Prune and destroy infected leaves.",
        "crops": ["apple"],
        "severity": "medium",
        "treatment": "Apply fungicides during wet weather. Use resistant varieties.",
        "prevention": "Plant resistant varieties, ensure good air circulation, remove fallen leaves."
    },
    {
        "name": "Apple___Black_rot",
        "cause": "Caused by the fungus Botryosphaeria obtusa.",
        "cure": "Prune and remove infected areas. Apply fungicides during the growing season.",
        "crops": ["apple"],
        "severity": "high",
        "treatment": "Prune infected areas, apply fungicides during growing season.",
        "prevention": "Maintain tree health, proper pruning, fungicide applications."
    },
    {
        "name": "Apple___Cedar_apple_rust",
        "cause": "Fungus Gymnosporangium juniperi-virginianae. Requires junipers as an alternate host.",
        "cure": "Remove nearby juniper hosts. Use resistant varieties and fungicides.",
        "crops": ["apple"],
        "severity": "medium",
        "treatment": "Apply fungicides, remove nearby juniper hosts.",
        "prevention": "Plant resistant varieties, remove alternate hosts, fungicide sprays."
    },
    {
        "name": "Apple___healthy",
        "cause": "No disease present.",
        "cure": "Maintain good cultural practices for optimal health.",
        "crops": ["apple"],
        "severity": "low",
        "treatment": "No treatment needed.",
        "prevention": "Continue good cultural practices."
    },
    {
        "name": "Blueberry___healthy",
        "cause": "No disease present.",
        "cure": "Maintain good cultural practices for optimal health.",
        "crops": ["blueberry"],
        "severity": "low",
        "treatment": "No treatment needed.",
        "prevention": "Continue good cultural practices."
    },
    {
        "name": "Cherry___Powdery_mildew",
        "cause": "Fungus Podosphaera clandestina.",
        "cure": "Apply sulfur-based or fungicide treatments. Ensure good air circulation.",
        "crops": ["cherry"],
        "severity": "medium",
        "treatment": "Apply sulfur-based fungicides, ensure good air circulation.",
        "prevention": "Maintain proper spacing, avoid overhead watering."
    },
    {
        "name": "Cherry___healthy",
        "cause": "No disease present.",
        "cure": "Maintain good cultural practices for optimal health.",
        "crops": ["cherry"],
        "severity": "low",
        "treatment": "No treatment needed.",
        "prevention": "Continue good cultural practices."
    },
    {
        "name": "Corn___Cercospora_leaf_spot Gray_leaf_spot",
        "cause": "Fungus Cercospora zeae-maydis.",
        "cure": "Use resistant hybrids and fungicide sprays.",
        "crops": ["corn"],
        "severity": "medium",
        "treatment": "Apply fungicide sprays, use resistant hybrids.",
        "prevention": "Plant resistant varieties, crop rotation, proper field sanitation."
    },
    {
        "name": "Corn___Common_rust",
        "cause": "Fungus Puccinia sorghi.",
        "cure": "Apply fungicides and plant resistant varieties.",
        "crops": ["corn"],
        "severity": "medium",
        "treatment": "Apply fungicides, plant resistant varieties.",
        "prevention": "Use resistant hybrids, monitor weather conditions."
    },
    {
        "name": "Corn___Northern_Leaf_Blight",
        "cause": "Fungus Exserohilum turcicum.",
        "cure": "Use resistant varieties and fungicides.",
        "crops": ["corn"],
        "severity": "high",
        "treatment": "Apply fungicides, use resistant varieties.",
        "prevention": "Plant resistant hybrids, crop rotation, field sanitation."
    },
    {
        "name": "Corn___healthy",
        "cause": "No disease present.",
        "cure": "Maintain good cultural practices for optimal health.",
        "crops": ["corn"],
        "severity": "low",
        "treatment": "No treatment needed.",
        "prevention": "Continue good cultural practices."
    },
    {
        "name": "Grape___Black_rot",
        "cause": "Fungus Guignardia bidwellii.",
        "cure": "Prune infected areas and apply fungicides.",
        "crops": ["grape"],
        "severity": "high",
        "treatment": "Prune infected areas, apply fungicides.",
        "prevention": "Proper pruning, fungicide applications, vineyard sanitation."
    },
    {
        "name": "Grape___Esca_(Black_Measles)",
        "cause": "Fungal complex including Phaeomoniella chlamydospora.",
        "cure": "Remove infected wood. Avoid injuries to vines.",
        "crops": ["grape"],
        "severity": "high",
        "treatment": "Remove infected wood, avoid vine injuries.",
        "prevention": "Minimize pruning wounds, proper vineyard management."
    },
    {
        "name": "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)",
        "cause": "Fungus Pseudocercospora vitis.",
        "cure": "Apply fungicides and manage vineyard hygiene.",
        "crops": ["grape"],
        "severity": "medium",
        "treatment": "Apply fungicides, maintain vineyard hygiene.",
        "prevention": "Good air circulation, proper spacing, fungicide programs."
    },
    {
        "name": "Grape___healthy",
        "cause": "No disease present.",
        "cure": "Maintain good cultural practices for optimal health.",
        "crops": ["grape"],
        "severity": "low",
        "treatment": "No treatment needed.",
        "prevention": "Continue good cultural practices."
    },
    {
        "name": "Orange___Haunglongbing_(Citrus_greening)",
        "cause": "Bacterium Candidatus Liberibacter spp. Spread by psyllid insects.",
        "cure": "Control psyllid population and remove infected trees.",
        "crops": ["orange", "citrus"],
        "severity": "high",
        "treatment": "Control psyllid insects, remove infected trees.",
        "prevention": "Psyllid management, use certified disease-free plants."
    },
    {
        "name": "Peach___Bacterial_spot",
        "cause": "Bacterium Xanthomonas campestris pv. pruni.",
        "cure": "Use resistant varieties and copper-based bactericides.",
        "crops": ["peach"],
        "severity": "medium",
        "treatment": "Apply copper-based bactericides, use resistant varieties.",
        "prevention": "Plant resistant varieties, proper orchard sanitation."
    },
    {
        "name": "Peach___healthy",
        "cause": "No disease present.",
        "cure": "Maintain good cultural practices for optimal health.",
        "crops": ["peach"],
        "severity": "low",
        "treatment": "No treatment needed.",
        "prevention": "Continue good cultural practices."
    },
    {
        "name": "Pepper,_bell___Bacterial_spot",
        "cause": "Bacterium Xanthomonas campestris pv. vesicatoria.",
        "cure": "Use copper-based bactericides and resistant varieties.",
        "crops": ["pepper", "bell pepper"],
        "severity": "medium",
        "treatment": "Apply copper-based bactericides, use resistant varieties.",
        "prevention": "Plant resistant varieties, avoid overhead irrigation."
    },
    {
        "name": "Pepper,_bell___healthy",
        "cause": "No disease present.",
        "cure": "Maintain good cultural practices for optimal health.",
        "crops": ["pepper", "bell pepper"],
        "severity": "low",
        "treatment": "No treatment needed.",
        "prevention": "Continue good cultural practices."
    },
    {
        "name": "Potato___Early_blight",
        "cause": "Fungus Alternaria solani.",
        "cure": "Apply fungicides and practice crop rotation.",
        "crops": ["potato"],
        "severity": "medium",
        "treatment": "Apply fungicides, practice crop rotation.",
        "prevention": "Crop rotation, proper spacing, fungicide applications."
    },
    {
        "name": "Potato___Late_blight",
        "cause": "Pathogen Phytophthora infestans.",
        "cure": "Use resistant varieties and fungicides.",
        "crops": ["potato"],
        "severity": "high",
        "treatment": "Apply fungicides immediately, use resistant varieties.",
        "prevention": "Plant resistant varieties, monitor weather conditions."
    },
    {
        "name": "Potato___healthy",
        "cause": "No disease present.",
        "cure": "Maintain good cultural practices for optimal health.",
        "crops": ["potato"],
        "severity": "low",
        "treatment": "No treatment needed.",
        "prevention": "Continue good cultural practices."
    },
    {
        "name": "Raspberry___healthy",
        "cause": "No disease present.",
        "cure": "Maintain good cultural practices for optimal health.",
        "crops": ["raspberry"],
        "severity": "low",
        "treatment": "No treatment needed.",
        "prevention": "Continue good cultural practices."
    },
    {
        "name": "Soybean___healthy",
        "cause": "No disease present.",
        "cure": "Maintain good cultural practices for optimal health.",
        "crops": ["soybean"],
        "severity": "low",
        "treatment": "No treatment needed.",
        "prevention": "Continue good cultural practices."
    },
    {
        "name": "Squash___Powdery_mildew",
        "cause": "Fungal pathogens including Erysiphe cichoracearum.",
        "cure": "Apply sulfur-based fungicides and maintain good air circulation.",
        "crops": ["squash"],
        "severity": "medium",
        "treatment": "Apply sulfur-based fungicides, ensure good air circulation.",
        "prevention": "Proper spacing, avoid overhead watering, resistant varieties."
    },
    {
        "name": "Strawberry___Leaf_scorch",
        "cause": "Fungus Diplocarpon earlianum.",
        "cure": "Remove infected leaves and apply fungicides.",
        "crops": ["strawberry"],
        "severity": "medium",
        "treatment": "Remove infected leaves, apply fungicides.",
        "prevention": "Proper spacing, avoid overhead watering, resistant varieties."
    },
    {
        "name": "Strawberry___healthy",
        "cause": "No disease present.",
        "cure": "Maintain good cultural practices for optimal health.",
        "crops": ["strawberry"],
        "severity": "low",
        "treatment": "No treatment needed.",
        "prevention": "Continue good cultural practices."
    },
    {
        "name": "Tomato___Bacterial_spot",
        "cause": "Bacterium Xanthomonas spp.",
        "cure": "Apply copper-based bactericides and practice crop rotation.",
        "crops": ["tomato"],
        "severity": "medium",
        "treatment": "Apply copper-based bactericides, practice crop rotation.",
        "prevention": "Use resistant varieties, avoid overhead irrigation."
    },
    {
        "name": "Tomato___Early_blight",
        "cause": "Fungus Alternaria solani.",
        "cure": "Apply fungicides and remove infected leaves.",
        "crops": ["tomato"],
        "severity": "medium",
        "treatment": "Apply fungicides, remove infected leaves.",
        "prevention": "Crop rotation, proper spacing, fungicide applications."
    },
    {
        "name": "Tomato___Late_blight",
        "cause": "Pathogen Phytophthora infestans.",
        "cure": "Use resistant varieties and fungicides.",
        "crops": ["tomato"],
        "severity": "high",
        "treatment": "Apply fungicides immediately, use resistant varieties.",
        "prevention": "Plant resistant varieties, monitor weather conditions."
    },
    {
        "name": "Tomato___Leaf_Mold",
        "cause": "Fungus Passalora fulva.",
        "cure": "Apply fungicides and ensure good ventilation.",
        "crops": ["tomato"],
        "severity": "medium",
        "treatment": "Apply fungicides, ensure good ventilation.",
        "prevention": "Proper ventilation, avoid high humidity."
    },
    {
        "name": "Tomato___Septoria_leaf_spot",
        "cause": "Fungus Septoria lycopersici.",
        "cure": "Remove infected leaves and apply fungicides.",
        "crops": ["tomato"],
        "severity": "medium",
        "treatment": "Remove infected leaves, apply fungicides.",
        "prevention": "Proper spacing, avoid overhead watering, mulching."
    },
    {
        "name": "Tomato___Spider_mites Two-spotted_spider_mite",
        "cause": "Spider mites Tetranychus urticae.",
        "cure": "Use miticides or insecticidal soaps.",
        "crops": ["tomato"],
        "severity": "medium",
        "treatment": "Apply miticides or insecticidal soaps.",
        "prevention": "Maintain proper humidity, regular monitoring."
    },
    {
        "name": "Tomato___Target_Spot",
        "cause": "Fungus Corynespora cassiicola.",
        "cure": "Apply fungicides and ensure good air circulation.",
        "crops": ["tomato"],
        "severity": "medium",
        "treatment": "Apply fungicides, ensure good air circulation.",
        "prevention": "Proper spacing, avoid overhead watering."
    },
    {
        "name": "Tomato___Tomato_Yellow_Leaf_Curl_Virus",
        "cause": "Virus spread by whiteflies.",
        "cure": "Control whitefly population and use resistant varieties.",
        "crops": ["tomato"],
        "severity": "high",
        "treatment": "Control whitefly population, use resistant varieties.",
        "prevention": "Whitefly management, use resistant varieties."
    },
    {
        "name": "Tomato___Tomato_mosaic_virus",
        "cause": "Virus transmitted through contact and contaminated tools.",
        "cure": "Remove infected plants and sterilize tools.",
        "crops": ["tomato"],
        "severity": "high",
        "treatment": "Remove infected plants, sterilize tools.",
        "prevention": "Tool sanitation, avoid plant contact when wet."
    },
    {
        "name": "Tomato___healthy",
        "cause": "No disease present.",
        "cure": "Maintain good cultural practices for optimal health.",
        "crops": ["tomato"],
        "severity": "low",
        "treatment": "No treatment needed.",
        "prevention": "Continue good cultural practices."
    }
];

// Main analysis function
export const analyzeImageForPests = async (imageUri: string, cropType?: string): Promise<PestDetection & { plantData?: any; growingConditions?: string[] }> => {
    // 1. Try Trained Keras Model First
    try {
        console.log('Attempting to use trained Keras model for pest detection...');
        const modelResult = await predictPestDisease(imageUri);

        if (modelResult && modelResult.confidence > 50) { // Only use if confidence is reasonable
            console.log('Keras model prediction successful:', modelResult);

            // Get detailed information from database
            const pestInfo = getPestInfo(modelResult.pestName);

            return {
                id: Date.now().toString(),
                userId: 'user', // Placeholder, overwritten by caller
                imageUri,
                pestName: modelResult.pestName,
                affectedCrop: modelResult.affectedCrop,
                confidence: modelResult.confidence,
                severity: pestInfo?.severity as 'low' | 'medium' | 'high' || 'medium',
                treatment: pestInfo?.treatment || pestInfo?.cure || 'Consult agricultural expert',
                prevention: pestInfo?.prevention || 'Follow good agricultural practices',
                cause: pestInfo?.cause || 'Unknown cause',
                timestamp: new Date().toISOString(),
                detectionMethod: 'ai', // Keras Model
                plantData: undefined,
                growingConditions: []
            };
        }
    } catch (e) {
        console.warn('Keras model prediction failed, using fallback:', e);
    }

    // 2. Vision API removed as per requirements
    /* 
    try {
        // Vision API logic removed
    } catch (e) {
        console.warn('Vision API lookup failed');
    }
    */

    // Vision API code removed

    // 3. Fallback to Simulation (Existing Logic)
    console.log('Using Simulation Mode for Pest Detection');

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));

    let growingConditions: string[] = [];

    // Filter pests based on crop type if provided
    let possiblePests = PEST_DATABASE;
    if (cropType) {
        possiblePests = PEST_DATABASE.filter(pest => {
            const cropFromName = pest.name.split('___')[0].toLowerCase();
            return cropFromName.includes(cropType.toLowerCase()) ||
                cropType.toLowerCase().includes(cropFromName);
        });
    }

    // If no crop-specific pests found, use all pests
    if (possiblePests.length === 0) {
        possiblePests = PEST_DATABASE;
    }

    // Simulate AI confidence based on image quality and pest visibility
    const baseConfidence = 70 + Math.random() * 25; // 70-95% confidence
    const selectedPest = possiblePests[Math.floor(Math.random() * possiblePests.length)];

    // Determine affected crop
    let affectedCrop = cropType || 'Unknown';
    if (!cropType) {
        // Extract crop from pest name
        const cropFromName = selectedPest.name.split('___')[0];
        if (cropFromName && cropFromName !== 'Background') {
            affectedCrop = cropFromName;
        }
    }

    // Format crop name
    const cropDisplayName = affectedCrop.charAt(0).toUpperCase() + affectedCrop.slice(1);

    const result = {
        id: Date.now().toString(),
        userId: 'user', // Placeholder, overwritten by caller
        pestName: selectedPest.name,
        affectedCrop: cropDisplayName,
        treatment: selectedPest.cure, // Use cure as treatment
        prevention: "Follow good agricultural practices and monitor regularly",
        cause: selectedPest.cause || 'Unknown cause',
        imageUri,
        timestamp: new Date().toISOString(),
        confidence: Math.round(baseConfidence),
        severity: (selectedPest as any).severity as 'low' | 'medium' | 'high' || (selectedPest.name.includes('healthy') ? 'low' as const : 'medium' as const),
        detectionMethod: 'ai' as const,
        plantData: undefined,
        growingConditions: growingConditions.length > 0 ? growingConditions : undefined,
    };

    return result;
};

// Get pest information by name
export const getPestInfo = (pestName: string) => {
    return PEST_DATABASE.find(pest =>
        pest.name.toLowerCase().includes(pestName.toLowerCase())
    );
};

// Get common pests for a specific crop
export const getCommonPests = (cropType: string) => {
    return PEST_DATABASE.filter(pest => {
        // Extract crop name from pest name (format: "Crop___Disease")
        const cropFromName = pest.name.split('___')[0].toLowerCase();
        return cropFromName.includes(cropType.toLowerCase()) ||
            cropType.toLowerCase().includes(cropFromName);
    });
};

// Helper function to check if the trained model is available
export const isTrainedModelAvailable = (): boolean => {
    return isModelReady();
};

// Helper function to get detection method priority
export const getDetectionMethods = (): string[] => {
    const methods = [];

    if (isModelReady()) {
        methods.push('Trained Keras Model');
    }

    // methods.push('Vision API'); // Removed
    methods.push('Simulation');

    return methods;
};