# 📊 Como Monitorar o Supabase em Tempo Real

## 🎯 Acesso Rápido ao Dashboard

### Link Direto:
```
https://supabase.com/dashboard/project/vjznmeoftbgyebhclibb/table-editor
```

---

## 📋 3 Formas de Ver os Dados:

### 1️⃣ **Table Editor** (Mais Fácil - Recomendado)

**O que é:** Visualização visual das tabelas como se fosse uma planilha Excel

**Como acessar:**
1. Acesse: https://supabase.com/dashboard/project/vjznmeoftbgyebhclibb/table-editor
2. No menu lateral esquerdo, clique em **"products"**
3. Pronto! Você verá todos os produtos cadastrados

**Características:**
- ✅ Atualiza **automaticamente** quando você cadastra/edita/exclui produtos
- ✅ Visualização em formato de tabela
- ✅ Pode editar diretamente clicando nas células
- ✅ Pode adicionar novas linhas
- ✅ Pode excluir linhas

**Como usar:**
```
1. Abra o Table Editor em uma aba
2. Abra o admin (http://localhost:8080/admin) em outra aba
3. Cadastre um produto no admin
4. Volte para o Table Editor - o produto aparece AUTOMATICAMENTE!
```

---

### 2️⃣ **SQL Editor** (Para Consultas Personalizadas)

**O que é:** Executar consultas SQL personalizadas

**Como acessar:**
1. Acesse: https://supabase.com/dashboard/project/vjznmeoftbgyebhclibb/editor
2. Clique em **"New query"** (canto superior direito)
3. Escreva sua consulta SQL
4. Clique em **"Run"** (botão verde)

**Consultas Úteis:**

```sql
-- Ver todos os produtos (mais recentes primeiro)
SELECT * FROM products ORDER BY created_at DESC;

-- Ver apenas produtos de uma categoria
SELECT * FROM products WHERE category = 'Velas';

-- Contar quantos produtos existem
SELECT COUNT(*) FROM products;

-- Ver produtos com preço maior que R$ 50
SELECT * FROM products WHERE price > 50;

-- Ver apenas nome e preço dos produtos
SELECT name, price, category FROM products;

-- Ver produtos criados hoje
SELECT * FROM products 
WHERE DATE(created_at) = CURRENT_DATE;

-- Ver estatísticas por categoria
SELECT category, COUNT(*) as total, AVG(price) as preco_medio
FROM products 
GROUP BY category;
```

---

### 3️⃣ **Storage** (Para Ver Imagens)

**O que é:** Gerenciar arquivos de imagem

**Como acessar:**
1. Acesse: https://supabase.com/dashboard/project/vjznmeoftbgyebhclibb/storage
2. Clique no bucket **"product-images"**
3. Você verá todas as imagens organizadas em pastas

**Características:**
- ✅ Vê todas as imagens uploadadas
- ✅ Pode visualizar cada imagem
- ✅ Pode copiar a URL pública
- ✅ Pode excluir imagens

**Estrutura de pastas:**
```
product-images/
└── products/
    ├── 1783089879453-f0z1.jpg
    ├── 1783089880149-br8bx.jpg
    └── ...
```

---

## 🔍 Monitoramento em Tempo Real - Passo a Passo

### Configuração Recomendada:

1. **Abra 3 abas no navegador:**

   **Aba 1 - Admin:**
   ```
   http://localhost:8080/admin
   ```
   - Use para cadastrar/editar/excluir produtos

   **Aba 2 - Table Editor:**
   ```
   https://supabase.com/dashboard/project/vjznmeoftbgyebhclibb/table-editor
   ```
   - Monitore produtos em tempo real

   **Aba 3 - Storage:**
   ```
   https://supabase.com/dashboard/project/vjznmeoftbgyebhclibb/storage
   ```
   - Monitore imagens uploadadas

2. **Teste o fluxo:**
   - Cadastre um produto no admin (Aba 1)
   - Veja aparecer no Table Editor (Aba 2) - **atualização automática!**
   - Veja a imagem no Storage (Aba 3)

---

## 📊 Dados que Você Verá na Tabela `products`:

| Coluna | Descrição | Exemplo |
|--------|-----------|---------|
| `id` | ID único do produto | 1, 2, 3... |
| `slug` | URL amigável do produto | `vela-aromatica-lavanda` |
| `name` | Nome do produto | `Vela Aromática de Soja` |
| `category` | Categoria | `Velas` |
| `price` | Preço | `79.90` |
| `images` | Array de URLs das imagens | `["https://...", "https://..."]` |
| `short` | Resumo curto | `Cera de soja natural...` |
| `description` | Descrição completa | `Vela artesanal feita...` |
| `purchaseLink` | Link de compra | `/produtos/vela-aromatica-lavanda#comprar` |
| `scents` | Array de aromas | `["Lavanda", "Baunilha"]` |
| `sizes` | Array de tamanhos/preços | `[{"label": "P", "price": 59.9}]` |
| `created_at` | Data de criação | `2025-01-15 10:30:00` |
| `updated_at` | Data de atualização | `2025-01-15 10:30:00` |

---

## 🎯 Dicas Úteis:

### 1. **Filtros no Table Editor:**
- Clique no ícone de **filtro** (funil) no topo da tabela
- Filtre por categoria, preço, data, etc.

### 2. **Ordenação:**
- Clique no nome da coluna para ordenar
- Ex: Clique em `created_at` para ver produtos mais recentes primeiro

### 3. **Edição Rápida:**
- Clique duas vezes em qualquer célula para editar diretamente
- Muito útil para corrigir pequenos erros

### 4. **Exportar Dados:**
- Clique em **"Export"** no topo da tabela
- Escolha o formato: CSV, JSON, etc.

---

## 🐛 Troubleshooting:

### Problema: "Não vejo a tabela products"
**Solução:** Execute o script SQL `executar_no_supabase.sql` no SQL Editor

### Problema: "Não consigo inserir produtos (erro 401)"
**Solução:** Execute o script SQL `corrigir_policy_products.sql` no SQL Editor

### Problema: "Imagens não aparecem"
**Solução:** Execute o script SQL `configurar_storage.sql` no SQL Editor

---

## 📞 Links Úteis:

- **Table Editor:** https://supabase.com/dashboard/project/vjznmeoftbgyebhclibb/table-editor
- **SQL Editor:** https://supabase.com/dashboard/project/vjznmeoftbgyebhclibb/editor
- **Storage:** https://supabase.com/dashboard/project/vjznmeoftbgyebhclibb/storage
- **Settings:** https://supabase.com/dashboard/project/vjznmeoftbgyebhclibb/settings/api

---

## ✅ Resumo:

**Para monitorar em tempo real:**
1. Abra o Table Editor: https://supabase.com/dashboard/project/vjznmeoftbgyebhclibb/table-editor
2. Clique na tabela `products`
3. Cadastre/edite produtos no admin
4. Veja as mudanças aparecerem AUTOMATICAMENTE no Table Editor!

**É literalmente em tempo real!** 🚀