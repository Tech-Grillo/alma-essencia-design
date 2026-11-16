// Cliente Supabase com a chave secreta. SÓ pode ser importado pelo servidor:
// ele ignora as regras de RLS. Nunca importe este arquivo em componentes.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | undefined;

export function supabaseAdmin(): SupabaseClient {
  if (client) return client;
  const url = process.env.VITE_SUPABASE_URL ?? import.meta.env.VITE_SUPABASE_URL;
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (!url || !secret) {
    throw new Error("SUPABASE_SECRET_KEY ou VITE_SUPABASE_URL não configurados no servidor");
  }
  client = createClient(url, secret, { auth: { persistSession: false, autoRefreshToken: false } });
  return client;
}
