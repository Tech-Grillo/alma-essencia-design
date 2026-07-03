# 🔐 Segurança do Supabase - Implementar Autenticação

## 🚨 Problema Identificado:

A política atual permite que **qualquer pessoa** cadastre produtos se descobrir a anon key:
```sql
-- ❌ INSEGURO - Permite INSERT público
CREATE POLICY "Allow public insert" ON products
  FOR INSERT WITH CHECK (true);
```

## ✅ Solução: Implementar Supabase Auth

Vou criar um sistema de autenticação seguro para o admin.

---

## 📋 Passo a Passo:

### 1. Criar tabela de usuários admin
### 2. Configurar autenticação no Supabase
### 3. Atualizar políticas de segurança
### 4. Implementar login/cadastro no admin
### 5. Remover credenciais hardcoded

---

## 🔒 Níveis de Segurança:

### Nível 1: Apenas Autenticados (Recomendado)
```sql
-- Apenas usuários logados podem inserir/editar/excluir
CREATE POLICY "Allow authenticated insert" ON products
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
```

### Nível 2: Apenas Admins (Mais Seguro)
```sql
-- Apenas usuários com role = 'admin' podem modificar
CREATE POLICY "Allow admin insert" ON products
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' 
    AND EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.user_id = auth.uid() 
      AND admin_users.role = 'admin'
    )
  );
```

---

## 🎯 Implementação:

Vou implementar o **Nível 1** (autenticação básica) primeiro, e depois podemos adicionar o Nível 2 se necessário.

**Quer que eu prossiga com a implementação?**