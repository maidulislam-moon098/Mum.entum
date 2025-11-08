import React, { useRef, useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

const ChatWidget = ({ profileSummary, userId, initialPrompt }) => {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hey! How are you doing today?' }
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const endRef = useRef(null);
  const hasHandledPrompt = useRef(false);

  // Handle initial prompt from notification
  useEffect(() => {
    if (initialPrompt && !hasHandledPrompt.current) {
      hasHandledPrompt.current = true;
      // Add the AI's question to the chat
      setMessages([
        { role: 'assistant', content: initialPrompt.question }
      ]);
      scrollToBottom();
    }
  }, [initialPrompt]);

  const scrollToBottom = () => {
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const sendMessage = async (event) => {
    event.preventDefault();
    if (!input.trim()) return;

    const newMessages = [...messages, { role: 'user', content: input.trim() }];
    setMessages(newMessages);
    setInput('');
    setSending(true);

    // Add "thinking" indicator
    const thinkingMessage = { role: 'assistant', content: '💭 Mum.entum is thinking...', isThinking: true };
    setMessages([...newMessages, thinkingMessage]);
    scrollToBottom();

    try {
      const { data } = await axios.post('/api/chat', {
        messages: newMessages,
        profileSummary,
        userId
      });

      const reply = data.reply || 'Our AI companion will be available soon.';
      // Replace thinking indicator with actual response
      setMessages([...newMessages, { role: 'assistant', content: reply }]);
      scrollToBottom();
    } catch (error) {
      setMessages([
        ...newMessages,
        { role: 'assistant', content: 'I could not reach the AI companion right now. Please try again later.' }
      ]);
    } finally {
      setSending(false);
    }
  };

  return (
    <motion.section 
      initial={{ opacity: 0, y: 16 }} 
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{
        background: 'white',
        borderRadius: '24px',
        boxShadow: '0 4px 20px rgba(240, 132, 174, 0.1)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden'
      }}
    >
      <div style={{
        overflowY: 'auto',
        flex: 1,
        padding: '30px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        {messages.map((message, index) => (
          <motion.div 
            key={index}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              alignSelf: message.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '70%',
              padding: '14px 20px',
              borderRadius: message.role === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
              background: message.role === 'user' 
                ? 'linear-gradient(135deg, #f084ae, #d9648f)' 
                : 'rgba(240, 132, 174, 0.08)',
              color: message.role === 'user' ? 'white' : '#2a2a2a',
              fontSize: '1rem',
              lineHeight: '1.5',
              fontStyle: message.isThinking ? 'italic' : 'normal'
            }}
          >
            {message.content}
          </motion.div>
        ))}
        <span ref={endRef} />
      </div>
      <form 
        onSubmit={sendMessage}
        style={{
          padding: '20px 30px',
          borderTop: '1px solid rgba(0, 0, 0, 0.06)',
          display: 'flex',
          gap: '12px'
        }}
      >
        <input
          type="text"
          placeholder="Ask about nutrition, movement, or what is normal..."
          value={input}
          onChange={(event) => setInput(event.target.value)}
          disabled={sending}
          style={{
            flex: 1,
            padding: '14px 20px',
            borderRadius: '24px',
            border: '1px solid rgba(0, 0, 0, 0.1)',
            fontSize: '1rem',
            outline: 'none'
          }}
        />
        <button 
          type="submit" 
          disabled={sending || !input.trim()}
          style={{
            padding: '14px 32px',
            borderRadius: '24px',
            border: 'none',
            background: sending || !input.trim() 
              ? '#e0e0e0' 
              : 'linear-gradient(135deg, #4fb3a6, #3a8f85)',
            color: 'white',
            fontWeight: '600',
            cursor: sending || !input.trim() ? 'not-allowed' : 'pointer',
            fontSize: '1rem'
          }}
        >
          {sending ? '...' : 'Send'}
        </button>
      </form>
    </motion.section>
  );
};

export default ChatWidget;
