import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://dzsuybilbckwsolrhjwq.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6c3V5YmlsYmNrd3NvbHJoandxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQxMTQwNTYsImV4cCI6MjA1OTY5MDA1Nn0.BQIESrCQF5dQbKmOiG-AnNB747AOQH0V5u0y_uc4Xrw"


export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})