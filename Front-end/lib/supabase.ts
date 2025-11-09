import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY || SUPABASE_URL === 'YOUR_SUPABASE_URL_HERE') {
  console.error('❌ Supabase credentials not configured!');
  console.error('Please update lib/config.ts with your Supabase URL and anon key');
  console.error('You can find these in your Supabase project settings: https://app.supabase.com');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
