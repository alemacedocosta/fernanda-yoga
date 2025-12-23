import React, { useState, useEffect, useMemo } from 'react';
import Login from './components/Login';
import VideoCard from './components/VideoCard';
import AIAssistant from './components/AIAssistant';
import { ADMIN_EMAIL, LOGO_URL } from './constants';
import { User, YogaClass, YogaCategory } from './types';
import { db } from './services/dbService';

/**
 * FERNANDA YOGA - PORTAL DO ALUNO
 * MVP 1.0 - Baseline Estável
 */

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [yogaClasses, setYogaClasses] = useState<YogaClass[]>([]);
  const [allowedEmails, setAllowedEmails] = useState<string[]>([]);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [selectedClass, setSelectedClass] = useState<YogaClass | null>(null);
  const [activeCategory, setActiveCategory] = useState<YogaCategory | 'Todas'>('Todas');
  const [isLoading, setIsLoading] = useState(true);
  
  const [showAdmin, setShowAdmin] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [newClass, setNewClass] = useState({
    title: '',
    youtubeUrl: '',
    category: YogaCategory.HATHA,
    level: 'Iniciante' as const,
    duration: '30 min'
  });

  const isAdmin = useMemo(() => user?.email.toLowerCase().trim() === ADMIN_EMAIL.toLowerCase().trim(), [user]);

  const loadInitialData = async (userEmail?: string) => {
    setIsLoading(true);
    try {
      const [classes, emails] = await Promise.all([
        db.getClasses(),
        db.getAlunos()
      ]);
      setYogaClasses(classes);
      setAllowedEmails(emails);

      if (userEmail) {
        const progress = await db.getUserProgress(userEmail);
        setCompletedIds(progress);
      }
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadInitialData(user.email);
    }
  }, [user?.email]);

  const handleLogin = (email: string) => {
    setShowAdmin(false);
    setUser({ email, name: email.split('@')[0], isLoggedIn: true });
  };

  const handleLogout = () => {
    setUser(null);
    setShowAdmin(false);
    setCompletedIds([]);
  };

  const toggleComplete = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!user) return;

    const currentlyCompleted = completedIds.includes(id);
    const newIds = currentlyCompleted 
      ? completedIds.filter(i => i !== id) 
      : [...completedIds, id];
    setCompletedIds(newIds);

    try {
      await db.toggleProgress(user.email, id, currentlyCompleted);
    } catch (err) {
      setCompletedIds(completedIds);
      alert("Erro ao salvar progresso.");
    }
  };

  const filteredClasses = useMemo(() => {
    return activeCategory === 'Todas' 
      ? yogaClasses 
      : yogaClasses.filter(c => c.category === activeCategory);
  }, [yogaClasses, activeCategory]);

  const progressPercentage = yogaClasses.length > 0 
    ? Math.round((completedIds.length / yogaClasses.length) * 100)
    : 0;

  const handleAddAluno = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail) return;
    try {
      await db.saveAluno(newEmail);
      setAllowedEmails(await db.getAlunos());
      setNewEmail('');
    } catch (err) { alert("Erro ao adicionar aluno."); }
  };

  const handleDeleteClass = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta aula?")) return;
    try {
      await db.deleteClass(id);
      setYogaClasses(await db.getClasses());
    } catch (err) { alert("Erro ao excluir aula."); }
  };

  const handleAddClass = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      let ytId = newClass.youtubeUrl;
      if (ytId.includes('v=')) ytId = ytId.split('v=')[1].split('&')[0];
      else if (ytId.includes('youtu.be/')) ytId = ytId.split('youtu.be/')[1].split('?')[0];

      const payload = {
        id: Date.now().toString(),
        title: newClass.title,
        youtubeId: ytId.trim(),
        category: newClass.category,
        level: newClass.level,
        duration: newClass.duration,
        description: 'Aula de yoga guiada.',
        thumbnailUrl: `https://img.youtube.com/vi/${ytId.trim()}/maxresdefault.jpg`
      };

      await db.saveClass(payload);
      setYogaClasses(await db.getClasses());
      setNewClass({ title: '', youtubeUrl: '', category: YogaCategory.HATHA, level: 'Iniciante', duration: '30 min' });
    } catch (err) {
      alert("Erro ao publicar aula.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) return <Login onLogin={handleLogin} />;

  return (
    <div className="min-h-screen bg-[#fdfaf5] text-[#2d3a2a]">
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-[#efe9e0] px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src={LOGO_URL} alt="Logo" className="w-10 h-10" />
            <h1 className="serif font-bold text-xl hidden sm:block">Fernanda Yoga</h1>
          </div>
          <div className="flex items-center gap-4">
            {isAdmin && (
              <button 
                onClick={() => setShowAdmin(!showAdmin)}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${showAdmin ? 'bg-orange-500 text-white' : 'bg-[#4a6741] text-white shadow-lg'}`}
              >
                {showAdmin ? 'Sair do Painel' : 'Gerenciar App'}
              </button>
            )}
            <button onClick={handleLogout} className="text-sm font-bold text-gray-400 hover:text-red-500 transition-colors">Sair</button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-10">
        {isAdmin && showAdmin ? (
          <div className="space-y-12 animate-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <section className="bg-white p-8 rounded-[2.5rem] border border-[#efe9e0] shadow-sm">
                <h3 className="text-xl font-bold serif mb-6 flex items-center gap-2">Autorizar Alunos</h3>
                <form onSubmit={handleAddAluno} className="flex gap-2 mb-6">
                  <input 
                    type="email" 
                    placeholder="E-mail do novo aluno" 
                    value={newEmail}
                    onChange={e => setNewEmail(e.target.value)}
                    className="flex-1 p-4 bg-gray-50 border border-[#efe9e0] rounded-2xl outline-none"
                  />
                  <button type="submit" className="px-6 bg-[#4a6741] text-white rounded-2xl font-bold">Add</button>
                </form>
                <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2">
                  {allowedEmails.map(email => (
                    <div key={email} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100 group">
                      <span className="text-sm font-medium">{email}</span>
                      {email.toLowerCase() !== ADMIN_EMAIL.toLowerCase() && (
                        <button onClick={() => db.deleteAluno(email).then(() => loadInitialData())} className="text-red-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">Remover</button>
                      )}
                    </div>
                  ))}
                </div>
              </section>

              <section className="bg-white p-8 rounded-[2.5rem] border border-[#efe9e0] shadow-sm">
                <h3 className="text-xl font-bold serif mb-6">Cadastrar Aula</h3>
                <form onSubmit={handleAddClass} className="space-y-4">
                  <input placeholder="Título" value={newClass.title} onChange={e => setNewClass({...newClass, title: e.target.value})} className="w-full p-4 bg-gray-50 border border-[#efe9e0] rounded-2xl" required />
                  <input placeholder="URL YouTube" value={newClass.youtubeUrl} onChange={e => setNewClass({...newClass, youtubeUrl: e.target.value})} className="w-full p-4 bg-gray-50 border border-[#efe9e0] rounded-2xl" required />
                  <div className="grid grid-cols-2 gap-4">
                    <select value={newClass.category} onChange={e => setNewClass({...newClass, category: e.target.value as YogaCategory})} className="p-4 bg-gray-50 border border-[#efe9e0] rounded-2xl text-sm">
                      {Object.values(YogaCategory).map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <select value={newClass.level} onChange={e => setNewClass({...newClass, level: e.target.value as any})} className="p-4 bg-gray-50 border border-[#efe9e0] rounded-2xl text-sm">
                      <option value="Iniciante">Iniciante</option>
                      <option value="Intermediário">Intermediário</option>
                      <option value="Avançado">Avançado</option>
                    </select>
                  </div>
                  <button disabled={isSaving} type="submit" className="w-full py-5 bg-[#e67e22] text-white rounded-2xl font-bold">
                    {isSaving ? 'Salvando...' : 'Publicar'}
                  </button>
                </form>
              </section>
            </div>

            <section className="bg-white p-10 rounded-[3rem] border border-[#efe9e0] shadow-sm">
              <h3 className="text-2xl font-bold serif mb-8">Catálogo</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {yogaClasses.map(c => (
                  <div key={c.id} className="flex flex-col bg-gray-50 rounded-[2rem] border border-gray-100 overflow-hidden group">
                    <div className="aspect-video relative">
                      <img src={c.thumbnailUrl} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center">
                        <button onClick={() => handleDeleteClass(c.id)} className="bg-red-500 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase">Excluir</button>
                      </div>
                    </div>
                    <div className="p-5"><h4 className="font-bold text-sm">{c.title}</h4></div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        ) : (
          <>
            <header className="mb-12 flex flex-col md:flex-row items-center gap-8 bg-white p-8 rounded-[3rem] border border-[#efe9e0] shadow-sm">
              <div className="relative w-28 h-28 flex-shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="#f0f4f1" strokeWidth="6" />
                  <circle cx="50" cy="50" r="45" fill="none" stroke="#e67e22" strokeWidth="6" strokeDasharray="282.7" strokeDashoffset={282.7 - (282.7 * progressPercentage / 100)} strokeLinecap="round" className="transition-all duration-1000" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-black">{progressPercentage}%</span>
                </div>
              </div>
              <div>
                <h2 className="text-3xl font-bold serif mb-1">Namastê, {user.name}</h2>
                <p className="text-[#8a9b86] font-medium">Seu progresso é individual e salvo automaticamente em sua conta.</p>
              </div>
            </header>

            <div className="flex gap-2 overflow-x-auto pb-6 no-scrollbar">
              <button 
                onClick={() => setActiveCategory('Todas')}
                className={`px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${activeCategory === 'Todas' ? 'bg-[#e67e22] text-white' : 'bg-white border border-[#efe9e0] text-gray-400'}`}
              >
                Todas
              </button>
              {Object.values(YogaCategory).map(cat => (
                <button 
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap ${activeCategory === cat ? 'bg-[#e67e22] text-white' : 'bg-white border border-[#efe9e0] text-gray-400'}`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {isLoading ? (
              <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div></div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredClasses.length > 0 ? filteredClasses.map(c => (
                  <VideoCard 
                    key={c.id} 
                    yogaClass={c} 
                    isCompleted={completedIds.includes(c.id)} 
                    onToggleComplete={toggleComplete} 
                    onClick={setSelectedClass} 
                  />
                )) : (
                  <div className="col-span-full py-20 text-center opacity-40">
                    <p className="text-lg">Nenhuma aula encontrada.</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>

      {selectedClass && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="w-full max-w-5xl bg-white rounded-[3rem] overflow-hidden shadow-2xl">
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="text-xl font-bold serif">{selectedClass.title}</h3>
              <button onClick={() => setSelectedClass(null)} className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">✕</button>
            </div>
            <div className="aspect-video bg-black">
              <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${selectedClass.youtubeId}?autoplay=1`} allowFullScreen />
            </div>
            <div className="p-8 flex justify-end gap-4">
               <button 
                onClick={() => { toggleComplete(selectedClass.id); setSelectedClass(null); }}
                className={`px-8 py-4 rounded-2xl font-bold ${completedIds.includes(selectedClass.id) ? 'bg-gray-100 text-gray-400' : 'bg-[#4a6741] text-white shadow-lg'}`}
               >
                 {completedIds.includes(selectedClass.id) ? 'Concluída ✓' : 'Marcar como Concluída'}
               </button>
            </div>
          </div>
        </div>
      )}

      {!showAdmin && <AIAssistant availableClasses={yogaClasses} />}
    </div>
  );
};

export default App;