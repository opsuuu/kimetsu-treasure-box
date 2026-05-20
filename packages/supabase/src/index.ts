import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

export { createClient };
export type { SupabaseClient } from '@supabase/supabase-js';
export type { Database, Tables, TablesInsert, TablesUpdate, Enums } from './database.types';

export function createSupabaseClient(url: string, key: string) {
  return createClient<Database>(url, key);
}
