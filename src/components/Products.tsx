import React from 'react';

const Products: React.FC = () => {
  return (
    <section id="products" className="products-section">
      <div className="container">
        <div className="section-header">
          <h2>Premium Plant Solutions</h2>
          <p>Whether you're looking to boost growth or heal a suffering plant, we have the right formula.</p>
        </div>
        <div className="product-grid">
          <div className="product-card">
            <div className="product-icon fert"></div>
            <h3>Growth Multiplier</h3>
            <p>A balanced fertilizer for all-purpose foliage growth and blooming strength.</p>
            <span className="price">$24.99</span>
          </div>
          <div className="product-card">
            <div className="product-icon med"></div>
            <h3>Root Reviver</h3>
            <p>Powerful organic medicine for treating common fungal infections and root rot.</p>
            <span className="price">$19.99</span>
          </div>
          <div className="product-card">
            <div className="product-icon fert"></div>
            <h3>Succulent Surge</h3>
            <p>Specially formulated low-nitrogen mix for drought-resistant varieties.</p>
            <span className="price">$21.99</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Products;
