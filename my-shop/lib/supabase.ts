import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  // During build/deploy the environment variables may not be available yet.
  // Don't throw during module evaluation — log a warning and export `undefined`.
  // This avoids failing Vercel's build step while still surfacing a clear message.
  // Make sure to set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Vercel.
  // If you prefer failing fast, restore the original throw.
  // eslint-disable-next-line no-console
  console.warn('Missing Supabase environment variables. Supabase client will not be initialized.')
}

// Create client only if environment variables are available
// Construct a Supabase client even if env vars are missing (use empty strings)
// This avoids TypeScript errors in other modules during build. At runtime,
// calls will fail if the credentials are incorrect — ensure env vars are set.
export const supabase: SupabaseClient = createClient(supabaseUrl || '', supabaseKey || '')
