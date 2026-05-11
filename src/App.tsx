import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import DiseaseDetector from './components/DiseaseDetector';
import About from './components/About';
import Products from './components/Products';
import Benefits from './components/Benefits';
import Footer from './components/Footer';
import './App.css';

const App: React.FC = () => {
  return (
    <div className="app-wrapper">
      <Navbar />
      <main>
        <Hero />
        <DiseaseDetector />
        <About />
        <Products />
        <Benefits />
      </main>
      <Footer />
    </div>
  );
};

export default App;
