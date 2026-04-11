import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Compass, Menu, X } from 'lucide-react';
import WeatherWidget from './WeatherWidget';
import './Navbar.css';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Destinations', path: '/destinations' },
    { name: 'Spot Analysis', path: '/spot/Taj%20Mahal' },
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Journal', path: '/journal' }
  ];

  return (
    <nav className={`navbar ${scrolled ? 'nav-scrolled' : ''}`}>
      <div className="container nav-container">
        
        <Link to="/" className="nav-logo">
          <Compass className="logo-icon" size={28} />
          <span className="logo-text">TourWala</span>
        </Link>

        <div className="nav-links desktop-only">
          {navLinks.map((link) => (
            <Link 
              key={link.name}
              to={link.path} 
              className={`nav-link ${location.pathname === link.path || (link.path.startsWith('/spot') && location.pathname.startsWith('/spot')) ? 'active' : ''}`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        <div className="nav-actions">
          <div className="nav-weather-wrapper">
            <WeatherWidget city="Auto-Detect" />
          </div>
          <button className="btn-primary desktop-only">Explore Now</button>
          
          <button 
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="mobile-menu">
          {navLinks.map((link) => (
             <Link 
              key={link.name}
              to={link.path} 
              className={`mobile-nav-link ${location.pathname === link.path ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          <button className="btn-primary w-full mt-4">Explore Now</button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
