import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://sfhpxfwtfazlraflzxll.supabase.co" as string;
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmaHB4Znd0ZmF6bHJhZmx6eGxsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MTU3NjAsImV4cCI6MjA3MzQ5MTc2MH0.fo0_itNr3V8b5BsfPrSmlsl5YyLyrv0neVopl6SPdzE" as string;
export const supabase = createClient(supabaseUrl, supabaseKey);
