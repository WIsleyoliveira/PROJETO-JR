import React, { useState, useEffect, useRef } from 'react';
import './Chatbot.css';
import chatbotService from '../services/chatbotService';

const QUICK_REPLIES = [
  'Quais serviços vocês oferecem?',
  'Como funciona o guincho 24h?',
  'Como solicitar um orçamento?'
];

function generateUserId() {
  let id = localStorage.getItem('jr_user_id');
  if (!id) {
    id = 'user_' + Math.random().toString(36).slice(2, 9);
    localStorage.setItem('jr_user_id', id);
  }
  return id;
}

export default function Chatbot() {
  const userId = useRef(generateUserId());
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem('jr_chat_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcome = { id: 'bot_welcome', text: '👋 Olá! Sou o assistente da JR Reboques. Posso tirar dúvidas sobre produtos e serviços. Pergunte algo ou escolha uma opção rápida.', sender: 'bot', timestamp: new Date() };
      setMessages([welcome]);
    }
  }, [isOpen, messages.length]);

  useEffect(() => {
    localStorage.setItem('jr_chat_history', JSON.stringify(messages));
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text) => {
    if (!text || !text.trim()) return;

    const userMsg = { id: `u_${Date.now()}`, text, sender: 'user', timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      const aiResponse = await chatbotService.sendMessageToAI(userId.current, text);
      const botMsg = { id: `b_${Date.now()}`, text: aiResponse, sender: 'bot', timestamp: new Date() };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      const errorMsg = { id: `b_${Date.now()}`, text: 'Desculpe, ocorreu um erro. Tente novamente.', sender: 'bot', timestamp: new Date() };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuick = (q) => sendMessage(q);

  const clearChat = () => {
    setMessages([]);
    setIsTyping(false);
    localStorage.removeItem('jr_chat_history');
    chatbotService.clearConversation(userId.current);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(inputText);
  };

  return (
    <div className="chatbot-container">
      <button onClick={() => setIsOpen(o => !o)} className="chatbot-button" aria-label="Abrir chat">
        {isOpen ? (
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        ) : (
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
        )}
      </button>

      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <div className="chatbot-header-info">
              <div className="chatbot-avatar">🤖</div>
              <div className="chatbot-title"><h3>Assistente JR Reboques</h3><p>Online • Responde em segundos</p></div>
            </div>
            <button onClick={clearChat} className="chatbot-close" title="Limpar conversa"> <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
          </div>

          <div className="chatbot-messages">
            {messages.map(m => (
              <div key={m.id} className={`chatbot-message ${m.sender === 'user' ? 'user' : 'bot'}`}>
                <div className="chatbot-message-content"><p style={{margin:0}}>{m.text}</p><div className="chatbot-message-time">{new Date(m.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div></div>
              </div>
            ))}

            {isTyping && (
              <div className="chatbot-message bot"><div className="chatbot-message-content"><div className="chatbot-typing"><span></span><span></span><span></span></div></div></div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {messages.length <= 1 && (
            <div className="chatbot-quick-questions" style={{padding:16, background:'white', borderTop:'1px solid #e5e7eb'}}>
              <p style={{fontSize:12, color:'#6b7280', marginBottom:8}}>Perguntas frequentes:</p>
              <div style={{display:'flex', flexWrap:'wrap', gap:8}}>
                {QUICK_REPLIES.map((q, i) => (
                  <button key={i} onClick={() => handleQuick(q)} className="chatbot-quick-question">{q}</button>
                ))}
              </div>
            </div>
          )}

          <div className="chatbot-input-area">
            <form onSubmit={handleSubmit} className="chatbot-input-form">
              <input className="chatbot-input" placeholder="Digite sua mensagem..." value={inputText} onChange={e => setInputText(e.target.value)} disabled={isTyping} />
              <button className="chatbot-send-button" type="submit" disabled={!inputText.trim() || isTyping} aria-label="Enviar mensagem"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg></button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
