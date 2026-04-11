import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Cloud, Sun, CloudRain, Calendar, DollarSign, Users, ArrowRight } from 'lucide-react';
import { weatherAPI } from '../api';
import './DestinationCard.css';

const DestinationCard = ({ id, destination }) => {
  const [weather, setWeather] = useState(null);
  
  // Fetch weather when hovered/in view
  const handleMouseEnter = async () => {
    if (!weather) {
      try {
        const res = await weatherAPI.getWeather(destination.name);
        setWeather(res);
      } catch (e) {}
    }
  };

  const getRiskColor = (risk) => {
    switch(risk?.toLowerCase()) {
      case 'low': return 'badge-green';
      case 'medium': return 'badge-amber';
      case 'high': return 'badge-red';
      default: return 'badge-amber';
    }
  };

  return (
    <div className="dest-card-brutal glass-panel" onMouseEnter={handleMouseEnter}>
      <div className="dest-img-wrapper-brutal">
        <img src={destination.image} alt={destination.name} className="img-noir" loading="lazy" />
        <div className="dest-status-layer">
          <span className={`mono tiny ${getRiskColor(destination['Confidence Level'])}`}>
            CONFIDENCE_{destination['Confidence Level']?.toUpperCase()}
          </span>
        </div>
      </div>
      
      <div className="dest-card-content-brutal">
        <h3 className="dest-title-brutal">{destination.name}</h3>
        <p className="dest-desc-editorial">{destination.description}</p>
        
        <div className="dest-telemetry">
          <div className="telemetry-item">
            <span className="mono tiny">STATUS:</span>
            <span className="mono">{destination['Season Classification']?.toUpperCase() || 'STABLE'}</span>
          </div>
          <div className="telemetry-item">
            <span className="mono tiny">INFRA:</span>
            <span className="mono">{destination['Infra Level']?.toUpperCase() || 'STANDARD'}</span>
          </div>
          
          <div className="telemetry-item">
            <span className="mono tiny">SAN:</span>
            <span className="mono">{destination['Sanitation Index']?.toUpperCase() || 'A'}</span>
          </div>
        </div>
        
        <Link to={`/spot/${encodeURIComponent(destination.name)}`} className="btn-brutal-sm">
          ANALYZE_NODE <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
};

export default DestinationCard;
