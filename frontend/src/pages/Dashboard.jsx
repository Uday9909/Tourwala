import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts';
import { Activity, AlertOctagon, TrendingUp, Users, RefreshCw } from 'lucide-react';
import AnimatedCounter from '../components/AnimatedCounter';
import { tSAPI } from '../api';
import './Dashboard.css';

const MOCK_PREDICT_ACTUAL = Array.from({length: 14}).map((_, i) => ({
  date: `2025-05-${(i+1).toString().padStart(2, '0')}`,
  predicted: 25000 + Math.random() * 5000,
  actual: 24000 + Math.random() * 7000
}));

const Dashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [spotsList, setSpotsList] = useState([]);
  const [activeSpot, setActiveSpot] = useState('Taj Mahal');
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    tSAPI.getMetrics().then(res => {
      setMetrics(res);
      setLoading(false);
    }).catch(e => {
      setMetrics({
        metrics: {
          mae: 1450,
          rmse: 2100,
          r2: 0.94
        }
      });
      setLoading(false);
    });

    tSAPI.getSpots().then(res => {
      if(res.spots) setSpotsList(res.spots);
    }).catch(e => {
        setSpotsList(['Taj Mahal', 'Jaipur']); // fallback
    });
  }, []);

  useEffect(() => {
    if(activeSpot) {
      Promise.all([
          tSAPI.getHistory(activeSpot, 30),
          tSAPI.getPrediction(activeSpot)
      ]).then(([res, predRes]) => {
        if(res.history) {
            const data = res.history.map((h, i) => {
                return {
                    date: new Date(h.Date).toLocaleDateString('en-US', {month: 'short', day:'numeric'}),
                    actual: Math.round(h['Visitor Count']),
                    predicted: null
                }
            });
            
            if (predRes) {
                const lastHistory = res.history[res.history.length - 1];
                const nextDate = new Date(predRes.timestamp || new Date());
                nextDate.setMonth(nextDate.getMonth() + 1); // Simple forward projection date for demo
                
                data.push({
                   date: nextDate.toLocaleDateString('en-US', {month: 'short', day: 'numeric'}),
                   actual: null,
                   predicted: predRes['LSTM Prediction Forecast']
                });
                
                // Connect the last actual point to the prediction to draw the line continuously
                if (data.length > 1) {
                   data[data.length - 2].predicted = data[data.length - 2].actual;
                }
            }
            setChartData(data);
        }
      }).catch(e => {
          console.error(e);
          setChartData(Array.from({length: 14}).map((_, i) => ({
              date: `May ${(i+1).toString().padStart(2, '0')}`,
              predicted: 25000 + Math.random() * 5000,
              actual: 24000 + Math.random() * 7000
          })));
      });
    }
  }, [activeSpot]);

  return (
    <div className="dashboard-page noise-overlay">
      <div className="container" style={{padding: '6rem 2rem'}}>
        <div className="dash-top-brutal">
          <div className="title-stack">
            <span className="mono tiny">TELEMETRY_ENGINE_V4.0</span>
            <h1 className="page-title-brutal">ANALYTICS <i>HUB</i></h1>
            <p className="subtext-mono">Continuous monitoring of global footfall dynamics.</p>
          </div>
          <div className="top-meta-brutal glass-panel">
            <div className="meta-indicator">
              <span className="dot pulse-green"></span>
              <span className="mono">MODEL_ACTIVE</span>
            </div>
            <span className="mono tiny">LAST_SYNC: {new Date().toLocaleTimeString()}</span>
          </div>
        </div>

        {/* 1. KPI Cards: Glass & Brutalist */}
        <div className="kpi-grid-brutal mt-4">
          <div className="glass-panel kpi-card-brutal">
            <div className="kpi-icon-brutal"><Activity size={20}/></div>
            <div className="kpi-data-brutal">
              <h3 className="mono"><AnimatedCounter end={72} /></h3>
              <p className="tiny">ACTIVE_NODES</p>
            </div>
          </div>
          <div className="glass-panel kpi-card-brutal accent-purple">
            <div className="kpi-icon-brutal"><TrendingUp size={20}/></div>
            <div className="kpi-data-brutal">
              <h3 className="mono"><AnimatedCounter end={94} suffix="%" /></h3>
              <p className="tiny">AVG_CONFIDENCE</p>
            </div>
          </div>
          <div className="glass-panel kpi-card-brutal accent-red">
            <div className="kpi-icon-brutal"><AlertOctagon size={20}/></div>
            <div className="kpi-data-brutal">
              <h3 className="mono"><AnimatedCounter end={4} /></h3>
              <p className="tiny">HIGH_RISK_ALERTS</p>
            </div>
          </div>
          <div className="glass-panel kpi-card-brutal accent-amber">
            <div className="kpi-icon-brutal"><Users size={20}/></div>
            <div className="kpi-data-brutal">
              <h3 className="mono"><AnimatedCounter end={1.2} suffix="M" duration={1.5} /></h3>
              <p className="tiny">EST_FOOTFALL_24H</p>
            </div>
          </div>
        </div>

        <div className="analysis-grid-brutal mt-6">
          {/* Main Chart: Forecast vs Actual */}
          <div className="glass-panel panel-card-brutal main-analysis">
            <div className="panel-header-brutal">
              <div>
                <h3 className="mono">FORECAST_SYNC</h3>
                <p className="tiny">Actual vs Predicted Footfall (30D)</p>
              </div>
              <div className="selector-wrapper">
                <select 
                  className="brutal-select"
                  value={activeSpot} 
                  onChange={(e) => setActiveSpot(e.target.value)}
                >
                    {spotsList.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="chart-wrapper-brutal">
              <ResponsiveContainer width="100%" height="100%">
                 <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10, fontFamily: 'Space Mono'}} />
                  <YAxis tickFormatter={(val) => `${val/1000}k`} axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10, fontFamily: 'Space Mono'}} />
                  <Tooltip 
                    contentStyle={{borderRadius: '0px', border: '1px solid #333', background: '#050505'}}
                    itemStyle={{fontSize: '10px', fontFamily: 'Space Mono'}}
                  />
                  <Line type="monotone" dataKey="actual" stroke="#334155" strokeWidth={1} strokeDasharray="4 4" dot={false} name="Actual" />
                  <Line type="monotone" dataKey="predicted" stroke="var(--color-primary)" strokeWidth={2} dot={{r: 3, fill: 'var(--color-primary)', strokeWidth: 0}} name="Predicted" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Side Panels */}
          <div className="side-panels-brutal">
            <div className="glass-panel panel-card-brutal">
              <div className="panel-header-brutal">
                <h3 className="mono">ANOMALY_FEED</h3>
              </div>
              <div className="alert-feed-brutal">
                <div className="feed-item-brutal critical">
                  <div className="feed-meta"><span className="tiny mono">NODE: KYOTO</span> <span className="mono tiny text-red">+340%</span></div>
                  <p className="feed-msg">Surge peak projected for Week 14.</p>
                </div>
                <div className="feed-item-brutal warning">
                  <div className="feed-meta"><span className="tiny mono">NODE: SANTORINI</span> <span className="mono tiny text-amber">STABLE</span></div>
                  <p className="feed-msg">Price parity optimization recommended.</p>
                </div>
                <div className="feed-item-brutal info">
                  <div className="feed-meta"><span className="tiny mono">NODE: COORG</span> <span className="mono tiny text-dim">EMPTY</span></div>
                  <p className="feed-msg">Ideal window for maintenance operations.</p>
                </div>
              </div>
            </div>

            <div className="glass-panel panel-card-brutal">
              <div className="panel-header-brutal">
                <h3 className="mono">MODEL_METRICS</h3>
              </div>
              <div className="metrics-grid-brutal">
                <div className="metric-box-brutal">
                  <label className="tiny mono">R_SQUARED</label>
                  <span className="mono">{metrics?.metrics?.r2 || '0.94'}</span>
                </div>
                <div className="metric-box-brutal">
                  <label className="tiny mono">VAL_MAE</label>
                  <span className="mono">{metrics?.metrics?.mae ? Math.round(metrics.metrics.mae) : '1,450'}</span>
                </div>
                <div className="metric-box-brutal">
                  <label className="tiny mono">VAL_RMSE</label>
                  <span className="mono">{metrics?.metrics?.rmse ? Math.round(metrics.metrics.rmse) : '2,100'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
