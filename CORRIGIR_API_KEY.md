# 🔑 Como Corrigir a API Key do Supabase

## ❌ Erro Atual

```
Error fetching products from Supabase: Object
hint: "Double check the provided API key for typos..."
message: "Invalid API key"
```

## 🔍 Passo a Passo para Pegar a API Key Correta

### 1. Acesse o Supabase Dashboard

Abra o navegador e acesse:
```
https://supabase.com/dashboard/project/vjznmeoftbgyebhclibb/settings/api
```

### 2. Encontre a API Key

Na página de configurações, procure por:

**"Project API keys"** ou **"API Keys"**

Você verá duas chaves:
- **anon/public** - Para uso no frontend (é essa que precisamos!)
- **service_role** - Para uso no backend (NÃO use essa no frontend!)

### 3. Copie a Chave "anon/public"

1. Clique no botão **"Copy"** ao lado da chave **anon/public**
2. A chave terá este formato:
   ```
   sb_publishable_I6T782mAHfBHTJBxw0yIZA_w5jAx...
   ```
   (mas será MUITO mais longa!)

### 4. Atualize o Arquivo `.env.local`

Abra o arquivo `.env.local` e substitua a linha 8 pela chave completa:

```env
# ANTES (incorreta - está truncada):
VITE_SUPABASE_ANON_KEY=sb_publishable_I6T782mAHfBHTJBxw0yIZA_w5jAx...

# DEPOIS (correta - chave completa):
VITE_SUPABASE_ANON_KEY=sb_publishable_I6T782mAHfBHTJBxw0yIZA_w5jAx1234567890abcdef...
```

**Cole a chave COMPLETA que você copiou do dashboard!**

### 5. Reinicie o Servidor

Após atualizar o `.env.local`, você PRECISA reiniciar o servidor:

```bash
# 1. Pare o servidor (Ctrl + C)

# 2. Inicie novamente:
npm run dev
```

## ✅ Verificação

Após reiniciar, abra o console do navegador (F12) e verifique se aparece:

```
✅ Supabase configurado: https://vjznmeoftbgyebhclibb.supabase.co
```

## 🎯 Exemplo Completo do `.env.local`

```env
# Supabase Configuration
# Projeto: vjznmeoftbgyebhclibb

# URL do projeto
VITE_SUPABASE_URL=https://vjznmeoftbgyebhclibb.supabase.co

# Publishable key (anon key) - COLE A CHAVE COMPLETA AQUI!
VITE_SUPABASE_ANON_KEY=sb_publishable_I6T782mAHfBHTJBxw0yIZA_w5jAx1234567890abcdefghijklmnopqrstuvwxyz
```

## ⚠️ Importante

- **NÃO** use a chave `service_role` no frontend (ela tem acesso total!)
- **SEMPRE** use a chave `anon/public` no frontend
- **NÃO** compartilhe essas chaves publicamente (não commit no git)
- **REINICIE** o servidor após alterar o `.env.local`

## 🔗 Links Úteis

- Dashboard do projeto: https://supabase.com/dashboard/project/vjznmeoftbgyebhclibb
- Documentação: https://supabase.com/docs/guides/getting-started/tutorials/with-react