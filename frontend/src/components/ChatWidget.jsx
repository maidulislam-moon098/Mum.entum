import React, { useRef, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

const ChatWidget = ({ profileSummary }) => {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi! I am here whenever you need a listening ear or gentle guidance.' }
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const endRef = useRef(null);

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

    try {
      const { data } = await axios.post('/api/chat', {
        messages: newMessages,
        profileSummary
      });

      const reply = data.reply || 'Our AI companion will be available soon.';
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
    <motion.section className="chat-widget" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <header>
  <h2>Ask Mum.entum AI</h2>
        <p>Feel supported with empathetic, evidence-informed responses 24/7.</p>
      </header>
      <div className="chat-widget__messages">
        {messages.map((message, index) => (
          <div key={index} className={`chat-bubble chat-bubble--${message.role}`}>
            <p>{message.content}</p>
          </div>
        ))}
        <span ref={endRef} />
      </div>
      <form onSubmit={sendMessage} className="chat-widget__input">
        <input
          type="text"
          placeholder="Ask about nutrition, movement, or what is normal..."
          value={input}
          onChange={(event) => setInput(event.target.value)}
        />
        <button type="submit" className="button button--primary" disabled={sending}>
          {sending ? 'Sending…' : 'Send'}
        </button>
      </form>
    </motion.section>
  );
};

export default ChatWidget;
