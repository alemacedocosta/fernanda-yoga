
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

// Tenta buscar de várias fontes: Variáveis de ambiente (Vercel) ou LocalStorage (Configuração manual no app)
const getCredential = (key: string): string => {
  try {
    return (
      (typeof process !== 'undefined' && process.env?.[key]) ||
      (typeof process !== 'undefined' && process.env?.[`VITE_${key}`]) ||
      localStorage.getItem(`ZENYOGA_CFG_${key}`) ||
      ''
    );
  } catch {
    return '';
  }
};

const supabaseUrl = getCredential('SUPABASE_URL');
const supabaseAnonKey = getCredential('SUPABASE_ANON_KEY');

// O cliente só será instanciado se as chaves existirem
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

if (supabase) {
  console.log("✅ Fernanda Yoga: Conectado ao Supabase.");
} else {
  console.log("ℹ️ Fernanda Yoga: Rodando em modo Local (sem chaves detectadas).");
}
