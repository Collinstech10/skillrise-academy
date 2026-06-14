import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

// eslint-disable-next-line @typescript-eslint/no-var-requires
const ws = require('ws');

// Service role client — bypasses RLS, use only server-side
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
  // @ts-ignore — ws is valid transport for Node < 22
  realtime: { transport: ws },
});

// Anon client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  // @ts-ignore
  realtime: { transport: ws },
});

export default supabaseAdmin;
