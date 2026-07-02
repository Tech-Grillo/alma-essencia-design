# Como Pegar as Credenciais do Supabase

## ✅ O que você já tem:
- **Publishable key**: `sb_publishable_I6T782mAHfBHTJBxw0yIZA_w5jAx...` ✅

## 🔍 O que você precisa encontrar:

### **Project URL (URL do Projeto)**

Você pode encontrar de 3 formas:

---

### **Forma 1: Na mesma página de API Keys**
1. Na página que você está (Settings > API)
2. Role a página para **CIMA** (para o topo)
3. Procure por uma seção chamada **"Project URL"** ou **"API URL"**
4. Vai aparecer algo como: `https://abc123.supabase.co`
5. Clique no botão de **copiar** ao lado

---

### **Forma 2: No Dashboard do Projeto**
1. Volte para a página principal do Supabase
2. No topo da página, clique no nome do seu projeto
3. A URL vai aparecer lá

---

### **Forma 3: Na barra de endereços do navegador**
1. Olhe para a barra de endereços do seu navegador
2. A URL vai estar lá, algo como:
   ```
   https://supabase.com/dashboard/project/ABC123/api
   ```
3. O `ABC123` é o ID do seu projeto
4. A URL completa vai ser: `https://ABC123.supabase.co`

---

## 📝 Depois de pegar a URL:

Edite o arquivo `.env.local` que eu criei:

```env
VITE_SUPABASE_URL=https://ABC123.supabase.co  # Cole a URL aqui
VITE_SUPABASE_ANON_KEY=sb_publishable_I6T782mAHfBHTJBxw0yIZA_w5jAx...  # Sua chave
```

## 🎯 Exemplo prático:

Se a URL do seu projeto for `https://alma-essencia-123.supabase.co`, o arquivo fica:

```env
VITE_SUPABASE_URL=https://alma-essencia-123.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_I6T782mAHfBHTJBxw0yIZA_w5jAx...
```

## ❓ Não consegue encontrar a URL?

Tente isto:
1. Clique no logo do Supabase (canto superior esquerdo) para voltar ao dashboard
2. Clique no card do seu projeto
3. A URL vai aparecer na tela

Ou simplesmente me diga o nome do seu projeto que eu te ajudo a montar a URL!