import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Insights = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedArticle, setExpandedArticle] = useState(null);

  const categories = [
    { id: 'all', name: 'All Topics', icon: '📚' },
    { id: 'breastfeeding', name: 'Breastfeeding', icon: '🤱' },
    { id: 'baby-care', name: 'Baby Care', icon: '👶' },
    { id: 'recovery', name: 'Recovery', icon: '💪' },
    { id: 'nutrition', name: 'Nutrition', icon: '🥗' },
    { id: 'mental-health', name: 'Mental Health', icon: '🧘‍♀️' },
    { id: 'sleep', name: 'Sleep', icon: '😴' }
  ];

  useEffect(() => {
    fetchArticles();
  }, [selectedCategory]);

  const fetchArticles = async () => {
    try {
      const token = localStorage.getItem('sb-access-token');
      const url = selectedCategory === 'all' 
        ? `${import.meta.env.VITE_API_URL || 'http://localhost:5050'}/api/insights`
        : `${import.meta.env.VITE_API_URL || 'http://localhost:5050'}/api/insights?category=${selectedCategory}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setArticles(data);
      }
    } catch (error) {
      console.error('Failed to fetch articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateArticles = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('sb-access-token');
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5050'}/api/insights/generate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      fetchArticles();
    } catch (error) {
      console.error('Failed to generate articles:', error);
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <Navbar />
      
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: '48px', textAlign: 'center' }}
        >
          <h1 style={{ 
            fontSize: '2.5rem', 
            marginBottom: '16px',
            background: 'linear-gradient(135deg, #f084ae, #4fb3a6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            💡 Insights & Guidance
          </h1>
          <p style={{ fontSize: '1.1rem', color: '#8b7a80', maxWidth: '600px', margin: '0 auto' }}>
            AI-curated articles for pregnancy, postpartum recovery, breastfeeding and baby care
          </p>
        </motion.header>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '12px',
            marginBottom: '40px',
            justifyContent: 'center'
          }}
        >
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              style={{
                padding: '12px 24px',
                borderRadius: '24px',
                border: '2px solid',
                borderColor: selectedCategory === cat.id ? '#f084ae' : 'rgba(0,0,0,0.1)',
                background: selectedCategory === cat.id ? '#f084ae' : 'white',
                color: selectedCategory === cat.id ? 'white' : '#666',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '500',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </motion.div>

        {/* Generate Button */}
        {articles.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ textAlign: 'center', marginBottom: '40px' }}
          >
            <button
              onClick={generateArticles}
              style={{
                padding: '16px 32px',
                borderRadius: '24px',
                border: 'none',
                background: 'linear-gradient(135deg, #4fb3a6, #3a8f85)',
                color: 'white',
                fontSize: '1.1rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              ✨ Generate Personalized Articles
            </button>
          </motion.div>
        )}

        {/* Articles Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#999' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📖</div>
            <p>Loading insights...</p>
          </div>
        ) : articles.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              background: 'linear-gradient(135deg, #f084ae15, #4fb3a615)',
              borderRadius: '24px',
              padding: '60px 40px',
              textAlign: 'center'
            }}
          >
            <div style={{ fontSize: '4rem', marginBottom: '20px' }}>📚</div>
            <h3 style={{ marginBottom: '12px', color: '#333' }}>No articles yet</h3>
            <p style={{ color: '#8b7a80', maxWidth: '500px', margin: '0 auto' }}>
              Click the button above to generate personalized articles based on your profile and stage.
            </p>
          </motion.div>
        ) : (
          <div style={{ display: 'grid', gap: '24px' }}>
            {articles.map((article, index) => (
              <motion.article
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                style={{
                  background: 'white',
                  borderRadius: '24px',
                  padding: '32px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  border: article.is_personalized ? '2px solid rgba(240, 132, 174, 0.3)' : 'none'
                }}
              >
                <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', flexWrap: 'wrap' }}>
                  <span style={{
                    padding: '6px 16px',
                    borderRadius: '16px',
                    background: '#f084ae20',
                    color: '#f084ae',
                    fontSize: '0.85rem',
                    fontWeight: '600'
                  }}>
                    {article.category}
                  </span>
                  {article.is_personalized && (
                    <span style={{
                      padding: '6px 16px',
                      borderRadius: '16px',
                      background: '#4fb3a620',
                      color: '#4fb3a6',
                      fontSize: '0.85rem',
                      fontWeight: '600'
                    }}>
                      ✨ Personalized for you
                    </span>
                  )}
                  <span style={{
                    padding: '6px 16px',
                    borderRadius: '16px',
                    background: '#f0f0f0',
                    color: '#666',
                    fontSize: '0.85rem'
                  }}>
                    {article.stage === 'postpartum' ? '👶 Postpartum' : '🤰 Pregnancy'}
                  </span>
                </div>

                <h2 style={{ fontSize: '1.6rem', marginBottom: '12px', color: '#2a2a2a' }}>
                  {article.title}
                </h2>
                
                <p style={{ color: '#666', lineHeight: '1.7', marginBottom: '20px', fontSize: '1.05rem' }}>
                  {article.summary}
                </p>

                {article.tags && article.tags.length > 0 && (
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
                    {article.tags.map((tag, i) => (
                      <span key={i} style={{
                        padding: '4px 12px',
                        borderRadius: '12px',
                        background: '#f5f5f5',
                        color: '#888',
                        fontSize: '0.8rem'
                      }}>
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                <button
                  onClick={() => setExpandedArticle(expandedArticle === article.id ? null : article.id)}
                  style={{
                    padding: '12px 24px',
                    borderRadius: '20px',
                    border: '2px solid #f084ae',
                    background: expandedArticle === article.id ? '#f084ae' : 'white',
                    color: expandedArticle === article.id ? 'white' : '#f084ae',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '0.95rem',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {expandedArticle === article.id ? '− Read less' : '+ Read full article'}
                </button>

                {expandedArticle === article.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    style={{
                      marginTop: '24px',
                      paddingTop: '24px',
                      borderTop: '1px solid #eee',
                      color: '#555',
                      lineHeight: '1.8',
                      whiteSpace: 'pre-wrap'
                    }}
                  >
                    {article.content}
                  </motion.div>
                )}
              </motion.article>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Insights;
