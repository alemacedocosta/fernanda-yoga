
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

// Função auxiliar para buscar variáveis de forma segura no navegador
const getEnv = (key: string): string => {
  try {
    // Tenta buscar no process.env (padrão Node/Bundlers)
    // Tenta também com o prefixo VITE_ que é o padrão mais comum para apps frontend modernos
    return (
      (typeof process !== 'undefined' && process.env?.[key]) || 
      (typeof process !== 'undefined' && process.env?.[`VITE_${key}`]) ||
      (window as any)._env_?.[key] || 
      ''
    );
  } catch (e) {
    return '';
  }
};

const supabaseUrl = getEnv('SUPABASE_URL');
const supabaseAnonKey = getEnv('SUPABASE_ANON_KEY');

// Diagnóstico para o desenvolvedor no console do navegador
if (!supabaseUrl || !supabaseAnonKey) {
  console.group("⚠️ Fernanda Yoga: Configuração de Banco de Dados");
  if (!supabaseUrl) console.warn("Faltando: SUPABASE_URL");
  if (!supabaseAnonKey) console.warn("Faltando: SUPABASE_ANON_KEY");
  console.info("Dica: No Vercel, tente usar os nomes VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY se os nomes originais não funcionarem.");
  console.groupEnd();
}

// O cliente só será exportado se as chaves existirem
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

if (supabase) {
  console.log("✅ Fernanda Yoga: Conectado ao Supabase com sucesso.");
}
