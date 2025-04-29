
import { createClient } from '@supabase/supabase-js';
import { supabase as configuredSupabase } from '@/integrations/supabase/client';

// Use the properly configured Supabase client from the integration
export const supabase = configuredSupabase;
