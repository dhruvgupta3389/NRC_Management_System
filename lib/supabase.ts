// Supabase client configuration
// This file attempts to initialize Supabase with fallback to CSV storage
// The environment variables should be set in .env.local

let supabaseClient: any = null;
let initError: Error | null = null;

async function initializeSupabase() {
  if (supabaseClient || initError) {
    if (initError) throw initError;
    return supabaseClient;
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase environment variables. Using CSV storage.');
    }

    // Dynamically import Supabase only when needed
    const { createClient } = await import('@supabase/supabase-js');
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
    
    console.log('✅ Supabase client initialized');
    return supabaseClient;
  } catch (error) {
    initError = error as Error;
    console.log('⚠️ Supabase initialization failed, using CSV storage:', (error as Error).message);
    return null;
  }
}

export async function getSupabaseClient() {
  return initializeSupabase();
}

export const supabaseConfig = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL,
  key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  isConfigured: !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
};
