// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://rynjvukckceinttegstn.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5bmp2dWtja2NlaW50dGVnc3RuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQwMzc4NjQsImV4cCI6MjA1OTYxMzg2NH0.puEOpzvU6ab1U_4HrZ09E2x116L8ai4D2R3cdEaO7cE";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);