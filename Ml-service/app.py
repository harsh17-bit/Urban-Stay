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
realistic_bounds = metadata.get("realistic_bounds", {})
supported_cities = metadata.get("supported_cities", ["bangalore"])
supported_states = metadata.get("supported_states", ["karnataka"])
location_to_city_state = metadata.get("location_to_city_state", {})
default_location = (
    max(location_frequency, key=location_frequency.get)
    if location_frequency
    else (supported_locations[0] if supported_locations else "")
)


def _get_numeric_value(features, column, fallback=0.0):
    if column not in feature_columns:
        return float(fallback)
    return float(features[feature_columns.index(column)])


def _resolve_bounds(column, fallback_min, fallback_max):
    bounds = realistic_bounds.get(column, {})
    lower = float(bounds.get("min", fallback_min))
    upper = float(bounds.get("max", fallback_max))
    if lower > upper:
        lower, upper = upper, lower
    return lower, upper


def _out_of_bounds(value, lower, upper):
    return value < lower or value > upper


def validate_realistic_input(payload, feature_vector, location, city, state):
    features = feature_vector[0]

    area = _get_numeric_value(features, "area", medians.get("area", 1000))
    bedrooms = _get_numeric_value(
        features,
        "bedrooms",
        medians.get("bedrooms", 2),
    )
    bathrooms = _get_numeric_value(
        features,
        "bathrooms",
        medians.get("bathrooms", max(1, round(float(bedrooms) * 0.75))),
    )
    area_per_bedroom = _get_numeric_value(
        features,
        "area_per_bedroom",
        area / max(bedrooms, 1),
    )
    amenities_count = _get_numeric_value(features, "amenities_count", 0)

    area_min, area_max = _resolve_bounds("area", 200.0, 25000.0)
    bed_min, bed_max = _resolve_bounds("bedrooms", 1.0, 12.0)
    bath_min, bath_max = _resolve_bounds("bathrooms", 1.0, 12.0)
    apb_min, apb_max = _resolve_bounds("area_per_bedroom", 100.0, 6000.0)
    amen_min, amen_max = _resolve_bounds("amenities_count", 0.0, float(len(amenity_columns)))

    if not location:
        raise ValueError("Invalid input: location is required.")

    if supported_cities and city and city not in supported_cities:
        raise ValueError("Invalid input: city is not supported by this model.")

    if supported_states and state and state not in supported_states:
        raise ValueError("Invalid input: state is not supported by this model.")

    if supported_locations and location not in supported_locations:
        raise ValueError(
            "Invalid input: location is outside supported training locations."
        )

    if _out_of_bounds(area, area_min, area_max):
        raise ValueError(
            f"Invalid input: area should be between {round(area_min)} and {round(area_max)} sqft."
        )

    if _out_of_bounds(bedrooms, bed_min, bed_max):
        raise ValueError(
            f"Invalid input: bedrooms should be between {round(bed_min)} and {round(bed_max)}."
        )

    if _out_of_bounds(bathrooms, bath_min, bath_max):
        raise ValueError(
            f"Invalid input: bathrooms should be between {round(bath_min)} and {round(bath_max)}."
        )

    if bathrooms > bedrooms + 3:
        raise ValueError(
            "Invalid input: bathrooms are unrealistically high for the given bedrooms."
        )

    if _out_of_bounds(area_per_bedroom, apb_min, apb_max):
        raise ValueError(
            "Invalid input: area per bedroom is outside realistic range."
        )

    if _out_of_bounds(amenities_count, amen_min, amen_max):
        raise ValueError("Invalid input: amenities count is outside realistic range.")

    listed_price = payload.get("listedPrice", payload.get("price"))
    if listed_price is not None:
        listed_price = float(listed_price)
        pps = listed_price / max(area, 1)
        pps_min, pps_max = _resolve_bounds("price_per_sqft", 100.0, 100000.0)
        if _out_of_bounds(pps, pps_min, pps_max):
            raise ValueError(
                "Invalid input: listed price is unrealistic for the provided area."
            )


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


def resolve_geo_fields(payload):
    location = str(
        payload.get("location")
        or payload.get("locality")
        or payload.get("areaName")
        or ""
    ).strip().lower()
    city = str(payload.get("city") or "").strip().lower()
    state = str(payload.get("state") or "").strip().lower()

    # Backward compatibility: if locality was sent in city field.
    if not location and city and city in supported_locations:
        location = city
        city = ""

    # City-only fallback for forms that don't collect locality.
    if not location and city and city in supported_cities:
        location = default_location

    defaults = location_to_city_state.get(location, {})
    city = city or defaults.get("city", "")
    state = state or defaults.get("state", "")

    if not city and supported_cities and location:
        city = supported_cities[0]
    if not state and supported_states and location:
        state = supported_states[0]

    return location, city, state


def build_feature_row(payload):
    location, city, state = resolve_geo_fields(payload)

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
    return feature_vector, location, city, state, listed_price


@app.route("/health", methods=["GET"])
def health():
    return jsonify(
        {
            "status": "ok",
            "model": metadata.get("model_name", "unknown"),
            "locations": supported_locations[:50],
            "cities": supported_cities,
            "states": supported_states,
        }
    )


@app.route("/predict", methods=["POST"])
def predict():
    try:
        payload = request.get_json(force=True) or {}
        feature_vector, location, city, state, listed_price = build_feature_row(payload)
        validate_realistic_input(payload, feature_vector, location, city, state)

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
    grouped = {}
    for location in supported_locations:
        mapping = location_to_city_state.get(location, {})
        city = mapping.get("city", supported_cities[0] if supported_cities else "")
        state = mapping.get("state", supported_states[0] if supported_states else "")

        if state not in grouped:
            grouped[state] = {}
        if city not in grouped[state]:
            grouped[state][city] = []

        grouped[state][city].append(location)

    for state_name in grouped:
        for city_name in grouped[state_name]:
            grouped[state_name][city_name] = sorted(grouped[state_name][city_name])

    return jsonify(
        {
            "locations": supported_locations,
            "cities": supported_cities,
            "states": supported_states,
            "groupedLocations": grouped,
        }
    )


if __name__ == "__main__":
    print(f"Loaded model: {metadata.get('model_name', 'unknown')}")
    app.run(host="0.0.0.0", port=5001, debug=True)