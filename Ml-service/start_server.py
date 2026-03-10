import sys
print("Starting Flask ML Service...")
sys.stdout.flush()

try:
    from flask import Flask, request, jsonify
    from flask_cors import CORS
    import joblib
    import numpy as np
    
    print("Imports successful")
    sys.stdout.flush()
    
    app = Flask(__name__)
    CORS(app)
    
    # Load model and encoders
    print("Loading models...")
    sys.stdout.flush()
    
    model = joblib.load('model.pkl')
    encoders = joblib.load('encoders.pkl')
    city_encoder = encoders['city_encoder']
    feature_cols = encoders['feature_cols']
    supported_cities = encoders['cities']
    
    print(f"Models loaded. Supported cities: {supported_cities[:5]}... ({len(supported_cities)} total)")
    sys.stdout.flush()
    
    @app.route('/health', methods=['GET'])
    def health():
        return jsonify({'status': 'ok', 'cities': supported_cities})
    
    @app.route('/predict', methods=['POST'])
    def predict():
        try:
            data = request.json
            
            # Extract features
            city = str(data.get('city', '')).strip().lower()
            area = float(data.get('area', 1000))
            bedrooms = int(data.get('bedrooms', 2))
            bathrooms = int(data.get('bathrooms', bedrooms))
            amenities_count = int(data.get('amenitiesCount', 0))
            
            # Encode city
            if city in supported_cities:
                city_encoded = city_encoder.transform([city])[0]
            else:
                city_encoded = 0
            
            # Prepare features
            features = {
                'area': area,
                'bedrooms': bedrooms,
                'bathrooms': bathrooms,
                'city_encoded': city_encoded,
                'amenities_count': amenities_count
            }
            
            X = np.array([[features.get(col, 0) for col in feature_cols]])
            
            # Predict
            predicted_price = model.predict(X)[0]
            
            # Calculate confidence range (±15%)
            min_price = predicted_price * 0.85
            max_price = predicted_price * 1.15
            price_per_sqft = predicted_price / area
            
            return jsonify({
                'success': True,
                'predictedPrice': round(predicted_price),
                'priceRange': {
                    'min': round(min_price),
                    'max': round(max_price)
                },
                'pricePerSqft': round(price_per_sqft),
                'confidence': 0.85,
                'city': city,
                'supportedCities': supported_cities
            })
            
        except Exception as e:
            return jsonify({'success': False, 'error': str(e)}), 400
    
    print("Starting server on http://0.0.0.0:5001")
    sys.stdout.flush()
    app.run(host='0.0.0.0', port=5001, debug=False, use_reloader=False)
    
except Exception as e:
    print(f"ERROR: {e}")
    import traceback
    traceback.print_exc()
    sys.stdout.flush()
