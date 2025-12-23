
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

// No ambiente de preview do editor, process.env pode não estar disponível.
// Em produção (Vercel), estas variáveis devem ser configuradas no painel do projeto.
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

if (!supabase) {
  console.warn("⚠️ Supabase: Chaves não detectadas. Se você estiver no modo Preview, isso é normal. Para o site funcionar online, configure as Environment Variables SUPABASE_URL e SUPABASE_ANON_KEY no seu servidor (ex: Vercel).");
}
