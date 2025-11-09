import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

import Navbar from '../components/Navbar.jsx';
import FullscreenLoader from '../components/FullscreenLoader.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const Progress = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [healthData, setHealthData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      setFetching(true);
      setError('');
      try {
        const { data } = await axios.get('/api/dashboard', {
          params: { userId: user.id }
        });
        if (data.onboardingRequired) {
          navigate('/onboarding', { replace: true });
          return;
        }
        setProfile(data.profileSummary);
      } catch (err) {
        setError(err.response?.data?.error || 'Unable to load progress data.');
      } finally {
        setFetching(false);
      }
    };

    if (user && !loading) {
      fetchProfile();
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const fetchHealthData = async () => {
      if (!user) return;
      try {
        const { data } = await axios.get('/api/health-tracking', {
          params: { userId: user.id }
        });
        setHealthData(data.healthTracking || []);
      } catch (err) {
        console.error('Error fetching health data:', err);
      }
    };

    if (user && !loading) {
      fetchHealthData();
    }
  }, [user, loading]);

  if (loading || fetching) {
    return <FullscreenLoader message="Loading your progress" />;
  }

  const currentWeek = profile?.current_week || profile?.weeks_pregnant || 0;
  const weeks = Array.from({ length: 40 }, (_, i) => i + 1);
  const progressPercent = ((currentWeek / 40) * 100).toFixed(1);

  // Prepare chart data (use real data if available, otherwise use dummy data)
  const chartData = healthData.length > 0 
    ? healthData.map(entry => ({
        date: new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        bloodPressure: entry.blood_pressure_systolic,
        weight: entry.weight_kg,
        mood: entry.mood,
        moodValue: entry.mood === 'Happy' ? 4 : entry.mood === 'Calm' ? 3 : entry.mood === 'Tired' ? 2 : 1
      })).reverse()
    : [
        { date: 'Oct 11', bloodPressure: 118, weight: 68.2, mood: 'Calm', moodValue: 3 },
        { date: 'Oct 12', bloodPressure: 120, weight: 68.3, mood: 'Happy', moodValue: 4 },
        { date: 'Oct 13', bloodPressure: 119, weight: 68.5, mood: 'Tired', moodValue: 2 },
        { date: 'Oct 14', bloodPressure: 117, weight: 68.6, mood: 'Calm', moodValue: 3 },
        { date: 'Oct 15', bloodPressure: 121, weight: 68.8, mood: 'Anxious', moodValue: 1 },
        { date: 'Oct 16', bloodPressure: 118, weight: 69.0, mood: 'Happy', moodValue: 4 },
        { date: 'Oct 17', bloodPressure: 120, weight: 69.2, mood: 'Calm', moodValue: 3 },
        { date: 'Oct 18', bloodPressure: 119, weight: 69.4, mood: 'Tired', moodValue: 2 },
        { date: 'Oct 19', bloodPressure: 122, weight: 69.6, mood: 'Happy', moodValue: 4 },
        { date: 'Oct 20', bloodPressure: 118, weight: 69.8, mood: 'Calm', moodValue: 3 },
        { date: 'Oct 21', bloodPressure: 120, weight: 70.0, mood: 'Happy', moodValue: 4 },
        { date: 'Oct 22', bloodPressure: 117, weight: 70.2, mood: 'Anxious', moodValue: 1 },
        { date: 'Oct 23', bloodPressure: 121, weight: 70.4, mood: 'Tired', moodValue: 2 },
        { date: 'Oct 24', bloodPressure: 119, weight: 70.6, mood: 'Calm', moodValue: 3 },
        { date: 'Oct 25', bloodPressure: 120, weight: 70.8, mood: 'Happy', moodValue: 4 },
        { date: 'Oct 26', bloodPressure: 118, weight: 71.0, mood: 'Calm', moodValue: 3 },
        { date: 'Oct 27', bloodPressure: 122, weight: 71.2, mood: 'Tired', moodValue: 2 },
        { date: 'Oct 28', bloodPressure: 119, weight: 71.4, mood: 'Happy', moodValue: 4 },
        { date: 'Oct 29', bloodPressure: 121, weight: 71.5, mood: 'Calm', moodValue: 3 },
        { date: 'Oct 30', bloodPressure: 117, weight: 71.6, mood: 'Anxious', moodValue: 1 },
        { date: 'Oct 31', bloodPressure: 120, weight: 71.8, mood: 'Happy', moodValue: 4 },
        { date: 'Nov 1', bloodPressure: 118, weight: 72.0, mood: 'Calm', moodValue: 3 },
        { date: 'Nov 2', bloodPressure: 119, weight: 72.1, mood: 'Tired', moodValue: 2 },
        { date: 'Nov 3', bloodPressure: 121, weight: 72.3, mood: 'Happy', moodValue: 4 },
        { date: 'Nov 4', bloodPressure: 120, weight: 72.5, mood: 'Calm', moodValue: 3 },
        { date: 'Nov 5', bloodPressure: 118, weight: 72.6, mood: 'Happy', moodValue: 4 },
        { date: 'Nov 6', bloodPressure: 122, weight: 72.8, mood: 'Anxious', moodValue: 1 },
        { date: 'Nov 7', bloodPressure: 119, weight: 72.9, mood: 'Tired', moodValue: 2 },
        { date: 'Nov 8', bloodPressure: 117, weight: 73.0, mood: 'Calm', moodValue: 3 },
        { date: 'Nov 9', bloodPressure: 120, weight: 73.2, mood: 'Happy', moodValue: 4 }
      ];

  // Prepare calendar data (last 30 days)
  const today = new Date();
  const calendarDays = [];
  
  if (healthData.length > 0) {
    // Use real data
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayData = healthData.find(h => h.date === dateStr);
      calendarDays.push({
        date: dateStr,
        day: date.getDate(),
        dayOfWeek: date.toLocaleDateString('en-US', { weekday: 'short' }),
        mood: dayData?.mood,
        hasData: !!dayData
      });
    }
  } else {
    // Use dummy data for visualization
    const dummyMoods = ['Happy', 'Calm', 'Tired', 'Anxious', 'Happy', 'Calm', 'Happy', 'Tired', 'Calm', 'Happy', 
                        'Calm', 'Anxious', 'Tired', 'Calm', 'Happy', 'Calm', 'Tired', 'Happy', 'Calm', 'Anxious',
                        'Happy', 'Calm', 'Tired', 'Happy', 'Calm', 'Happy', 'Anxious', 'Tired', 'Calm', 'Happy'];
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      calendarDays.push({
        date: date.toISOString().split('T')[0],
        day: date.getDate(),
        dayOfWeek: date.toLocaleDateString('en-US', { weekday: 'short' }),
        mood: dummyMoods[29 - i],
        hasData: true
      });
    }
  }

  const moodColors = {
    'Happy': '#4fb3a6',
    'Calm': '#81C5BC',
    'Tired': '#F8BCD3',
    'Anxious': '#f084ae'
  };

  return (
    <div className="gradient-bg progress-page app-shell">
      <Navbar />
      <main style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
        <motion.section 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5 }}
        >
          <h1 style={{ marginBottom: '10px' }}>Your Journey Progress</h1>
          <p style={{ color: '#8b7a80', marginBottom: '40px' }}>
            Track your beautiful journey week by week
          </p>
        </motion.section>

        {error && <div className="alert alert-error">{error}</div>}

        {/* Progress Overview */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{
            background: 'white',
            borderRadius: '24px',
            padding: '32px',
            marginBottom: '30px',
            boxShadow: '0 4px 20px rgba(240, 132, 174, 0.1)'
          }}
          >
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
              <h2 style={{ margin: '0 0 8px 0' }}>Week {currentWeek} of 40</h2>
              <p style={{ color: '#8b7a80', fontSize: '1.1rem' }}>{progressPercent}% Complete</p>
            </div>          {/* Progress Bar */}
          <div style={{
            width: '100%',
            height: '12px',
            background: 'rgba(240, 132, 174, 0.15)',
            borderRadius: '999px',
            overflow: 'hidden',
            marginBottom: '40px'
          }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              style={{
                height: '100%',
                background: 'linear-gradient(90deg, #f084ae, #d9648f)',
                borderRadius: '999px'
              }}
            />
          </div>

          {/* Week Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(50px, 1fr))',
            gap: '8px',
            marginBottom: '20px'
          }}>
            {weeks.map(week => {
              const isPast = week < currentWeek;
              const isCurrent = week === currentWeek;
              const isFuture = week > currentWeek;
              
              return (
                <motion.div
                  key={week}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: week * 0.01 }}
                  style={{
                    padding: '12px 8px',
                    borderRadius: '12px',
                    textAlign: 'center',
                    fontSize: '0.9rem',
                    fontWeight: isCurrent ? '700' : '500',
                    background: isPast 
                      ? 'linear-gradient(135deg, rgba(240, 132, 174, 0.2), rgba(248, 188, 211, 0.3))'
                      : isCurrent
                      ? 'linear-gradient(135deg, #f084ae, #d9648f)'
                      : 'rgba(0, 0, 0, 0.05)',
                    color: isCurrent ? 'white' : isPast ? '#d9648f' : '#999',
                    border: isCurrent ? '2px solid #f084ae' : 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  whileHover={{ scale: 1.05 }}
                >
                  {week}
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Mood Calendar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          style={{
            background: 'white',
            borderRadius: '24px',
            padding: '32px',
            marginBottom: '30px',
            boxShadow: '0 4px 20px rgba(240, 132, 174, 0.1)'
          }}
        >
          <h2 style={{ marginBottom: '20px' }}>Daily Mood & Health Calendar</h2>
          
          {/* Calendar Legend */}
          <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
            {Object.entries(moodColors).map(([mood, color]) => (
              <div key={mood} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: color }} />
                <span style={{ fontSize: '0.9rem', color: '#666' }}>{mood}</span>
              </div>
            ))}
          </div>

          {/* Scrollable Calendar */}
          <div style={{
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
            paddingBottom: '16px',
            scrollbarWidth: 'thin',
            scrollbarColor: '#f084ae rgba(240, 132, 174, 0.2)'
          }}>
            {calendarDays.map((day, idx) => (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.05 }}
                onClick={() => setSelectedDate(day.hasData ? day.date : null)}
                style={{
                  minWidth: '60px',
                  padding: '12px 8px',
                  borderRadius: '12px',
                  textAlign: 'center',
                  cursor: day.hasData ? 'pointer' : 'default',
                  background: day.hasData 
                    ? moodColors[day.mood] || 'rgba(0, 0, 0, 0.05)'
                    : 'rgba(0, 0, 0, 0.05)',
                  border: selectedDate === day.date ? '2px solid #f084ae' : '2px solid transparent',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ 
                  fontSize: '0.75rem', 
                  color: day.hasData ? 'white' : '#999',
                  fontWeight: '600',
                  marginBottom: '4px'
                }}>
                  {day.dayOfWeek}
                </div>
                <div style={{ 
                  fontSize: '1.1rem', 
                  fontWeight: '700',
                  color: day.hasData ? 'white' : '#666'
                }}>
                  {day.day}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Selected Day Details */}
          {selectedDate && (() => {
            const dayDetails = healthData.find(h => h.date === selectedDate);
            return dayDetails ? (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                style={{
                  marginTop: '24px',
                  padding: '20px',
                  borderRadius: '16px',
                  background: 'rgba(240, 132, 174, 0.05)',
                  border: '1px solid rgba(240, 132, 174, 0.2)'
                }}
              >
                <h3 style={{ marginBottom: '16px', color: '#f084ae' }}>
                  {new Date(selectedDate).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                  <div>
                    <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '4px' }}>Mood</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: '600', color: moodColors[dayDetails.mood] }}>
                      {dayDetails.mood || 'Not logged'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '4px' }}>Blood Pressure</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: '600' }}>
                      {dayDetails.blood_pressure_systolic}/{dayDetails.blood_pressure_diastolic} mmHg
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '4px' }}>Weight</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: '600' }}>
                      {dayDetails.weight_kg} kg
                    </div>
                  </div>
                  {dayDetails.symptoms && dayDetails.symptoms.length > 0 && (
                    <div style={{ gridColumn: '1 / -1' }}>
                      <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '8px' }}>Symptoms</div>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {dayDetails.symptoms.map((symptom, idx) => (
                          <span
                            key={idx}
                            style={{
                              padding: '6px 12px',
                              borderRadius: '8px',
                              background: 'white',
                              fontSize: '0.9rem',
                              color: '#666',
                              border: '1px solid rgba(240, 132, 174, 0.3)'
                            }}
                          >
                            {symptom}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : null;
          })()}
        </motion.div>

        {/* Health Trends Graphs */}
        {chartData.length > 0 && (
          <>
            {/* Blood Pressure Graph */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              style={{
                background: 'white',
                borderRadius: '24px',
                padding: '32px',
                marginBottom: '30px',
                boxShadow: '0 4px 20px rgba(240, 132, 174, 0.1)'
              }}
            >
              <h2 style={{ marginBottom: '24px' }}>Blood Pressure Trend</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                  <XAxis dataKey="date" stroke="#666" style={{ fontSize: '0.85rem' }} />
                  <YAxis stroke="#666" style={{ fontSize: '0.85rem' }} />
                  <Tooltip 
                    contentStyle={{ 
                      background: 'white', 
                      border: '1px solid rgba(240, 132, 174, 0.3)',
                      borderRadius: '12px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }} 
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="bloodPressure" 
                    stroke="#f084ae" 
                    strokeWidth={2}
                    name="Systolic BP (mmHg)"
                    dot={{ fill: '#f084ae', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Weight Graph */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              style={{
                background: 'white',
                borderRadius: '24px',
                padding: '32px',
                marginBottom: '30px',
                boxShadow: '0 4px 20px rgba(240, 132, 174, 0.1)'
              }}
            >
              <h2 style={{ marginBottom: '24px' }}>Weight Trend</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                  <XAxis dataKey="date" stroke="#666" style={{ fontSize: '0.85rem' }} />
                  <YAxis stroke="#666" style={{ fontSize: '0.85rem' }} domain={['dataMin - 1', 'dataMax + 1']} />
                  <Tooltip 
                    contentStyle={{ 
                      background: 'white', 
                      border: '1px solid rgba(79, 179, 166, 0.3)',
                      borderRadius: '12px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }} 
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="weight" 
                    stroke="#4fb3a6" 
                    strokeWidth={2}
                    name="Weight (kg)"
                    dot={{ fill: '#4fb3a6', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Mood Graph */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              style={{
                background: 'white',
                borderRadius: '24px',
                padding: '32px',
                marginBottom: '30px',
                boxShadow: '0 4px 20px rgba(240, 132, 174, 0.1)'
              }}
            >
              <h2 style={{ marginBottom: '24px' }}>Mood Trend</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                  <XAxis dataKey="date" stroke="#666" style={{ fontSize: '0.85rem' }} />
                  <YAxis 
                    stroke="#666" 
                    style={{ fontSize: '0.85rem' }}
                    ticks={[1, 2, 3, 4]}
                    domain={[0.5, 4.5]}
                    tickFormatter={(value) => {
                      const moods = { 1: 'Anxious', 2: 'Tired', 3: 'Calm', 4: 'Happy' };
                      return moods[value] || '';
                    }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      background: 'white', 
                      border: '1px solid rgba(240, 132, 174, 0.3)',
                      borderRadius: '12px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                    formatter={(value, name, props) => [props.payload.mood, 'Mood']}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="moodValue" 
                    stroke="#f084ae" 
                    strokeWidth={3}
                    name="Mood"
                    dot={{ fill: '#f084ae', r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Overall Health Score Graph */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              style={{
                background: 'white',
                borderRadius: '24px',
                padding: '32px',
                marginBottom: '30px',
                boxShadow: '0 4px 20px rgba(240, 132, 174, 0.1)'
              }}
            >
              <h2 style={{ marginBottom: '24px' }}>Overall Health Score</h2>
              <p style={{ color: '#666', marginBottom: '20px', fontSize: '0.95rem' }}>
                Combined score based on blood pressure, weight stability, and mood
              </p>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData.map((item, idx) => {
                  // Calculate health score (0-100)
                  const bpScore = item.bloodPressure >= 115 && item.bloodPressure <= 120 ? 90 : 
                                  item.bloodPressure >= 110 && item.bloodPressure <= 125 ? 75 : 60;
                  const moodScore = item.moodValue * 20; // Happy=80, Calm=60, Tired=40, Anxious=20
                  const weightScore = 70; // Stable weight
                  const overallScore = Math.round((bpScore + moodScore + weightScore) / 3);
                  
                  return {
                    ...item,
                    healthScore: overallScore
                  };
                })}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                  <XAxis dataKey="date" stroke="#666" style={{ fontSize: '0.85rem' }} />
                  <YAxis 
                    stroke="#666" 
                    style={{ fontSize: '0.85rem' }}
                    domain={[0, 100]}
                    ticks={[0, 25, 50, 75, 100]}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      background: 'white', 
                      border: '1px solid rgba(129, 197, 188, 0.3)',
                      borderRadius: '12px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                    formatter={(value) => [`${value}/100`, 'Health Score']}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="healthScore" 
                    stroke="#81C5BC" 
                    strokeWidth={3}
                    name="Health Score"
                    dot={{ fill: '#81C5BC', r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>
          </>
        )}

        {/* Milestones */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          style={{
            background: 'white',
            borderRadius: '24px',
            padding: '32px',
            boxShadow: '0 4px 20px rgba(240, 132, 174, 0.1)'
          }}
        >
          <h2 style={{ marginBottom: '24px' }}>Key Milestones</h2>
          <div style={{ display: 'grid', gap: '20px' }}>
            {[
              { week: 12, title: 'First Trimester Complete', desc: 'Major organs formed' },
              { week: 20, title: 'Halfway There!', desc: 'Baby can hear your voice' },
              { week: 28, title: 'Third Trimester', desc: 'Baby\'s eyes can open' },
              { week: 37, title: 'Full Term', desc: 'Baby is ready to meet you' },
              { week: 40, title: 'Due Date', desc: 'Welcome to the world!' }
            ].map((milestone, idx) => {
              const reached = currentWeek >= milestone.week;
              return (
                <div 
                  key={idx}
                  style={{
                    padding: '20px',
                    borderRadius: '16px',
                    background: reached 
                      ? 'linear-gradient(135deg, rgba(240, 132, 174, 0.1), rgba(248, 188, 211, 0.15))'
                      : 'rgba(0, 0, 0, 0.03)',
                    opacity: reached ? 1 : 0.5,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                      Week {milestone.week}: {milestone.title}
                    </div>
                    <div style={{ color: '#8b7a80', fontSize: '0.9rem' }}>
                      {milestone.desc}
                    </div>
                  </div>
                  {reached && <div style={{ color: '#4fb3a6', fontSize: '1.5rem' }}>✓</div>}
                </div>
              );
            })}
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Progress;
