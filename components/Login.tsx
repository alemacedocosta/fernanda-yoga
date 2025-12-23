
import React, { useState } from 'react';
import { INITIAL_ALLOWED_EMAILS } from '../constants';

interface LoginProps { onLogin: (email: string) => void; }

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const stored = localStorage.getItem('zenyoga_db_allowed_emails');
      const allowed: string[] = stored ? JSON.parse(stored) : INITIAL_ALLOWED_EMAILS;
      
      if (allowed.includes(email.toLowerCase().trim())) {
        onLogin(email);
      } else {
        setError('Acesso não autorizado para este e-mail.');
      }
    } catch (err) {
      console.error("Erro no login:", err);
      // Fallback em caso de erro no storage
      if (email === 'admin@zenyoga.com') onLogin(email);
      else setError('Ocorreu um erro ao verificar seu acesso.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#fdfaf5]">
      <div className="max-w-md w-full bg-white p-10 rounded-[3rem] shadow-2xl text-center border border-[#efe9e0]">
        <div className="w-20 h-20 bg-[#f0f4f1] rounded-3xl flex items-center justify-center text-4xl mx-auto mb-8 shadow-inner">🧘</div>
        <h2 className="text-3xl font-bold mb-2 serif text-[#2d3a2a]">ZenYoga Studio</h2>
        <p className="text-[#8a9b86] mb-8 text-sm">Entre no seu espaço sagrado</p>
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div>
            <label className="text-xs font-bold uppercase text-[#8a9b86] tracking-widest ml-4 mb-2 block">E-mail de Aluno</label>
            <input 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              placeholder="seu@email.com" 
              className="w-full p-4 bg-[#fdfaf5] border border-[#efe9e0] rounded-2xl outline-none focus:ring-2 focus:ring-[#4a6741] transition-all" 
              required 
            />
          </div>
          {error && <p className="text-red-400 text-xs px-4 font-bold">{error}</p>}
          <button type="submit" className="w-full py-5 bg-[#4a6741] text-white rounded-2xl font-bold shadow-xl shadow-green-100 hover:bg-[#3d5435] transition-all active:scale-[0.98]">
            Acessar Portal
          </button>
        </form>
        <p className="mt-8 text-[10px] text-gray-300 uppercase font-bold tracking-[0.2em]">Exclusivo para Membros</p>
      </div>
    </div>
  );
};

export default Login;
