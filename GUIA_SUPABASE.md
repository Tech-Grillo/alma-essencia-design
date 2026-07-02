# Guia: Implementar Supabase para Gerenciar Imagens

## O que é o Supabase?
- Backend como serviço (BaaS)
- Banco de dados PostgreSQL
- Armazenamento de arquivos (Storage)
- Autenticação
- Gratuito até 500MB de armazenamento

## Passo 1: Criar Projeto no Supabase

1. Acesse: https://supabase.com/
2. Clique em "Start your project"
3. Faça login com GitHub ou email
4. Clique em "New Project"
5. Preencha:
   - **Project name**: alma-essencia
   - **Database Password**: (escolha uma senha forte)
   - **Region**: South America (ou mais próxima)
6. Clique em "Create new project"
7. Aguarde 2 minutos para o projeto ser criado

## Passo 2: Obter Credenciais

1. No dashboard do projeto, vá em **Settings** (ícone de engrenagem)
2. Clique em **API**
3. Copie:
   - **Project URL** (ex: https://xxx.supabase.co)
   - **anon/public key** (chave pública)

## Passo 3: Configurar Banco de Dados

1. No menu lateral, vá em **SQL Editor**
2. Clique em **New query**
3. Cole o seguinte SQL:

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

-- Criar índice para busca por slug
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);

-- Criar índice para busca por categoria
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

4. Clique em **Run** para executar

## Passo 4: Configurar Storage (para imagens)

1. No menu lateral, vá em **Storage**
2. Clique em **New bucket**
3. Preencha:
   - **Name**: product-images
   - **Public bucket**: ✅ (marque esta opção)
   - **File size limit**: 50MB
   - **Allowed MIME types**: image/jpeg, image/png, image/webp
4. Clique em **Create bucket**

5. Agora vá em **Policies** (dentro do bucket)
6. Clique em **New policy**
7. Selecione **For full customization**
8. Cole o seguinte:

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

9. Clique em **Review** e depois **Save policy**

## Passo 5: Configurar Variáveis de Ambiente

1. Crie um arquivo `.env.local` na raiz do projeto (adicione no .gitignore)
2. Adicione:

```env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=sua_anon_key_aqui
```

3. Substitua pelos valores do seu projeto

## Passo 6: Instalar Dependências

```bash
npm install @supabase/supabase-js
```

## Próximos Passos

Depois de configurar o Supabase, vou implementar:
1. Cliente Supabase no código
2. Funções para upload de imagens
3. Integração com o painel admin
4. Busca de produtos do banco de dados

Você quer que eu continue com a implementação do código?