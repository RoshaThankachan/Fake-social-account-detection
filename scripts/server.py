import os
import joblib
import pandas as pd
from flask import Flask, request, jsonify, send_from_directory

app = Flask(__name__, static_folder='../', static_url_path='')

# Load model and medians
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, '..', 'models', 'random_forest_model.pkl')
METADATA_PATH = os.path.join(BASE_DIR, '..', 'models', 'model_metadata.json')

model = None
features = [
    "has_profile_pic", "bio_length", "username_randomness", "followers", "following",
    "follower_following_ratio", "account_age_days", "posts", "posts_per_day",
    "caption_similarity_score", "content_similarity_score", "follow_unfollow_rate",
    "spam_comments_rate", "generic_comment_rate", "suspicious_links_in_bio",
    "verified", "username_length", "digits_count", "digit_ratio",
    "special_char_count", "repeat_char_count"
]

if os.path.exists(MODEL_PATH):
    model = joblib.load(MODEL_PATH)
    print("Random Forest model loaded successfully!")

@app.route('/')
def index():
    return send_from_directory(os.path.join(BASE_DIR, '..'), 'index.html')

@app.route('/api/predict', methods=['POST'])
def predict():
    try:
        data = request.json or {}
        # Parse or default features
        input_values = []
        for feat in features:
            val = float(data.get(feat, 0.0))
            input_values.append(val)
        
        df_input = pd.DataFrame([input_values], columns=features)
        pred_label = int(model.predict(df_input)[0])
        probabilities = model.predict_proba(df_input)[0]
        fake_prob = float(probabilities[1])
        genuine_prob = float(probabilities[0])

        return jsonify({
            "status": "success",
            "prediction": "Fake" if pred_label == 1 else "Genuine",
            "is_fake": pred_label,
            "confidence": round(fake_prob if pred_label == 1 else genuine_prob, 4),
            "fake_probability": round(fake_prob, 4),
            "genuine_probability": round(genuine_prob, 4),
            "risk_level": "High" if fake_prob > 0.7 else ("Medium" if fake_prob > 0.4 else "Low")
        })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 400

@app.route('/api/health')
def health():
    return jsonify({"status": "healthy", "model_loaded": model is not None})

if __name__ == '__main__':
    print("Starting Fake Social Media Account Detection Server on http://127.0.0.1:5000 ...")
    app.run(host='0.0.0.0', port=5000, debug=True)
