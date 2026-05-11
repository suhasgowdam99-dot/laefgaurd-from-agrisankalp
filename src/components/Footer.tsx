import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="container footer-content">
        <div className="footer-brand">
          <div className="logo white">Phyto<span>Guard</span></div>
          <p>Science-Backed Nutrition for Your Greener World.</p>
        </div>
        <div className="footer-newsletter">
          <h4>Join the Green Revolution</h4>
          <form className="newsletter-form">
            <input type="email" placeholder="Your Email Address" />
            <button type="submit" className="btn-accent">Join Now</button>
          </form>
        </div>
      </div>
      <div className="container footer-bottom">
        <p>&copy; 2026 PhytoGuard Inc. All rights reserved.</p>
        <ul className="footer-links">
          <li><a href="#">Privacy Policy</a></li>
          <li><a href="#">Terms of Service</a></li>
        </ul>
      </div>
    </footer>
  );
};

export default Footer;
