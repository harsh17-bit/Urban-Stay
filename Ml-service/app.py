from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np

app = Flask(__name__)
CORS(app)

# Load model and encoders
model = joblib.load('model.pkl')
encoders = joblib.load('encoders.pkl')
city_encoder = encoders['city_encoder']
feature_cols = encoders['feature_cols']
supported_cities = encoders['cities']

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
            # Use most similar city or default
            city_encoded = 0  # Default to first city
        
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

@app.route('/cities', methods=['GET'])
def get_cities():
    return jsonify({'cities': supported_cities})
# ===== INVESTMENT ANALYSIS ENDPOINT =====
@app.route('/analyze-investment', methods=['POST'])
def analyze_investment():
    try:
        data = request.json
        
        # Load investment models
        import os
        if not os.path.exists('investment_models'):
            return jsonify({'success': False, 'error': 'Investment models not found. Run investment_model.py first.'}), 400
        
        model_rental = joblib.load('investment_models/rental_yield_model.pkl')
        model_roi = joblib.load('investment_models/roi_score_model.pkl')
        model_appr5 = joblib.load('investment_models/appreciation_5yr_model.pkl')
        model_appr10 = joblib.load('investment_models/appreciation_10yr_model.pkl')
        encoders = joblib.load('investment_models/investment_encoders.pkl')
        
        feature_cols = encoders['feature_cols']
        
        # Extract and convert features
        area = float(data.get('area', 1000))
        bedrooms = int(data.get('bedrooms', 2))
        city = str(data.get('city', 'Bangalore')).strip().lower()
        
        # Location score (popular cities)
        popular_cities = ['bangalore', 'mumbai', 'delhi', 'hyderabad', 'pune']
        location_score = 80 if city in popular_cities else 60
        
        # Amenity score (count amenities)
        amenities = data.get('amenities', [])
        amenity_score = min(len(amenities) * 15 + 50, 100)
        
        # Possession score (ready to move)
        possession_score = 85
        
        # Prepare feature vector
        X = np.array([[area, bedrooms, location_score, amenity_score, possession_score]])
        
        # Predictions
        rental_yield = max(0.1, float(model_rental.predict(X)[0]))
        roi_score = float(model_roi.predict(X)[0])
        appreciation_5yr = int(model_appr5.predict(X)[0])
        appreciation_10yr = int(model_appr10.predict(X)[0])
        
        # Clamp values
        roi_score = max(0, min(100, roi_score))
        
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
                'rentalYield': round(rental_yield, 2),
                'appreciation': {
                    'fiveYear': appreciation_5yr,
                    'tenYear': appreciation_10yr,
                    'fiveYearPercent': round((appreciation_5yr / data.get('price', 100)) * 100, 1),
                    'tenYearPercent': round((appreciation_10yr / data.get('price', 100)) * 100, 1)
                },
                'scores': {
                    'location': location_score,
                    'amenity': round(amenity_score, 0),
                    'possession': possession_score
                },
                'confidence': 0.82
            }
        })
        
    except Exception as e:
        print(f"Investment analysis error: {e}")
        return jsonify({'success': False, 'error': str(e)}), 400
if __name__ == '__main__':
    print(f"Supported cities: {supported_cities}")
    app.run(host='0.0.0.0', port=5001, debug=True)