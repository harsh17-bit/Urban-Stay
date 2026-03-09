import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, r2_score
import joblib
import warnings
warnings.filterwarnings('ignore')

def train_investment_model():
    print("Loading property data for investment analysis...")
    
    # Load your existing Bangalore data or create synthetic data
    df = pd.read_csv('data/Bangalore.csv')
    
    print(f"Original records: {len(df)}")
    
    # Standardize columns
    column_mapping = {
        'Price': 'price',
        'Area': 'area',
        'Location': 'city',
        'No. of Bedrooms': 'bedrooms',
        'price': 'price',
        'area': 'area',
        'city': 'city',
        'bedrooms': 'bedrooms'
    }
    
    df.rename(columns={k: v for k, v in column_mapping.items() if k in df.columns}, inplace=True)
    df = df.loc[:, ~df.columns.duplicated()]
    
    # Clean data
    required = ['price', 'area', 'bedrooms', 'city']
    missing = [c for c in required if c not in df.columns]
    if missing:
        print(f"ERROR: Missing columns: {missing}")
        return
    
    df = df.dropna(subset=['price', 'area', 'bedrooms'])
    df = df[df['price'] > 0]
    df = df[df['area'] > 0]
    
    # ===== INVESTMENT FEATURES =====
    # 1. Rental Yield Calculation (estimated based on area and bedrooms)
    # Assumption: Bangalore 1BHK = ~20k/month, 2BHK = ~35k/month, 3BHK = ~50k/month
    rental_rates = {
        1: 20000,
        2: 35000,
        3: 50000,
        4: 70000
    }
    
    df['bedrooms'] = df['bedrooms'].astype(int)
    df['estimated_monthly_rent'] = df['bedrooms'].map(rental_rates).fillna(20000)
    df['estimated_annual_rent'] = df['estimated_monthly_rent'] * 12
    df['rental_yield'] = (df['estimated_annual_rent'] / df['price'] * 100).round(2)
    
    # 2. Price per sqft (appreciation indicator)
    df['price_per_sqft'] = (df['price'] / df['area']).round(2)
    
    # 3. Location Score (popular locations get higher scores)
    # This is simplified - in real world, use actual location data
    popular_locations = ['Bangalore', 'Whitefield', 'Indiranagar', 'Koramangala', 'Banjara Hills']
    df['location_score'] = df['city'].apply(lambda x: 80 if x in popular_locations else 60)
    
    # 4. Property Age/Possession Status (new properties = higher scores)
    # Assuming all are ready to move for now
    df['possession_score'] = 85
    
    # 5. Amenities Score (more amenities = better investment)
    amenity_cols = [col for col in df.columns if col in ['gym', 'pool', 'security']]
    df['amenity_score'] = len(amenity_cols) * 15 + 50  # 50-110 range
    
    # 6. Calculate Appreciation Potential (location + trend)
    # Historical appreciation in Bangalore avg ~8-12% per year
    df['appreciation_5yr'] = (df['price'] * (1.10 ** 5) - df['price']).round(0)
    df['appreciation_10yr'] = (df['price'] * (1.10 ** 10) - df['price']).round(0)
    
    # 7. Calculate ROI Score
    df['roi_score'] = (
        df['rental_yield'] * 0.4 +  # 40% weight on rental yield
        (df['location_score'] / 100 * 30) +  # 30% on location
        (df['amenity_score'] / 100 * 20) +  # 20% on amenities
        (df['possession_score'] / 100 * 10)  # 10% on possession status
    ).round(1)
    
    # Cap ROI score at 100
    df['roi_score'] = df['roi_score'].clip(0, 100)
    
    # 8. Investment Category
    def get_investment_category(roi_score):
        if roi_score >= 80:
            return "Excellent"
        elif roi_score >= 70:
            return "Very Good"
        elif roi_score >= 60:
            return "Good"
        elif roi_score >= 50:
            return "Average"
        else:
            return "Below Average"
    
    df['investment_category'] = df['roi_score'].apply(get_investment_category)
    
    print(f"Clean records: {len(df)}")
    print(f"\nInvestment Metrics Calculated")
    print(f"Avg Rental Yield: {df['rental_yield'].mean():.2f}%")
    print(f"Avg ROI Score: {df['roi_score'].mean():.1f}/100")
    
    # ===== TRAIN MULTIPLE MODELS FOR DIFFERENT OUTPUTS =====
    
    feature_cols = ['area', 'bedrooms', 'location_score', 'amenity_score', 'possession_score']
    X = df[feature_cols]
    
    # Model 1: Predict Rental Yield
    print("\n=== Training Rental Yield Model ===")
    y_rental = df['rental_yield']
    model_rental = RandomForestRegressor(n_estimators=50, max_depth=10, random_state=42, n_jobs=-1)
    model_rental.fit(X, y_rental)
    y_pred_rental = model_rental.predict(X)
    mae_rental = mean_absolute_error(y_rental, y_pred_rental)
    print(f"Rental Yield MAE: {mae_rental:.2f}%")
    
    # Model 2: Predict ROI Score
    print("\n=== Training ROI Score Model ===")
    y_roi = df['roi_score']
    model_roi = RandomForestRegressor(n_estimators=50, max_depth=10, random_state=42, n_jobs=-1)
    model_roi.fit(X, y_roi)
    y_pred_roi = model_roi.predict(X)
    r2_roi = r2_score(y_roi, y_pred_roi)
    print(f"ROI Score R² Score: {r2_roi:.4f}")
    
    # Model 3: Predict Appreciation 5yr
    print("\n=== Training 5-Year Appreciation Model ===")
    y_appr5 = df['appreciation_5yr']
    model_appr5 = RandomForestRegressor(n_estimators=50, max_depth=10, random_state=42, n_jobs=-1)
    model_appr5.fit(X, y_appr5)
    
    # Model 4: Predict Appreciation 10yr
    print("\n=== Training 10-Year Appreciation Model ===")
    y_appr10 = df['appreciation_10yr']
    model_appr10 = RandomForestRegressor(n_estimators=50, max_depth=10, random_state=42, n_jobs=-1)
    model_appr10.fit(X, y_appr10)
    
    # Save all models
    joblib.dump(model_rental, 'investment_models/rental_yield_model.pkl')
    joblib.dump(model_roi, 'investment_models/roi_score_model.pkl')
    joblib.dump(model_appr5, 'investment_models/appreciation_5yr_model.pkl')
    joblib.dump(model_appr10, 'investment_models/appreciation_10yr_model.pkl')
    
    joblib.dump({
        'feature_cols': feature_cols,
        'supported_cities': df['city'].unique().tolist()
    }, 'investment_models/investment_encoders.pkl')
    
    print("\n✓ All investment models saved to investment_models/")
    print("  - rental_yield_model.pkl")
    print("  - roi_score_model.pkl")
    print("  - appreciation_5yr_model.pkl")
    print("  - appreciation_10yr_model.pkl")
    print("  - investment_encoders.pkl")

if __name__ == '__main__':
    train_investment_model()