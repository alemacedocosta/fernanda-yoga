
import { YogaClass } from "../types";
import { supabase } from "./supabaseClient";

export const db = {
  isConnected: () => !!supabase,

  getClasses: async (): Promise<YogaClass[]> => {
    if (!supabase) throw new Error("Banco de dados não configurado.");
    const { data, error } = await supabase
      .from('aulas')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return (data as YogaClass[]) || [];
  },
  
  saveClass: async (newClass: YogaClass) => {
    if (!supabase) throw new Error("Banco de dados não configurado.");
    const { error } = await supabase.from('aulas').insert([newClass]);
    if (error) throw error;
    return db.getClasses();
  },
  
  deleteClass: async (id: string) => {
    if (!supabase) throw new Error("Banco de dados não configurado.");
    const { error } = await supabase.from('aulas').delete().eq('id', id);
    if (error) throw error;
    return db.getClasses();
  },

  getAlunos: async (): Promise<string[]> => {
    if (!supabase) throw new Error("Banco de dados não configurado.");
    const { data, error } = await supabase.from('alunos').select('email');
    if (error) throw error;
    return data ? data.map(item => item.email) : [];
  },
  
  saveAluno: async (email: string) => {
    if (!supabase) throw new Error("Banco de dados não configurado.");
    const { error } = await supabase.from('alunos').insert([{ email: email.toLowerCase().trim() }]);
    if (error) throw error;
    return db.getAlunos();
  },
  
  deleteAluno: async (email: string) => {
    if (!supabase) throw new Error("Banco de dados não configurado.");
    const { error } = await supabase.from('alunos').delete().eq('email', email);
    if (error) throw error;
    return db.getAlunos();
  }
};
