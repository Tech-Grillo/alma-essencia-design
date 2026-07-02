# Como Pegar a URL do Projeto Supabase

## 🎯 Método Mais Fácil (3 passos):

### 1. Volte para o Dashboard
- Clique no logo do Supabase no canto superior esquerdo
- Ou clique em "Home" no menu lateral

### 2. Clique no seu projeto
- Você vai ver um card com o nome do seu projeto
- Clique nele

### 3. Copie a URL
- A URL vai aparecer na tela
- Vai ser algo como: `https://seu-projeto.supabase.co`

---

## 🔍 Se ainda não encontrar:

### Olhe na barra de endereços do navegador:

Quando você está no dashboard do projeto, a URL no navegador é algo assim:
```
https://supabase.com/dashboard/project/ABC123def456
```

Onde está `ABC123def456` é o ID do seu projeto.

A URL da API vai ser:
```
https://ABC123def456.supabase.co
```

**Basta trocar** `supabase.com/dashboard/project/` por `supabase.co`

---

## 📝 Exemplo Prático:

Se na barra de endereços você ver:
```
https://supabase.com/dashboard/project/alma-essencia-123abc
```

A URL do projeto é:
```
https://alma-essencia-123abc.supabase.co
```

---

## ✅ Depois de pegar a URL:

Edite o arquivo `.env.local`:

```env
VITE_SUPABASE_URL=https://alma-essencia-123abc.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_I6T782mAHfBHTJBxw0yIZA_w5jAx...
```

---

## 🆘 Ainda com dificuldade?

Me diga:
1. Qual o nome do seu projeto no Supabase?
2. Qual a URL que aparece na barra de endereços do navegador?

Que eu te ajudo a montar a URL correta!