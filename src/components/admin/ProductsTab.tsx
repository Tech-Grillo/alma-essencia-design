// Gestão de produtos: lista com busca e um único editor (painel lateral) para criar e editar.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as Icons from "lucide-react";
import type { Product, SizeOption } from "@/lib/products-supabase";
import { deleteProductFromDb, getAllCategories, getAllProducts, saveProduct, updateProductInDb } from "@/lib/products-supabase";
import placeholderProduto from "@/assets/placeholder-produto.webp";
import { Button, Card, EmptyState, Field, MoneyInput, Notice, Sheet, brl, inputClass, useToast } from "./ui";

const lowestPrice = (p: Product) => (p.sizes?.length ? Math.min(...p.sizes.map((s) => s.price)) : p.price);

export function ProductsTab() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("todas");
  const [editing, setEditing] = useState<Product | "new" | null>(null);
  const { show, toast } = useToast();

  const load = useCallback(async () => {
    try {
      setProducts(await getAllProducts());
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
      setProducts([]);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const categories = useMemo(
    () => [...new Set([...(products ?? []).map((p) => p.category), ...getAllCategories()])].filter(Boolean),
    [products],
  );
  const usedCategories = useMemo(() => [...new Set((products ?? []).map((p) => p.category))].sort(), [products]);

  const term = search.trim().toLowerCase();
  const shown = (products ?? []).filter(
    (p) => (category === "todas" || p.category === category) && (!term || p.name.toLowerCase().includes(term)),
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Icons.Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input className={`${inputClass} pl-9`} placeholder="Buscar produto" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className={`${inputClass} sm:w-56`} value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Filtrar por categoria">
          <option value="todas">Todas as categorias</option>
          {usedCategories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <Button onClick={() => setEditing("new")}>
          <Icons.Plus className="h-4 w-4" /> Novo produto
        </Button>
      </div>

      {!products ? (
        <p className="text-sm text-muted-foreground">Carregando...</p>
      ) : shown.length === 0 ? (
        <EmptyState
          icon={<Icons.Package className="h-6 w-6" />}
          title={products.length === 0 ? "Nenhum produto cadastrado" : "Nenhum produto encontrado"}
          text={products.length === 0 ? "Cadastre o primeiro produto para ele aparecer na loja." : "Tente outro nome ou outra categoria."}
          action={
            products.length === 0 ? (
              <Button onClick={() => setEditing("new")}>
                <Icons.Plus className="h-4 w-4" /> Novo produto
              </Button>
            ) : undefined
          }
        />
      ) : (
        <Card className="overflow-hidden">
          <p className="border-b border-border px-4 py-3 text-xs text-muted-foreground sm:px-5">
            {shown.length} {shown.length === 1 ? "produto" : "produtos"}
          </p>
          <ul className="divide-y divide-border">
            {shown.map((p) => (
              <li key={p.slug} className="flex items-center gap-3 px-4 py-3 transition hover:bg-secondary/40 sm:gap-4 sm:px-5">
                <button onClick={() => setEditing(p)} className="flex min-w-0 flex-1 items-center gap-3 text-left sm:gap-4">
                  <img
                    src={p.images?.[0] || placeholderProduto}
                    alt=""
                    className="h-14 w-14 flex-shrink-0 rounded-xl border border-border bg-secondary object-cover"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{p.name}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {p.category}
                      {p.sizes?.length > 1 && ` · ${p.sizes.length} tamanhos`}
                    </span>
                  </span>
                  <span className="text-right">
                    {p.sizes?.length > 1 && <span className="block text-[11px] text-muted-foreground">a partir de</span>}
                    <span className="font-medium">{brl(lowestPrice(p))}</span>
                  </span>
                </button>
                <a
                  href={`/produtos/${p.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="hidden rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground sm:block"
                  aria-label={`Ver ${p.name} no site`}
                  title="Ver no site"
                >
                  <Icons.ExternalLink className="h-4 w-4" />
                </a>
                <button
                  onClick={() => setEditing(p)}
                  className="rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground"
                  aria-label={`Editar ${p.name}`}
                  title="Editar"
                >
                  <Icons.Pencil className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {editing && (
        <ProductEditor
          product={editing === "new" ? null : editing}
          categories={categories}
          onClose={() => setEditing(null)}
          onSaved={async (message) => {
            setEditing(null);
            show(message);
            await load();
          }}
        />
      )}
      {toast}
    </div>
  );
}

// ---------------------------------------------------------------------------

type SizeRow = { label: string; unit: string; price: number | null };
const NEW_CATEGORY = "__nova__";

function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const max = 1200;
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("canvas"));
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      img.onerror = () => reject(new Error("imagem"));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("arquivo"));
    reader.readAsDataURL(file);
  });
}

function ProductEditor({
  product,
  categories,
  onClose,
  onSaved,
}: {
  product: Product | null;
  categories: string[];
  onClose: () => void;
  onSaved: (message: string) => void;
}) {
  const isNew = !product;
  const [name, setName] = useState(product?.name ?? "");
  const [categoryValue, setCategoryValue] = useState(product?.category ?? "");
  const [newCategory, setNewCategory] = useState("");
  const [description, setDescription] = useState(product?.description ?? "");
  const [scents, setScents] = useState<string[]>(product?.scents?.filter((s) => s && s !== "Essencia especial") ?? []);
  const [images, setImages] = useState<string[]>(product?.images?.filter((i) => i && !i.includes("placeholder")) ?? []);
  const [sizes, setSizes] = useState<SizeRow[]>(
    product?.sizes?.length
      ? product.sizes.map((s) => ({ label: s.label, unit: s.unit ?? "", price: s.price }))
      : [{ label: "Único", unit: "", price: product?.price ?? null }],
  );
  const [triedSave, setTriedSave] = useState(false);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const singlePrice = sizes.length === 1 && /^[uú]nico$/i.test(sizes[0].label.trim());

  const addFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    const list = Array.from(files);
    if (list.some((f) => !f.type.startsWith("image/"))) return setFormError("Escolha apenas arquivos de imagem.");
    try {
      const compressed = await Promise.all(list.map(compressImage));
      setImages((prev) => [...prev, ...compressed]);
      setFormError("");
    } catch {
      setFormError("Não foi possível ler uma das imagens. Tente outra.");
    }
  };

  const updateSize = (i: number, patch: Partial<SizeRow>) => setSizes((rows) => rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));

  const resolvedCategory = categoryValue === NEW_CATEGORY ? newCategory.trim() : categoryValue;

  const computeErrors = (): Record<string, string> => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Informe o nome do produto.";
    if (!resolvedCategory) e.category = categoryValue === NEW_CATEGORY ? "Digite o nome da nova categoria." : "Escolha a categoria.";
    if (!description.trim()) e.description = "Escreva uma descrição.";
    if (sizes.some((s) => !s.price || s.price <= 0)) e.sizes = singlePrice ? "Informe o preço." : "Todo tamanho precisa de um preço.";
    else if (!singlePrice && sizes.some((s) => !s.label.trim())) e.sizes = "Dê um nome para cada tamanho (ex.: Pequeno).";
    else if (new Set(sizes.map((s) => s.label.trim().toLowerCase())).size !== sizes.length) e.sizes = "Há dois tamanhos com o mesmo nome.";
    return e;
  };
  // Os erros só aparecem depois da primeira tentativa de salvar, e somem assim que o campo é corrigido.
  const errors = triedSave ? computeErrors() : {};

  const save = async () => {
    setFormError("");
    setTriedSave(true);
    if (saving || Object.keys(computeErrors()).length > 0) return;
    const cat = resolvedCategory;

    const finalSizes: SizeOption[] = sizes.map((s) => ({
      label: s.label.trim() || "Único",
      ...(s.unit.trim() ? { unit: s.unit.trim() } : {}),
      price: Number(s.price),
    }));
    const data = {
      name: name.trim(),
      category: cat,
      description: description.trim(),
      scents,
      sizes: finalSizes,
      price: Math.min(...finalSizes.map((s) => s.price)), // o site mostra "a partir de" o menor preço
      images: images.length ? images : [placeholderProduto],
    };

    setSaving(true);
    try {
      if (isNew) {
        await saveProduct(data);
      } else {
        if (!product.id) throw new Error("Produto sem ID.");
        await updateProductInDb(product.id, { ...product, ...data });
      }
      onSaved(isNew ? `“${data.name}” cadastrado` : `“${data.name}” atualizado`);
    } catch (error) {
      const duplicated = error instanceof Error && error.message.includes("products_slug_key");
      setFormError(
        duplicated
          ? "Já existe um produto com esse nome. Use um nome diferente."
          : `Não foi possível salvar: ${error instanceof Error ? error.message : "tente de novo."}`,
      );
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!product) return;
    setSaving(true);
    try {
      await deleteProductFromDb(product.slug);
      onSaved(`“${product.name}” excluído`);
    } catch {
      setFormError("Não foi possível excluir. Tente de novo.");
      setSaving(false);
    }
  };

  const footer = confirmDelete ? (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm">
        Excluir <strong>{product?.name}</strong>? Isso não pode ser desfeito.
      </p>
      <div className="flex gap-2">
        <Button variant="secondary" onClick={() => setConfirmDelete(false)} disabled={saving}>
          Cancelar
        </Button>
        <Button variant="destructive" onClick={remove} disabled={saving}>
          {saving ? "Excluindo..." : "Excluir"}
        </Button>
      </div>
    </div>
  ) : (
    <div className="flex items-center justify-between gap-3">
      {!isNew ? (
        <Button variant="danger" onClick={() => setConfirmDelete(true)} disabled={saving}>
          <Icons.Trash2 className="h-4 w-4" /> Excluir
        </Button>
      ) : (
        <span />
      )}
      <div className="flex gap-2">
        <Button variant="secondary" onClick={onClose} disabled={saving}>
          Cancelar
        </Button>
        <Button onClick={save} disabled={saving}>
          {saving ? <Icons.Loader2 className="h-4 w-4 animate-spin" /> : <Icons.Check className="h-4 w-4" />}
          {saving ? "Salvando..." : isNew ? "Cadastrar" : "Salvar"}
        </Button>
      </div>
    </div>
  );

  return (
    <Sheet open title={isNew ? "Novo produto" : "Editar produto"} onClose={onClose} footer={footer}>
      <div className="space-y-6">
        {formError && <Notice>{formError}</Notice>}

        {/* Fotos */}
        <section>
          <p className="mb-1.5 text-sm font-medium">Fotos</p>
          <div
            className={`grid grid-cols-3 gap-2 rounded-xl sm:grid-cols-4 ${dragging ? "ring-2 ring-caramel/40" : ""}`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              addFiles(e.dataTransfer.files);
            }}
          >
            {images.map((src, i) => (
              <div key={`${i}-${src.slice(-24)}`} className="group relative aspect-square overflow-hidden rounded-xl border border-border bg-secondary">
                <img src={src} alt="" className="h-full w-full object-cover" />
                {i === 0 && (
                  <span className="absolute left-1.5 top-1.5 rounded-md bg-background/90 px-1.5 py-0.5 text-[10px] font-semibold">Capa</span>
                )}
                <div className="absolute inset-x-1.5 bottom-1.5 flex justify-between gap-1">
                  {i > 0 ? (
                    <button
                      type="button"
                      onClick={() => setImages((list) => [list[i], ...list.filter((_, idx) => idx !== i)])}
                      className="rounded-md bg-background/90 px-1.5 py-1 text-[10px] font-semibold hover:bg-background"
                    >
                      Usar como capa
                    </button>
                  ) : (
                    <span />
                  )}
                  <button
                    type="button"
                    onClick={() => setImages((list) => list.filter((_, idx) => idx !== i))}
                    className="rounded-md bg-background/90 p-1 hover:bg-background"
                    aria-label="Remover foto"
                  >
                    <Icons.X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-border text-xs text-muted-foreground transition hover:border-caramel hover:text-foreground"
            >
              <Icons.ImagePlus className="h-5 w-5" />
              Adicionar
            </button>
          </div>
          <input ref={fileInput} type="file" accept="image/*" multiple hidden onChange={(e) => addFiles(e.target.files)} />
          <p className="mt-1.5 text-xs text-muted-foreground">Arraste ou clique para adicionar. A primeira foto é a capa na loja.</p>
        </section>

        <Field label="Nome" required error={errors.name}>
          <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex.: Vela aromática de lavanda" />
        </Field>

        <Field label="Categoria" required error={errors.category}>
          <select className={inputClass} value={categoryValue} onChange={(e) => setCategoryValue(e.target.value)}>
            <option value="">Selecione</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
            <option value={NEW_CATEGORY}>+ Nova categoria…</option>
          </select>
          {categoryValue === NEW_CATEGORY && (
            <input
              className={`${inputClass} mt-2`}
              autoFocus
              placeholder="Nome da nova categoria"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
            />
          )}
        </Field>

        {/* Preço e tamanhos */}
        <section>
          {singlePrice ? (
            <Field label="Preço" required error={errors.sizes}>
              <MoneyInput value={sizes[0].price} onChange={(price) => updateSize(0, { price })} />
              <button
                type="button"
                onClick={() => setSizes([{ label: "", unit: "", price: sizes[0].price }, { label: "", unit: "", price: null }])}
                className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-caramel-deep hover:underline"
              >
                <Icons.Plus className="h-3.5 w-3.5" /> Vender em tamanhos diferentes
              </button>
            </Field>
          ) : (
            <div>
              <p className="mb-1.5 text-sm font-medium">
                Tamanhos e preços <span className="text-caramel-deep">*</span>
              </p>
              <div className="space-y-2">
                <div className="grid grid-cols-[1fr_0.8fr_1fr_auto] gap-2 px-0.5 text-xs text-muted-foreground">
                  <span>Nome</span>
                  <span>Medida</span>
                  <span>Preço</span>
                  <span className="w-8" />
                </div>
                {sizes.map((s, i) => (
                  <div key={i} className="grid grid-cols-[1fr_0.8fr_1fr_auto] items-center gap-2">
                    <input className={inputClass} placeholder="Pequeno" value={s.label} onChange={(e) => updateSize(i, { label: e.target.value })} aria-label="Nome do tamanho" />
                    <input className={inputClass} placeholder="150ml" value={s.unit} onChange={(e) => updateSize(i, { unit: e.target.value })} aria-label="Medida" />
                    <MoneyInput value={s.price} onChange={(price) => updateSize(i, { price })} ariaLabel="Preço" />
                    <button
                      type="button"
                      onClick={() =>
                        setSizes((rows) => {
                          const next = rows.filter((_, idx) => idx !== i);
                          return next.length ? next : [{ label: "Único", unit: "", price: null }];
                        })
                      }
                      className="rounded-lg p-2 text-muted-foreground hover:bg-secondary"
                      aria-label="Remover tamanho"
                    >
                      <Icons.X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
              {errors.sizes && <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">{errors.sizes}</p>}
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                <button
                  type="button"
                  onClick={() => setSizes((rows) => [...rows, { label: "", unit: "", price: null }])}
                  className="inline-flex items-center gap-1 text-xs font-medium text-caramel-deep hover:underline"
                >
                  <Icons.Plus className="h-3.5 w-3.5" /> Adicionar tamanho
                </button>
                <button
                  type="button"
                  onClick={() => setSizes([{ label: "Único", unit: "", price: sizes.find((s) => s.price)?.price ?? null }])}
                  className="text-xs text-muted-foreground hover:underline"
                >
                  Usar preço único
                </button>
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground">Na loja aparece “a partir de” o menor preço.</p>
            </div>
          )}
        </section>

        <Field label="Descrição" required error={errors.description}>
          <textarea
            className={`${inputClass} min-h-28 resize-y`}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Do que é feito, como usar, o que torna especial."
          />
        </Field>

        <div>
          <p className="mb-1.5 text-sm font-medium">Aromas</p>
          <TagInput values={scents} onChange={setScents} placeholder="Digite um aroma e aperte Enter" />
          <p className="mt-1.5 text-xs text-muted-foreground">Opcional. O cliente escolhe um deles na página do produto.</p>
        </div>
      </div>
    </Sheet>
  );
}

function TagInput({ values, onChange, placeholder }: { values: string[]; onChange: (v: string[]) => void; placeholder: string }) {
  const [text, setText] = useState("");
  const add = (raw: string) => {
    const parts = raw.split(",").map((s) => s.trim()).filter(Boolean);
    const next = [...values];
    for (const p of parts) if (!next.some((v) => v.toLowerCase() === p.toLowerCase())) next.push(p);
    onChange(next);
    setText("");
  };
  return (
    <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-border bg-background px-2 py-1.5 focus-within:border-caramel focus-within:ring-2 focus-within:ring-caramel/20">
      {values.map((v) => (
        <span key={v} className="inline-flex items-center gap-1 rounded-lg bg-secondary px-2 py-1 text-sm">
          {v}
          <button type="button" onClick={() => onChange(values.filter((x) => x !== v))} aria-label={`Remover ${v}`} className="text-muted-foreground hover:text-foreground">
            <Icons.X className="h-3.5 w-3.5" />
          </button>
        </span>
      ))}
      <input
        className="min-w-[10rem] flex-1 bg-transparent px-1.5 py-1 text-sm outline-none placeholder:text-muted-foreground/70"
        value={text}
        placeholder={values.length ? "" : placeholder}
        onChange={(e) => (e.target.value.includes(",") ? add(e.target.value) : setText(e.target.value))}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            if (text.trim()) add(text);
          } else if (e.key === "Backspace" && !text && values.length) {
            onChange(values.slice(0, -1));
          }
        }}
        onBlur={() => text.trim() && add(text)}
      />
    </div>
  );
}
