import os
import argparse
import pandas as pd
from datetime import datetime, timedelta
import joblib

# from data_preprocessing import load_and_preprocess_data
from tourism_forecast_model import train_and_evaluate_models, create_sequences
from decision_engine import get_decision_intelligence

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, "daily_synthetic_data.csv")
RAW_DATA_PATH = os.path.join(BASE_DIR, "dataset.csv")

def ensure_data(is_test_run=False):
    """ Ensure data exists, preprocessing it if not. """
    if not os.path.exists(DATA_PATH):
        print("Preprocessing raw data...")
        df = pd.read_csv(RAW_DATA_PATH, skiprows=1)
        if 'Date' not in df.columns:
            df['Date'] = pd.to_datetime(df['Year'].astype(str) + '-' + df['Month'].astype(str) + '-01')
        if 'Monthly Visitor Count' in df.columns:
            df.rename(columns={'Monthly Visitor Count': 'Visitor Count'}, inplace=True)
        if 'Capacity Utilization' not in df.columns:
            df['Capacity Utilization'] = 0.5
        if 'Satisfaction Score' not in df.columns:
            df['Satisfaction Score'] = 8.0
        if 'Pandemic Indicator' not in df.columns:
            df['Pandemic Indicator'] = 0
        if 'Disaster Indicator' not in df.columns:
            df['Disaster Indicator'] = 0
        if 'Season' not in df.columns:
            df['Season'] = df['Season Classification']
        df.to_csv(DATA_PATH, index=False)
        df_daily = df
    else:
        print(f"Loading cached preprocessed data: {DATA_PATH}")
        df_daily = pd.read_csv(DATA_PATH)
        df_daily['Date'] = pd.to_datetime(df_daily['Date'])
    
    # Optional: Fast track
    if is_test_run:
        # subsetting data
        return df_daily
        
    return df_daily

def train_pipeline(is_test_run=True):
    """ Complete training loop. """
    df_daily = ensure_data(is_test_run)
    rf, lstm, s_x, s_y, f_names = train_and_evaluate_models(df_daily, time_steps=30, epochs=3, is_test_run=is_test_run)
    
    lstm.save(os.path.join(BASE_DIR, "lstm_tourism_model.pkl"))
    joblib.dump(rf, os.path.join(BASE_DIR, "rf_tourism_model.pkl"))
    joblib.dump((s_x, s_y, f_names), os.path.join(BASE_DIR, "scalers_features.pkl"))
    return df_daily, rf, lstm, s_x, s_y, f_names

def simulate_future_inference(df_daily, lstm_model, scaler_x, scaler_y, f_names, target_spot="Taj Mahal"):
    """
    Given the trained model, make a prediction for a specific tourist spot.
    Uses the last 30 days of data for the spot to predict the NEXT day.
    Works with both sklearn models (GradientBoosting / RandomForest).
    """
    df_spot = df_daily[df_daily['Tourist Spot Name'] == target_spot].sort_values(by='Date')
    
    # We need the last 30 days
    last_30_days = df_spot.tail(30).copy()
    
    # Convert categorical logic used in training
    last_30_days['Spot_Code'] = last_30_days['Tourist Spot Name'].astype('category').cat.codes
    last_30_days['Season_Code'] = last_30_days['Season'].astype('category').cat.codes
    
    for f in f_names:
        if f not in last_30_days.columns:
            last_30_days[f] = 0
            
    features_df = last_30_days[f_names]
    X_last = features_df.values
    
    X_scaled = scaler_x.transform(X_last)
    
    # Predict using the last day's features (sklearn model)
    pred_scaled = lstm_model.predict(X_scaled[-1].reshape(1, -1))[0]
    predicted_count = float(scaler_y.inverse_transform([[pred_scaled]])[0][0])
    
    rf_model = joblib.load(os.path.join(BASE_DIR, "rf_tourism_model.pkl"))
    rf_pred_scaled = rf_model.predict(X_scaled[-1].reshape(1, -1))[0]
    rf_pred = float(scaler_y.inverse_transform([[rf_pred_scaled]])[0][0])
    
    rolling_30_avg = last_30_days['Visitor Count'].mean()
    baseline_capacity = last_30_days['Capacity Utilization'].mean() * 100000  # Synthesize capacity number (~50k to 100k)
    capacity_estimate = baseline_capacity / max(0.01, last_30_days['Capacity Utilization'].iloc[-1])
    
    pandemic_ind = last_30_days['Pandemic Indicator'].iloc[-1]
    disaster_ind = last_30_days['Disaster Indicator'].iloc[-1]
    last_date = last_30_days['Date'].iloc[-1]
    target_pred_date = last_date + timedelta(days=1)
    
    decision_out = get_decision_intelligence(
        city=df_spot['District / City'].iloc[0],
        predicted_count=predicted_count,
        baseline_rolling_avg=rolling_30_avg,
        capacity=capacity_estimate,
        pandemic_ind=pandemic_ind,
        disaster_ind=disaster_ind,
        df_daily=df_daily,
        target_date=target_pred_date
    )
    
    decision_out['Random Forest Prediction Forecast'] = int(rf_pred)
    decision_out['LSTM Prediction Forecast'] = int(predicted_count)
    return decision_out

def main():
    parser = argparse.ArgumentParser(description="AI Tourism Forecasting System")
    parser.add_argument("--test-run", action="store_true", help="Run with a smaller subset of data for fast validation")
    parser.add_argument("--retrain", action="store_true", help="Force retrain the models")
    parser.add_argument("--spot", type=str, default="Taj Mahal", help="Target spot to run inference on")
    
    args = parser.parse_args()
    
    if args.retrain or not os.path.exists(os.path.join(BASE_DIR, "lstm_tourism_model.pkl")):
        print("====== INITIATING PIPELINE (TRAINING) ======")
        df_daily, rf, lstm, s_x, s_y, f_names = train_pipeline(is_test_run=args.test_run)
    else:
        print("====== USING PRE-TRAINED MODELS ======")
        df_daily = ensure_data()
        lstm = joblib.load(os.path.join(BASE_DIR, "lstm_tourism_model.pkl"))
        rf = joblib.load(os.path.join(BASE_DIR, "rf_tourism_model.pkl"))
        s_x, s_y, f_names = joblib.load(os.path.join(BASE_DIR, "scalers_features.pkl"))
        
    print(f"\n====== INFERENCE ENGINE: TARGET {args.spot} ======")
    try:
        results = simulate_future_inference(df_daily, lstm, s_x, s_y, f_names, target_spot=args.spot)
        
        # Display nicely based on prompt
        print("-" * 50)
        print("DECISION INTELLIGENCE OUTPUT")
        print("-" * 50)
        print(f"Location: {results['City']} (Target: {args.spot})")
        print(f"Predicted Visitor Count (LSTM): {results['LSTM Prediction Forecast']}")
        print(f"Predicted Visitor Count (RF Baseline): {results['Random Forest Prediction Forecast']}")
        print(f"Surge Alert: {results['Surge Alert']}")
        print(f"Risk Level: {results['Risk Level']}")
        print("\nRecommended Actions:")
        for r in results['Recommended Actions']:
            print(f" - {r}")
            
        print("\nCity Recommendation Engine:")
        print(f" Suggested Best Cities: {', '.join(results['Suggested Best Cities'])}")
        print(f" Cities to Avoid: {', '.join(results['Cities to Avoid'])}")
        print("-" * 50)
        
    except Exception as e:
        print(f"Failed to run inference for '{args.spot}'. Error: {e}")

if __name__ == "__main__":
    main()
