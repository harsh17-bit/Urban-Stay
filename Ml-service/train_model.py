import re
import warnings

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_absolute_percentage_error, mean_squared_error, r2_score
from sklearn.model_selection import train_test_split
from xgboost import XGBRegressor

warnings.filterwarnings("ignore")


def normalize_name(value):
    value = re.sub(r"[^a-zA-Z0-9]+", "_", str(value).strip().lower())
    return value.strip("_")


def clean_area(value):
    if pd.isna(value):
        return None
    if isinstance(value, (int, float)):
        return float(value)

    text = str(value).strip().lower().replace(",", "")
    if "-" in text:
        parts = text.split("-")
        try:
            numbers = [float(part.strip().split()[0]) for part in parts[:2]]
            return sum(numbers) / len(numbers)
        except (TypeError, ValueError, IndexError):
            return None

    match = re.search(r"\d+(?:\.\d+)?", text)
    return float(match.group()) if match else None


def standardize_columns(df):
    df = df.copy()
    df.columns = [normalize_name(column) for column in df.columns]

    alias_map = {
        "price": "price",
        "area": "area",
        "propertysqft": "area",
        "total_sqft": "area",
        "location": "location",
        "locality": "location",
        "no_of_bedrooms": "bedrooms",
        "bhk": "bedrooms",
        "size": "bedrooms",
        "bath": "bathrooms",
    }

    df.rename(columns={column: alias_map[column] for column in df.columns if column in alias_map}, inplace=True)
    return df.loc[:, ~df.columns.duplicated()].copy()


def infer_bathrooms(df):
    if "bathrooms" not in df.columns:
        df["bathrooms"] = np.maximum(1, np.round(df["bedrooms"] * 0.75)).astype(int)
        return df

    fallback = np.maximum(1, np.round(df["bedrooms"] * 0.75)).astype(int)
    df["bathrooms"] = pd.to_numeric(df["bathrooms"], errors="coerce").fillna(fallback)
    df["bathrooms"] = df["bathrooms"].clip(lower=1)
    return df


def infer_binary_columns(df, excluded_columns):
    binary_columns = []
    for column in df.columns:
        if column in excluded_columns:
            continue

        series = pd.to_numeric(df[column], errors="coerce")
        if series.isna().any():
            continue

        unique_values = set(series.astype(int).unique().tolist())
        if unique_values.issubset({0, 1}):
            binary_columns.append(column)

    return sorted(binary_columns)


def normalize_binary_like_columns(df, excluded_columns):
    for column in df.columns:
        if column in excluded_columns:
            continue

        series = pd.to_numeric(df[column], errors="coerce")
        if series.isna().any():
            continue

        unique_values = set(series.astype(int).unique().tolist())
        if unique_values.issubset({0, 1, 9}):
            df[column] = series.replace(9, 0).astype(int)

    return df


def prepare_training_frame(csv_path="data/Bangalore.csv"):
    print("Loading data...")
    df = pd.read_csv(csv_path)
    print(f"Original records: {len(df)}")

    df = standardize_columns(df)
    print(f"Columns: {df.columns.tolist()}")

    if "bedrooms" in df.columns and df["bedrooms"].dtype == "object":
        df["bedrooms"] = df["bedrooms"].astype(str).str.extract(r"(\d+)")

    df["area"] = df["area"].apply(clean_area)
    df["bedrooms"] = pd.to_numeric(df["bedrooms"], errors="coerce")
    df["price"] = pd.to_numeric(df["price"], errors="coerce")

    required_columns = ["price", "area", "bedrooms", "location"]
    missing_columns = [column for column in required_columns if column not in df.columns]
    if missing_columns:
        raise ValueError(f"Missing required columns: {missing_columns}")

    df["location"] = df["location"].astype(str).str.strip().str.lower()
    df = df.dropna(subset=required_columns)
    df = df[(df["price"] > 0) & (df["area"] > 0) & (df["area"] < 50000) & (df["bedrooms"] > 0)]
    df = infer_bathrooms(df)

    numeric_columns = [column for column in df.columns if column not in {"location"}]
    for column in numeric_columns:
        df[column] = pd.to_numeric(df[column], errors="coerce")

    df = normalize_binary_like_columns(df, {"price", "area", "bedrooms", "bathrooms"})

    binary_columns = infer_binary_columns(df, {"price", "bathrooms", "bedrooms"})
    amenity_columns = [column for column in binary_columns if column != "resale"]
    df["amenities_count"] = df[amenity_columns].sum(axis=1) if amenity_columns else 0
    df["area_per_bedroom"] = df["area"] / df["bedrooms"].clip(lower=1)

    location_frequency = df["location"].value_counts(normalize=True)
    df["location_frequency"] = df["location"].map(location_frequency)
    df["price_per_sqft"] = df["price"] / df["area"]

    low_pps = df["price_per_sqft"].quantile(0.01)
    high_pps = df["price_per_sqft"].quantile(0.99)
    df = df[df["price_per_sqft"].between(low_pps, high_pps)].copy()

    feature_columns = [
        "area",
        "bedrooms",
        "bathrooms",
        "area_per_bedroom",
        "location_frequency",
        "amenities_count",
    ]
    if "resale" in df.columns:
        feature_columns.append("resale")
    feature_columns.extend(amenity_columns)

    print(f"Clean records: {len(df)}")
    print(f"Feature count: {len(feature_columns)}")

    metadata = {
        "feature_columns": feature_columns,
        "amenity_columns": amenity_columns,
        "supported_locations": sorted(df["location"].unique().tolist()),
        "supported_cities": ["bangalore"],
        "supported_states": ["karnataka"],
        "location_to_city_state": {
            location: {"city": "bangalore", "state": "karnataka"}
            for location in sorted(df["location"].unique().tolist())
        },
        "location_frequency": location_frequency.to_dict(),
        "medians": {column: float(df[column].median()) for column in feature_columns},
        "realistic_bounds": {
            "area": {
                "min": float(df["area"].quantile(0.01)),
                "max": float(df["area"].quantile(0.99)),
            },
            "bedrooms": {
                "min": float(df["bedrooms"].quantile(0.01)),
                "max": float(df["bedrooms"].quantile(0.99)),
            },
            "bathrooms": {
                "min": float(df["bathrooms"].quantile(0.01)),
                "max": float(df["bathrooms"].quantile(0.99)),
            },
            "area_per_bedroom": {
                "min": float(df["area_per_bedroom"].quantile(0.01)),
                "max": float(df["area_per_bedroom"].quantile(0.99)),
            },
            "amenities_count": {
                "min": float(df["amenities_count"].quantile(0.01)),
                "max": float(df["amenities_count"].quantile(0.99)),
            },
            "price_per_sqft": {
                "min": float(df["price_per_sqft"].quantile(0.01)),
                "max": float(df["price_per_sqft"].quantile(0.99)),
            },
        },
        "training_rows": int(len(df)),
    }
    return df, metadata


