import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL || "https://sghwaujproypfnepiffk.supabase.co",
  process.env.REACT_APP_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNnaHdhdWpwcm95cGZuZXBpZmZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxMTcwMTQsImV4cCI6MjA5MzY5MzAxNH0.e4s_PIlpcNYX_gVeUux84PxDCKtqCLyTWkAMODwibyg"
);