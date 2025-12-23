
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
      const { data, error } = await supabase
        .from('aulas')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) return data as YogaClass[];
    }
    const data = localStorage.getItem(KEYS.CLASSES);
    return data ? JSON.parse(data) : DEFAULT_CLASSES;
  },
  
  saveClass: async (newClass: YogaClass) => {
    if (supabase) {
      const { error } = await supabase.from('aulas').insert([newClass]);
      if (!error) return db.getClasses();
    }
    const classes = await db.getClasses();
    const updated = [newClass, ...classes];
    localStorage.setItem(KEYS.CLASSES, JSON.stringify(updated));
    return updated;
  },
  
  deleteClass: async (id: string) => {
    if (supabase) {
      const { error } = await supabase.from('aulas').delete().eq('id', id);
      if (!error) return db.getClasses();
    }
    const classes = await db.getClasses();
    const updated = classes.filter(c => c.id !== id);
    localStorage.setItem(KEYS.CLASSES, JSON.stringify(updated));
    return updated;
  },

  // Gerenciamento de Alunos
  getAlunos: async (): Promise<string[]> => {
    if (supabase) {
      const { data, error } = await supabase.from('alunos').select('email');
      if (!error && data) return data.map(item => item.email);
    }
    const data = localStorage.getItem(KEYS.ALUNOS);
    return data ? JSON.parse(data) : INITIAL_ALLOWED_EMAILS;
  },
  
  saveAluno: async (email: string) => {
    const cleanEmail = email.toLowerCase().trim();
    if (supabase) {
      const { error } = await supabase.from('alunos').insert([{ email: cleanEmail }]);
      if (!error) return db.getAlunos();
    }
    const emails = await db.getAlunos();
    if (emails.includes(cleanEmail)) return emails;
    const updated = [...emails, cleanEmail];
    localStorage.setItem(KEYS.ALUNOS, JSON.stringify(updated));
    return updated;
  },
  
  deleteAluno: async (email: string) => {
    if (supabase) {
      const { error } = await supabase.from('alunos').delete().eq('email', email);
      if (!error) return db.getAlunos();
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
