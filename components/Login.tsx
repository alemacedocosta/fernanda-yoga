
import React, { useState } from 'react';
import { db } from '../services/dbService';
import { ADMIN_EMAIL } from '../constants';

interface LoginProps { onLogin: (email: string) => void; }

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setError('');
    
    try {
      const allowedEmails = await db.getAlunos();
      const cleanEmail = email.toLowerCase().trim();
      
      if (allowedEmails.includes(cleanEmail) || cleanEmail === ADMIN_EMAIL) {
        onLogin(cleanEmail);
      } else {
        setError('Acesso não autorizado para este e-mail.');
      }
    } catch (err) {
      console.error("Erro no login:", err);
      setError('Erro ao conectar com o servidor. Tente novamente.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#fdfaf5]">
      <div className="max-w-md w-full bg-white p-10 rounded-[3rem] shadow-2xl text-center border border-[#efe9e0]">
        <div className="w-20 h-20 bg-[#f0f4f1] rounded-3xl flex items-center justify-center text-4xl mx-auto mb-8 shadow-inner">🧘‍♀️</div>
        <h2 className="text-3xl font-bold mb-2 serif text-[#2d3a2a]">Fernanda Yoga</h2>
        <p className="text-[#8a9b86] mb-8 text-sm">Bem-vindo à sua prática pessoal</p>
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div>
            <label className="text-xs font-bold uppercase text-[#8a9b86] tracking-widest ml-4 mb-2 block">Seu E-mail de Aluno</label>
            <input 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              placeholder="aluno@email.com" 
              className="w-full p-4 bg-[#fdfaf5] border border-[#efe9e0] rounded-2xl outline-none focus:ring-2 focus:ring-[#4a6741] transition-all" 
              disabled={isVerifying}
              required 
            />
          </div>
          {error && <p className="text-red-400 text-xs px-4 font-bold">{error}</p>}
          <button 
            type="submit" 
            disabled={isVerifying}
            className={`w-full py-5 text-white rounded-2xl font-bold shadow-xl transition-all active:scale-[0.98] ${isVerifying ? 'bg-gray-400 shadow-none' : 'bg-[#4a6741] shadow-green-100 hover:bg-[#3d5435]'}`}
          >
            {isVerifying ? 'Verificando...' : 'Entrar no Portal'}
          </button>
        </form>
        <p className="mt-8 text-[10px] text-gray-300 uppercase font-bold tracking-[0.2em]">Exclusivo para Membros</p>
      </div>
    </div>
  );
};

export default Login;
