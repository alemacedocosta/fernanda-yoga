
import React, { useState } from 'react';
import { INITIAL_ALLOWED_EMAILS } from '../constants';

interface LoginProps { onLogin: (email: string) => void; }

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const allowed = JSON.parse(localStorage.getItem('zenyoga_allowed_emails') || JSON.stringify(INITIAL_ALLOWED_EMAILS));
    if (allowed.includes(email.toLowerCase().trim())) onLogin(email);
    else setError('Email não autorizado.');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white p-10 rounded-[2.5rem] shadow-xl text-center border">
        <div className="text-4xl mb-6">🧘</div>
        <h2 className="text-3xl font-bold mb-6 serif">Portal do Aluno</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Seu e-mail" className="w-full p-4 bg-gray-50 border rounded-2xl outline-none focus:ring-2 focus:ring-[#4a6741]" required />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" className="w-full py-4 bg-[#4a6741] text-white rounded-2xl font-bold shadow-lg">Entrar</button>
        </form>
      </div>
    </div>
  );
};

export default Login;
