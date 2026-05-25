import numpy as np
import pandas as pd

def detect_anomalies(predicted_count, rolling_avg, current_capacity):
    """
    Detects surges or anomalies.
    Returns specific status strings.
    """
    surge_threshold = rolling_avg * 1.3  # > 30% increase
    low_demand_threshold = rolling_avg * 0.7  # < 30% decrease
    
    is_surge = predicted_count > surge_threshold and predicted_count > (current_capacity * 0.8)
    is_drop = predicted_count < low_demand_threshold
    
    if is_surge:
        return "Surge Detected", True
    elif is_drop:
        return "Low Demand", False
    else:
        return "Normal", False

def assess_risk_level(predicted_count, capacity, pandemic_ind, disaster_ind):
    """
    Returns Risk Level: Low, Medium, High
    """
    if disaster_ind == 1 or pandemic_ind == 1:
        return "High"
    
    utilization = predicted_count / max(1, capacity)
    
    if utilization >= 0.95:
        return "High"
    elif utilization >= 0.75:
        return "Medium"
    else:
        return "Low"

def generate_recommendations(status, risk_level):
    """
    Generates prescriptive recommended actions
    """
    recs = []
    if status == "Surge Detected":
        recs.append("Increase public transport frequency and capacity.")
        recs.append("Deploy additional cleaning and sanitation staff at key hotspots.")
        recs.append("Increase police/security patrols for crowd management.")
    elif status == "Low Demand":
        recs.append("Launch targeted tourism promotions and campaigns.")
        recs.append("Offer hotel discounts or host public events to attract footfall.")
        
    if risk_level == "High":
        recs.append("CRITICAL: Limit tourist entry to prevent overcrowding or exposure.")
        recs.append("Issue immediate safety alerts to travelers.")
        recs.append("Redirect incoming tourists to safer, alternate locations.")
    elif risk_level == "Medium":
        recs.append("Monitor crowd levels closely; prepare overflow parking.")
        
    if not recs:
        recs.append("Maintain standard city operations.")
        
    return recs

def recommend_cities(df_daily, target_date, current_city):
    """
    Proposes best alternative cities and cities to avoid based on risk and demand.
    For simplicity, filters random historical data near target season/month if live forecast isn't fully expanded.
    """
    # Simple logic: avoid cities with high disaster or pandemic indicators or highest utilization.
    month = target_date.month
    
    # Filter dataset for same month to see general trends
    recent_data = df_daily[df_daily['Month'] == month].groupby('Tourist Spot Name').agg({
        'Visitor Count': 'mean',
        'Capacity Utilization': 'mean',
        'Disaster Indicator': 'max',
        'Pandemic Indicator': 'max',
        'District / City': 'first'
    }).reset_index()
    
    # Avoid cities: Disaster = 1 or top 10% utilization
    recent_data['Risk_Score'] = recent_data['Capacity Utilization'] + recent_data['Disaster Indicator']*2 + recent_data['Pandemic Indicator']*2
    sorted_cities = recent_data.sort_values(by='Risk_Score', ascending=True)
    
    def _dedupe_without_current(values):
        seen = set()
        filtered = []
        for city in values:
            if city == current_city or city in seen:
                continue
            seen.add(city)
            filtered.append(city)
        return filtered

    best_spots = _dedupe_without_current(sorted_cities.head(3)['District / City'].tolist())
    worst_spots = _dedupe_without_current(sorted_cities.tail(3)['District / City'].tolist())
    
    return best_spots, worst_spots

def get_decision_intelligence(city, predicted_count, baseline_rolling_avg, capacity, 
                              pandemic_ind=0, disaster_ind=0, df_daily=None, target_date=None):
    
    status, is_surge = detect_anomalies(predicted_count, baseline_rolling_avg, capacity)
    risk_level = assess_risk_level(predicted_count, capacity, pandemic_ind, disaster_ind)
    actions = generate_recommendations(status, risk_level)
    
    if df_daily is not None and target_date is not None:
        best, worst = recommend_cities(df_daily, target_date, city)
    else:
        best, worst = ["Alternative A", "Alternative B"], ["High Risk City X"]
        
    return {
        "City": city,
        "Predicted Visitor Count": int(predicted_count),
        "Surge Alert": "Yes" if is_surge else "No",
        "Risk Level": risk_level,
        "Recommended Actions": actions,
        "Suggested Best Cities": best,
        "Cities to Avoid": worst
    }
