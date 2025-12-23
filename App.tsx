
import React, { useState, useEffect, useMemo } from 'react';
import Login from './components/Login';
import VideoCard from './components/VideoCard';
import { ADMIN_EMAIL } from './constants';
import { User, YogaClass, YogaCategory } from './types';
import { db } from './services/dbService';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [selectedClass, setSelectedClass] = useState<YogaClass | null>(null);
  const [activeCategory, setActiveCategory] = useState<YogaCategory | 'Todas' | 'Concluídas'>('Todas');
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  
  const [allowedEmails, setAllowedEmails] = useState<string[]>([]);
  const [yogaClasses, setYogaClasses] = useState<YogaClass[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [adminTab, setAdminTab] = useState<'alunos' | 'aulas'>('alunos');
  
  const [newEmail, setNewEmail] = useState('');
  const [newClass, setNewClass] = useState<Partial<YogaClass>>({
    category: YogaCategory.HATHA,
    level: 'Iniciante',
    duration: '20 min'
  });

  const radius = 54;
  const circumference = 2 * Math.PI * radius;

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [emails, classes] = await Promise.all([
        db.getAlunos(),
        db.getClasses()
      ]);
      setAllowedEmails(emails);
      setYogaClasses(classes);
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleLogin = (email: string) => {
    const name = email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1);
    setUser({ email, name, isLoggedIn: true, completedClasses: [] });
  };

  const extractYouTubeId = (url: string) => {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : url;
  };

  const toggleCompletion = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCompletedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const progressPercentage = useMemo(() => {
    if (yogaClasses.length === 0) return 0;
    return Math.round((completedIds.length / yogaClasses.length) * 100);
  }, [completedIds, yogaClasses]);

  const filteredClasses = useMemo(() => {
    let classes = yogaClasses;
    if (activeCategory === 'Concluídas') {
      classes = yogaClasses.filter(c => completedIds.includes(c.id));
    } else if (activeCategory !== 'Todas') {
      classes = yogaClasses.filter(c => c.category === activeCategory);
    }
    return classes;
  }, [activeCategory, completedIds, yogaClasses]);

  const handleAddClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClass.title || !newClass.youtubeId) return;
    
    const ytId = extractYouTubeId(newClass.youtubeId);
    const id = Date.now().toString();
    const classToAdd: YogaClass = {
      id,
      title: newClass.title,
      description: newClass.description || '',
      youtubeId: ytId,
      category: newClass.category as YogaCategory,
      duration: newClass.duration || '20 min',
      level: newClass.level as any,
      thumbnailUrl: `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`
    };
    
    const updated = await db.saveClass(classToAdd);
    setYogaClasses(updated);
    setNewClass({ category: YogaCategory.HATHA, level: 'Iniciante', duration: '20 min' });
  };

  const handleDeleteClass = async (id: string) => {
    if (window.confirm("Deseja realmente excluir esta aula?")) {
      const updated = await db.deleteClass(id);
      setYogaClasses(updated);
    }
  };

  const handleAddAluno = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail) return;
    const updated = await db.saveAluno(newEmail);
    setAllowedEmails(updated);
    setNewEmail('');
  };

  const handleDeleteAluno = async (email: string) => {
    if (email === ADMIN_EMAIL) return;
    if (window.confirm(`Remover acesso de ${email}?`)) {
      const updated = await db.deleteAluno(email);
      setAllowedEmails(updated);
    }
  };

  if (!user) return <Login onLogin={handleLogin} />;
  const isAdmin = user.email === ADMIN_EMAIL;

  return (
    <div className="min-h-screen pb-24">
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-[#f0f4f1] px-4 md:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveCategory('Todas')}>
            <img src="https://raw.githubusercontent.com/fboliveira/fboliveira.github.io/main/yoga-logo.png" alt="Fernanda Yoga" className="w-12 h-12 object-contain" />
            <span className="text-xl font-bold text-[#2d3a2a] serif tracking-tight hidden sm:block">Fernanda Yoga</span>
          </div>
          <div className="flex items-center gap-4">
            {isAdmin && (
              <button onClick={() => setShowAdminPanel(true)} className="flex items-center gap-2 px-4 py-2 bg-[#4a6741] text-white rounded-xl text-sm font-bold shadow-md hover:bg-[#3d5435] transition-all">
                Administração
              </button>
            )}
            <button onClick={() => setUser(null)} className="p-2 text-[#6b7c67] hover:bg-[#f0f4f1] rounded-full transition-colors font-bold text-sm">
              Sair
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-12 h-12 border-4 border-[#4a6741] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[#8a9b86] font-medium animate-pulse">Conectando ao seu portal...</p>
          </div>
        ) : (
          <>
            <section className="bg-white rounded-[2.5rem] p-6 md:p-10 border border-[#efe9e0] shadow-sm mb-12 flex flex-col md:flex-row items-center gap-8">
              <div className="relative w-32 h-32 flex-shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 128 128">
                  <circle cx="64" cy="64" r={radius} stroke="#f0f4f1" strokeWidth="8" fill="transparent" />
                  <circle cx="64" cy="64" r={radius} stroke="#4a6741" strokeWidth="8" fill="transparent" strokeDasharray={circumference} strokeDashoffset={circumference - (circumference * progressPercentage) / 100} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-[#2d3a2a]">{progressPercentage}%</span>
                  <span className="text-[10px] text-[#8a9b86] uppercase font-bold tracking-tighter">Concluído</span>
                </div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-bold text-[#2d3a2a] mb-2 serif">Olá, {user.name}</h2>
                <p className="text-[#6b7c67]">Você já completou {completedIds.length} das {yogaClasses.length} práticas disponíveis nesta sessão.</p>
              </div>
            </section>

            <div className="flex overflow-x-auto pb-6 gap-3 no-scrollbar mb-8">
              <button onClick={() => setActiveCategory('Todas')} className={`px-6 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${activeCategory === 'Todas' ? 'bg-[#4a6741] text-white shadow-lg shadow-green-100' : 'bg-white text-[#6b7c67] border border-[#efe9e0] hover:border-[#4a6741]'}`}>Todas</button>
              <button onClick={() => setActiveCategory('Concluídas')} className={`px-6 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${activeCategory === 'Concluídas' ? 'bg-[#b8860b] text-white shadow-lg shadow-amber-100' : 'bg-white text-[#6b7c67] border border-[#efe9e0] hover:border-[#b8860b]'}`}>Minhas Concluídas</button>
              {Object.values(YogaCategory).map((cat) => (
                <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-6 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${activeCategory === cat ? 'bg-[#4a6741] text-white shadow-lg shadow-green-100' : 'bg-white text-[#6b7c67] border border-[#efe9e0] hover:border-[#4a6741]'}`}>{cat}</button>
              ))}
            </div>

            {filteredClasses.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-[#efe9e0]">
                <p className="text-[#8a9b86]">Ainda não há aulas disponíveis nesta categoria.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredClasses.map((yogaClass) => (
                  <VideoCard key={yogaClass.id} yogaClass={yogaClass} isCompleted={completedIds.includes(yogaClass.id)} onToggleComplete={toggleCompletion} onClick={setSelectedClass} />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {showAdminPanel && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b flex justify-between items-center bg-[#fdfaf5]">
              <div>
                <h2 className="text-xl font-bold serif text-[#2d3a2a]">Painel Administrativo</h2>
                <p className="text-[10px] text-[#4a6741] uppercase font-bold tracking-wider">Sistema de Gerenciamento Online</p>
              </div>
              <button onClick={() => setShowAdminPanel(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400">✕</button>
            </div>
            <div className="flex border-b">
              <button onClick={() => setAdminTab('alunos')} className={`flex-1 py-4 font-bold transition-colors ${adminTab === 'alunos' ? 'text-[#4a6741] border-b-2 border-[#4a6741]' : 'text-gray-400 hover:text-gray-600'}`}>Alunos Autorizados</button>
              <button onClick={() => setAdminTab('aulas')} className={`flex-1 py-4 font-bold transition-colors ${adminTab === 'aulas' ? 'text-[#4a6741] border-b-2 border-[#4a6741]' : 'text-gray-400 hover:text-gray-600'}`}>Catálogo de Aulas</button>
            </div>
            <div className="p-8 overflow-y-auto bg-white">
              {adminTab === 'alunos' ? (
                <div>
                  <form onSubmit={handleAddAluno} className="flex gap-2 mb-8">
                    <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="Email do novo aluno..." className="flex-1 p-3 border border-[#efe9e0] rounded-xl outline-none focus:ring-2 focus:ring-[#4a6741]" required />
                    <button type="submit" className="px-6 bg-[#4a6741] text-white rounded-xl font-bold hover:bg-[#3d5435] transition-colors">Autorizar</button>
                  </form>
                  <div className="space-y-2">
                    {allowedEmails.map(e => (
                      <div key={e} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-[#efe9e0]">
                        <span className="text-gray-700 font-medium">{e}</span> 
                        {e !== ADMIN_EMAIL && <button onClick={() => handleDeleteAluno(e)} className="text-red-400 font-bold p-2 hover:bg-red-50 rounded-lg">✕</button>}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <form onSubmit={handleAddClass} className="space-y-4 mb-8 p-6 bg-gray-100/50 rounded-2xl border border-[#efe9e0]">
                    <input type="text" placeholder="Título da Prática" value={newClass.title || ''} onChange={e => setNewClass({...newClass, title: e.target.value})} className="w-full p-3 border border-white rounded-xl shadow-sm outline-none" required />
                    <input type="text" placeholder="URL do YouTube" value={newClass.youtubeId || ''} onChange={e => setNewClass({...newClass, youtubeId: e.target.value})} className="w-full p-3 border border-white rounded-xl shadow-sm outline-none" required />
                    <div className="grid grid-cols-2 gap-4">
                      <select value={newClass.category} onChange={e => setNewClass({...newClass, category: e.target.value as YogaCategory})} className="p-3 bg-white border-white rounded-xl outline-none shadow-sm font-semibold text-gray-600">
                        {Object.values(YogaCategory).map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <select value={newClass.level} onChange={e => setNewClass({...newClass, level: e.target.value as any})} className="p-3 bg-white border-white rounded-xl outline-none shadow-sm font-semibold text-gray-600">
                        <option value="Iniciante">Iniciante</option>
                        <option value="Intermediário">Intermediário</option>
                        <option value="Avançado">Avançado</option>
                      </select>
                    </div>
                    <button type="submit" className="w-full py-4 bg-[#4a6741] text-white rounded-xl font-bold shadow-lg shadow-green-100">Adicionar à Grade Curricular</button>
                  </form>
                  <div className="space-y-3">
                    {yogaClasses.map(c => (
                      <div key={c.id} className="flex justify-between items-center p-3 bg-white rounded-xl border border-[#efe9e0]">
                        <div className="flex items-center gap-4">
                           <img src={`https://img.youtube.com/vi/${c.youtubeId}/default.jpg`} className="w-16 h-10 object-cover rounded-lg" />
                           <span className="font-bold text-[#2d3a2a] truncate max-w-[150px]">{c.title}</span>
                        </div>
                        <button onClick={() => handleDeleteClass(c.id)} className="text-gray-300 hover:text-red-500 transition-colors p-2">✕</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {selectedClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md">
          <div className="w-full max-w-5xl bg-[#1a1c18] rounded-[2.5rem] overflow-hidden shadow-2xl">
            <div className="p-6 flex justify-between items-center text-white bg-[#1a1c18]">
              <div className="flex flex-col">
                <span className="text-[10px] text-[#4a6741] uppercase font-black tracking-widest">{selectedClass.category}</span>
                <h3 className="text-xl font-bold serif">{selectedClass.title}</h3>
              </div>
              <button onClick={() => setSelectedClass(null)} className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">✕</button>
            </div>
            <div className="relative aspect-video bg-black shadow-inner">
              <iframe 
                className="absolute inset-0 w-full h-full" 
                src={`https://www.youtube.com/embed/${selectedClass.youtubeId}?autoplay=1&rel=0`} 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
              ></iframe>
            </div>
            <div className="p-8 flex flex-col md:flex-row gap-6 items-center justify-between bg-white">
              <p className="text-[#6b7c67] flex-1">{selectedClass.description}</p>
              <button onClick={() => {toggleCompletion(selectedClass.id); setSelectedClass(null);}} className={`px-10 py-4 rounded-2xl font-bold shadow-xl transition-all ${completedIds.includes(selectedClass.id) ? 'bg-gray-100 text-gray-400' : 'bg-[#4a6741] text-white hover:bg-[#3d5435]'}`}>{completedIds.includes(selectedClass.id) ? 'Prática Concluída ✓' : 'Marcar como Concluída'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
