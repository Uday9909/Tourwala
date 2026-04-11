import React from 'react';
import { Database, BrainCircuit, Rocket } from 'lucide-react';
import './About.css';

const About = () => {
  return (
    <div className="about-page-brutal noise-overlay">
      <div className="container" style={{paddingBottom: '8rem'}}>
        
        {/* Mission Statement */}
        <div className="mission-section-brutal">
          <div className="mission-index">DOCUMENTATION_V1.0</div>
          <h1 className="mission-title-brutal">DECODING_GLOBAL_FLOW</h1>
          <p className="mission-statement-brutal">
            OUR MISSION IS TO NEUTRALIZE OVER-TOURISM BY DEPLOYING PREDICTIVE SPATIAL INTELLIGENCE. WE TRANSFORM RAW ENVIRONMENTAL DATA INTO ARCHITECTURAL DECISIONS.
          </p>
        </div>

        {/* How It Works */}
        <div className="process-grid-brutal">
          <div className="process-step-brutal glass-panel">
            <span className="step-number-brutal mono">01_INGESTION</span>
            <h3 className="mono">DATA_INPUT</h3>
            <p>WE AGGREGATE METEOROLOGICAL PATTERNS, HISTORICAL FOOTFALL, FISCAL SIGNALS, AND SOCIAL SENTIMENT ACROSS 72+ GLOBAL NODES.</p>
          </div>
          
          <div className="process-step-brutal glass-panel">
            <span className="step-number-brutal mono">02_PROCESSING</span>
            <h3 className="mono">AI_FORECASTING</h3>
            <p>OUR ENSEMBLE MODELS (GBTS & LSTMS) CALCULATE CONGESTION CLUSTERS WITH 89.4% CONFIDENCE BANDS UP TO 12 MONTHS IN ADVANCE.</p>
          </div>

          <div className="process-step-brutal glass-panel">
            <span className="step-number-brutal mono">03_EXECUTION</span>
            <h3 className="mono">DECISION_LOGIC</h3>
            <p>THE SYSTEM TRANSLATES PROJECTIONS INTO OPERATIONAL PROTOCOLS: OPTIMUM VISIT WINDOWS AND REAL-TIME RISK MITIGATION.</p>
          </div>
        </div>

        {/* Tech Stack */}
        <div style={{marginTop: '5rem', textAlign: 'center'}}>
           <div className="mission-index">CORE_STACK</div>
           <div className="tech-badges-brutal">
             <span className="badge-brutal">PYTHON_FASTAPI</span>
             <span className="badge-brutal">SKLEARN_ENSEMBLE</span>
             <span className="badge-brutal">REACT_VITE</span>
             <span className="badge-brutal">RECHARTS_GLOW</span>
             <span className="badge-brutal">OPENWEATHER_API</span>
           </div>
        </div>

      </div>
    </div>
  );
};

export default About;
