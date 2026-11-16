# Alma e Essência

Site de aromaterapia artesanal: catálogo, carrinho com finalização por WhatsApp e painel administrativo.

**Stack:** React 19 · TypeScript · Vite · TanStack Start/Router · Tailwind 4 · Supabase · Cloudflare Workers

## Rodando localmente

```bash
npm install
cp .env.example .env.local   # preencha as chaves do Supabase
npm run dev
```

## Scripts

| Comando | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |

## Estrutura

```
src/
├── assets/       imagens e ícones
├── components/   Header, Footer, ProductCard, admin/...
├── hooks/
├── lib/          supabase, carrinho, produtos, analytics
├── routes/       páginas (TanStack Router)
└── server.ts     entrada do Worker (tratamento de erro SSR)
```
