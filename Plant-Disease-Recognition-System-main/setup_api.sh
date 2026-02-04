#!/bin/bash
echo "Setting up Plant Disease Detection API..."

echo "Installing Python dependencies..."
pip install -r requirements.txt

echo ""
echo "Starting API server..."
echo "The API will be available at http://localhost:5000"
echo ""
echo "Available endpoints:"
echo "  GET  /api/health - Health check"
echo "  POST /api/predict - Make predictions"
echo "  GET  /api/classes - Get all classes"
echo "  GET  /api/disease-info/<id> - Get disease info"
echo ""

python api_server.py