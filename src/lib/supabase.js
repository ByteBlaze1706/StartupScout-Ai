import { createClient } from '@supabase/supabase-js';

let supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Normalize the Supabase URL to prevent double slashes or suffix path issues (e.g. PGRST125)
if (supabaseUrl) {
  // Trim spaces
  supabaseUrl = supabaseUrl.trim();
  // Remove trailing slashes
  supabaseUrl = supabaseUrl.replace(/\/+$/, '');
  // Remove trailing /rest/v1 if the user copied the REST API endpoint URL
  if (supabaseUrl.endsWith('/rest/v1')) {
    supabaseUrl = supabaseUrl.substring(0, supabaseUrl.length - 8);
  }
}

// Log the resolved URL to stdout during startup (safely hidden, no secret keys printed)
console.log(`[Supabase Init] Resolved URL: "${supabaseUrl || 'NOT_CONFIGURED'}"`);

// Server-side client using Service Role Key. 
// Bypasses Row Level Security (RLS) and is intended ONLY for server-side execution.
// Do not import this file in any client-side components.
export const supabase = supabaseUrl && supabaseServiceKey ?
createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
}) :
null;