from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
import joblib
import os
from datetime import datetime
import json

app = Flask(__name__)
CORS(app)

# Global variables for the model
model = None
scaler = None
model_trained = False

def initialize_model():
    """Initialize and train the credit scoring model"""
    global model, scaler, model_trained
    
    # Create sample training data
    np.random.seed(42)
    n_samples = 1000
    
    # Generate synthetic training data
    data = {
        'yield_history': np.random.normal(1000, 300, n_samples),
        'sales_history': np.random.normal(50000, 15000, n_samples),
        'weather_data': np.random.uniform(0.3, 1.0, n_samples),
        'land_area': np.random.uniform(1, 100, n_samples),
        'soil_quality': np.random.uniform(50, 100, n_samples),
        'reputation': np.random.uniform(0, 100, n_samples),
        'crop_type_encoded': np.random.randint(0, 5, n_samples),
        'credit_score': np.random.uniform(300, 850, n_samples)
    }
    
    df = pd.DataFrame(data)
    
    # Features and target
    feature_columns = ['yield_history', 'sales_history', 'weather_data', 
                      'land_area', 'soil_quality', 'reputation', 'crop_type_encoded']
    X = df[feature_columns]
    y = df['credit_score']
    
    # Scale features
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    # Train model
    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X_scaled, y)
    
    model_trained = True
    print("AI model trained successfully!")

def encode_crop_type(crop_type):
    """Encode crop type to numerical value"""
    crop_encoding = {
        'rice': 0,
        'wheat': 1,
        'corn': 2,
        'sugarcane': 3,
        'cotton': 4,
        'unknown': 2
    }
    return crop_encoding.get(crop_type.lower(), 2)

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'OK',
        'message': 'AI Service is running',
        'model_trained': model_trained,
        'timestamp': datetime.now().isoformat()
    })

