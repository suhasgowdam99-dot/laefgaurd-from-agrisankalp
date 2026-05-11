import React from 'react';

const Navbar: React.FC = () => {
  return (
    <nav className="navbar">
      <div className="container nav-content">
        <div className="logo">Phyto<span>Guard</span></div>
        <ul className="nav-links">
          <li><a href="#detector">AI Detector</a></li>
          <li><a href="#about">About</a></li>
          <li><a href="#products">Products</a></li>
          <li><a href="#benefits">Benefits</a></li>
        </ul>
        <button className="btn-primary">Get Started</button>
      </div>
    </nav>
  );
};

export default Navbar;
