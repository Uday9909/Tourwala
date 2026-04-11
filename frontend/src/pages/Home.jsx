import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Activity, TrendingUp, Users } from 'lucide-react';
import DestinationCard from '../components/DestinationCard';
import AnimatedCounter from '../components/AnimatedCounter';
import { tSAPI } from '../api';
import { getSpotImage } from '../utils/imageMapper';
import './Home.css';

const CATEGORIES = [
  { name: 'Religious/Heritage', img: 'https://images.unsplash.com/photo-1548013146-72479768bada', span: 2 },
  { name: 'Kerala Backwaters', img: 'https://images.unsplash.com/photo-1602216056096-3c40cc0c9944', span: 1 },
  { name: 'Andaman Islands', img: 'https://images.unsplash.com/photo-1589135398309-1581e591c78f', span: 1 },
  { name: 'Himalayas/Ladakh', img: 'https://images.unsplash.com/photo-1526761122248-c31c93f8b2b9', span: 2 },
];

const getMockDestAttr = (spotName) => {
  const hash = spotName.length;
  // Matches dataset.csv taxonomy
  const confidences = ['High', 'Medium', 'Stable'];
  const seasons = ['Peak Season', 'Shoulder Season', 'Off-Peak'];
  const infraLevels = ['High', 'Moderate', 'Evolving'];
  const sanitation = ['Clean (A)', 'Standard (B)', 'Improving (C)'];

  return {
    image: getSpotImage(spotName),
    'Confidence Level': confidences[hash % 3],
    'Season Classification': seasons[hash % 3],
    'Infra Level': infraLevels[hash % 3],
    'Sanitation Index': sanitation[hash % 3],
    description: `Deciphering footfall patterns and spatial dynamics for ${spotName}. Node status: OPERATIONAL.`
  };
};

