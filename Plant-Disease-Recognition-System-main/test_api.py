#!/usr/bin/env python3
"""
Test script for the Plant Disease Detection API
"""
import requests
import base64
import json
import os

API_BASE_URL = 'http://localhost:5000'

def test_health():
    """Test the health endpoint"""
    print("Testing health endpoint...")
    try:
        response = requests.get(f'{API_BASE_URL}/api/health')
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Health check passed: {data}")
            return True
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Health check error: {e}")
        return False

def test_classes():
    """Test the classes endpoint"""
    print("\nTesting classes endpoint...")
    try:
        response = requests.get(f'{API_BASE_URL}/api/classes')
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Classes endpoint works: {data['total']} classes available")
            return True
        else:
            print(f"❌ Classes endpoint failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Classes endpoint error: {e}")
        return False

def test_prediction_with_sample():
    """Test prediction with a sample image (if available)"""
    print("\nTesting prediction endpoint...")
    
    # Look for sample images in common locations
    sample_paths = [
        'sample_images',
        'test_images', 
        'uploadimages',
        '../sample_images'
    ]
    
    sample_image = None
    for path in sample_paths:
        if os.path.exists(path):
            for file in os.listdir(path):
                if file.lower().endswith(('.jpg', '.jpeg', '.png')):
                    sample_image = os.path.join(path, file)
                    break
            if sample_image:
                break
    
    if not sample_image:
        print("⚠️  No sample image found. Skipping prediction test.")
        print("   Place a test image in one of these folders to test predictions:")
        for path in sample_paths:
            print(f"   - {path}/")
        return True
    
    try:
        # Read and encode image
        with open(sample_image, 'rb') as f:
            image_data = base64.b64encode(f.read()).decode('utf-8')
        
        # Make prediction request
        response = requests.post(f'{API_BASE_URL}/api/predict', 
                               json={'imageBase64': f'data:image/jpeg;base64,{image_data}'},
                               timeout=30)
        
        if response.status_code == 200:
            data = response.json()
            if data['success']:
                pred = data['prediction']
                print(f"✅ Prediction successful:")
                print(f"   Disease: {pred['pestName']}")
                print(f"   Confidence: {pred['confidence']}%")
                print(f"   Crop: {pred['affectedCrop']}")
                return True
            else:
                print(f"❌ Prediction failed: {data.get('error', 'Unknown error')}")
                return False
        else:
            print(f"❌ Prediction request failed: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Prediction test error: {e}")
        return False

def main():
    """Run all tests"""
    print("🧪 Testing Plant Disease Detection API")
    print("=" * 50)
    
    tests = [
        test_health,
        test_classes,
        test_prediction_with_sample
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        if test():
            passed += 1
    
    print("\n" + "=" * 50)
    print(f"📊 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! Your API is working correctly.")
        print("\n💡 Next steps:")
        print("   1. Start your React Native app")
        print("   2. Update the API_BASE_URL in utils/modelInference.ts if needed")
        print("   3. Test pest detection in your mobile app")
    else:
        print("⚠️  Some tests failed. Check the API server logs.")
        print("\n🔧 Troubleshooting:")
        print("   1. Make sure the API server is running (python api_server.py)")
        print("   2. Check that the model file exists in models/pest_detection_model_pwp.keras")
        print("   3. Verify all dependencies are installed (pip install -r requirements.txt)")

if __name__ == '__main__':
    main()