# Como Instalar @supabase/supabase-js

## ❌ Problema:
Os comandos `npm` e `bun` não estão disponíveis no seu sistema.

## ✅ Soluções:

### **Opção 1: Usar o Node.js portátil (se existir)**

Verifique se existe uma pasta `node-v24.16.0-win-x64` no seu projeto. Se existir:

1. Abra o PowerShell na pasta do projeto
2. Execute:
```powershell
.\node-v24.16.0-win-x64\npm.cmd install @supabase/supabase-js
```

---

### **Opção 2: Instalar Node.js (recomendado)**

1. Acesse: https://nodejs.org/
2. Baixe a versão LTS (recomendada)
3. Instale o Node.js
4. Abra um NOVO terminal e execute:
```bash
npm install @supabase/supabase-js
```

---

### **Opção 3: Usar o VS Code Terminal**

1. No VS Code, pressione `Ctrl + `` (crase) para abrir o terminal
2. Verifique se npm está disponível:
```bash
npm --version
```

3. Se aparecer uma versão, execute:
```bash
npm install @supabase/supabase-js
```

---

### **Opção 4: Instalar via PowerShell (se tiver permissão)**

Execute no PowerShell como Administrador:
```powershell
winget install OpenJS.NodeJS.LTS
```

Depois reinicie o terminal e execute:
```bash
npm install @supabase/supabase-js
```

---

## 🎯 Qual opção usar?

**Se você tem o Node.js instalado**: Use a Opção 1 ou 3
**Se não tem Node.js**: Use a Opção 2 (mais fácil)

---

## ✅ Depois de instalar:

1. Reinicie o servidor de desenvolvimento
2. Acesse http://localhost:5173/admin
3. Teste criar um produto com imagens

---

## 💡 Dica:

Se você não quiser instalar a dependência agora, o sistema **ainda funciona**!
- Sem a dependência: Usa localStorage (modo local)
- Com a dependência: Usa Supabase (modo nuvem)

Você pode testar o painel admin mesmo sem instalar!