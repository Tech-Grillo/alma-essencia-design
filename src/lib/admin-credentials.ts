import { supabase } from "./supabase";

// Login real via Supabase Auth — cria uma sessão autenticada de fato
export async function validateAdminLogin(email: string, senha: string): Promise<boolean> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: senha,
  });

  if (error) {
    console.error("Erro no login admin:", error.message);
    return false;
  }

  return !!data.session;
}

// Verifica se já existe uma sessão ativa (usado no useEffect do admin.tsx)
export async function isAdminLoggedIn(): Promise<boolean> {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    console.error("Erro ao verificar sessão:", error.message);
    return false;
  }
  return !!data.session;
}

// Logout real, encerra a sessão no Supabase
export async function adminLogout(): Promise<void> {
  await supabase.auth.signOut();
}