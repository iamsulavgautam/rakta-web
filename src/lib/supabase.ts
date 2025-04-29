
import { createClient } from '@supabase/supabase-js';

// These will be replaced with environment variables in a real application
const supabaseUrl = 'https://your-supabase-url.supabase.co';
const supabaseAnonKey = 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
