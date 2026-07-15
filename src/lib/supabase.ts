import { createClient } from '@supabase/supabase-js';
import { compressImage } from './image-compression';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase credentials not found. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env.local file');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

// Função para fazer upload de imagem
export async function uploadImage(file: File, path: string): Promise<string> {
  const compressedFile = await compressImage(file);           
  const fileExt = compressedFile.name.split('.').pop();        
  const fileName = `${path}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
  
  const { data, error } = await supabase.storage
    .from('product-images')
    .upload(fileName, compressedFile, {                        
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    console.error('Error uploading image:', error);
    throw error;
  }

  // Retornar URL pública da imagem
  const { data: { publicUrl } } = supabase.storage
    .from('product-images')
    .getPublicUrl(fileName);

  return publicUrl;
}

// Função para deletar imagem
export async function deleteImage(filePath: string): Promise<void> {
  const { error } = await supabase.storage
    .from('product-images')
    .remove([filePath]);

  if (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
}

// Função para buscar todos os produtos
export async function fetchProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products:', error);
    throw error;
  }

  return data || [];
}

// Função para buscar produto por slug
export async function fetchProductBySlug(slug: string) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    console.error('Error fetching product:', error);
    throw error;
  }

  return data;
}

// Função para criar produto
export async function createProduct(product: any) {
  const { data, error } = await supabase
    .from('products')
    .insert([product])
    .select()
    .single();

  if (error) {
    console.error('Error creating product:', error);
    throw error;
  }

  return data;
}

// Função para atualizar produto
export async function updateProduct(id: number, product: any) {
  const { data, error } = await supabase
    .from('products')
    .update(product)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating product:', error);
    throw error;
  }

  return data;
}

// Função para deletar produto
export async function deleteProduct(id: number) {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
}