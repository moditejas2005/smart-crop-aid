from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import numpy as np
import json
import uuid
import tensorflow as tf
import base64
import io
from PIL import Image
import os

app = Flask(__name__)
# Allow CORS for all domains to support mobile apps and web clients
CORS(app)

# Load the trained model
model = None
model_dir = "models"
model_path = None
loading_error = None

print(f"Current working directory: {os.getcwd()}")
print(f"Listing current directory: {os.listdir('.')}")

if os.path.exists(model_dir):
    print(f"Listing models directory: {os.listdir(model_dir)}")
    files = [f for f in os.listdir(model_dir) if f.endswith('.keras') or f.endswith('.h5')]
    if files:
        model_path = os.path.join(model_dir, files[0])
        print(f"Found model file: {model_path}")
    else:
        loading_error = "No .keras or .h5 files found in models directory"
        print(f"❌ {loading_error}")
else:
    loading_error = "'models' directory not found"
    print(f"❌ {loading_error}")

if model_path:
    try:
        print(f"Attempting to load model from: {model_path}")
        model = tf.keras.models.load_model(model_path, compile=False)
        print("✅ Model loaded successfully!")
    except Exception as e:
        loading_error = str(e)
        print(f"❌ FAILED to load model: {e}")
elif not loading_error:
    loading_error = "Unknown error locating model file"

# Class labels (same as your existing app)
label = ['Apple___Apple_scab',
 'Apple___Black_rot',
 'Apple___Cedar_apple_rust',
 'Apple___healthy',
 'Background_without_leaves',
 'Blueberry___healthy',
 'Cherry___Powdery_mildew',
 'Cherry___healthy',
 'Corn___Cercospora_leaf_spot Gray_leaf_spot',
 'Corn___Common_rust',
 'Corn___Northern_Leaf_Blight',
 'Corn___healthy',
 'Grape___Black_rot',
 'Grape___Esca_(Black_Measles)',
 'Grape___Leaf_blight_(Isariopsis_Leaf_Spot)',
 'Grape___healthy',
 'Orange___Haunglongbing_(Citrus_greening)',
 'Peach___Bacterial_spot',
 'Peach___healthy',
 'Pepper,_bell___Bacterial_spot',
 'Pepper,_bell___healthy',
 'Potato___Early_blight',
 'Potato___Late_blight',
 'Potato___healthy',
 'Raspberry___healthy',
 'Soybean___healthy',
 'Squash___Powdery_mildew',
 'Strawberry___Leaf_scorch',
 'Strawberry___healthy',
 'Tomato___Bacterial_spot',
 'Tomato___Early_blight',
 'Tomato___Late_blight',
 'Tomato___Leaf_Mold',
 'Tomato___Septoria_leaf_spot',
 'Tomato___Spider_mites Two-spotted_spider_mite',
 'Tomato___Target_Spot',
 'Tomato___Tomato_Yellow_Leaf_Curl_Virus',
 'Tomato___Tomato_mosaic_virus',
 'Tomato___healthy']

# Load plant disease information
try:
    with open("plant_disease.json", 'r') as file:
        plant_disease = json.load(file)
except FileNotFoundError:
    print("Warning: plant_disease.json not found. Using basic disease info.")
    plant_disease = {}

# Create upload directory if it doesn't exist
os.makedirs('uploadimages', exist_ok=True)

def extract_features(image_path):
    """Extract features from image for model prediction"""
    image = tf.keras.utils.load_img(image_path, target_size=(160, 160))
    feature = tf.keras.utils.img_to_array(image)
    feature = np.array([feature])
    feature = feature / 255.0  # Normalize pixel values
    return feature

def extract_features_from_pil(pil_image):
    """Extract features from PIL Image object"""
    # Resize image to model input size
    image = pil_image.resize((160, 160))
    # Convert to array
    feature = tf.keras.utils.img_to_array(image)
    feature = np.array([feature])
    feature = feature / 255.0  # Normalize pixel values
    return feature

