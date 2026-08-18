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

// Valida somente as credenciais do administrador.
// A sessão ativa não é liberada ainda; o acesso real só acontece depois do OTP.
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
  await supabase.auth.signOut();

  return admin;
}

// Envia o código de verificação para o e-mail do administrador.
export async function requestAdminOtp(email: string): Promise<boolean> {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: false,
      emailRedirectTo:
        typeof window !== "undefined" ? `${window.location.origin}/admin` : undefined,
    },
  });

  if (error) {
    console.error("Erro ao enviar código de verificação:", error.message);
    return false;
  }

  return true;
}

// Confirma o código enviado por e-mail e só então libera a sessão do painel.
export async function verifyAdminOtp(email: string, code: string): Promise<boolean> {
  const token = code.trim();
  if (!token) return false;

  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: "email",
  });

  if (error) {
    console.error("Erro ao validar código admin:", error.message);
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