@app.route('/credit-score', methods=['POST'])
def calculate_credit_score():
    """Calculate credit score using AI model"""
    try:
        if not model_trained:
            initialize_model()
        
        data = request.get_json()
        
        # Extract features
        yield_history = data.get('yield_history', 0)
        sales_history = data.get('sales_history', 0)
        weather_data = data.get('weather_data', 0.5)
        land_area = data.get('land_area', 0)
        soil_quality = data.get('soil_quality', 50)
        reputation = data.get('reputation', 0)
        crop_type = data.get('crop_type', 'unknown')
        
        # Encode crop type
        crop_type_encoded = encode_crop_type(crop_type)
        
        # Prepare features
        features = np.array([[
            yield_history,
            sales_history,
            weather_data,
            land_area,
            soil_quality,
            reputation,
            crop_type_encoded
        ]])
        
        # Scale features
        features_scaled = scaler.transform(features)
        
        # Predict credit score
        predicted_score = model.predict(features_scaled)[0]
        
        # Ensure score is within valid range
        credit_score = max(300, min(850, predicted_score))
        
        # Calculate confidence based on data completeness
        confidence = min(0.95, 0.5 + (len([x for x in [yield_history, sales_history, land_area, soil_quality] if x > 0]) * 0.1))
        
        return jsonify({
            'credit_score': round(credit_score, 2),
            'confidence': round(confidence, 2),
            'factors': {
                'yield_history': yield_history,
                'sales_history': sales_history,
                'weather_data': weather_data,
                'land_area': land_area,
                'soil_quality': soil_quality,
                'reputation': reputation,
                'crop_type': crop_type
            },
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({
            'error': 'Credit score calculation failed',
            'message': str(e)
        }), 500

@app.route('/loan-risk', methods=['POST'])
def calculate_loan_risk():
    """Calculate loan risk assessment"""
    try:
        data = request.get_json()
        
        loan_amount = data.get('loan_amount', 0)
        duration = data.get('duration', 0)
        borrower_credit_score = data.get('borrower_credit_score', 300)
        crop_type = data.get('crop_type', 'unknown')
        season = data.get('season', 'unknown')
        weather_forecast = data.get('weather_forecast', 0.5)
        market_price = data.get('market_price', 0)
        
        # Calculate risk score (0-100)
        risk_score = 0
        
        # Loan amount risk
        if loan_amount > 10000:
            risk_score += 30
        elif loan_amount > 5000:
            risk_score += 20
        elif loan_amount > 2000:
            risk_score += 10
        
        # Duration risk
        if duration > 365:
            risk_score += 25
        elif duration > 180:
            risk_score += 15
        elif duration > 90:
            risk_score += 10
        
        # Credit score risk
        if borrower_credit_score < 500:
            risk_score += 40
        elif borrower_credit_score < 600:
            risk_score += 30
        elif borrower_credit_score < 700:
            risk_score += 20
        elif borrower_credit_score < 800:
            risk_score += 10
        
        # Weather risk
        if weather_forecast < 0.3:
            risk_score += 20
        elif weather_forecast < 0.5:
            risk_score += 15
        elif weather_forecast < 0.7:
            risk_score += 10
        
        # Market price risk
        if market_price < 0.5:
            risk_score += 15
        elif market_price < 0.7:
            risk_score += 10
        
        risk_score = min(100, risk_score)
        
        # Determine risk level
        if risk_score < 30:
            risk_level = 'Low'
            recommendation = 'Approve loan with standard terms'
        elif risk_score < 60:
            risk_level = 'Medium'
            recommendation = 'Approve loan with higher interest rate'
        elif risk_score < 80:
            risk_level = 'High'
            recommendation = 'Approve loan with collateral requirement'
        else:
            risk_level = 'Very High'
            recommendation = 'Reject loan application'
        
        return jsonify({
            'risk_score': risk_score,
            'risk_level': risk_level,
            'recommendation': recommendation,
            'factors': {
                'loan_amount': loan_amount,
                'duration': duration,
                'borrower_credit_score': borrower_credit_score,
                'crop_type': crop_type,
                'season': season,
                'weather_forecast': weather_forecast,
                'market_price': market_price
            },
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({
            'error': 'Loan risk calculation failed',
            'message': str(e)
        }), 500

@app.route('/yield-prediction', methods=['POST'])
def predict_yield():
    """Predict crop yield"""
    try:
        data = request.get_json()
        
        crop_type = data.get('crop_type', 'unknown')
        land_area = data.get('land_area', 0)
        soil_quality = data.get('soil_quality', 50)
        weather_data = data.get('weather_data', 0.5)
        irrigation = data.get('irrigation', False)
        fertilizer = data.get('fertilizer', False)
        
        # Base yield multipliers by crop type
        crop_multipliers = {
            'rice': 4.5,
            'wheat': 3.2,
            'corn': 3.8,
            'sugarcane': 6.0,
            'cotton': 2.5,
            'unknown': 3.0
        }
        
        multiplier = crop_multipliers.get(crop_type.lower(), crop_multipliers['unknown'])
        predicted_yield = land_area * multiplier
        
        # Adjust for soil quality
        predicted_yield *= (soil_quality / 100)
        
        # Adjust for weather
        predicted_yield *= weather_data
        
        # Adjust for irrigation
        if irrigation:
            predicted_yield *= 1.2
        
        # Adjust for fertilizer
        if fertilizer:
            predicted_yield *= 1.15
        
        # Add some randomness for realistic prediction
        noise_factor = np.random.normal(1.0, 0.1)
        predicted_yield *= noise_factor
        
        predicted_yield = max(0, predicted_yield)
        
        # Calculate confidence
        confidence = 0.6
        if land_area > 0:
            confidence += 0.1
        if soil_quality > 0:
            confidence += 0.1
        if weather_data > 0:
            confidence += 0.1
        if irrigation:
            confidence += 0.05
        if fertilizer:
            confidence += 0.05
        
        confidence = min(0.95, confidence)
        
        return jsonify({
            'predicted_yield': round(predicted_yield, 2),
            'confidence': round(confidence, 2),
            'factors': {
                'crop_type': crop_type,
                'land_area': land_area,
                'soil_quality': soil_quality,
                'weather_data': weather_data,
                'irrigation': irrigation,
                'fertilizer': fertilizer
            },
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({
            'error': 'Yield prediction failed',
            'message': str(e)
        }), 500

@app.route('/train-model', methods=['POST'])
def train_model():
    """Retrain the model with new data"""
    try:
        initialize_model()
        return jsonify({
            'message': 'Model retrained successfully',
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({
            'error': 'Model training failed',
            'message': str(e)
        }), 500

if __name__ == '__main__':
    # Initialize model on startup
    initialize_model()
    
    # Run the Flask app
    port = int(os.environ.get('PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=True)
