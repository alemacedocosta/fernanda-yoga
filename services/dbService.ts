
import { YogaClass } from "../types";
import { supabase } from "./supabaseClient";

export const db = {
  isConnected: () => !!supabase,

  // Gerenciamento de Aulas (Apenas Supabase)
  getClasses: async (): Promise<YogaClass[]> => {
    if (!supabase) return [];
    try {
      const { data, error } = await supabase
        .from('aulas')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return (data as YogaClass[]) || [];
    } catch (err) {
      console.error("Erro ao buscar aulas:", err);
      return [];
    }
  },
  
  saveClass: async (newClass: YogaClass) => {
    if (!supabase) return [];
    try {
      const { error } = await supabase.from('aulas').insert([newClass]);
      if (error) throw error;
      return db.getClasses();
    } catch (err) {
      console.error("Erro ao salvar aula:", err);
      return db.getClasses();
    }
  },
  
  deleteClass: async (id: string) => {
    if (!supabase) return [];
    try {
      const { error } = await supabase.from('aulas').delete().eq('id', id);
      if (error) throw error;
      return db.getClasses();
    } catch (err) {
      console.error("Erro ao deletar aula:", err);
      return db.getClasses();
    }
  },

  // Gerenciamento de Alunos (Apenas Supabase)
  getAlunos: async (): Promise<string[]> => {
    if (!supabase) return [];
    try {
      const { data, error } = await supabase.from('alunos').select('email');
      if (error) throw error;
      return data ? data.map(item => item.email) : [];
    } catch (err) {
      console.error("Erro ao buscar alunos:", err);
      return [];
    }
  },
  
  saveAluno: async (email: string) => {
    const cleanEmail = email.toLowerCase().trim();
    if (!supabase) return [];
    try {
      const { error } = await supabase.from('alunos').insert([{ email: cleanEmail }]);
      if (error) throw error;
      return db.getAlunos();
    } catch (err) {
      console.error("Erro ao salvar aluno:", err);
      return db.getAlunos();
    }
  },
  
  deleteAluno: async (email: string) => {
    if (!supabase) return [];
    try {
      const { error } = await supabase.from('alunos').delete().eq('email', email);
      if (error) throw error;
      return db.getAlunos();
    } catch (err) {
      console.error("Erro ao deletar aluno:", err);
      return db.getAlunos();
    }
  }
};
