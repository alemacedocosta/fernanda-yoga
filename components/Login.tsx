
import React, { useState } from 'react';
import { db } from '../services/dbService';
import { ADMIN_EMAIL } from '../constants';

const Logo = ({ className = "w-32 h-32 mx-auto mb-6" }) => (
  <img 
    src="https://fboliveira.github.io/yoga-logo.png" 
    alt="Fernanda Yoga Logo" 
    className={`${className} object-contain`}
    loading="eager"
    onError={(e) => {
      if (e.currentTarget.src !== "https://raw.githubusercontent.com/fboliveira/fboliveira.github.io/main/yoga-logo.png") {
        e.currentTarget.src = "https://raw.githubusercontent.com/fboliveira/fboliveira.github.io/main/yoga-logo.png";
      }
    }}
  />
);

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
      if (!db.isConnected()) {
        setError('Configuração do servidor pendente (Variáveis de Ambiente).');
        setIsVerifying(false);
        return;
      }

      const allowedEmails = await db.getAlunos();
      const cleanEmail = email.toLowerCase().trim();
      
      if (allowedEmails.includes(cleanEmail) || cleanEmail === ADMIN_EMAIL) {
        onLogin(cleanEmail);
      } else {
        setError('Acesso negado. Certifique-se de que este é o e-mail cadastrado nas aulas.');
      }
    } catch (err) {
      setError('Erro ao validar acesso. Tente novamente em instantes.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#fdfaf5]">
      <div className="max-w-md w-full bg-white p-12 rounded-[3rem] shadow-2xl text-center border border-[#efe9e0]">
        <Logo />
        <h2 className="text-3xl font-bold mb-2 serif text-[#2d3a2a]">Fernanda Yoga</h2>
        <p className="text-[#8a9b86] mb-8 text-sm font-medium italic">Portal Exclusivo para Alunos</p>
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-4">E-mail Cadastrado</label>
            <input 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              placeholder="seu@email.com" 
              className="w-full p-4 bg-[#fdfaf5] border border-[#efe9e0] rounded-2xl outline-none focus:ring-2 focus:ring-[#e67e22] transition-all" 
              required 
              disabled={isVerifying}
            />
          </div>
          {error && (
            <div className="bg-red-50 p-3 rounded-xl border border-red-100">
              <p className="text-red-500 text-xs font-bold text-center leading-relaxed">{error}</p>
            </div>
          )}
          <button 
            type="submit" 
            disabled={isVerifying}
            className={`w-full py-5 text-white rounded-2xl font-bold shadow-xl transition-all active:scale-95 ${isVerifying ? 'bg-gray-300 cursor-not-allowed' : 'bg-[#e67e22] hover:bg-[#d35400] shadow-orange-100'}`}
          >
            {isVerifying ? 'Verificando...' : 'Acessar Aulas'}
          </button>
        </form>
        <div className="mt-8 pt-6 border-t border-gray-50 opacity-40">
          <p className="text-[8px] uppercase font-black tracking-widest">Acesso Seguro • Fernanda Yoga 2024</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
