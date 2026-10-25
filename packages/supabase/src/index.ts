import { createClient } from '@supabase/supabase-js';
import type { Database as GeneratedDatabase } from './database.types';

export { createClient };
export type { SupabaseClient } from '@supabase/supabase-js';
export type { Enums } from './database.types';

type GeneratedPublic = GeneratedDatabase['public'];
type GeneratedItems = GeneratedPublic['Tables']['items'];

/**
 * 產生的型別無法表達「由 trigger 補值」的欄位，在這裡覆寫，database.types.ts 才能直接重新產生。
 * - items.display_order：NOT NULL 但沒有 DEFAULT，由 BEFORE INSERT trigger 取號，新增時不必送
 */
export type Database = Omit<GeneratedDatabase, 'public'> & {
  public: Omit<GeneratedPublic, 'Tables'> & {
    Tables: Omit<GeneratedPublic['Tables'], 'items'> & {
      items: Omit<GeneratedItems, 'Insert'> & {
        Insert: Omit<GeneratedItems['Insert'], 'display_order'> & {
          display_order?: number;
        };
      };
    };
  };
};

// 產生檔裡的同名 helper 參照的是覆寫前的 Database，要從覆寫後的版本推導，才不會跟 client 的型別矛盾
type PublicTables = Database['public']['Tables'];
export type Tables<T extends keyof PublicTables> = PublicTables[T]['Row'];
export type TablesInsert<T extends keyof PublicTables> = PublicTables[T]['Insert'];
export type TablesUpdate<T extends keyof PublicTables> = PublicTables[T]['Update'];

export function createSupabaseClient(url: string, key: string) {
  return createClient<Database>(url, key);
}
