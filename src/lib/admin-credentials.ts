// ⚠️ CREDENCIAIS DO ADMIN
// Altere aqui o email e senha desejados
export const ADMIN_CREDENTIALS = {
  email: "admin@almaeessencia.com",
  senha: "senhaalma1234",
};

// Função para validar login
export function validateAdminLogin(email: string, senha: string): boolean {
  return email === ADMIN_CREDENTIALS.email && senha === ADMIN_CREDENTIALS.senha;
}
