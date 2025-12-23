
import { YogaClass } from "../types";
import { INITIAL_ALLOWED_EMAILS, YOGA_CLASSES as DEFAULT_CLASSES } from "../constants";
import { supabase } from "./supabaseClient";

const KEYS = {
  CLASSES: 'zenyoga_db_classes',
  ALUNOS: 'zenyoga_db_allowed_emails'
};

export const db = {
  // Verificação de status
  isConnected: () => !!supabase,

  // Gerenciamento de Aulas
  getClasses: async (): Promise<YogaClass[]> => {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('aulas')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        if (data) return data as YogaClass[];
      } catch (err) {
        console.error("Erro ao buscar aulas no Supabase:", err);
      }
    }
    // Fallback para LocalStorage se o Supabase falhar ou não estiver configurado
    const data = localStorage.getItem(KEYS.CLASSES);
    return data ? JSON.parse(data) : DEFAULT_CLASSES;
  },
  
  saveClass: async (newClass: YogaClass) => {
    if (supabase) {
      try {
        const { error } = await supabase.from('aulas').insert([newClass]);
        if (error) throw error;
        return db.getClasses();
      } catch (err) {
        console.error("Erro ao salvar aula no Supabase:", err);
      }
    }
    const classes = await db.getClasses();
    const updated = [newClass, ...classes];
    localStorage.setItem(KEYS.CLASSES, JSON.stringify(updated));
    return updated;
  },
  
  deleteClass: async (id: string) => {
    if (supabase) {
      try {
        const { error } = await supabase.from('aulas').delete().eq('id', id);
        if (error) throw error;
        return db.getClasses();
      } catch (err) {
        console.error("Erro ao deletar aula no Supabase:", err);
      }
    }
    const classes = await db.getClasses();
    const updated = classes.filter(c => c.id !== id);
    localStorage.setItem(KEYS.CLASSES, JSON.stringify(updated));
    return updated;
  },

  // Gerenciamento de Alunos
  getAlunos: async (): Promise<string[]> => {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('alunos').select('email');
        if (error) throw error;
        if (data) return data.map(item => item.email);
      } catch (err) {
        console.error("Erro ao buscar alunos no Supabase:", err);
      }
    }
    const data = localStorage.getItem(KEYS.ALUNOS);
    return data ? JSON.parse(data) : INITIAL_ALLOWED_EMAILS;
  },
  
  saveAluno: async (email: string) => {
    const cleanEmail = email.toLowerCase().trim();
    if (supabase) {
      try {
        const { error } = await supabase.from('alunos').insert([{ email: cleanEmail }]);
        if (error) throw error;
        return db.getAlunos();
      } catch (err) {
        console.error("Erro ao salvar aluno no Supabase:", err);
      }
    }
    const emails = await db.getAlunos();
    if (emails.includes(cleanEmail)) return emails;
    const updated = [...emails, cleanEmail];
    localStorage.setItem(KEYS.ALUNOS, JSON.stringify(updated));
    return updated;
  },
  
  deleteAluno: async (email: string) => {
    if (supabase) {
      try {
        const { error } = await supabase.from('alunos').delete().eq('email', email);
        if (error) throw error;
        return db.getAlunos();
      } catch (err) {
        console.error("Erro ao deletar aluno no Supabase:", err);
      }
    }
    const emails = await db.getAlunos();
    const updated = emails.filter(e => e !== email);
    localStorage.setItem(KEYS.ALUNOS, JSON.stringify(updated));
    return updated;
  },

  exportBackup: async () => {
    const data = {
      classes: await db.getClasses(),
      alunos: await db.getAlunos(),
      exportDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_fernanda_yoga_${new Date().toLocaleDateString()}.json`;
    a.click();
  }
};
