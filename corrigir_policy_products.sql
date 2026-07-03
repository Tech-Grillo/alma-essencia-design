-- Corrigir políticas da tabela products para permitir INSERT

-- Remover política antiga de INSERT (se existir)
DROP POLICY IF EXISTS "Allow authenticated insert" ON products;

-- Criar nova política permitindo INSERT público (para anon key)
CREATE POLICY "Allow public insert" ON products
  FOR INSERT WITH CHECK (true);

-- Garantir que RLS está habilitado
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Verificar políticas atuais
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'products';