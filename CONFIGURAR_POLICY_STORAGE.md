# Configurar Policy do Storage - Passo a Passo DIRETO

## Você está na tela: "Adding new policy to product-images"

Preencha EXATAMENTE assim:

---

### 1. **Policy name** (primeiro campo)
```
Allow public uploads and reads
```

---

### 2. **Allowed operation** (segundo campo)
Marque estas 4 opções:
- ✅ **SELECT** (já está marcado)
- ✅ **INSERT** (marque esta)
- ✅ **UPDATE** (marque esta)
- ✅ **DELETE** (marque esta)

**OU** se preferir mais simples, clique nos botões:
- `upload`
- `download`
- `list`
- `update`
- `remove`

---

### 3. **Target roles** (terceiro campo)
Deixe como está: **"Defaults to all (public) roles if none selected"**

(Não precisa mudar nada aqui)

---

### 4. **Policy definition** (último campo - código SQL)
Apague o que está lá e cole EXATAMENTE isso:

```sql
bucket_id = 'product-images'
```

**Pronto!** Apenas essa linha.

---

### 5. Clique no botão **"Review"** (verde, no canto inferior direito)

### 6. Na próxima tela, clique em **"Save policy"**

---

## ✅ Pronto!

Agora teste novamente no seu site!

---

## 🆘 Se ainda der erro:

Volte no SQL Editor e execute o arquivo `executar_no_supabase.sql` que eu criei.