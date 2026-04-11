import React from 'react';
import './Journal.css';

const JOURNAL_POSTS = [
  {
    title: 'The Future of AI in Predictive Tourism',
    category: 'AI Forecasting',
    readTime: '5 min read',
    img: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop',
    excerpt: 'How gradient boosted trees are changing the way cities prepare for massive influxes of visitors.'
  },
  {
    title: 'Kyoto\'s Cherry Blossom Strategy',
    category: 'Data Stories',
    readTime: '8 min read',
    img: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=2070&auto=format&fit=crop',
    excerpt: 'Analyzing the 2025 surge and how early warnings helped local infrastructure adapt.'
  },
  {
    title: 'Off-Peak Wonders: Where to go in July',
    category: 'Destination Guides',
    readTime: '6 min read',
    img: 'https://images.unsplash.com/photo-1542401886-65d6c61db217?q=80&w=2070&auto=format&fit=crop',
    excerpt: 'Escape the heat and the crowds. Our model identifies the best value destinations this summer.'
  }
];

const Journal = () => {
  return (
    <div className="journal-page-brutal noise-overlay">
      <div className="container" style={{paddingBottom: '8rem'}}>
        <div style={{textAlign: 'center', marginBottom: '8rem', paddingTop: '4rem'}}>
          <p className="mission-index">EDITORIAL_LOG_v1</p>
          <h1 className="mission-title-brutal">SYSTEM_INSIGHTS</h1>
          <p className="mono tiny" style={{color: 'var(--color-primary)'}}>DISPATCHES ON SPATIAL INTELLIGENCE AND PREDICTIVE DYNAMICS.</p>
        </div>

        <div className="journal-grid-brutal">
          {JOURNAL_POSTS.map((post, i) => (
            <div key={i} className="journal-card-brutal glass-panel">
              <div className="journal-img-brutal">
                <img src={post.img} alt={post.title} className="img-noir" />
                <span className="journal-badge-brutal">{post.category.toUpperCase()}</span>
              </div>
              <div className="journal-content-brutal">
                <p className="journal-meta-brutal">{post.readTime.toUpperCase()}</p>
                <h3 className="journal-title-brutal">{post.title.toUpperCase()}</h3>
                <p className="journal-excerpt-brutal">{post.excerpt.toUpperCase()}</p>
                <button className="journal-link-brutal">ACCESS_FULL_REPORT <ArrowRight size={14}/></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Journal;
