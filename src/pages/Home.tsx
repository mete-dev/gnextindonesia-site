import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Marquee from '../components/Marquee';
import About from '../components/About';
import Work from '../components/Work';
import Journey from '../components/Journey';
import News from '../components/News';
import Footer from '../components/Footer';
import { SEO } from '../components/SEO';

export default function Home() {
  return (
    <div className="min-h-screen bg-neutral-50 selection:bg-accent selection:text-neutral-900">
      <SEO 
        title="Home" 
        description="Gnext Creative Studio - Ruang tumbuh bagi kreator muda untuk mengubah ide menjadi karya dan kontribusi nyata."
        path="/"
      />
      <Navbar />
      <main>
        <Hero />
        <Marquee />
        <About />
        <Journey />
        <Work />
        <News />
      </main>
      <Footer />
    </div>
  );
}
