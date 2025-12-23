
import { supabase } from "./supabaseClient";
import { YogaClass } from "../types";

export const db = {
  // Aulas
  getClasses: async (): Promise<YogaClass[]> => {
    const { data, error } = await supabase
      .from('aulas')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  saveClass: async (newClass: Omit<YogaClass, 'created_at'>) => {
    const { error } = await supabase.from('aulas').insert([newClass]);
    if (error) throw error;
  },

  deleteClass: async (id: string) => {
    const { error } = await supabase.from('aulas').delete().eq('id', id);
    if (error) throw error;
  },

  // Alunos
  getAlunos: async (): Promise<string[]> => {
    const { data, error } = await supabase.from('alunos').select('email');
    if (error) throw error;
    return data ? data.map(item => item.email) : [];
  },

  saveAluno: async (email: string) => {
    const { error } = await supabase.from('alunos').insert([{ email: email.toLowerCase().trim() }]);
    if (error) throw error;
  },

  deleteAluno: async (email: string) => {
    const { error } = await supabase.from('alunos').delete().eq('email', email);
    if (error) throw error;
  },

  // Progresso Individual
  getUserProgress: async (email: string): Promise<string[]> => {
    const { data, error } = await supabase
      .from('progresso')
      .select('aula_id')
      .eq('aluno_email', email.toLowerCase().trim());
    if (error) throw error;
    return data ? data.map(item => item.aula_id) : [];
  },

  toggleProgress: async (email: string, aulaId: string, isCompleted: boolean) => {
    const cleanEmail = email.toLowerCase().trim();
    if (isCompleted) {
      // Remover marcação
      const { error } = await supabase
        .from('progresso')
        .delete()
        .eq('aluno_email', cleanEmail)
        .eq('aula_id', aulaId);
      if (error) throw error;
    } else {
      // Adicionar marcação
      const { error } = await supabase
        .from('progresso')
        .insert([{ aluno_email: cleanEmail, aula_id: aulaId }]);
      if (error) throw error;
    }
  }
};
