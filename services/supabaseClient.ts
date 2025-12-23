
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../constants';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
