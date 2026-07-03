# 🎯 Guia Completo: Testar se o Supabase está Funcionando

## 📋 Pré-requisitos

Antes de começar, verifique se você tem:
- [x] Arquivo `.env.local` configurado com as credenciais do Supabase
- [x] Dependências instaladas (`npm install` ou `bun install`)
- [x] Servidor rodando (`npm run dev` ou `bun run dev`)

---

## 🔍 Teste 1: Verificar no Console do Navegador

### Passo a passo:

1. **Abra o navegador** e acesse: `http://localhost:8080/admin`

2. **Abra o DevTools** (Ferramentas do Desenvolvedor):
   - Pressione **F12**
   - Ou clique com botão direito → **Inspecionar**

3. **Vá na aba "Console"**

4. **Faça login** no painel admin (email e senha)

5. **Procure por estas mensagens:**

### ✅ SUCESSO:
```
✅ Supabase configurado: https://vjznmeoftbgyebhclibb.supabase.co
```

### ❌ ERRO:
```
⚠️ Supabase credentials not found. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
```

---

## 🧪 Teste 2: Criar um Produto no Painel Admin

### Passo a passo:

1. **Acesse** `http://localhost:8080/admin`

2. **Faça login** com suas credenciais

3. **Preencha o formulário** de novo produto:
   - Nome: `Vela Teste`
   - Categoria: `Velas`
   - Preço: `79,90`
   - Imagem: Selecione uma imagem
   - Resumo: `Vela aromática teste`
   - Descrição: `Descrição do produto teste`
   - Aromas: `Lavanda, Baunilha`

4. **Clique em "Salvar produto"**

5. **Verifique:**
   - ✅ Mensagem verde de sucesso aparece
   - ✅ Produto aparece na lista abaixo
   - ✅ Contador de produtos aumenta

---

## 🔎 Teste 3: Verificar no Supabase Dashboard

### Passo a passo:

1. **Acesse** o Supabase Dashboard:
   ```
   https://supabase.com/dashboard/project/vjznmeoftbgyebhclibb
   ```

2. **Vá na seção "Table Editor"** (menu lateral esquerdo)

3. **Selecione a tabela `products`**

4. **Verifique se o produto aparece** na lista

5. **Clique no produto** para ver os detalhes:
   - Nome: `Vela Teste`
   - Categoria: `Velas`
   - Preço: `79.90`
   - Imagens: URLs do Supabase Storage
   - E todos os outros campos

---

## 📊 Teste 4: Verificar Storage (Imagens)

### Passo a passo:

1. **No Supabase Dashboard**, vá em **Storage** (menu lateral)

2. **Clique no bucket `product-images`**

3. **Verifique se há arquivos** de imagem uploadados

4. **Clique em uma imagem** para ver a URL pública

5. **Copie a URL** e abra no navegador para verificar se a imagem carrega

---

## 🐛 Troubleshooting

### Problema 1: "Supabase credentials not found"

**Solução:**
1. Verifique se o arquivo `.env.local` existe na raiz do projeto
2. Verifique se as variáveis estão corretas:
   ```env
   VITE_SUPABASE_URL=https://vjznmeoftbgyebhclibb.supabase.co
   VITE_SUPABASE_ANON_KEY=sb_publishable_I6T782mAHfBHTJBxw0yIZA_w5jAx...
   ```
3. **Reinicie o servidor** após alterar o `.env.local`

### Problema 2: Erro ao criar produto

**Solução:**
1. Verifique o console do navegador (F12) para ver o erro exato
2. Verifique se as tabelas foram criadas no Supabase:
   - Execute o arquivo `executar_no_supabase.sql` no SQL Editor do Supabase
3. Verifique se as políticas (RLS) estão configuradas

### Problema 3: Imagens não aparecem

**Solução:**
1. Verifique se o bucket `product-images` existe no Storage
2. Verifique se as políticas de Storage estão configuradas
3. Verifique se as URLs das imagens estão corretas

### Problema 4: Erro "relation 'products' does not exist"

**Solução:**
1. A tabela `products` não foi criada
2. Execute o script SQL no Supabase Dashboard:
   - Abra o arquivo `executar_no_supabase.sql`
   - Copie todo o conteúdo
   - Cole no SQL Editor do Supabase
   - Clique em "Run"

---

## ✅ Checklist de Verificação

Marque cada item após verificar:

- [ ] Console mostra "✅ Supabase configurado"
- [ ] Consigo fazer login no admin
- [ ] Consigo criar um produto
- [ ] Mensagem de sucesso aparece
- [ ] Produto aparece na lista
- [ ] Produto aparece no Supabase Dashboard (Table Editor)
- [ ] Imagens foram uploadadas para o Storage
- [ ] Imagens carregam corretamente

---

## 📝 Comandos Úteis

### Reiniciar servidor (se alterou .env.local):
```bash
# Windows
Ctrl + C
npm run dev

# Mac/Linux
./run-dev.sh
```

### Verificar variáveis de ambiente:
```bash
# No console do navegador (F12):
console.log(import.meta.env.VITE_SUPABASE_URL)
console.log(import.meta.env.VITE_SUPABASE_ANON_KEY)
```

### Limpar cache do localStorage (se necessário):
```javascript
// No console do navegador:
localStorage.clear()
location.reload()
```

---

## 🎯 Resultado Esperado

Se tudo estiver funcionando, você verá:

1. ✅ Console: `✅ Supabase configurado: https://vjznmeoftbgyebhclibb.supabase.co`
2. ✅ Admin: Produto criado com sucesso
3. ✅ Supabase Dashboard: Produto na tabela `products`
4. ✅ Supabase Storage: Imagens no bucket `product-images`

---

## 📞 Suporte

Se ainda houver problemas:
1. Verifique o console do navegador para erros detalhados
2. Verifique os logs do Supabase Dashboard
3. Verifique se todas as migrations foram executadas