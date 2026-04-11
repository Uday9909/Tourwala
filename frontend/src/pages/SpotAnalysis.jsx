import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Area, ComposedChart, Bar
} from 'recharts';
import { Thermometer, Wind, Droplets, MapPin, AlertTriangle, Info, Calendar, TrendingUp, Users, Sun, Cloud, SlidersHorizontal } from 'lucide-react';
import { tSAPI, weatherAPI } from '../api';
import { getSpotImage } from '../utils/imageMapper';
import './SpotAnalysis.css';

const SpotAnalysis = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const spotName = decodeURIComponent(id || 'Taj Mahal');
  const [spotsList, setSpotsList] = useState([]);
  const [data, setData] = useState(null);
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [maxCapacity, setMaxCapacity] = useState(500000);
  const [heatMapData, setHeatMapData] = useState([]);

  // What-If States
  const [simTemp, setSimTemp] = useState(25);
  const [simRain, setSimRain] = useState(0);
  const [simHoliday, setSimHoliday] = useState(false);
  const [simDisaster, setSimDisaster] = useState(false);
  const [simLoading, setSimLoading] = useState(false);
  const [simulatedCount, setSimulatedCount] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [predictRes, weatherRes, forecastRes, historyRes] = await Promise.all([
          tSAPI.getPrediction(spotName).catch(e => null),
          weatherAPI.getWeather(spotName).catch(e => null),
          weatherAPI.getForecast(spotName).catch(e => null),
          tSAPI.getHistory(spotName, 365).catch(e => null)
        ]);

        if (predictRes) {
          setData(predictRes);
          setSimulatedCount(predictRes['LSTM Prediction Forecast']);
        } else {
          // Fallback MOCK data aligned with dataset.csv
          setData({
            City: spotName,
            "LSTM Prediction Forecast": 450320,
            "Risk Level": "High",
            "Confidence Level": "High",
            "Infra Level": "Moderate",
            "Sanitation Index": "Clean (A)",
            "Internet Connectivity": "High Speed 4G",
            "Age_0_18": 15, "Age_19_30": 35, "Age_31_45": 25, "Age_46_60": 15, "Age_60plus": 10,
            "Male": 55, "Female": 42, "Other": 3,
            "Recommended Actions": ["ACTIVATE_TRANSPORT_NODE_LIMIT", "CALIBRATE_SANITATION_LOGISTICS"],
            "Suggested Best Cities": ["Jaipur", "Kerala"],
            "Cities to Avoid": ["Delhi"],
            history: Array.from({length: 12}).map((_, i) => ({
              Date: `2025-${(i+1).toString().padStart(2, '0')}-01`,
              "Visitor Count": 200000 + Math.random() * 300000
            }))
          });
          setSimulatedCount(450320);
        }
        
        if (predictRes && predictRes["Max Historical Capacity"]) {
          setMaxCapacity(predictRes["Max Historical Capacity"] * 1.2); // Buffering for future peaks
        }

        setWeather(weatherRes);
        setForecast(forecastRes);
        
        if (historyRes && historyRes.history && historyRes.history.length > 0) {
            let maxC = 0;
            const qtrs = [0, 0, 0, 0];
            historyRes.history.forEach(h => {
                const count = h['Visitor Count'] || 0;
                const util = h['Capacity Utilization'] || 0.5;
                const c = count / Math.max(0.01, util);
                if (c > maxC) maxC = c;
                
                const month = new Date(h.Date).getMonth();
                const q = Math.floor(month / 3);
                qtrs[q] += count;
            });
            
            // If API didn't provide a max_hist, use the calculated one
            if (!predictRes || !predictRes["Max Historical Capacity"]) {
               if (maxC > 1000) setMaxCapacity(maxC * 1.1);
            }
            
            const maxQ = Math.max(...qtrs, 1);
            setHeatMapData([
               { label: 'JAN-MAR', pct: (qtrs[0] / maxQ) * 100 },
               { label: 'APR-JUN', pct: (qtrs[1] / maxQ) * 100 },
               { label: 'JUL-SEP', pct: (qtrs[2] / maxQ) * 100 },
               { label: 'OCT-DEC', pct: (qtrs[3] / maxQ) * 100 }
            ]);
        } else {
            setHeatMapData([
               { label: 'JAN-MAR', pct: 30 },
               { label: 'APR-JUN', pct: 60 },
               { label: 'JUL-SEP', pct: 90 },
               { label: 'OCT-DEC', pct: 40 }
            ]);
        }
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };

    fetchData();

    tSAPI.getSpots().then(res => {
      if(res.spots) setSpotsList(res.spots);
    }).catch(e => {
        setSpotsList(['Taj Mahal', 'Kyoto']); 
    });
  }, [spotName]);

  // Gauge setup
  const capacityPct = data ? Math.min(100, Math.round((data['LSTM Prediction Forecast'] / maxCapacity) * 100)) : 0;
  
  // What-If handler hitting real ML inference
  useEffect(() => {
    if (!data) return;
    setSimLoading(true);
    const timer = setTimeout(() => {
        tSAPI.simulatePrediction(spotName, {
            temperature: parseFloat(simTemp),
            rainfall: parseFloat(simRain),
            holiday: Boolean(simHoliday),
            disaster: Boolean(simDisaster)
        }).then(res => {
            if (res && res['LSTM Prediction Forecast']) {
                setSimulatedCount(res['LSTM Prediction Forecast']);
            }
            setSimLoading(false);
        }).catch(err => {
            console.error("Simulation failed", err);
            setSimLoading(false);
        });
    }, 500); // 500ms debounce
    return () => clearTimeout(timer);
  }, [simTemp, simRain, simHoliday, simDisaster, data, spotName]);

  // Chart data
  const chartData = data?.history ? data.history.map(h => ({
    name: new Date(h.Date).toLocaleDateString('en-US', {month: 'short'}),
    visitors: Math.round(h['Visitor Count']),
    capacity: Math.round(maxCapacity * 0.8)
  })) : [];

  if (loading) {
    return <div className="page-container" style={{display: 'flex', justifyContent: 'center', paddingTop: '20vh'}}><h2>Loading AI Analysis...</h2></div>;
  }

  return (
    <div className="spot-analysis-page noise-overlay">
      {/* 1. Hero Section */}
      <div className="spot-hero">
        <div className="spot-hero-bg">
          <img src={getSpotImage(spotName)} alt={spotName} />
          <div className="hero-overlay"></div>
        </div>
        
        <div className="container spot-hero-content">
          <div className="spot-header-stack">
            <div className="spot-index-label">NODE_TELEMETRY_{spotName.toUpperCase().replace(/\s/g, '_')}</div>
            <h1 className="spot-title">{spotName}</h1>
            <select 
               className="brutal-select"
               value={spotName}
               onChange={(e) => navigate(`/spot/${encodeURIComponent(e.target.value)}`)}
            >
              {spotsList.map(s => <option key={s} value={s} style={{background: '#050505', color: 'white'}}>{s}</option>)}
            </select>
            <p className="spot-country">{data?.City}</p>
          </div>

          {weather && (
            <div className="spot-weather-card-brutal glass-panel">
              <div className="swc-top-brutal">
                <span className="swc-temp-brutal mono">{weather.temp}°C</span>
                <div className="swc-meta-brutal">
                  <span className="mono tiny">{weather.condition.toUpperCase()}</span>
                  <span className="mono tiny">FEELS: {weather.feels_like}°C</span>
                </div>
              </div>
              <div className="swc-bottom-brutal mt-4">
                <div className="mono tiny"><Droplets size={12}/> {weather.humidity}% HUMID</div>
                <div className="mono tiny"><Wind size={12}/> {weather.wind_speed} KM/H WIND</div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="container">
        {/* 2. AI Forecast Grid Row 1 */}
        <div className="analysis-grid-brutal">
          
          {/* Main Chart */}
          <div className="glass-panel panel-card-brutal">
            <div className="panel-header-brutal">
              <div>
                <h3 className="mono">VISITOR_FORECAST</h3>
                <p className="tiny">AI_PREDICTION_ENGINE_OUTPUT_30D</p>
              </div>
              <div className="btn-group-brutal">
                <button className="btn-tab-brutal active">MONTHLY</button>
                <button className="btn-tab-brutal">WEEKLY</button>
              </div>
            </div>
            
            <div className="chart-wrapper-brutal">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10, fontFamily: 'Space Mono'}} />
                  <YAxis tickFormatter={(val) => `${val/1000}k`} axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10, fontFamily: 'Space Mono'}} />
                  <RechartsTooltip 
                    contentStyle={{borderRadius: '0px', border: '1px solid #333', background: '#050505'}}
                    itemStyle={{fontSize: '10px', fontFamily: 'Space Mono'}}
                  />
                  <Area type="monotone" dataKey="capacity" fill="rgba(139, 92, 246, 0.03)" stroke="none" />
                  <Line type="monotone" dataKey="visitors" stroke="var(--color-primary)" strokeWidth={3} dot={{r: 4, strokeWidth: 0}} activeDot={{r: 6}} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Crowd Risk / Gauge */}
          <div className="glass-panel panel-card-brutal">
            <div className="panel-header-brutal">
              <div>
                <h3 className="mono">CROWD_SATURATION</h3>
                <p className="tiny">REALTIME_CAPACITY_UTILIZATION</p>
              </div>
            </div>

            <div className="gauge-container-brutal">
              <svg viewBox="0 0 100 50" className="gauge-svg">
                <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12" strokeLinecap="round" />
                <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke={capacityPct > 75 ? "var(--color-risk-high)" : (capacityPct > 50 ? "var(--color-accent)" : "var(--color-risk-low)")} strokeWidth="12" strokeLinecap="round" strokeDasharray={`${(capacityPct/100) * 125} 125`} />
              </svg>
              <div className="gauge-value-brutal">
                <h2 className="mono">{capacityPct}%</h2>
                <span className="mono tiny">{data?.['Risk Level']?.toUpperCase()} RISK</span>
              </div>
            </div>

            <div className="telemetry-grid-mini mt-6">
               <div className="mono tiny"><span style={{color: 'var(--color-primary)'}}>CONFIDENCE:</span> {data?.['Confidence Level']?.toUpperCase() || 'STABLE'}</div>
               <div className="mono tiny"><span style={{color: 'var(--color-primary)'}}>INFRA_LVL:</span> {data?.['Infra Level']?.toUpperCase() || 'STANDARD'}</div>
               <div className="mono tiny"><span style={{color: 'var(--color-primary)'}}>SANITATION:</span> {data?.['Sanitation Index']?.toUpperCase() || 'CLEAN'}</div>
               <div className="mono tiny"><span style={{color: 'var(--color-primary)'}}>CONNECTIVITY:</span> {data?.['Internet Connectivity']?.toUpperCase() || '4G/5G'}</div>
            </div>
            
            <div className={`alert-box-brutal mt-6 ${data?.['Risk Level'] === 'High' ? 'high-risk' : ''}`}>
              <span className="mono tiny">{data?.['Risk Level'] === 'High' ? 'CRITICAL_CONGESTION_WARNING: RECOMMENDING_ALTERNATIVES' : 'OPERATIONAL_STATUS: STABLE'}</span>
            </div>
          </div>
        </div>

        {/* 3. Demographic Breakdown (Row 2) */}
        <div className="glass-panel panel-card-brutal mt-6">
          <div className="panel-header-brutal">
            <div>
              <h3 className="mono">DEMOGRAPHIC_INTELLIGENCE</h3>
              <p className="tiny">AGE_DISTRIBUTION_X_GENDER_SPLIT_ANALYSIS</p>
            </div>
          </div>
          
          <div className="demographic-grid-brutal">
            <div className="age-stats-brutal">
              {[
                {label: '0-18', val: data?.Age_0_18 || 15},
                {label: '19-30', val: data?.Age_19_30 || 35},
                {label: '31-45', val: data?.Age_31_45 || 25},
                {label: '46-60', val: data?.Age_46_60 || 15},
                {label: '60+', val: data?.Age_60plus || 10}
              ].map((age, i) => (
                <div key={i} className="age-row-brutal">
                  <span className="mono tiny" style={{width: '60px'}}>{age.label}</span>
                  <div className="age-bar-brutal" style={{width: `${age.val * 2}%`}}></div>
                  <span className="mono tiny">{age.val}%</span>
                </div>
              ))}
            </div>
            
            <div className="gender-stats-brutal">
               <div className="gender-circle-brutal">
                  <div className="gender-segment-brutal" style={{background: 'var(--color-primary)', height: `${data?.Male || 50}%`}}></div>
                  <div className="gender-label-overlay mono tiny">MALE_{data?.Male}% / FEMALE_{data?.Female}%</div>
               </div>
            </div>
          </div>
        </div>

        {/* 4. What-If Scenario Simulator & Alternatives (Row 3) */}
        <div className="analysis-grid-brutal mt-6">
          <div className="glass-panel panel-card-brutal">
            <div className="panel-header-brutal">
              <div>
                <h3 className="mono">SIMULATED_PROJECTION</h3>
                <p className="tiny">ADJUST_MODEL_FACTORS_FOR_HAVE_BEEN_PREDICTION</p>
              </div>
            </div>
            
            <div className="simulator-controls" style={{gap: '2rem'}}>
              <div className="slider-group">
                <label className="mono tiny">TEMP_VARIANCE (°C): {simTemp}</label>
                <input type="range" min="5" max="45" value={simTemp} onChange={(e)=>setSimTemp(e.target.value)} />
              </div>
              <div className="slider-group">
                <label className="mono tiny">RAINFALL_DELTA (mm): {simRain}</label>
                <input type="range" min="0" max="300" value={simRain} onChange={(e)=>setSimRain(e.target.value)} />
              </div>
              <div className="toggle-group" style={{flexDirection: 'row', gap: '2rem'}}>
                <label className="mono tiny"><input type="checkbox" checked={simHoliday} onChange={(e)=>setSimHoliday(e.target.checked)}/> FESTIVAL_SYNC</label>
                <label className="mono tiny"><input type="checkbox" checked={simDisaster} onChange={(e)=>setSimDisaster(e.target.checked)}/> ANOMALY_LOAD</label>
              </div>
            </div>

            <div className="simulated-result mt-6" style={{borderTop: '1px solid var(--glass-border)', paddingTop: '2rem'}}>
              <p className="mono tiny">{simLoading ? 'CALCULATING_NEW_PROJECTION...' : 'PROJECTED_VISITOR_COUNT'}</p>
              <h2 className="mono" style={{fontSize: '4rem', color: simLoading ? 'var(--color-text-muted)' : 'var(--color-primary)', opacity: simLoading ? 0.5 : 1}}>
                {(simulatedCount || 0).toLocaleString()}
              </h2>
            </div>
          </div>

          <div className="glass-panel panel-card-brutal">
             <div className="panel-header-brutal">
               <div>
                <h3 className="mono">SECTOR_ALTERNATIVES</h3>
                <p className="tiny">AI_RANKED_LOW_CONGESTION_NODES</p>
               </div>
            </div>
            
            <div className="alt-list-brutal">
              {data?.['Suggested Best Cities']?.map(city => (
                <Link to={`/spot/${city}`} key={city} className="alt-card-brutal glass-panel">
                   <img src={getSpotImage(city)} alt={city}/>
                   <div className="alt-txt-brutal">{city.toUpperCase()}</div>
                </Link>
              ))}
            </div>
            
            <div className="avoid-list mt-6" style={{borderTop: '1px solid rgba(239, 68, 68, 0.2)', paddingTop: '2rem'}}>
              <h4 className="mono tiny text-red">CRITICAL_AVOID_STATUS</h4>
              <p className="mono tiny">{data?.['Cities to Avoid']?.join(', ')?.toUpperCase() || 'NONE_DETECTED'}</p>
            </div>
          </div>
        </div>

        {/* 5. 7-Day Weather Strip */}
        {forecast && (
          <div className="forecast-strip-brutal mt-6">
            {forecast.map((day, i) => (
              <div key={i} className="fc-day-brutal">
                <p className="fc-date-brutal mono tiny">{day.day.toUpperCase()}</p>
                <div style={{color: 'var(--color-primary)', marginBottom: '1rem'}}>
                  {day.icon === 'sun' ? <Sun size={24}/> : <Cloud size={24}/>}
                </div>
                <p className="fc-temps-brutal mono">{day.high}°</p>
                <p className="mono tiny text-dim">{day.low}°</p>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default SpotAnalysis;
