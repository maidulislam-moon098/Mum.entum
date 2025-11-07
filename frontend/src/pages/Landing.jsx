import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

import Navbar from '../components/Navbar.jsx';
import Pill from '../components/Pill.jsx';
import SectionHeading from '../components/SectionHeading.jsx';
import FeatureCard from '../components/FeatureCard.jsx';
import Footer from '../components/Footer.jsx';

const features = [
  {
    title: 'Tailored pregnancy dashboard',
    description:
  'Track your baby\'s growth, movement patterns, nutritional goals, and emotional check-ins in one gentle space.',
    icon: '🍼'
  },
  {
    title: 'Daily wellness nudges',
    description:
      'Gentle reminders for hydration, rest, supplements, and mindfulness crafted with your stage and preferences in mind.',
    icon: '🌸'
  },
  {
    title: 'Care team ready insights',
    description:
      'Shareable summaries designed to keep partners and healthcare providers aligned with your well-being.',
    icon: '🤝'
  }
];

const LandingPage = () => (
  <div className="gradient-bg">
    <Navbar />
    <main>
      <section className="hero">
        <div className="hero__content">
          <Pill>Welcome to Mum.entum</Pill>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Embrace every moment of your pregnancy journey with calm and clarity.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Mum.entum blends compassionate guidance, meaningful data, and AI companionship to help you feel supported each day.
          </motion.p>
          <motion.div
            className="hero__actions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Link className="button button--primary" to="/auth">
              Join Mum.entum
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="section">
        <SectionHeading
          title="Why mums love Mum.entum"
          subtitle="Crafted to meet you where you are, every single day."
        />
        <div className="feature-grid">
          {features.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </section>
    </main>
    <Footer />
  </div>
);

export default LandingPage;
