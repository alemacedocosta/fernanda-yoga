
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
        setError('Acesso restrito. E-mail não encontrado na lista de alunos.');
      }
    } catch (err) {
      console.error("Erro no login:", err);
      setError('Falha na conexão com o banco de dados.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#fdfaf5]">
      <div className="max-w-md w-full bg-white p-10 rounded-[3rem] shadow-2xl text-center border border-[#efe9e0]">
        <img 
          src="https://raw.githubusercontent.com/fboliveira/fboliveira.github.io/main/yoga-logo.png" 
          alt="Fernanda Yoga" 
          className="w-24 h-24 mx-auto mb-6 object-contain"
        />
        <h2 className="text-3xl font-bold mb-2 serif text-[#2d3a2a]">Fernanda Yoga</h2>
        <p className="text-[#8a9b86] mb-8 text-sm font-medium">Portal Exclusivo do Aluno</p>
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div>
            <label className="text-xs font-bold uppercase text-[#8a9b86] tracking-widest ml-4 mb-2 block">E-mail Cadastrado</label>
            <input 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              placeholder="seu@email.com" 
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
            {isVerifying ? 'Autenticando...' : 'Acessar Práticas'}
          </button>
        </form>
        <div className="mt-8 pt-6 border-t border-gray-50">
          <p className="text-[10px] text-gray-300 uppercase font-black tracking-[0.2em]">Conexão Segura e Criptografada</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
