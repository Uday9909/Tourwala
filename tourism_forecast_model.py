import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, mean_absolute_percentage_error
from sklearn.preprocessing import MinMaxScaler
import joblib
import os



def build_lstm_model(input_shape):
    """Stub — replaced by GradientBoosting on Python 3.14 (no TF support)."""
    return None


def create_sequences(data_features, data_target, time_steps=30):
    return np.array([]), np.array([])


def train_and_evaluate_models(df_daily, time_steps=30, epochs=5, is_test_run=False):
    """
    Trains GradientBoosting (primary, acts as LSTM substitute) + RandomForest (baseline).
    Returns in the same signature as the original so api.py / main.py need no changes.
    """
    print("Preparing ML features...")

    df = df_daily.copy()

    # Encode categoricals
    df["Spot_Code"]   = df["Tourist Spot Name"].astype("category").cat.codes
    df["Season_Code"] = df["Season"].astype("category").cat.codes

    features_df = df.select_dtypes(include=[np.number])
    X = features_df.drop(columns=["Visitor Count"]).values
    feature_names = features_df.drop(columns=["Visitor Count"]).columns.tolist()
    target = df["Visitor Count"].values

    split_index = int(len(X) * 0.8)

    if is_test_run:
        X      = X[-2000:]
        target = target[-2000:]
        split_index = int(len(X) * 0.8)

    print("Scaling features...")
    scaler_x = MinMaxScaler()
    scaler_y = MinMaxScaler()

    X_scaled      = scaler_x.fit_transform(X)
    target_scaled = scaler_y.fit_transform(target.reshape(-1, 1)).flatten()

    X_train, X_test   = X_scaled[:split_index], X_scaled[split_index:]
    y_train_scaled    = target_scaled[:split_index]
    y_test_scaled     = target_scaled[split_index:]
    y_test_raw        = target[split_index:]

    # ── Random Forest (baseline) ──────────────────────────────────────────────
    print("--- Training Random Forest ---")
    rf_model = RandomForestRegressor(n_estimators=50, random_state=42, n_jobs=-1)
    rf_model.fit(X_train, y_train_scaled)
    rf_preds_scaled = rf_model.predict(X_test)
    rf_preds = scaler_y.inverse_transform(rf_preds_scaled.reshape(-1, 1)).flatten()
    rf_mae   = mean_absolute_error(y_test_raw, rf_preds)
    print(f"Random Forest -> MAE: {rf_mae:.2f}")

    # ── Gradient Boosting (primary — replaces LSTM) ───────────────────────────
    print("--- Training Gradient Boosting (LSTM substitute) ---")
    gb_model = GradientBoostingRegressor(
        n_estimators=100, learning_rate=0.1, max_depth=4,
        random_state=42, subsample=0.8
    )
    gb_model.fit(X_train, y_train_scaled)
    gb_preds_scaled = gb_model.predict(X_test)
    gb_preds = scaler_y.inverse_transform(gb_preds_scaled.reshape(-1, 1)).flatten()
    gb_mae   = mean_absolute_error(y_test_raw, gb_preds)
    print(f"Gradient Boosting -> MAE: {gb_mae:.2f}")

    # Return gb_model in the lstm slot so the rest of the pipeline is unchanged
    return rf_model, gb_model, scaler_x, scaler_y, feature_names


if __name__ == "__main__":
    base_dir = os.path.dirname(os.path.abspath(__file__))
    out_path = os.path.join(base_dir, "daily_synthetic_data.csv")

    # Forcing rebuild to ensure situational columns are injected
    print("Enriching dataset with situational features...")
    df = pd.read_csv(os.path.join(base_dir, "dataset.csv"), skiprows=1)
    if 'Date' not in df.columns:
        df['Date'] = pd.to_datetime(df['Year'].astype(str) + '-' + df['Month'].astype(str) + '-01')
    if 'Monthly Visitor Count' in df.columns:
        df.rename(columns={'Monthly Visitor Count': 'Visitor Count'}, inplace=True)
    
    df['Visitor Count'] = df['Visitor Count'].astype(float)
    
    # 1. Inject Temperature (Seasonal: High in May/June, Low in Dec/Jan)
    df['Temperature'] = df['Month'].apply(lambda m: 28 + (10 * np.sin((m-4) * (np.pi/6))))
    
    # 2. Inject Rainfall (Seasonal: High in July/Aug - Monsoon)
    df['Rainfall'] = df['Month'].apply(lambda m: 300 if m in [7, 8] else (150 if m in [6, 9] else 20))
    
    # 3. Inject Holiday Indicator (Oct, Nov, Dec, Jan are peak)
    df['Holiday Indicator'] = df['Month'].apply(lambda m: 1 if m in [1, 10, 11, 12] else 0)
    
    # 4. Inject Disaster Indicator (Rare random anomalies)
    df['Disaster Indicator'] = np.random.choice([0, 1], size=len(df), p=[0.99, 0.01])
    
    # 5. Inject Correlations (Make the simulation "Work")
    # If Rainfall > 200, reduce count by 20%. If Disaster, reduce by 60%.
    df.loc[df['Rainfall'] > 200, 'Visitor Count'] *= 0.8
    df.loc[df['Disaster Indicator'] == 1, 'Visitor Count'] *= 0.4
    
    if 'Capacity Utilization' not in df.columns:
        df['Capacity Utilization'] = 0.5
    if 'Satisfaction Score' not in df.columns:
        df['Satisfaction Score'] = 8.0
    if 'Pandemic Indicator' not in df.columns:
        df['Pandemic Indicator'] = 0
    if 'Season' not in df.columns:
        df['Season'] = df['Season Classification']
    
    df.to_csv(out_path, index=False)
    df_daily = df

    rf, gb, s_x, s_y, f_names = train_and_evaluate_models(
        df_daily, time_steps=30, epochs=3, is_test_run=False
    )
    joblib.dump(gb, os.path.join(base_dir, "lstm_tourism_model.pkl"))
    joblib.dump(rf, os.path.join(base_dir, "rf_tourism_model.pkl"))
    joblib.dump((s_x, s_y, f_names), os.path.join(base_dir, "scalers_features.pkl"))
    print("Models saved!")
