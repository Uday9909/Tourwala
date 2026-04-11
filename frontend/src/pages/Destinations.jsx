import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, SlidersHorizontal, MapPin } from 'lucide-react';
import DestinationCard from '../components/DestinationCard';
import { tSAPI } from '../api';
import { getSpotImage } from '../utils/imageMapper';
import './Destinations.css';

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=2074&auto=format&fit=crop';

const getMockDestAttr = (spotName) => {
  const hash = spotName.length;
  // Deterministic mock attributes aligned with dataset.csv
  const confidences = ['High', 'Medium', 'Stable'];
  const spotTypes = ['Religious/Heritage', 'Nature/Scenic', 'Beach/Coastal', 'Adventure/Activity'];
  const seasons = ['Peak Season', 'Shoulder Season', 'Off-Peak'];
  const infraLevels = ['High', 'Moderate', 'Evolving'];
  const sanitation = ['Clean (A)', 'Standard (B)', 'Improving (C)'];

  return {
    image: getSpotImage(spotName),
    'Confidence Level': confidences[hash % 3],
    'Spot Type': spotTypes[hash % 4],
    'Season Classification': seasons[hash % 3],
    'Infra Level': infraLevels[hash % 3],
    'Sanitation Index': sanitation[hash % 3],
    'Best Time': 'Oct-Mar',
    'Pricing Tier': 'Mid-range',
    description: `Deciphering footfall patterns and spatial dynamics for ${spotName}. Node status: OPERATIONAL.`
  };
};

const Destinations = () => {
  const [spots, setSpots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Real data
  useEffect(() => {
    tSAPI.getOverview(null, 150).then(res => {
      if(res.spots) {
        const enriched = res.spots.map(s => ({
          name: s['Tourist Spot Name'],
          ...getMockDestAttr(s['Tourist Spot Name'])
        }));
        setSpots(enriched);
      }
      setLoading(false);
    }).catch(e => {
      console.error(e);
      // Fallback
      setSpots([
        { 
          name: 'Taj Mahal', 
          image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523', 
          'Confidence Level': 'High', 
          'Season Classification': 'Peak Season', 
          'Infra Level': 'High',
          'Sanitation Index': 'Clean (A)',
          description: 'Iconic marble mausoleum. Node status: OPERATIONAL.'
        },
        { 
          name: 'Jaipur', 
          image: 'https://images.unsplash.com/photo-1477587458883-47145ed94245', 
          'Confidence Level': 'Medium', 
          'Season Classification': 'Shoulder Season', 
          'Infra Level': 'Moderate',
          'Sanitation Index': 'Standard (B)',
          description: 'The Pink City of India. Node status: OPERATIONAL.'
        }
      ]);
      setLoading(false);
    });
  }, []);

  const filtered = spots.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const displayed = searchTerm.trim() === '' ? filtered.slice(0, 30) : filtered;

  return (
    <div className="dest-page-container noise-overlay">
      <div className="dest-header-brutal container">
        <h1 className="page-title">GLOBAL_NODES</h1>
        <p className="page-desc">ARCHIVE_ACCESS: 15,000+ ENTIRES. ANALYZING FOOTFALL, SEASONALITY, AND INFRASTRUCTURE TELEMETRY.</p>
      </div>

      <div className="container dest-content-brutal">
        <aside className="dest-sidebar-brutal">
          <div className="filter-box-brutal glass-panel">
            <h3 className="filter-title-brutal">FILTER_PROTOCOLS</h3>
            
            <div className="filter-group-brutal">
              <label className="filter-label-brutal">NODE_SEARCH</label>
              <div className="search-input-wrapper-brutal" style={{position: 'relative'}}>
                <Search size={16} className="search-icon-brutal" />
                <input 
                  type="text" 
                  className="search-input-brutal"
                  placeholder="INPUT_NODE_NAME..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="filter-group-brutal">
              <label className="filter-label-brutal">CONFIDENCE_SPECTRUM</label>
              <label className="checkbox-label-brutal"><input type="checkbox" /> HIGH_CONFIDENCE</label>
              <label className="checkbox-label-brutal"><input type="checkbox" /> STABLE_NODE</label>
              <label className="checkbox-label-brutal"><input type="checkbox" /> CALIBRATING...</label>
            </div>

            <div className="filter-group-brutal">
              <label className="filter-label-brutal">INFRA_MATURITY</label>
              <label className="checkbox-label-brutal"><input type="checkbox" /> HIGH_DEVELOPMENT</label>
              <label className="checkbox-label-brutal"><input type="checkbox" /> MODERATE_SYNC</label>
              <label className="checkbox-label-brutal"><input type="checkbox" /> EVOLVING_NODE</label>
            </div>
          </div>
        </aside>

        <main className="dest-main">
          {/* Mobile Search */}
          <div className="mobile-search mb-4">
             <div className="search-input-wrapper-brutal" style={{position: 'relative'}}>
                <Search size={16} className="search-icon-brutal" />
                <input 
                  type="text" 
                  className="search-input-brutal"
                  placeholder="SEARCH_NODES..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
          </div>

          <div className="dest-grid-brutal">
            {loading ? (
              <p className="mono tiny">INITIALIZING_CATALOGUE...</p>
            ) : displayed.length === 0 ? (
              <p className="mono tiny">MISS_DATA: NO_NODES_MATCHED '{searchTerm.toUpperCase()}'</p>
            ) : (
              displayed.map((dest, i) => (
                <motion.div
                  key={dest.name}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: (i % 8) * 0.05 }}
                >
                  <DestinationCard destination={dest} />
                </motion.div>
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Destinations;
