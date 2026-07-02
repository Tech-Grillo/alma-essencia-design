# 🔧 Corrigir Erro: "Please allow at least one operation in your policy"

## ❌ O que aconteceu:

Você criou a tabela `products` mas as políticas de segurança (RLS) não foram criadas corretamente, ou não há nenhuma política permitindo operações.

## ✅ Solução:

### **Passo 1: Acessar o SQL Editor**

1. Vá para: https://supabase.com/dashboard/project/vjznmeoftbgyebhclibb/editor
2. Clique em **"SQL Editor"** no menu lateral
3. Clique em **"New query"**

### **Passo 2: Executar o SQL Completo**

**Copie e cole TODO o SQL abaixo** (incluindo as políticas):

```sql
-- 1. Criar tabela de produtos (se não existir)
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  images TEXT[] NOT NULL DEFAULT '{}',
  short TEXT NOT NULL,
  description TEXT NOT NULL,
  scents TEXT[] NOT NULL DEFAULT '{}',
  sizes JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Criar índices
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);

-- 3. Habilitar RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- 4. CRIAR POLÍTICAS (isso é o que faltava!)
-- Permitir leitura pública
CREATE POLICY "Allow public read" ON products
  FOR SELECT USING (true);

-- Permitir inserção para usuários autenticados
CREATE POLICY "Allow authenticated insert" ON products
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Permitir atualização para usuários autenticados
CREATE POLICY "Allow authenticated update" ON products
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Permitir exclusão para usuários autenticados
CREATE POLICY "Allow authenticated delete" ON products
  FOR DELETE USING (auth.role() = 'authenticated');
```

### **Passo 3: Executar**

1. Clique no botão **"Run"** (verde) no canto inferior direito
2. Aguarde a mensagem: **"Success. No rows returned"**

### **Passo 4: Verificar se funcionou**

Execute este SQL para verificar as políticas:

```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'products';
```

Você deve ver 4 políticas listadas:
- Allow public read
- Allow authenticated insert
- Allow authenticated update
- Allow authenticated delete

---

## 🎯 Alternativa Rápida (se o SQL acima não funcionar):

Se ainda der erro, execute este SQL mais simples que permite tudo:

```sql
-- Remover políticas existentes (se houver)
DROP POLICY IF EXISTS "Allow public read" ON products;
DROP POLICY IF EXISTS "Allow authenticated insert" ON products;
DROP POLICY IF EXISTS "Allow authenticated update" ON products;
DROP POLICY IF EXISTS "Allow authenticated delete" ON products;

-- Criar política única que permite tudo
CREATE POLICY "Allow all operations" ON products
  FOR ALL
  USING (true)
  WITH CHECK (true);
```

**Aviso**: Esta política é menos segura (permite tudo), mas funciona para desenvolvimento.

---

## 📝 Depois de corrigir:

1. Volte para o seu site
2. Recarregue a página (F5)
3. Tente criar um produto novamente
4. O erro deve ter desaparecido!

## 🔍 Verificar se está funcionando:

No Supabase, vá em **Table Editor** > **products**:
- Se a tabela aparecer vazia (0 linhas) = ✅ Está funcionando!
- Se aparecer o erro novamente = ❌ Repita o processo

## 💡 Importante:

As políticas (policies) são **OBRIGATÓRIAS** quando você habilita RLS (Row Level Security). Sem elas, nenhuma operação é permitida, mesmo que você esteja autenticado.

Depois de executar o SQL, teste novamente no seu site!