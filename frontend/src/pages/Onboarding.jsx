import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';

import Navbar from '../components/Navbar.jsx';
import FullscreenLoader from '../components/FullscreenLoader.jsx';
import QuestionCard from '../components/QuestionCard.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const defaultAnswerValue = (question) => {
  if (!question) return '';
  if (question.responseType === 'multi_select') return [];
  if (question.responseType === 'scale') return null;
  return '';
};

const OnboardingFlow = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [question, setQuestion] = useState(null);
  const [answer, setAnswer] = useState('');
  const [saving, setSaving] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState('');

  const fetchNextQuestion = useCallback(async () => {
    if (!user) return;
    setFetching(true);
    setError('');

    try {
      const { data } = await axios.get('/api/onboarding/next', {
        params: { userId: user.id }
      });

      if (data.completed) {
        setCompleted(true);
        setQuestion(null);
        setAnswer('');
      } else {
        setQuestion(data.question);
        setAnswer(defaultAnswerValue(data.question));
        setCompleted(false);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to load onboarding question.');
    } finally {
      setFetching(false);
    }
  }, [user]);

  useEffect(() => {
    if (!loading && user) {
      fetchNextQuestion();
    }
  }, [loading, user, fetchNextQuestion]);

  const handleSubmit = async () => {
    if (!question) return;
    if (question.isRequired) {
      const hasValue = Array.isArray(answer)
        ? answer.length > 0
        : answer !== null && answer !== undefined && String(answer).trim() !== '';
      if (!hasValue) {
        setError('Please provide a response before continuing.');
        return;
      }
    }

    setSaving(true);
    setError('');

    try {
      await axios.post('/api/onboarding/respond', {
        userId: user.id,
        questionId: question.id,
        response: answer
      });
      await fetchNextQuestion();
    } catch (err) {
      setError(err.response?.data?.error || 'We could not save your response.');
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = async () => {
    if (!question) return;

    setSaving(true);
    setError('');
    try {
      await axios.post('/api/onboarding/skip', {
        userId: user.id,
        questionId: question.id
      });
      await fetchNextQuestion();
    } catch (err) {
      setError(err.response?.data?.error || 'We could not skip this question.');
    } finally {
      setSaving(false);
    }
  };

  if (loading || fetching) {
    return <FullscreenLoader message="Finding the next question" />;
  }

  if (completed) {
    return (
      <div className="gradient-bg onboarding-minimal">
        <div className="onboarding-minimal__logo">
          <span className="onboarding-minimal__mark">🌸</span>
          <span className="onboarding-minimal__brand">Mum.entum</span>
        </div>
        <main className="onboarding-minimal__content">
          <motion.section
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="completion-card"
          >
            <h1>Your profile is ready</h1>
            <p>
              Thank you for sharing your story. We have crafted a personalised dashboard with insights for you and your baby.
            </p>
            <button type="button" className="button button--primary" onClick={() => navigate('/dashboard')}>
              Go to dashboard
            </button>
          </motion.section>
        </main>
      </div>
    );
  }

  return (
    <div className="gradient-bg onboarding-minimal">
      {/* Logo only at top */}
      <div className="onboarding-minimal__logo">
        <span className="onboarding-minimal__mark">🌸</span>
        <span className="onboarding-minimal__brand">Mum.entum</span>
      </div>

      <main className="onboarding-minimal__content">
        <motion.section 
          key={question?.id}
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
        >
          {error && <div className="alert" style={{ marginBottom: '20px' }}>{error}</div>}
          {question && (
            <QuestionCard
              question={question}
              value={answer}
              onChange={setAnswer}
              onSubmit={handleSubmit}
              onSkip={handleSkip}
              saving={saving}
            />
          )}
        </motion.section>
      </main>
    </div>
  );
};

export default OnboardingFlow;
