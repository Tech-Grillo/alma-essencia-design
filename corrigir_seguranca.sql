-- 🔐 CORRIGIR SEGURANÇA - Remover política insegura e implementar autenticação

-- 1. Remover política INSEGURA de INSERT público
DROP POLICY IF EXISTS "Allow public insert" ON products;

-- 2. Criar política SEGURA - apenas usuários autenticados podem inserir
CREATE POLICY "Allow authenticated insert" ON products
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 3. Garantir que UPDATE e DELETE também são seguros
DROP POLICY IF EXISTS "Allow authenticated update" ON products;
CREATE POLICY "Allow authenticated update" ON products
  FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow authenticated delete" ON products;
CREATE POLICY "Allow authenticated delete" ON products
  FOR DELETE USING (auth.role() = 'authenticated');

-- 4. SELECT continua público (qualquer um pode ver produtos)
-- (não precisa mudar, já está correto)

-- 5. Verificar políticas atuais
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'products';