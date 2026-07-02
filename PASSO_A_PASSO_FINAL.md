# 🎯 Passo a Passo Final - Supabase Pronto!

## ✅ O que já está configurado:

- ✅ URL do projeto: `https://vjznmeoftbgyebhclibb.supabase.co`
- ✅ API Key: `sb_publishable_I6T782mAHfBHTJBxw0yIZA_w5jAx...`
- ✅ Arquivo `.env.local` criado e preenchido
- ✅ Código implementado

## 📋 O que você precisa fazer agora:

### **Passo 1: Configurar o Banco de Dados**

1. Acesse: https://supabase.com/dashboard/project/vjznmeoftbgyebhclibb/editor
2. Clique em **"SQL Editor"** no menu lateral esquerdo
3. Clique em **"New query"**
4. **Copie e cole** o SQL abaixo:

```sql
-- Criar tabela de produtos
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

-- Criar índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);

-- Habilitar Row Level Security (RLS)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Permitir leitura pública (qualquer pessoa pode ver produtos)
CREATE POLICY "Allow public read" ON products
  FOR SELECT USING (true);

-- Permitir inserção apenas para usuários autenticados
CREATE POLICY "Allow authenticated insert" ON products
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Permitir atualização apenas para usuários autenticados
CREATE POLICY "Allow authenticated update" ON products
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Permitir exclusão apenas para usuários autenticados
CREATE POLICY "Allow authenticated delete" ON products
  FOR DELETE USING (auth.role() = 'authenticated');
```

5. Clique em **"Run"** (botão verde no canto inferior direito)
6. Aguarde aparecer "Success. No rows returned"

---

### **Passo 2: Configurar o Storage (para imagens)**

1. No menu lateral, clique em **"Storage"**
2. Clique em **"New bucket"**
3. Preencha:
   - **Name**: `product-images`
   - **Public bucket**: ✅ (marque esta opção)
   - **File size limit**: `50MB`
   - **Allowed MIME types**: `image/jpeg, image/png, image/webp`
4. Clique em **"Create bucket"**

5. Agora, dentro do bucket `product-images`, clique em **"Policies"**
6. Clique em **"New policy"**
7. Selecione **"For full customization"**
8. Cole o SQL abaixo:

```sql
-- Permitir upload de imagens para usuários autenticados
CREATE POLICY "Allow authenticated uploads" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'product-images' 
    AND auth.role() = 'authenticated'
  );

-- Permitir leitura pública das imagens
CREATE POLICY "Allow public read" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

-- Permitir atualização para usuários autenticados
CREATE POLICY "Allow authenticated updates" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'product-images' 
    AND auth.role() = 'authenticated'
  );

-- Permitir exclusão para usuários autenticados
CREATE POLICY "Allow authenticated deletes" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'product-images' 
    AND auth.role() = 'authenticated'
  );
```

9. Clique em **"Review"** e depois **"Save policy"**

---

### **Passo 3: Instalar a Dependência**

Abra o terminal na pasta do projeto e execute:

```bash
npm install @supabase/supabase-js
```

---

### **Passo 4: Testar!**

1. Reinicie o servidor de desenvolvimento
2. Acesse: http://localhost:5173/admin
3. Faça login com:
   - Email: `admin@almaeessencia.com`
   - Senha: `admin123`
4. Tente criar um produto com imagens
5. As imagens vão ser enviadas para o Supabase automaticamente!

---

## 🎯 Pronto!

Agora você tem:
- ✅ Banco de dados PostgreSQL funcionando
- ✅ Storage de imagens na nuvem
- ✅ Upload automático de imagens
- ✅ Sistema híbrido (funciona com ou sem Supabase)

## 🆘 Problemas?

1. **Erro de conexão**: Verifique se a URL e a chave estão corretas no `.env.local`
2. **Erro ao criar tabela**: Verifique se o SQL foi executado corretamente
3. **Erro ao fazer upload**: Verifique se o bucket foi criado e as políticas estão configuradas
4. **Console do navegador**: Abra o DevTools (F12) para ver erros detalhados

## 💡 Dica:

O sistema funciona em **modo híbrido**:
- Se o Supabase não estiver configurado → usa localStorage
- Se o Supabase estiver configurado → usa o banco de dados
- Se houver erro no Supabase → automaticamente usa localStorage

Então você pode testar mesmo sem configurar tudo!