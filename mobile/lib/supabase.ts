import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hiigbxpdmtzffwbovzkb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpaWdieHBkbXR6ZmZ3Ym92emtiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxNzU5NzYsImV4cCI6MjA4NTc1MTk3Nn0.1tGrqeDaTwKXkjW8l-dNsrmQj41lte_58X-Er5_3N14';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Setting persistSession to false prevents the "Auto-Login"
    persistSession: false, 
    autoRefreshToken: false, // Don't refresh in the background
    detectSessionInUrl: false,
  },
});