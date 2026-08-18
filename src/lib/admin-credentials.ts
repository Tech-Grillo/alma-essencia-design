import { supabase } from "./supabase";

// Confere na tabela admin_users se o usuário logado é de fato um admin.
// Essa tabela é bloqueada por RLS (ninguém lê/escreve nela pelo client),
// então só quem foi inserido manualmente pelo painel do Supabase passa aqui.
async function isUserAdmin(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("Erro ao verificar admin:", error.message);
    return false;
  }
  return !!data;
}

// Faz login direto com email e senha e verifica se é admin.
// A sessão fica ativa após o login bem-sucedido.
export async function validateAdminCredentials(email: string, senha: string): Promise<boolean> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: senha,
  });

  if (error) {
    console.error("Erro no login admin:", error.message);
    return false;
  }

  if (!data.session) return false;

  const admin = await isUserAdmin(data.session.user.id);
  if (!admin) {
    await supabase.auth.signOut();
    return false;
  }

  return true;
}

// Mantém a antiga função para compatibilidade com outros pontos do código.
export async function validateAdminLogin(email: string, senha: string): Promise<boolean> {
  return validateAdminCredentials(email, senha);
}

// Verifica se já existe uma sessão ativa E se essa sessão é de um admin
// (usado no useEffect do admin.tsx)
export async function isAdminLoggedIn(): Promise<boolean> {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    console.error("Erro ao verificar sessão:", error.message);
    return false;
  }
  if (!data.session) return false;

  return isUserAdmin(data.session.user.id);
}

// Logout real, encerra a sessão no Supabase
export async function adminLogout(): Promise<void> {
  await supabase.auth.signOut();
}