def model_predict(image_path=None, pil_image=None):
    """Make prediction using the trained model"""
    try:
        if model is None:
            print("Error: Attempted prediction but model is not loaded.")
            return None

        if pil_image is not None:
            img = extract_features_from_pil(pil_image)
        else:
            img = extract_features(image_path)
        
        prediction = model.predict(img)
        predicted_class_index = prediction.argmax()
        confidence = float(prediction.max())
        
        predicted_label = label[predicted_class_index]
        
        # Get additional disease information if available
        disease_info = plant_disease[predicted_class_index] if predicted_class_index < len(plant_disease) else {}
        
        return {
            'pestName': predicted_label,
            'confidence': round(confidence * 100, 2),
            'affectedCrop': predicted_label.split('___')[0].replace(',_', ' '),
            'classIndex': int(predicted_class_index),
            'diseaseInfo': disease_info
        }
    except Exception as e:
        print(f"Prediction error: {e}")
        return None

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'model_loaded': model is not None,
        'loading_error': loading_error,
        'classes': len(label)
    })

@app.route('/api/debug', methods=['GET'])
def debug_files():
    """Debug endpoint to list files"""
    files = []
    for root, dirs, filenames in os.walk('.'):
        for filename in filenames:
            files.append(os.path.join(root, filename))
    return jsonify({
        'cwd': os.getcwd(),
        'files': files
    })

@app.route('/api/predict', methods=['POST'])
def predict_api():
    """API endpoint for pest detection predictions"""
    try:
        # Check if request contains image data
        if 'image' not in request.files and 'imageBase64' not in request.json:
            return jsonify({'error': 'No image provided'}), 400
        
        prediction_result = None
        
        # Handle file upload
        if 'image' in request.files:
            image_file = request.files['image']
            if image_file.filename == '':
                return jsonify({'error': 'No image selected'}), 400
            
            # Save temporary file
            temp_name = f"uploadimages/temp_{uuid.uuid4().hex}_{image_file.filename}"
            image_file.save(temp_name)
            
            # Make prediction
            prediction_result = model_predict(image_path=temp_name)
            
            # Clean up temporary file
            try:
                os.remove(temp_name)
            except:
                pass
        
        # Handle base64 image
        elif request.is_json and 'imageBase64' in request.json:
            try:
                # Decode base64 image
                image_data = request.json['imageBase64']
                if image_data.startswith('data:image'):
                    # Remove data URL prefix
                    image_data = image_data.split(',')[1]
                
                # Decode and convert to PIL Image
                image_bytes = base64.b64decode(image_data)
                pil_image = Image.open(io.BytesIO(image_bytes))
                
                # Convert to RGB if necessary
                if pil_image.mode != 'RGB':
                    pil_image = pil_image.convert('RGB')
                
                # Make prediction
                prediction_result = model_predict(pil_image=pil_image)
                
            except Exception as e:
                return jsonify({'error': f'Invalid base64 image: {str(e)}'}), 400
        
        if prediction_result is None:
            return jsonify({'error': 'Prediction failed'}), 500
        
        return jsonify({
            'success': True,
            'prediction': prediction_result,
            'timestamp': str(uuid.uuid4())
        })
        
    except Exception as e:
        print(f"API Error: {e}")
        return jsonify({'error': f'Internal server error: {str(e)}'}), 500

@app.route('/api/classes', methods=['GET'])
def get_classes():
    """Get all available disease classes"""
    return jsonify({
        'classes': label,
        'total': len(label)
    })

@app.route('/api/disease-info/<int:class_index>', methods=['GET'])
def get_disease_info(class_index):
    """Get detailed information about a specific disease"""
    if class_index < 0 or class_index >= len(label):
        return jsonify({'error': 'Invalid class index'}), 400
    
    disease_info = plant_disease[class_index] if class_index < len(plant_disease) else {}
    return jsonify({
        'className': label[class_index],
        'classIndex': class_index,
        'diseaseInfo': disease_info
    })

# Keep original web interface routes for backward compatibility
@app.route('/uploadimages/<path:filename>')
def uploaded_images(filename):
    return send_from_directory('./uploadimages', filename)

@app.route('/', methods=['GET'])
def home():
    return jsonify({
        'message': 'Plant Disease Detection API',
        'version': '1.0.0',
        'endpoints': {
            'health': '/api/health',
            'predict': '/api/predict',
            'classes': '/api/classes',
            'disease_info': '/api/disease-info/<class_index>'
        }
    })

if __name__ == "__main__":
    print("Starting Plant Disease Detection API Server (Production)...")
    
    # Use PORT from environment (default to 7860 for Hugging Face)
    port = int(os.environ.get('PORT', 7860))
    app.run(host='0.0.0.0', port=port)