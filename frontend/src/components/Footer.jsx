import React from 'react';
import { Compass, Globe, Mail, Phone, MapPin, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        
        {/* Brand Column */}
        <div className="footer-col brand-col">
          <Link to="/" className="nav-logo footer-logo">
            <Compass className="logo-icon" size={28} />
            <span className="logo-text">TourWala</span>
          </Link>
          <p className="footer-desc">
            High-fidelity crowd forecasting and spatial intelligence for the modern analyst. Deciphering the surge across 72+ global nodes.
          </p>
          
          <div className="newsletter-box">
            <h4 className="footer-subtitle">TELEMETRY_FEED_O1</h4>
            <div className="input-group-brutal">
              <input type="email" placeholder="OPERATOR_EMAIL@NODE.COM" className="email-input-brutal"/>
              <button className="submit-btn-brutal"><ArrowRight size={18} /></button>
            </div>
          </div>
          
          <div className="social-links-brutal">
            <a href="#" className="social-icon-brutal"><Globe size={18} /></a>
            <a href="#" className="social-icon-brutal"><Mail size={18} /></a>
            <a href="#" className="social-icon-brutal"><Phone size={18} /></a>
            <a href="#" className="social-icon-brutal"><MapPin size={18} /></a>
          </div>
        </div>

        {/* Links Columns */}
        <div className="footer-col">
          <h4 className="footer-heading-brutal">SYSTEM</h4>
          <ul className="footer-links-brutal">
            <li><Link to="/about">DOCUMENTATION</Link></li>
            <li><a href="#">OPERATIONS</a></li>
            <li><a href="#">MODEL_ACCURACY</a></li>
            <li><a href="#">API_REF</a></li>
            <li><a href="#">LOGS</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4 className="footer-heading-brutal">SECTORS</h4>
          <ul className="footer-links-brutal">
            <li><a href="#">ASIA_PACIFIC</a></li>
            <li><a href="#">EUROPE</a></li>
            <li><a href="#">AMERICAS</a></li>
            <li><a href="#">MEA_REGION</a></li>
            <li><Link to="/destinations">ALL_NODES</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4 className="footer-heading-brutal">CATEGORIES</h4>
          <ul className="footer-links-brutal">
            <li><a href="#">HERITAGE</a></li>
            <li><a href="#">WILDLIFE</a></li>
            <li><a href="#">COASTAL</a></li>
            <li><a href="#">MOUNTAIN</a></li>
            <li><a href="#">CULTURAL</a></li>
          </ul>
        </div>
      </div>
      
      <div className="footer-bottom-brutal container">
        <p className="mono tiny">&copy; 2026 SENTINEL_HORIZON. ALL RIGHTS RESERVED.</p>
        <div className="legal-links-brutal">
          <a href="#" className="mono tiny">PRIVACY_POLICY</a>
          <a href="#" className="mono tiny">TERMS_OF_SERVICE</a>
          <a href="#" className="mono tiny">PROTOCOLS</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
