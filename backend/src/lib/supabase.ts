import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import ws from 'ws';
dotenv.config();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const wsAdapter = ws as any;

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

// Service role client — bypasses RLS, use only server-side
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
  realtime: {
    transport: wsAdapter,
    params: { eventsPerSecond: -1 },
  },
  global: {
    headers: { 'x-my-custom-header': 'skillrise-backend' },
  },
});

// Anon client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    transport: wsAdapter,
    params: { eventsPerSecond: -1 },
  },
});

export default supabaseAdmin;
