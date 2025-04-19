// Initialize Supabase client
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config() // Load environment variables

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

export default supabase
