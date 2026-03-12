import re

import joblib
import numpy as np
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

model = joblib.load("model.pkl")
metadata = joblib.load("encoders.pkl")
feature_columns = metadata["feature_columns"]
amenity_columns = metadata.get("amenity_columns", [])
supported_locations = metadata.get("supported_locations", [])
location_frequency = metadata.get("location_frequency", {})
medians = metadata.get("medians", {})
metrics = metadata.get("metrics", {})


def normalize_name(value):
    value = re.sub(r"[^a-zA-Z0-9]+", "_", str(value).strip().lower())
    return value.strip("_")


def to_bool_int(value):
    if isinstance(value, bool):
        return int(value)
    if isinstance(value, (int, float)):
        return int(value > 0)
    text = str(value).strip().lower()
    return int(text in {"1", "true", "yes", "y", "on"})


def build_feature_row(payload):
    location = str(
        payload.get("location")
        or payload.get("locality")
        or payload.get("city")
        or ""
    ).strip().lower()

    area = float(payload.get("area", medians.get("area", 1000)))
    bedrooms = int(payload.get("bedrooms", round(medians.get("bedrooms", 2))))
    bathrooms = int(payload.get("bathrooms", max(1, round(bedrooms * 0.75))))
    listed_price = payload.get("listedPrice", payload.get("price"))

    requested_amenities = payload.get("amenities", [])
    if isinstance(requested_amenities, str):
        requested_amenities = [item.strip() for item in requested_amenities.split(",") if item.strip()]
    requested_amenities = {normalize_name(item) for item in requested_amenities}

    features = {column: float(medians.get(column, 0)) for column in feature_columns}
    features["area"] = area
    features["bedrooms"] = bedrooms
    features["bathrooms"] = bathrooms
    features["area_per_bedroom"] = area / max(bedrooms, 1)
    features["location_frequency"] = float(location_frequency.get(location, medians.get("location_frequency", 0)))

    if "resale" in features:
        features["resale"] = to_bool_int(payload.get("resale", medians.get("resale", 0)))

    for amenity in amenity_columns:
        if amenity in payload:
            features[amenity] = to_bool_int(payload[amenity])
        else:
            features[amenity] = int(amenity in requested_amenities)

    features["amenities_count"] = sum(int(features.get(column, 0)) for column in amenity_columns)
    feature_vector = np.array([[float(features.get(column, 0)) for column in feature_columns]])
    return feature_vector, location, listed_price


@app.route("/health", methods=["GET"])
def health():
    return jsonify(
        {
            "status": "ok",
            "model": metadata.get("model_name", "unknown"),
            "locations": supported_locations[:50],
        }
    )


@app.route("/predict", methods=["POST"])
def predict():
    try:
        payload = request.get_json(force=True) or {}
        feature_vector, location, listed_price = build_feature_row(payload)

        predicted_price = float(np.expm1(model.predict(feature_vector)[0]))
        error_band = max(0.10, min(0.30, float(metrics.get("mape", 0.15))))
        min_price = predicted_price * (1 - error_band)
        max_price = predicted_price * (1 + error_band)
        price_per_sqft = predicted_price / max(feature_vector[0][feature_columns.index("area")], 1)

        value_label = None
        if listed_price is not None:
            listed_price = float(listed_price)
            if listed_price <= predicted_price * 0.92:
                value_label = "good_value"
            elif listed_price >= predicted_price * 1.10:
                value_label = "premium_priced"
            else:
                value_label = "fair_value"

        confidence = max(0.55, min(0.95, 1 - float(metrics.get("mape", 0.15))))
        return jsonify(
            {
                "success": True,
                "predictedPrice": round(predicted_price),
                "priceRange": {
                    "min": round(min_price),
                    "max": round(max_price),
                },
                "pricePerSqft": round(price_per_sqft),
                "confidence": round(confidence, 2),
                "location": location,
                "valueLabel": value_label,
                "model": metadata.get("model_name", "unknown"),
                "supportedLocations": supported_locations,
                "metrics": metrics,
            }
        )
    except Exception as error:
        return jsonify({"success": False, "error": str(error)}), 400


@app.route("/locations", methods=["GET"])
def get_locations():
    return jsonify({"locations": supported_locations})


if __name__ == "__main__":
    print(f"Loaded model: {metadata.get('model_name', 'unknown')}")
    app.run(host="0.0.0.0", port=5001, debug=True)