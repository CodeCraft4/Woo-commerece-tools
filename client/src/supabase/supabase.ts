import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://bvmgylflejzktwfedimk.supabase.co" as string;
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2bWd5bGZsZWp6a3R3ZmVkaW1rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwNjE5MjMsImV4cCI6MjA3NDYzNzkyM30.TKQUGq88qwJYO2WRgQ144N1H5F9iGgBu_XDeGnm1ymU" as string;
  
export const supabase = createClient(supabaseUrl, supabaseKey);
