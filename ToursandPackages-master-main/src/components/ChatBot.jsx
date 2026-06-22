import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Sparkles, AlertCircle, Compass, HelpCircle, Map } from 'lucide-react';

const SUGGESTIONS = [
  { text: "Suggest adventure package", icon: Compass },
  { text: "Show beach tours", icon: Map },
  { text: "How to plan a trip?", icon: HelpCircle },
];

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm **TourMate** 🌴, your interactive travel buddy. Ask me anything about our destinations, packages, or itinerary building!"
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto scroll to bottom of chat
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  const handleSendMessage = async (text) => {
    if (!text.trim()) return;

    const userMessage = { role: 'user', content: text };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.content }]);
    } catch (err) {
      console.error("Chat error:", err);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: "⚠️ *Oops! I had trouble reaching my travel database. Please check your internet connection or backend API key setup.*"
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Convert simple markdown-like text to React elements
  const formatMessage = (content) => {
    return content.split('\n').map((line, lineIdx) => {
      // Bold syntax
      let parts = line.split('**');
      let formattedLine = parts.map((part, partIdx) => {
        if (partIdx % 2 === 1) {
          return <strong key={partIdx} className="font-extrabold text-slate-950 dark:text-white">{part}</strong>;
        }
        
        // Italic/bullet syntax
        let subParts = part.split('*');
        return subParts.map((subPart, subPartIdx) => {
          if (subPartIdx % 2 === 1) {
            return <em key={subPartIdx} className="italic text-slate-800 dark:text-slate-200">{subPart}</em>;
          }
          return subPart;
        });
      });

      return (
        <p key={lineIdx} className={lineIdx > 0 ? "mt-2" : ""}>
          {formattedLine}
        </p>
      );
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      <AnimatePresence>
        {isOpen && (
          <div className="relative mb-6">
            {/* Ambient Background Glow Effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-3xl blur-xl opacity-40 dark:opacity-60 animate-pulse"></div>
            
            <motion.div
              initial={{ opacity: 0, y: 60, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 60, scale: 0.92 }}
              transition={{ type: "spring", stiffness: 280, damping: 24 }}
              className="relative w-[420px] sm:w-[480px] h-[680px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-slate-200/80 dark:border-slate-800/80 flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 px-6 py-5 flex items-center justify-between text-white shadow-lg">
                <div className="flex items-center gap-3.5">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm border border-white/30">
                      <Sparkles className="w-9 h-9 text-white animate-pulse" />
                    </div>
                    <span className="absolute bottom-0.5 right-0.5 w-4 h-4 bg-green-400 border-2 border-slate-950 rounded-full"></span>
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base tracking-wide">TourMate AI</h3>
                    <p className="text-[12px] text-emerald-100/90 font-medium">Always online • Ready to explore</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/10 active:bg-white/20 rounded-full transition-colors duration-200"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Message Area */}
              <div className="flex-1 overflow-y-auto p-5 space-y-5 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-5 py-3.5 text-[15px] leading-relaxed shadow-sm ${
                        msg.role === 'user'
                          ? 'bg-gradient-to-tr from-emerald-600 to-teal-600 text-white rounded-br-none'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none border border-slate-200/50 dark:border-slate-800/50'
                      }`}
                    >
                      {formatMessage(msg.content)}
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-2xl rounded-bl-none px-5 py-3.5 text-sm border border-slate-200/50 dark:border-slate-800/50 shadow-sm flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-2.5 h-2.5 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-2.5 h-2.5 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Suggestion Chips */}
              {messages.length === 1 && !isLoading && (
                <div className="px-5 py-3 flex flex-wrap gap-2.5 bg-slate-50/50 dark:bg-slate-950/20 border-t border-slate-100 dark:border-slate-900/50">
                  {SUGGESTIONS.map((chip, idx) => {
                    const Icon = chip.icon;
                    return (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(chip.text)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-[12px] font-bold text-slate-700 dark:text-slate-300 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
                      >
                        <Icon className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                        {chip.text}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Input Bar */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage(inputValue);
                }}
                className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800/80 flex items-center gap-3"
              >
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask about tours, pricing, locations..."
                  className="flex-1 bg-slate-100 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-[15px] px-5 py-3 rounded-full outline-none focus:ring-2 focus:ring-emerald-500/50 border border-transparent focus:border-emerald-500/80 transition-all duration-200"
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isLoading}
                  className="p-3.5 bg-gradient-to-tr from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:from-slate-300 disabled:to-slate-400 dark:disabled:from-slate-800 dark:disabled:to-slate-800 text-white rounded-full transition-all duration-200 shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95 disabled:scale-100 disabled:shadow-none"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Action Button Launcher */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.93 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-600 text-white flex items-center justify-center shadow-2xl hover:shadow-emerald-500/30 cursor-pointer relative group border-2 border-white/20"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="w-10 h-10" />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative"
            >
              <MessageSquare className="w-10 h-10" />
              <span className="absolute -top-3 -right-3 flex h-5 w-5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-5 w-5 bg-emerald-500 border-2 border-slate-950"></span>
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
