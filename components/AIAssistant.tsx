
import React, { useState } from 'react';
import { getYogaAdvice } from '../services/geminiService';
import { ChatMessage, YogaClass } from '../types';

const AIAssistant: React.FC<{availableClasses: YogaClass[]}> = ({ availableClasses }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([{role: 'model', text: 'Namastê! Como posso ajudar sua prática hoje?'}]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const send = async () => {
    if(!input || loading) return;
    setLoading(true);
    const msg = {role: 'user' as const, text: input};
    setMessages([...messages, msg]);
    setInput('');
    const reply = await getYogaAdvice([...messages, msg], availableClasses);
    setMessages(prev => [...prev, {role: 'model', text: reply}]);
    setLoading(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen && (
        <div className="mb-4 w-[320px] h-[450px] bg-white rounded-[2rem] shadow-2xl flex flex-col overflow-hidden border border-[#efe9e0] animate-in slide-in-from-bottom-4 duration-300">
          <div className="p-5 bg-[#4a6741] text-white flex items-center justify-between">
             <div className="flex items-center gap-2">
               <span className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">✨</span>
               <span className="font-bold">Maya - Guia Zen</span>
             </div>
             <button onClick={() => setIsOpen(false)} className="text-white/60 hover:text-white">✕</button>
          </div>
          <div className="flex-1 p-5 overflow-y-auto bg-[#fdfaf5] space-y-3 no-scrollbar">
            {messages.map((m, i) => (
              <div key={i} className={`p-4 rounded-[1.5rem] text-sm leading-relaxed ${m.role === 'user' ? 'bg-[#4a6741] text-white ml-8 shadow-sm rounded-br-none' : 'bg-white border border-[#efe9e0] mr-8 shadow-sm rounded-bl-none text-[#4a5a46]'}`}>
                {m.text}
              </div>
            ))}
            {loading && (
              <div className="flex gap-1 p-3 bg-white border border-[#efe9e0] rounded-2xl w-16 items-center justify-center animate-pulse">
                <div className="w-1 h-1 bg-green-300 rounded-full"></div>
                <div className="w-1 h-1 bg-green-400 rounded-full"></div>
                <div className="w-1 h-1 bg-green-300 rounded-full"></div>
              </div>
            )}
          </div>
          <div className="p-4 bg-white border-t border-[#efe9e0] flex gap-2">
            <input 
              value={input} 
              onChange={e => setInput(e.target.value)} 
              onKeyPress={(e) => e.key === 'Enter' && send()}
              className="flex-1 px-4 py-3 bg-gray-50 rounded-xl text-sm outline-none focus:ring-1 focus:ring-[#4a6741]" 
              placeholder="Qual sua intenção hoje?" 
            />
            <button onClick={send} className="w-11 h-11 bg-[#4a6741] text-white rounded-xl flex items-center justify-center shadow-lg active:scale-95 transition-all">↑</button>
          </div>
        </div>
      )}
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className={`w-16 h-16 rounded-full shadow-2xl flex items-center justify-center text-3xl transition-all duration-500 hover:scale-110 active:scale-95 ${isOpen ? 'bg-white text-[#4a6741] border-2 border-[#4a6741] rotate-90' : 'bg-[#4a6741] text-white'}`}
      >
        {isOpen ? '✕' : '🧘'}
      </button>
    </div>
  );
};
export default AIAssistant;
