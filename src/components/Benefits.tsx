import React from 'react';

const Benefits: React.FC = () => {
  return (
    <section id="benefits" className="benefits-section">
      <div className="container">
        <div className="benefits-grid">
          <div className="benefit-item">
            <div className="benefit-icon">🌿</div>
            <h4>100% Organic</h4>
            <p>No synthetic chemicals, ever. Safe for children and pets.</p>
          </div>
          <div className="benefit-item">
            <div className="benefit-icon">⚡</div>
            <h4>Fast-Acting</h4>
            <p>See visible growth and health improvement within 7 days.</p>
          </div>
          <div className="benefit-item">
            <div className="benefit-icon">🛡️</div>
            <h4>Eco-Shield</h4>
            <p>Our packaging is fully compostable and plastic-free.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Benefits;
