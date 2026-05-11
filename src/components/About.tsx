import React from 'react';

const About: React.FC = () => {
  return (
    <section id="about" className="about-section">
      <div className="container about-grid">
        <div className="about-image">
          <div className="clinical-shield"></div>
        </div>
        <div className="about-text">
          <span className="badge">Our Mission</span>
          <h2>The Science of Growing</h2>
          <p>Founded by botanists and chemists, PhytoGuard bridges the gap between traditional gardening and modern science. We believe that every plant deserves the highest quality care, tailored to its specific biological needs.</p>
          <ul className="check-list">
            <li>Ethically sourced organic ingredients</li>
            <li>Carbon-neutral manufacturing process</li>
            <li>Scientifically proven efficacy</li>
          </ul>
        </div>
      </div>
    </section>
  );
};

export default About;
