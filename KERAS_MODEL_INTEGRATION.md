# Keras Model Integration Guide

## Overview
This guide explains how to integrate your trained Keras model (`pest_detection_model_pwp.keras`) with the Smart Crop Aid app for real-time pest detection.

## Current Status
✅ **Framework Setup Complete** - The integration framework is ready
✅ **Flask API Created** - Backend API server ready to serve your model
⚠️ **API Server Setup Needed** - Start the Flask server to enable model predictions

## Files Created/Modified
1. **`utils/modelInference.ts`** - Model inference framework (currently simulated)
2. **`utils/pestDetection.ts`** - Updated to prioritize trained model
3. **`package.json`** - Added TensorFlow.js dependencies

## Detection Priority
The system uses this priority order:
1. **Trained Keras Model** (Primary) - Your custom model
2. **Vision API** (Fallback) - External AI service  
3. **Simulation** (Final fallback) - Random selection from database

## Integration Options for React Native

### Option 1: TensorFlow Lite (Recommended)
Convert your Keras model to TensorFlow Lite for mobile optimization:

```bash
# Convert Keras to TensorFlow Lite
python -c "
import tensorflow as tf
model = tf.keras.models.load_model('Plant-Disease-Recognition-System-main/models/pest_detection_model_pwp.keras')
converter = tf.lite.TFLiteConverter.from_keras_model(model)
tflite_model = converter.convert()
with open('pest_detection_model.tflite', 'wb') as f:
    f.write(tflite_model)
"
```

Then use a React Native TensorFlow Lite library:
```bash
npm install react-native-tensorflow-lite
```

### Option 2: Backend API ✅ **IMPLEMENTED**
I've created a complete Flask API server that serves your model:

**Files Created:**
- `Plant-Disease-Recognition-System-main/api_server.py` - Complete Flask API
- `Plant-Disease-Recognition-System-main/requirements.txt` - Python dependencies
- `Plant-Disease-Recognition-System-main/setup_api.bat` - Windows setup script
- `Plant-Disease-Recognition-System-main/setup_api.sh` - Linux/Mac setup script

**API Features:**
- ✅ Loads your existing Keras model
- ✅ Handles base64 image uploads
- ✅ Returns predictions with confidence scores
- ✅ CORS enabled for React Native
- ✅ Health check endpoint
- ✅ Disease information lookup

### Option 3: TensorFlow.js (Web Only)
Convert to TensorFlow.js format for web deployment:

```bash
tensorflowjs_converter --input_format=keras \
  Plant-Disease-Recognition-System-main/models/pest_detection_model_pwp.keras \
  ./assets/models/
```

## Current Implementation Details

### Model Configuration
```typescript
// In utils/modelInference.ts
const MODEL_PATH = '../Plant-Disease-Recognition-System-main/models/pest_detection_model_pwp.keras';
const IMAGE_SIZE = 224; // Adjust based on your model
const NUM_CLASSES = 38; // Based on your training data
```

### Class Names (Update if needed)
The `CLASS_NAMES` array contains all 38 disease categories. Ensure this matches your model's training order.

### Current Behavior
- `isModelReady()` returns `false` (model not loaded)
- `predictPestDisease()` returns `null` (falls back to Vision API)
- System gracefully falls back to other detection methods

## Quick Start Guide (Flask API)

### 1. Start the Flask API Server
```bash
# Navigate to the Flask app directory
cd Plant-Disease-Recognition-System-main

# Windows
setup_api.bat

# Linux/Mac  
chmod +x setup_api.sh
./setup_api.sh
```

### 2. Update API Configuration
In `utils/modelInference.ts`, update the API URL if needed:
```typescript
const API_BASE_URL = 'http://localhost:5000'; // Change to your server IP
```

For testing on a physical device, use your computer's IP address:
```typescript
const API_BASE_URL = 'http://192.168.1.100:5000'; // Your computer's IP
```

### 3. Test the Integration
```typescript
import { analyzeImageForPests } from './utils/pestDetection';

const result = await analyzeImageForPests(imageUri);
console.log('Detection method:', result.detectionMethod);
console.log('Confidence:', result.confidence);
```

### 4. Verify API is Working
Test the health endpoint:
```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "model_loaded": true,
  "classes": 38
}
```

## Model Information
- **File**: `pest_detection_model_pwp.keras`
- **Classes**: 38 plant disease categories
- **Expected Input**: 224x224 RGB images (verify with your training)
- **Output**: Probability distribution over 38 classes

## Testing the Framework
The current implementation allows you to test the integration framework:
1. The system will attempt to use the model (currently simulated)
2. Falls back to Vision API if model unavailable
3. Finally uses simulation if all else fails

## Troubleshooting

### Dependencies Installed Successfully
✅ TensorFlow.js packages are now installed
✅ No TypeScript errors in the integration code

### Common Next Steps Issues
1. **Model Format**: Keras models need conversion for mobile
2. **Image Preprocessing**: Ensure preprocessing matches training
3. **Class Mapping**: Verify class names match training order
4. **Performance**: Consider model quantization for mobile

## Resources
- [TensorFlow Lite Guide](https://www.tensorflow.org/lite)
- [React Native TensorFlow Lite](https://github.com/shaqian/react-native-tensorflow-lite)
- [TensorFlow.js Converter](https://github.com/tensorflow/tfjs/tree/master/tfjs-converter)

The framework is ready - choose your integration method and implement the actual model loading!