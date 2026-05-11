import React from 'react';

const Hero: React.FC = () => {
  return (
    <header className="hero">
      <div className="container hero-grid">
        <div className="hero-text">
          <h1>Science-Backed Nutrition for Your <span>Greener</span> World</h1>
          <p>PhytoGuard provides 100% organic, fast-acting fertilizers and medicine to help your indoor and outdoor plants thrive.</p>
          <div className="hero-actions">
            <button className="btn-primary">Explore Products</button>
            <button className="btn-secondary">Learn More</button>
          </div>
        </div>
        <div className="hero-visual">
          <div className="organic-blob"></div>
        </div>
      </div>
    </header>
  );
};

export default Hero;
