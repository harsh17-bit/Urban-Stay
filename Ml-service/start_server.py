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
    
    @app.route('/analyze-investment', methods=['POST'])
    def analyze_investment():
        try:
            data = request.json
            
            # Extract features
            area = float(data.get('area', 1000))
            bedrooms = int(data.get('bedrooms', 2))
            city = str(data.get('city', 'bangalore')).strip().lower()
            amenities = data.get('amenities', [])
            price = float(data.get('price', 5000000))
            
            # Calculate location score (popular cities)
            popular_cities = ['bangalore', 'whitefield', 'koramangala', 'indiranagar', 'mumbai', 'delhi', 'hyderabad', 'pune']
            location_score = 80 if city in popular_cities else 60
            
            # Calculate amenity score (count amenities)
            amenity_score = min(len(amenities) * 15 + 50, 100)
            
            # Possession score (ready to move)
            possession_score = 85
            
            # Rental rates based on bedrooms
            rental_rates = {1: 20000, 2: 35000, 3: 50000, 4: 70000}
            estimated_monthly_rent = rental_rates.get(bedrooms, 35000)
            estimated_annual_rent = estimated_monthly_rent * 12
            rental_yield = round((estimated_annual_rent / price) * 100, 2)
            
            # Calculate ROI score
            roi_score = (
                rental_yield * 4.0 +  # 40% weight on rental yield
                (location_score / 100 * 30) +  # 30% on location
                (amenity_score / 100 * 20) +  # 20% on amenities
                (possession_score / 100 * 10)  # 10% on possession status
            )
            roi_score = max(0, min(100, roi_score))
            
            # Calculate appreciation (assume 10% annual)
            appreciation_5yr = int(price * (1.10 ** 5) - price)
            appreciation_10yr = int(price * (1.10 ** 10) - price)
            
            # Investment category
            if roi_score >= 80:
                category = "Excellent"
                recommendation = "Strong investment potential"
            elif roi_score >= 70:
                category = "Very Good"
                recommendation = "Good investment opportunity"
            elif roi_score >= 60:
                category = "Good"
                recommendation = "Moderate investment potential"
            elif roi_score >= 50:
                category = "Average"
                recommendation = "Consider comparing with alternatives"
            else:
                category = "Below Average"
                recommendation = "Limited investment potential"
            
            return jsonify({
                'success': True,
                'analysis': {
                    'roiScore': round(roi_score, 1),
                    'category': category,
                    'recommendation': recommendation,
                    'rentalYield': rental_yield,
                    'appreciation': {
                        'fiveYear': appreciation_5yr,
                        'tenYear': appreciation_10yr,
                        'fiveYearPercent': round((appreciation_5yr / price) * 100, 1),
                        'tenYearPercent': round((appreciation_10yr / price) * 100, 1)
                    },
                    'scores': {
                        'location': location_score,
                        'amenity': int(amenity_score),
                        'possession': possession_score
                    },
                    'confidence': 0.82
                }
            })
            
        except Exception as e:
            print(f"Investment analysis error: {e}")
            import traceback
            traceback.print_exc()
            sys.stdout.flush()
            return jsonify({'success': False, 'error': str(e)}), 400
    
    print("Starting server on http://0.0.0.0:5001")
    sys.stdout.flush()
    app.run(host='0.0.0.0', port=5001, debug=False, use_reloader=False)
    
except Exception as e:
    print(f"ERROR: {e}")
    import traceback
    traceback.print_exc()
    sys.stdout.flush()
