
import React, { useState, useEffect, useMemo } from 'react';
import Login from './components/Login';
import VideoCard from './components/VideoCard';
import AIAssistant from './components/AIAssistant';
import { ADMIN_EMAIL } from './constants';
import { User, YogaClass, YogaCategory } from './types';
import { db } from './services/dbService';

// Logo Oficial - Usando a URL do GitHub Pages que é mais estável para previews
const Logo = ({ className = "w-12 h-12" }) => (
  <img 
    src="https://fboliveira.github.io/yoga-logo.png" 
    alt="Fernanda Yoga Logo" 
    className={`${className} object-contain`}
    loading="eager"
    onError={(e) => {
      // Se a URL do Pages falhar, tenta o link raw como fallback
      if (e.currentTarget.src !== "https://raw.githubusercontent.com/fboliveira/fboliveira.github.io/main/yoga-logo.png") {
        e.currentTarget.src = "https://raw.githubusercontent.com/fboliveira/fboliveira.github.io/main/yoga-logo.png";
      }
    }}
  />
);

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [selectedClass, setSelectedClass] = useState<YogaClass | null>(null);
  const [activeCategory, setActiveCategory] = useState<YogaCategory | 'Todas' | 'Concluídas'>('Todas');
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  
  const [allowedEmails, setAllowedEmails] = useState<string[]>([]);
  const [yogaClasses, setYogaClasses] = useState<YogaClass[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [adminTab, setAdminTab] = useState<'alunos' | 'aulas'>('alunos');
  
  const [newEmail, setNewEmail] = useState('');
  const [newClass, setNewClass] = useState<Partial<YogaClass>>({
    title: '',
    youtubeId: '',
    description: '',
    category: YogaCategory.HATHA,
    level: 'Iniciante',
    duration: '20 min'
  });

  const loadData = async () => {
    setErrorMsg(null);
    if (!db.isConnected()) {
      setIsLoading(false);
      setErrorMsg("Modo de Demonstração (Offline). Configure as chaves SUPABASE_URL e SUPABASE_ANON_KEY no seu servidor para ativar o banco de dados.");
      return;
    }

    setIsLoading(true);
    try {
      const [emails, classes] = await Promise.all([
        db.getAlunos(),
        db.getClasses()
      ]);
      setAllowedEmails(emails);
      setYogaClasses(classes);
    } catch (err: any) {
      console.error("Erro ao carregar dados:", err);
      setErrorMsg(`Erro de conexão: ${err.message || 'Verifique suas chaves do Supabase'}`);
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
    if (!db.isConnected()) {
      alert("Erro: Banco de dados não conectado.");
      return;
    }
    
    if (!newClass.title || !newClass.youtubeId) {
      alert("Preencha o título e o ID do vídeo.");
      return;
    }
    
    setIsLoading(true);
    try {
      let ytId = newClass.youtubeId || '';
      if (ytId.includes('v=')) ytId = ytId.split('v=')[1].split('&')[0];
      if (ytId.includes('youtu.be/')) ytId = ytId.split('youtu.be/')[1].split('?')[0];

      const classToAdd: YogaClass = {
        id: Date.now().toString(),
        title: newClass.title,
        description: newClass.description || 'Prática de yoga guiada.',
        youtubeId: ytId.trim(),
        category: newClass.category as YogaCategory,
        duration: newClass.duration || '20 min',
        level: newClass.level as any,
        thumbnailUrl: `https://img.youtube.com/vi/${ytId.trim()}/maxresdefault.jpg`
      };
      
      const updated = await db.saveClass(classToAdd);
      setYogaClasses(updated);
      setNewClass({ title: '', youtubeId: '', description: '', category: YogaCategory.HATHA, level: 'Iniciante', duration: '20 min' });
      alert("Aula cadastrada com sucesso!");
    } catch (err: any) {
      alert(`Erro ao salvar: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClass = async (id: string) => {
    if (window.confirm("Deseja realmente excluir esta aula?")) {
      try {
        const updated = await db.deleteClass(id);
        setYogaClasses(updated);
      } catch (err) {
        alert("Erro ao excluir.");
      }
    }
  };

  const handleAddAluno = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail) return;
    try {
      const updated = await db.saveAluno(newEmail);
      setAllowedEmails(updated);
      setNewEmail('');
      alert("Aluno autorizado!");
    } catch (err: any) {
      alert(`Erro ao adicionar: ${err.message}`);
    }
  };

  const handleDeleteAluno = async (email: string) => {
    if (email === ADMIN_EMAIL) return;
    if (window.confirm(`Remover acesso de ${email}?`)) {
      try {
        const updated = await db.deleteAluno(email);
        setAllowedEmails(updated);
      } catch (err) {
        alert("Erro ao remover.");
      }
    }
  };

  if (!user) return <Login onLogin={handleLogin} />;
  const isAdmin = user.email === ADMIN_EMAIL;

  return (
    <div className="min-h-screen pb-24">
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-[#f0f4f1] px-4 md:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveCategory('Todas')}>
            <Logo className="w-14 h-14" />
            <span className="text-xl font-bold text-[#2d3a2a] serif tracking-tight hidden sm:block">Fernanda Yoga</span>
          </div>
          <div className="flex items-center gap-4">
            {isAdmin && (
              <button onClick={() => setShowAdminPanel(true)} className="px-4 py-2 bg-[#e67e22] text-white rounded-xl text-sm font-bold shadow-lg hover:bg-[#d35400] transition-all">
                Painel Admin
              </button>
            )}
            <button onClick={() => setUser(null)} className="p-2 text-[#6b7c67] hover:bg-gray-100 rounded-lg font-bold text-sm transition-colors">
              Sair
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        {errorMsg && (
          <div className="mb-8 p-6 bg-orange-50 border border-orange-100 text-orange-800 rounded-3xl text-center font-medium shadow-sm">
            <p className="mb-2 font-bold text-lg">⚠️ Sistema em espera</p>
            <p className="text-sm opacity-80">{errorMsg}</p>
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-12 h-12 border-4 border-[#e67e22] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[#8a9b86] font-medium animate-pulse">Sincronizando com o servidor...</p>
          </div>
        ) : (
          <>
            <section className="bg-white rounded-[2.5rem] p-6 md:p-10 border border-[#efe9e0] shadow-sm mb-12 flex flex-col md:flex-row items-center gap-8">
              <div className="relative w-32 h-32 flex-shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 128 128">
                  <circle cx="64" cy="64" r="54" stroke="#f0f4f1" strokeWidth="8" fill="transparent" />
                  <circle cx="64" cy="64" r="54" stroke="#e67e22" strokeWidth="8" fill="transparent" strokeDasharray={339.29} strokeDashoffset={339.29 - (339.29 * progressPercentage) / 100} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-[#2d3a2a]">{progressPercentage}%</span>
                  <span className="text-[10px] text-[#8a9b86] uppercase font-bold tracking-tighter">Sessão</span>
                </div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-bold text-[#2d3a2a] mb-2 serif tracking-tight">Namastê, {user.name}</h2>
                <p className="text-[#6b7c67]">Você visualizou {completedIds.length} das {yogaClasses.length} práticas da sua grade.</p>
              </div>
            </section>

            <div className="flex overflow-x-auto pb-6 gap-3 no-scrollbar mb-8">
              <button onClick={() => setActiveCategory('Todas')} className={`px-6 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${activeCategory === 'Todas' ? 'bg-[#e67e22] text-white shadow-lg' : 'bg-white text-[#6b7c67] border border-[#efe9e0]'}`}>Todas</button>
              <button onClick={() => setActiveCategory('Concluídas')} className={`px-6 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${activeCategory === 'Concluídas' ? 'bg-[#b8860b] text-white shadow-lg' : 'bg-white text-[#6b7c67] border border-[#efe9e0]'}`}>Concluídas</button>
              {Object.values(YogaCategory).map((cat) => (
                <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-6 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${activeCategory === cat ? 'bg-[#e67e22] text-white shadow-lg' : 'bg-white text-[#6b7c67] border border-[#efe9e0]'}`}>{cat}</button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredClasses.map((yogaClass) => (
                <VideoCard key={yogaClass.id} yogaClass={yogaClass} isCompleted={completedIds.includes(yogaClass.id)} onToggleComplete={toggleCompletion} onClick={setSelectedClass} />
              ))}
            </div>
          </>
        )}
      </main>

      <AIAssistant availableClasses={yogaClasses} />

      {showAdminPanel && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b flex justify-between items-center bg-[#fdfaf5]">
              <h2 className="text-xl font-bold serif text-[#2d3a2a]">Administração Online</h2>
              <button onClick={() => setShowAdminPanel(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400">✕</button>
            </div>
            <div className="flex border-b">
              <button onClick={() => setAdminTab('alunos')} className={`flex-1 py-4 font-bold ${adminTab === 'alunos' ? 'text-[#e67e22] border-b-2 border-[#e67e22]' : 'text-gray-400'}`}>Alunos</button>
              <button onClick={() => setAdminTab('aulas')} className={`flex-1 py-4 font-bold ${adminTab === 'aulas' ? 'text-[#e67e22] border-b-2 border-[#e67e22]' : 'text-gray-400'}`}>Aulas</button>
            </div>
            <div className="p-8 overflow-y-auto bg-white">
              {adminTab === 'alunos' ? (
                <div>
                  <form onSubmit={handleAddAluno} className="flex gap-2 mb-8">
                    <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="Email do novo aluno..." className="flex-1 p-3 border border-[#efe9e0] rounded-xl outline-none focus:ring-2 focus:ring-[#e67e22]" required />
                    <button type="submit" className="px-6 bg-[#e67e22] text-white rounded-xl font-bold shadow-md">Autorizar</button>
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
                <div className="space-y-6">
                  <form onSubmit={handleAddClass} className="space-y-4 p-6 bg-gray-50 rounded-2xl border border-[#efe9e0]">
                    <div>
                      <label className="text-xs font-bold text-gray-400 uppercase mb-1 block ml-1">Título da Prática</label>
                      <input type="text" placeholder="Ex: Despertar Matinal" value={newClass.title || ''} onChange={e => setNewClass({...newClass, title: e.target.value})} className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-[#e67e22]" required />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-400 uppercase mb-1 block ml-1">Link ou ID do YouTube</label>
                      <input type="text" placeholder="ID do vídeo" value={newClass.youtubeId || ''} onChange={e => setNewClass({...newClass, youtubeId: e.target.value})} className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-[#e67e22]" required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <select value={newClass.category} onChange={e => setNewClass({...newClass, category: e.target.value as YogaCategory})} className="p-3 border rounded-xl bg-white">
                        {Object.values(YogaCategory).map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <select value={newClass.level} onChange={e => setNewClass({...newClass, level: e.target.value as any})} className="p-3 border rounded-xl bg-white">
                        <option value="Iniciante">Iniciante</option>
                        <option value="Intermediário">Intermediário</option>
                        <option value="Avançado">Avançado</option>
                      </select>
                    </div>
                    <button type="submit" className={`w-full py-4 bg-[#e67e22] text-white rounded-xl font-bold shadow-lg transition-opacity ${isLoading ? 'opacity-50' : 'opacity-100'}`} disabled={isLoading}>
                      {isLoading ? 'Salvando...' : 'Salvar Prática na Nuvem'}
                    </button>
                  </form>
                  <div className="space-y-3">
                    {yogaClasses.map(c => (
                      <div key={c.id} className="flex justify-between items-center p-3 bg-white rounded-xl border border-[#efe9e0]">
                        <div className="flex items-center gap-3">
                          <img src={`https://img.youtube.com/vi/${c.youtubeId}/default.jpg`} className="w-12 h-8 rounded object-cover" />
                          <span className="font-bold text-[#2d3a2a] truncate max-w-[200px] text-sm">{c.title}</span>
                        </div>
                        <button onClick={() => handleDeleteClass(c.id)} className="text-gray-300 hover:text-red-500 p-2">✕</button>
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
            <div className="p-6 flex justify-between items-center text-white">
              <div className="flex flex-col">
                <span className="text-[10px] text-[#e67e22] uppercase font-black tracking-widest">{selectedClass.category}</span>
                <h3 className="text-xl font-bold serif">{selectedClass.title}</h3>
              </div>
              <button onClick={() => setSelectedClass(null)} className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">✕</button>
            </div>
            <div className="aspect-video bg-black">
              <iframe 
                className="w-full h-full" 
                src={`https://www.youtube.com/embed/${selectedClass.youtubeId}?autoplay=1&rel=0`} 
                allowFullScreen
                allow="autoplay"
              ></iframe>
            </div>
            <div className="p-8 bg-white flex flex-col md:flex-row justify-between items-center gap-6">
              <p className="text-[#6b7c67] flex-1 text-lg">{selectedClass.description}</p>
              <button onClick={() => {toggleCompletion(selectedClass.id); setSelectedClass(null);}} className={`px-8 py-4 rounded-2xl font-bold shadow-xl transition-all ${completedIds.includes(selectedClass.id) ? 'bg-gray-100 text-gray-400' : 'bg-[#e67e22] text-white hover:bg-[#d35400]'}`}>
                {completedIds.includes(selectedClass.id) ? 'Prática Concluída ✓' : 'Marcar como Concluída'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
