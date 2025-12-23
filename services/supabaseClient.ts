
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

/**
 * IMPORTANTE: Para que o app funcione para todos, as variáveis SUPABASE_URL 
 * e SUPABASE_ANON_KEY devem estar configuradas no painel da Vercel.
 */

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

// Cliente Supabase instanciado apenas com variáveis de sistema
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

if (!supabase) {
  console.warn("⚠️ Fernanda Yoga: Chaves de API não detectadas no ambiente. O app pode não carregar dados.");
}
