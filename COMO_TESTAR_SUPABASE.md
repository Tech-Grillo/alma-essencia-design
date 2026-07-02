# Como Saber se o Supabase está Funcionando

## 🎯 Teste 1: Verificar no Console do Navegador

1. Acesse http://localhost:8080/admin
2. Faça login
3. Pressione **F12** para abrir o DevTools
4. Vá na aba **"Console"**
5. Procure por estas mensagens:

### ✅ Se o Supabase estiver funcionando:
```
✅ Supabase configurado: https://vjznmeoftbgyebhclibb.supabase.co
```

### ❌ Se NÃO estiver funcionando:
```
⚠️ Supabase credentials not found. Please set VITE_SUPABASE_URL...
```

---

## 🎯 Teste 2: Criar um Produto com Imagem

1. No painel admin, clique em **"Inserir novo produto"**
2. Preencha os dados:
   - Nome: `Produto Teste`
   - Categoria: `Velas`
   - Preço: `99,90`
   - Imagem: Adicione uma imagem
3. Clique em **"Salvar produto"**

### ✅ Se funcionar:
- Mensagem verde: `Produto "Produto Teste" cadastrado com sucesso!`
- Console mostra: `✅ Produto salvo no Supabase`

### ❌ Se não funcionar:
- Mensagem de erro
- Console mostra: `Error saving product: ...`

---

## 🎯 Teste 3: Verificar no Supabase Dashboard

1. Acesse: https://supabase.com/dashboard/project/vjznmeoftbgyebhclibb/editor
2. Clique em **"Table Editor"** no menu lateral
3. Clique em **"products"**
4. Se aparecer o produto que você criou = ✅ **FUNCIONANDO!**

### Verificar imagens:
1. Clique em **"Storage"** no menu lateral
2. Clique em **"product-images"**
3. Se aparecer a imagem que você enviou = ✅ **FUNCIONANDO!**

---

## 🎯 Teste 4: Verificar a URL da Imagem

1. No painel admin, encontre o produto que você criou
2. Clique em **"Editar"**
3. Na seção de imagens, clique com o botão direito na imagem
4. Selecione **"Abrir imagem em nova aba"**

### ✅ Se funcionar:
- A imagem abre em uma nova aba
- A URL contém: `vjznmeoftbgyebhclibb.supabase.co`

### ❌ Se não funcionar:
- A imagem não abre
- A URL é um caminho local (ex: `/src/assets/...`)

---

## 🔍 Diagnóstico Rápido

### Se NÃO está funcionando, verifique:

1. **Arquivo .env.local existe?**
   ```bash
   # Deve ter estas linhas:
   VITE_SUPABASE_URL=https://vjznmeoftbgyebhclibb.supabase.co
   VITE_SUPABASE_ANON_KEY=sb_publishable_I6T782mAHfBHTJBxw0yIZA_w5jAx...
   ```

2. **Tabela products existe no Supabase?**
   - Vá em SQL Editor e execute:
   ```sql
   SELECT EXISTS (
     SELECT FROM information_schema.tables 
     WHERE table_schema = 'public' 
     AND table_name = 'products'
   );
   ```
   - Deve retornar: `true`

3. **Policies estão criadas?**
   - Execute no SQL Editor:
   ```sql
   SELECT policyname FROM pg_policies WHERE tablename = 'products';
   ```
   - Deve retornar 4 policies

4. **Bucket product-images existe?**
   - Vá em Storage
   - Deve aparecer o bucket "product-images"

---

## ✅ Checklist de Funcionamento:

- [ ] Console mostra "Supabase configurado"
- [ ] Consigo criar produto sem erro
- [ ] Produto aparece no Table Editor do Supabase
- [ ] Imagem aparece no Storage do Supabase
- [ ] URL da imagem contém "supabase.co"

---

## 🆘 Se ainda não funcionar:

1. **Verifique o console do navegador** (F12 > Console)
2. **Verifique o terminal** onde o servidor está rodando
3. **Verifique se o SQL foi executado** corretamente no Supabase
4. **Verifique se as policies foram criadas**

## 💡 Dica:

O sistema funciona em **modo híbrido**:
- Se Supabase não estiver configurado → usa localStorage
- Se Supabase estiver configurado → usa banco de dados
- Se houver erro → automaticamente usa localStorage

Então você pode testar mesmo sem Supabase funcionando!