import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://bvmgylflejzktwfedimk.supabase.co" as string;
// const supabaseKey =
//   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2bWd5bGZsZWp6a3R3ZmVkaW1rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwNjE5MjMsImV4cCI6MjA3NDYzNzkyM30.TKQUGq88qwJYO2WRgQ144N1H5F9iGgBu_XDeGnm1ymU" as string;
const supabaseServiceRoleKey = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2bWd5bGZsZWp6a3R3ZmVkaW1rIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTA2MTkyMywiZXhwIjoyMDc0NjM3OTIzfQ.2eCGMRcgIzUOInI0-0JR2Ivsi_N-Vm6gOVqm2eSI6I0`;

export const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: "diy-auth",
  },
});

// Admin client: isolated storage key to avoid user-session tokens overriding service role.
// TODO: Move service-role usage to server/edge functions for security.
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
    storageKey: "diy-auth-admin",
  },
});
