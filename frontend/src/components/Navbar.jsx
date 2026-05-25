import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Compass, Menu, X } from 'lucide-react';
import WeatherWidget from './WeatherWidget';
import './Navbar.css';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isActiveLink = (path) => {
    return location.pathname === path || (path.startsWith('/spot') && location.pathname.startsWith('/spot'));
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

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
              className={`nav-link ${isActiveLink(link.path) ? 'active' : ''}`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        <div className="nav-actions">
          <div className="nav-weather-wrapper">
            <WeatherWidget city="Auto-Detect" />
          </div>
          <Link to="/destinations" className="btn-primary desktop-only">
            Explore Now
          </Link>
          
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
              className={`mobile-nav-link ${isActiveLink(link.path) ? 'active' : ''}`}
            >
              {link.name}
            </Link>
          ))}
          <Link to="/destinations" className="btn-primary w-full mt-4" onClick={() => setMobileMenuOpen(false)}>
            Explore Now
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
