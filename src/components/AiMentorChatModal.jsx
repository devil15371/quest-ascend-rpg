import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Sparkles, Bot, Key, ArrowRight, RefreshCw, Layers, CheckCircle2, Flame, Brain, BookOpen, Zap } from 'lucide-react';
import { streamChatWithAppAwareAi, getStoredGeminiApiKey, saveGeminiApiKey } from '../utils/geminiAiService';
import { audio } from '../utils/audioEngine';
import { triggerHapticFeedback } from '../utils/mobileNative';

export default function AiMentorChatModal({ isOpen, onClose, userData, setUserData }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Greetings, **${userData?.profile?.name || 'Scholar'}**! I am your AI Quantum Mentor. I have full real-time telemetry of your GATE curriculum, completed lectures, EXP rank, and Brain Matrix memory retention.\n\nAsk me anything about your study strategy, weak areas, or difficult GATE concepts!`
    }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [tempApiKey, setTempApiKey] = useState(getStoredGeminiApiKey());
  
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend) => {
    const query = (textToSend || inputVal).trim();
    if (!query || isLoading) return;

    audio.playClick();
    triggerHapticFeedback('light');

    const updatedHistory = [...messages, { role: 'user', content: query }];
    
    // Add placeholder assistant message for live streaming
    setMessages([...updatedHistory, { role: 'assistant', content: '...' }]);
    setInputVal('');
    setIsLoading(true);

    try {
      await streamChatWithAppAwareAi(
        updatedHistory,
        userData,
        (liveChunk) => {
          setMessages([...updatedHistory, { role: 'assistant', content: liveChunk }]);
          scrollToBottom();
        }
      );
      audio.playLevelUp();
    } catch (err) {
      setMessages([
        ...updatedHistory,
        {
          role: 'assistant',
          content: `⚠️ Error: ${err.message}. Serving instant offline advice.`
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveKey = (e) => {
    e.preventDefault();
    saveGeminiApiKey(tempApiKey);
    setShowKeyInput(false);
    audio.playClick();
    triggerHapticFeedback('medium');
    setMessages(prev => [
      ...prev,
      {
        role: 'assistant',
        content: `✅ Gemini API Key updated! Real-time streaming is active.`
      }
    ]);
  };

  const quickPrompts = [
    "🎯 What should I study next based on my progress?",
    "🖤 How do I purge my active Heart Demons?",
    "⚡ Check my readiness for next Realm Breakthrough",
    "💡 Create a 3-hour study plan for today"
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/90 backdrop-blur-xl animate-fade-in font-orbitron">
      <div className="cyber-panel max-w-2xl w-full h-[620px] max-h-[90vh] rounded-3xl p-4 sm:p-6 border-2 border-cyan-500/60 shadow-2xl relative bg-slate-950/95 cyber-hud-brackets flex flex-col justify-between">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-400 via-purple-500 to-pink-500 p-0.5 shadow-lg shadow-cyan-500/30 animate-pulse">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center text-xl">
                🤖
              </div>
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white uppercase flex items-center gap-2">
                <span>AI QUANTUM MENTOR</span>
                <span className="text-[9px] font-extrabold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-cyan-400 animate-pulse" />
                  SUB-SECOND STREAMING
                </span>
              </h3>
              <p className="text-[11px] font-rajdhani text-slate-400">
                Full-App Analysis • Real-time GATE CS Study Intelligence
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowKeyInput(!showKeyInput)}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-cyan-400 text-xs"
              title="Configure Gemini API Key"
            >
              <Key className="w-4 h-4" />
            </button>
            <button 
              onClick={onClose} 
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* In-Modal Key Setup Bar */}
        {showKeyInput && (
          <form onSubmit={handleSaveKey} className="p-3 my-2 rounded-2xl bg-cyan-950/40 border border-cyan-500/40 flex items-center gap-2 animate-fade-in">
            <Key className="w-4 h-4 text-cyan-400 flex-shrink-0" />
            <input
              type="password"
              placeholder="Paste Google Gemini API Key (Free)"
              value={tempApiKey}
              onChange={(e) => setTempApiKey(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
            />
            <button
              type="submit"
              className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs"
            >
              Save Key
            </button>
          </form>
        )}

        {/* Message Feed */}
        <div className="flex-1 overflow-y-auto space-y-3.5 my-3 pr-1 scrollbar-thin scrollbar-thumb-slate-800">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex items-start gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-lg bg-cyan-950 border border-cyan-400/40 flex items-center justify-center text-sm flex-shrink-0 mt-0.5">
                  🤖
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[80%] rounded-2xl p-3.5 text-xs font-rajdhani leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-cyan-600 text-slate-950 font-bold rounded-tr-none shadow-md shadow-cyan-600/20'
                    : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none shadow-lg whitespace-pre-wrap'
                }`}
              >
                {msg.content}
              </div>

              {msg.role === 'user' && (
                <div className="w-7 h-7 rounded-lg bg-purple-950 border border-purple-400/40 flex items-center justify-center text-sm flex-shrink-0 mt-0.5">
                  🧙‍♂️
                </div>
              )}
            </div>
          ))}

          {isLoading && messages[messages.length - 1]?.content === '...' && (
            <div className="flex items-center gap-2 text-xs font-rajdhani text-cyan-400 bg-slate-900/60 p-3 rounded-2xl border border-cyan-500/20 w-fit">
              <Sparkles className="w-4 h-4 animate-spin text-cyan-400" />
              <span>Quantum Mentor is streaming response...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="flex items-center gap-2 overflow-x-auto py-1.5 scrollbar-none">
          {quickPrompts.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(prompt)}
              className="px-2.5 py-1 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/50 text-[11px] font-rajdhani text-slate-300 whitespace-nowrap transition flex-shrink-0 active:scale-95"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Chat Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2 pt-2 border-t border-slate-800"
        >
          <input
            type="text"
            placeholder="Ask about your study strategy, weak areas, or difficult GATE concepts..."
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            disabled={isLoading}
            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 font-rajdhani text-sm"
          />
          <button
            type="submit"
            disabled={!inputVal.trim() || isLoading}
            className="p-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 font-bold transition active:scale-95 flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
}
