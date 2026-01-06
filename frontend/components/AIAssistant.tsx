import React, { useState, useRef, useEffect } from 'react';
import { InvestigationCase, Message } from '../types';
import { detectiveAI } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface AIAssistantProps {
  activeCase: InvestigationCase;
  onAnalyzeTimeline?: () => void;
  onAnalyzeSuspect?: (suspectId: string) => void;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ activeCase, onAnalyzeTimeline, onAnalyzeSuspect }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "I am your AI Analyst, ready to assist with the investigation. **What shall we explore first?**",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (message?: string) => {
    const messageToSend = message || input.trim();
    if (!messageToSend || isTyping) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: messageToSend,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await detectiveAI.analyzeCase(activeCase, messageToSend);
      const assistantMessage: Message = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      console.error(err);
      const errorMessage: Message = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: "I apologize, but I was unable to process your request. Check your connection or API key.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickPrompt = async (type: 'timeline' | 'suspect' | 'theory', id?: string) => {
    if (type === 'timeline') {
      if (onAnalyzeTimeline) onAnalyzeTimeline();
      await handleSend("Analyze the timeline for any inconsistencies, gaps, or suspicious patterns.");
    } else if (type === 'suspect' && id) {
      const suspect = activeCase.parties.find(s => s.id === id);
      if (suspect) {
        if (onAnalyzeSuspect) onAnalyzeSuspect(id);
        await handleSend(`Analyze suspect **${suspect.name}**. Examine their alibi, motive, and any statements they've made.`);
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#050505] border-l border-white/5 font-sans">
      {/* Modern Header */}
      <div className="p-6 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-[#0a0a0a] to-[#0a0a0a]/80 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#d4af37]/10 flex items-center justify-center border border-[#d4af37]/30">
            <svg className="w-4 h-4 text-[#d4af37]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0012 18.75c-1.03 0-1.9-.4-2.593-.91a3.375 3.375 0 00-.547-.547z" />
            </svg>
          </div>
          <div>
            <h3 className="text-xs font-bold text-white tracking-[0.2em] uppercase">AI Laboratory</h3>
            <p className="text-[10px] text-[#d4af37]/60 mt-0.5 uppercase tracking-widest font-medium">Benoit Blanc v1.4</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-white/5 py-1 px-2.5 rounded-full border border-white/5">
          <div className={`w-1.5 h-1.5 rounded-full ${isTyping ? 'bg-yellow-500 animate-pulse' : 'bg-green-500/50'}`} />
          <span className="text-[9px] text-white/40 uppercase tracking-widest font-bold">Analyst Online</span>
        </div>
      </div>

      {/* Modern Messages Area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-8 scroll-smooth"
        style={{ scrollbarWidth: 'none' }}
      >
        {messages.map((m) => (
          <div key={m.id} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'} max-w-full group animate-in fade-in slide-in-from-bottom-2 duration-300`}>
            <div className="flex items-center gap-2 mb-2 px-1">
              <span className="text-[9px] uppercase tracking-[0.2em] text-white/20 font-bold">
                {m.role === 'assistant' ? 'AI ANALYST' : 'INVESTIGATOR'}
              </span>
              <span className="text-[8px] text-white/10 font-mono">
                {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            <div className={`p-5 rounded-sm text-sm leading-relaxed max-w-[95%] shadow-2xl transition-all ${m.role === 'assistant'
              ? 'bg-gradient-to-br from-[#111] to-[#0a0a0a] border border-white/10 text-white/80'
              : 'bg-gradient-to-br from-[#d4af37]/10 to-[#d4af37]/5 border border-[#d4af37]/20 text-white/90'
              }`}>
              <div className="markdown-content prose prose-invert prose-sm max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {m.content}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex flex-col items-start animate-in fade-in duration-300">
            <span className="text-[9px] uppercase tracking-[0.2em] text-[#d4af37]/40 mb-2 px-1 font-bold">AI ANALYST IS THINKING</span>
            <div className="bg-[#111] border border-white/10 p-4 rounded-sm shadow-xl">
              <div className="flex gap-2">
                <div className="w-1 h-1 bg-[#d4af37] rounded-full animate-bounce [animation-delay:-0.3s]" />
                <div className="w-1 h-1 bg-[#d4af37] rounded-full animate-bounce [animation-delay:-0.15s]" />
                <div className="w-1 h-1 bg-[#d4af37] rounded-full animate-bounce" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Redesigned Quick Prompts */}
      <div className="px-6 py-4 bg-[#0a0a0a]/80 backdrop-blur-md border-t border-white/5">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleQuickPrompt('timeline')}
            disabled={isTyping}
            className="flex items-center gap-2 px-3 py-1.5 text-[9px] uppercase tracking-widest font-bold bg-white/5 hover:bg-white/10 border border-white/10 text-white/40 hover:text-white transition-all rounded-sm disabled:opacity-30"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Analyze Timeline
          </button>
          {activeCase.parties.slice(0, 2).map(suspect => (
            <button
              key={suspect.id}
              onClick={() => handleQuickPrompt('suspect', suspect.id)}
              disabled={isTyping}
              className="flex items-center gap-2 px-3 py-1.5 text-[9px] uppercase tracking-widest font-bold bg-[#d4af37]/5 hover:bg-[#d4af37]/10 border border-[#d4af37]/20 text-[#d4af37]/60 hover:text-[#d4af37] transition-all rounded-sm disabled:opacity-30"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              View: {suspect.name.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Redesigned Input Container */}
      <div className="p-6 bg-[#0a0a0a] border-t border-white/5">
        <div className="relative group transition-all">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-[#d4af37]/0 via-[#d4af37]/5 to-[#d4af37]/0 opacity-0 group-focus-within:opacity-100 transition-opacity blur shadow-2xl" />
          <div className="relative flex flex-col items-stretch">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Inject logical inquiry..."
              disabled={isTyping}
              className="w-full bg-[#111] border border-white/10 focus:border-[#d4af37]/50 p-4 pr-14 text-sm text-white/90 outline-none h-24 resize-none transition-all placeholder:text-white/10 rounded-sm disabled:opacity-50 font-serif italic"
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isTyping}
              className="absolute bottom-4 right-4 p-2 bg-[#d4af37]/10 hover:bg-[#d4af37] text-[#d4af37] hover:text-black transition-all rounded-sm disabled:opacity-0 group-focus-within:translate-y-0 translate-y-2 opacity-0 group-focus-within:opacity-100"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            </button>
          </div>
        </div>
        <div className="mt-3 flex justify-between items-center opacity-40">
          <span className="text-[8px] uppercase tracking-[0.2em] font-bold text-white/50">Secure Encryption Enabled</span>
          <span className="text-[8px] uppercase tracking-[0.2em] font-bold text-white/50">Return to Submit</span>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
