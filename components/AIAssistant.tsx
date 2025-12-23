
import React, { useState } from 'react';
import { getYogaAdvice } from '../services/geminiService';
import { ChatMessage, YogaClass } from '../types';

const AIAssistant: React.FC<{availableClasses: YogaClass[]}> = ({ availableClasses }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([{role: 'model', text: 'Namastê! Como posso ajudar sua prática hoje?'}]);
  const [input, setInput] = useState('');

  const send = async () => {
    if(!input) return;
    const msg = {role: 'user' as const, text: input};
    setMessages([...messages, msg]);
    setInput('');
    const reply = await getYogaAdvice([...messages, msg], availableClasses);
    setMessages(prev => [...prev, {role: 'model', text: reply}]);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen && (
        <div className="mb-4 w-80 h-96 bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border">
          <div className="p-4 bg-[#4a6741] text-white font-bold">Maya - Assistente Zen</div>
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50 space-y-2">
            {messages.map((m, i) => <div key={i} className={`p-3 rounded-xl text-sm ${m.role === 'user' ? 'bg-[#4a6741] text-white ml-auto' : 'bg-white border'}`}>{m.text}</div>)}
          </div>
          <div className="p-2 border-t flex gap-2">
            <input value={input} onChange={e => setInput(e.target.value)} className="flex-1 p-2 bg-gray-100 rounded-lg text-sm" placeholder="Pergunte..." />
            <button onClick={send} className="p-2 bg-[#4a6741] text-white rounded-lg">↑</button>
          </div>
        </div>
      )}
      <button onClick={() => setIsOpen(!isOpen)} className="w-14 h-14 bg-[#4a6741] text-white rounded-full shadow-lg text-2xl">🧘</button>
    </div>
  );
};
export default AIAssistant;
