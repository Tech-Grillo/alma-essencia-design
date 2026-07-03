-- Configurar políticas de Storage para o bucket product-images

-- 1. Garantir que o bucket existe
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/jng', 'image/gif', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- 2. Política para permitir upload de imagens (autenticado)
CREATE POLICY "Allow authenticated uploads" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'product-images' 
    AND auth.role() = 'authenticated'
  );

-- 3. Política para permitir leitura pública das imagens
CREATE POLICY "Allow public read" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

-- 4. Política para permitir atualização (autenticado)
CREATE POLICY "Allow authenticated updates" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'product-images' 
    AND auth.role() = 'authenticated'
  );

-- 5. Política para permitir exclusão (autenticado)
CREATE POLICY "Allow authenticated deletes" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'product-images' 
    AND auth.role() = 'authenticated'
  );

-- 6. Garantir que RLS está habilitado
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 7. Garantir que o bucket é público
UPDATE storage.buckets 
SET public = true 
WHERE id = 'product-images';