def evaluate_predictions(y_true, y_pred):
    mae = mean_absolute_error(y_true, y_pred)
    rmse = float(np.sqrt(mean_squared_error(y_true, y_pred)))
    mape = mean_absolute_percentage_error(y_true, y_pred)
    r2 = r2_score(y_true, y_pred)
    return {
        "mae": float(mae),
        "rmse": float(rmse),
        "mape": float(mape),
        "r2": float(r2),
    }


def print_metrics(label, metrics):
    print(f"\n=== {label} ===")
    print(f"MAE: Rs {metrics['mae']:,.0f}")
    print(f"RMSE: Rs {metrics['rmse']:,.0f}")
    print(f"MAPE: {metrics['mape'] * 100:.2f}%")
    print(f"R2 Score: {metrics['r2']:.4f}")


def fit_candidate_models(X_train, y_train, X_val, y_val):
    candidates = {
        "random_forest": RandomForestRegressor(
            n_estimators=350,
            max_depth=18,
            min_samples_split=4,
            min_samples_leaf=2,
            random_state=42,
            n_jobs=-1,
        ),
        "xgboost": XGBRegressor(
            objective="reg:squarederror",
            n_estimators=500,
            learning_rate=0.05,
            max_depth=6,
            subsample=0.9,
            colsample_bytree=0.9,
            reg_alpha=0.1,
            reg_lambda=1.2,
            min_child_weight=2,
            random_state=42,
        ),
    }

    results = {}
    for name, model in candidates.items():
        print(f"Training {name}...")
        if name == "xgboost":
            model.fit(X_train, y_train, eval_set=[(X_val, y_val)], verbose=False)
        else:
            model.fit(X_train, y_train)

        validation_predictions = np.expm1(model.predict(X_val))
        validation_metrics = evaluate_predictions(np.expm1(y_val), validation_predictions)
        print_metrics(f"Validation - {name}", validation_metrics)
        results[name] = {"model": model, "metrics": validation_metrics}

    best_model_name = min(results, key=lambda item: results[item]["metrics"]["mae"])
    print(f"\nSelected best model: {best_model_name}")
    return best_model_name, results


def train_model():
    df, metadata = prepare_training_frame()
    X = df[metadata["feature_columns"]].astype(float)
    y = np.log1p(df["price"].astype(float))

    X_train_full, X_test, y_train_full, y_test = train_test_split(
        X,
        y,
        test_size=0.15,
        random_state=42,
    )
    X_train, X_val, y_train, y_val = train_test_split(
        X_train_full,
        y_train_full,
        test_size=0.1765,
        random_state=42,
    )

    best_model_name, candidate_results = fit_candidate_models(X_train, y_train, X_val, y_val)
    best_model = candidate_results[best_model_name]["model"]

    if best_model_name == "xgboost":
        best_model.fit(X_train_full, y_train_full, eval_set=[(X_test, y_test)], verbose=False)
    else:
        best_model.fit(X_train_full, y_train_full)

    test_predictions = np.expm1(best_model.predict(X_test))
    test_metrics = evaluate_predictions(np.expm1(y_test), test_predictions)
    print_metrics("Final Test Metrics", test_metrics)

    feature_importances = getattr(best_model, "feature_importances_", None)
    if feature_importances is not None:
        print("\n=== Feature Importance ===")
        ranked_features = sorted(
            zip(metadata["feature_columns"], feature_importances),
            key=lambda item: item[1],
            reverse=True,
        )
        for feature_name, importance in ranked_features[:15]:
            print(f"{feature_name}: {importance:.4f}")

    metadata.update(
        {
            "model_name": best_model_name,
            "metrics": test_metrics,
            "target_transform": "log1p",
        }
    )

    joblib.dump(best_model, "model.pkl")
    joblib.dump(metadata, "encoders.pkl")

    print("\nSaved model to model.pkl")
    print("Saved preprocessing metadata to encoders.pkl")
    print(f"Supported locations: {metadata['supported_locations'][:10]}...")


if __name__ == "__main__":
    train_model()