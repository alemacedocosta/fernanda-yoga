
import React, { useState } from 'react';
import { db } from '../services/dbService';
import { ADMIN_EMAIL, LOGO_URL } from '../constants';

interface LoginProps { onLogin: (email: string) => void; }

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    const cleanEmail = email.toLowerCase().trim();

    try {
      if (cleanEmail === ADMIN_EMAIL) {
        onLogin(cleanEmail);
        return;
      }

      const allowedEmails = await db.getAlunos();
      if (allowedEmails.includes(cleanEmail)) {
        onLogin(cleanEmail);
      } else {
        setError('Acesso não autorizado. Entre em contato com a Fernanda.');
      }
    } catch (err) {
      setError('Erro de conexão. Tente novamente em instantes.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#fdfaf5]">
      <div className="max-w-md w-full bg-white p-10 md:p-12 rounded-[3rem] shadow-sm border border-[#efe9e0] text-center animate-in fade-in zoom-in-95 duration-500">
        <img src={LOGO_URL} alt="Fernanda Yoga" className="w-24 h-24 mx-auto mb-6 object-contain" />
        <h2 className="text-3xl font-bold mb-2 serif text-[#2d3a2a]">Fernanda Yoga</h2>
        <p className="text-[#8a9b86] mb-10 text-[10px] font-bold tracking-[0.2em] uppercase opacity-70">Portal Exclusivo</p>
        
        <form onSubmit={handleSubmit} className="space-y-6 text-left">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-4">E-mail de Aluno</label>
            <input 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              placeholder="seu@email.com" 
              className="w-full p-4 bg-gray-50 border border-stone-100 rounded-2xl outline-none focus:ring-2 focus:ring-[#e67e22] transition-all" 
              required 
            />
          </div>
          
          {error && (
            <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
              <p className="text-orange-700 text-[10px] font-bold text-center uppercase tracking-wider">{error}</p>
            </div>
          )}

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full py-5 bg-[#e67e22] hover:bg-[#d35400] text-white rounded-2xl font-bold shadow-xl shadow-orange-900/10 transition-all active:scale-95 disabled:opacity-50"
          >
            {isLoading ? 'Autenticando...' : 'Entrar no Tapetinho'}
          </button>
        </form>
        
        <div className="mt-12 pt-8 border-t border-stone-50">
          <p className="text-[9px] uppercase font-black tracking-[0.3em] text-[#4a6741] opacity-40">Respire • Pratique • Evolua</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
