import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, r2_score
import joblib
import warnings
warnings.filterwarnings('ignore')

def clean_area(value):
    """Convert area string to numeric"""
    if pd.isna(value):
        return None
    if isinstance(value, (int, float)):
        return float(value)
    value = str(value).strip()
    # Handle range like "1000 - 1200"
    if '-' in value:
        parts = value.split('-')
        try:
            return (float(parts[0].strip()) + float(parts[1].strip())) / 2
        except:
            return None
    # Handle "1000 sqft" format
    try:
        return float(value.split()[0].replace(',', ''))
    except:
        return None

def train_model():
    print("Loading data...")
    # Load your CSV (adjust filename as needed)
    df = pd.read_csv('data/Bangalore.csv')
    
    print(f"Original records: {len(df)}")
    
    # Standardize column names (adjust based on your CSV columns)
    # Common Kaggle dataset columns:
    column_mapping = {
        'Price': 'price',
        'Area': 'area',
        'Location': 'city',
        'No. of Bedrooms': 'bedrooms',
        'Resale': 'resale',
        'MaintenanceStaff': 'maintenance',
        'Gymnasium': 'gym',
        'SwimmingPool': 'pool',
        'LandscapedGardens': 'garden',
        'JoggingTrack': 'jogging',
        'IndoorGames': 'indoor_games',
        'Intercom': 'intercom',
        'ClubHouse': 'clubhouse',
        'LiftAvailable': 'lift',
        'BED': 'bedrooms',
        'BATH': 'bathrooms',
        'PROPERTYSQFT': 'area',
        'PRICE': 'price',
        'LOCALITY': 'city',
        'total_sqft': 'area',
        'bath': 'bathrooms',
        'bhk': 'bedrooms',
        'location': 'city',
        'size': 'bedrooms',
        'price': 'price'
    }
    
    df.rename(columns={k: v for k, v in column_mapping.items() if k in df.columns}, inplace=True)
    
    # Remove duplicate columns (keep first occurrence)
    df = df.loc[:, ~df.columns.duplicated()]
    
    # Print available columns
    print(f"Columns: {df.columns.tolist()}")
    
    # Extract bedrooms from size if needed (e.g., "2 BHK" -> 2)
    if 'bedrooms' in df.columns and df['bedrooms'].dtype == 'object':
        df['bedrooms'] = df['bedrooms'].astype(str).str.extract(r'(\d+)').astype(float)
    
    # Clean area
    if 'area' in df.columns:
        df['area'] = df['area'].apply(clean_area)
    
    # Required columns
    required = ['price', 'area', 'bedrooms', 'city']
    missing = [c for c in required if c not in df.columns]
    if missing:
        print(f"ERROR: Missing columns: {missing}")
        print(f"Available: {df.columns.tolist()}")
        return
    
    # Clean data
    df = df.dropna(subset=['price', 'area', 'bedrooms'])
    df = df[df['price'] > 0]
    df = df[df['area'] > 0]
    df = df[df['area'] < 50000]  # Remove unrealistic areas
    
    # Add bathrooms if missing
    if 'bathrooms' not in df.columns:
        df['bathrooms'] = (df['bedrooms'] * 0.5 + 0.5).round()
    
    # Calculate amenities count
    amenity_cols = ['gym', 'pool', 'garden', 'jogging', 'indoor_games', 
                    'intercom', 'clubhouse', 'lift', 'maintenance']
    amenity_cols = [c for c in amenity_cols if c in df.columns]
    df['amenities_count'] = df[amenity_cols].sum(axis=1) if amenity_cols else 0
    
    # Calculate price per sqft
    df['price_per_sqft'] = df['price'] / df['area']
    
    # Remove outliers (price per sqft)
    q1 = df['price_per_sqft'].quantile(0.01)
    q99 = df['price_per_sqft'].quantile(0.99)
    df = df[(df['price_per_sqft'] >= q1) & (df['price_per_sqft'] <= q99)]
    
    print(f"Clean records: {len(df)}")
    
    # Prepare features
    df['city'] = df['city'].astype(str).str.strip().str.lower()
    
    # Encode city
    city_encoder = LabelEncoder()
    df['city_encoded'] = city_encoder.fit_transform(df['city'])
    
    # Features for model
    feature_cols = ['area', 'bedrooms', 'bathrooms', 'city_encoded', 'amenities_count']
    feature_cols = [c for c in feature_cols if c in df.columns]
    
    X = df[feature_cols]
    y = df['price']
    
    print(f"Features: {feature_cols}")
    print(f"Training samples: {len(X)}")
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Train model
    print("Training model...")
    model = RandomForestRegressor(
        n_estimators=100,
        max_depth=15,
        min_samples_split=5,
        random_state=42,
        n_jobs=-1
    )
    model.fit(X_train, y_train)
    
    # Evaluate
    y_pred = model.predict(X_test)
    mae = mean_absolute_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)
    
    print(f"\n=== Model Performance ===")
    print(f"R² Score: {r2:.4f}")
    print(f"Mean Absolute Error: ₹{mae:,.0f}")
    print(f"Average Price: ₹{y.mean():,.0f}")
    print(f"Error %: {(mae/y.mean())*100:.1f}%")
    
    # Feature importance
    print(f"\n=== Feature Importance ===")
    for feat, imp in sorted(zip(feature_cols, model.feature_importances_), key=lambda x: x[1], reverse=True):
        print(f"{feat}: {imp:.3f}")
    
    # Save model and encoders
    joblib.dump(model, 'model.pkl')
    joblib.dump({
        'city_encoder': city_encoder,
        'feature_cols': feature_cols,
        'cities': city_encoder.classes_.tolist()
    }, 'encoders.pkl')
    
    print(f"\nModel saved to model.pkl")
    print(f" Encoders saved to encoders.pkl")
    print(f"Supported cities: {city_encoder.classes_.tolist()[:10]}...")

if __name__ == '__main__':
    train_model()