const Home = () => {
  const [systemStats, setSystemStats] = useState({ spots: 72, accuracy: 94, dataPoints: 1000 });
  const [featuredSpots, setFeaturedSpots] = useState([]);

  // Fetch real numbers and featured spots from backend
  useEffect(() => {
    tSAPI.getSpots().then(res => {
      if(res.count) setSystemStats(s => ({ ...s, spots: res.count }));
    }).catch(e => console.log('Backend not running locally yet?'));

    tSAPI.getOverview(null, 2).then(res => {
      if (res.spots && res.spots.length > 0) {
        setFeaturedSpots(res.spots.map(s => ({ name: s['Tourist Spot Name'], ...getMockDestAttr(s['Tourist Spot Name']) })));
      }
    }).catch(e => console.log('Wait for backend'));
  }, []);

  return (
    <div className="home-page noise-overlay">
      {/* 1. Hero Section: Grid-breaking & Brutalist */}
      <section className="hero-section">
        <div className="hero-bg">
          <img 
            src="https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96?q=80&w=2069&auto=format&fit=crop" 
            alt="Hero background" 
            className="hero-img-filter"
          />
          <div className="hero-overlay"></div>
        </div>
        
        <div className="container hero-content">
          <motion.div 
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="hero-text"
          >
            <div className="hero-header-stack">
              <p className="hero-subtitle">SENTINEL HORIZON — 01</p>
              <h1 className="hero-title">INTELLIGENCE</h1>
              <h2 className="hero-tagline">Beyond the Horizon.</h2>
            </div>
            
            <div className="hero-footer-stack">
              <p className="hero-desc">
                High-fidelity crowd forecasting for the modern analyst. We decode spatial dynamics to predict the next surge.
              </p>
              
              <div className="hero-actions">
                <Link to="/destinations" className="btn-brutal">EXPLORE SYSTEM <ArrowRight size={18} /></Link>
                <Link to="/spot/Taj%20Mahal" className="link-underlined">SYSTEM ANALYSIS</Link>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="hero-stats-panel glass-panel"
          >
            <div className="mini-stat">
              <span className="mono">{systemStats.spots}</span>
              <label>NODES</label>
            </div>
            <div className="mini-stat">
              <span className="mono">{systemStats.accuracy}%</span>
              <label>CONFIDENCE</label>
            </div>
            <div className="mini-stat">
              <span className="mono">{systemStats.dataPoints}k</span>
              <label>TELEMETRY</label>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. Stats Bar: Industrial High-Contrast */}
      <section className="stats-bar">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-block">
              <label className="stat-index">01</label>
              <h3 className="mono"><AnimatedCounter end={systemStats.spots} suffix="+" /></h3>
              <p className="stat-label">GLOBAL NODES</p>
            </div>
            <div className="stat-block">
              <label className="stat-index">02</label>
              <h3 className="mono"><AnimatedCounter end={systemStats.accuracy} suffix="%" /></h3>
              <p className="stat-label">MODAL ACCURACY</p>
            </div>
            <div className="stat-block">
              <label className="stat-index">03</label>
              <h3 className="mono"><AnimatedCounter end={systemStats.dataPoints} suffix="k" /></h3>
              <p className="stat-label">DAILY EVENTS</p>
            </div>
            <div className="stat-block">
              <label className="stat-index">04</label>
              <h3 className="mono"><AnimatedCounter end={130} suffix="K" /></h3>
              <p className="stat-label">OPERATORS</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Showcase Section: Editorial Grid */}
      <section className="showcase-section">
        <div className="container">
          <div className="section-header-brutal">
            <h2 className="section-title-large">FEATURED<br/><i>INTELLIGENCE</i></h2>
            <div className="section-desc-editorial">
              Each destination represents a live node in our global network, continuously monitored for pricing anomalies and crowd saturation.
            </div>
          </div>

          <div className="showcase-list">
            {featuredSpots.map((dest, i) => (
              <motion.div 
                key={dest.name}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: i * 0.2 }}
                className={`showcase-row-brutal ${i % 2 !== 0 ? 'row-reverse' : ''}`}
              >
                <div className="showcase-img-editorial">
                  <img src={dest.image} alt={dest.name} className="img-noir" />
                  <div className="img-label-brutal">NODE_{dest.name.toUpperCase().replace(/\s/g, '_')}</div>
                </div>
                <div className="showcase-content-editorial">
                  <DestinationCard destination={dest} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Mosaic Section: Asymmetric */}
      <section className="categories-section">
        <div className="container">
          <h2 className="section-title-md">SPATIAL SECTORS</h2>
          <div className="mosaic-grid-brutal">
            {CATEGORIES.map((cat, i) => (
              <motion.div 
                key={cat.name}
                initial={{ opacity: 0, scale: 0.98 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="mosaic-item-brutal"
                style={{ gridColumn: `span ${cat.span}` }}
              >
                <img src={cat.img} alt={cat.name} className="img-grayscale" />
                <div className="mosaic-overlay-brutal">
                  <span className="mono">0{i+1}</span>
                  <h3>{cat.name}</h3>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Events Section: Ticker style */}
      <section className="events-section">
        <div className="container">
          <div className="section-header-brutal">
            <h2 className="section-title-md">ANOMALY FEED</h2>
            <p className="section-desc-editorial">Critical saturation windows detected for Q3-Q4 2025.</p>
          </div>
          
          <div className="events-ticker">
            {[
              { title: 'Varanasi Aarti', img: 'https://images.unsplash.com/photo-1561359313-0639aad49ca6' },
              { title: 'Kumbh Mela', img: 'https://images.unsplash.com/photo-1590766948510-1006382f6e59' },
              { title: 'Hampi Heritage', img: 'https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d' },
              { title: 'Goa Festive', img: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2' }
            ].map((event, i) => (
              <div key={i} className="event-card-brutal glass-panel">
                <div className="event-img-brutal">
                  <img src={event.img} alt={event.title} className="img-noir" />
                </div>
                <div className="event-content-brutal">
                  <span className="mono tiny">PRIORITY_HIGH</span>
                  <h4>{event.title.toUpperCase()}</h4>
                  <div className="event-stats-brutal">
                    <span className="mono text-red">+340%</span>
                    <span className="mono text-dim">VAL_94</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* 6. Trusted Section: Full Bleed */}
      <section className="trusted-section-brutal">
        <div className="trusted-bg">
          <img src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b" alt="Himalayas" className="img-noir" />
          <div className="trusted-overlay-brutal"></div>
        </div>
        <div className="container trusted-content-brutal">
          <p className="mono tiny">VOICE_OF_THE_FIELD</p>
          <h2 className="quote-text-brutal">"SYSTEM ACCURACY REACHED 94% DURING THE VARANASI PEAK. INDISPENSABLE FOR DOMESTIC STRATEGY."</h2>
          <div className="quote-author-brutal">
            <strong className="mono">ADVAIT SHARMA</strong>
            <span className="mono tiny">DOMESTIC_OPS_HEAD</span>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
