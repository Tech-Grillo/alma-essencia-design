import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import * as Icons from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { validateAdminLogin, isAdminLoggedIn, adminLogout } from "@/lib/admin-credentials";
import { categories, categoryGroups, topLevelCategories } from "@/lib/products";
import type { Product, SizeOption } from "@/lib/products-supabase";
import { getAllProducts, getAllCategories, saveProduct, updateProductInDb, deleteProductFromDb } from "@/lib/products-supabase";
import { AnalyticsTab } from "@/components/admin/AnalyticsTab";
import heroImg from "@/assets/imagens_inicio/hero.jpg";

export const Route = createFileRoute("/admin")({
  component: AdminDashboard,
  head: () => ({ meta: [{ title: "Área Administrativa — Alma e Essência." }] }),
});

function AdminDashboard() {
  const navigate = useNavigate();
  const [authenticated, setAuthenticated] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [visitorsCount, setVisitorsCount] = useState<number | null>(null);
  const [productCount, setProductCount] = useState(4);
  const [productName, setProductName] = useState("");
  const [productCategory, setProductCategory] = useState(categories[0]);
  const [newCategory, setNewCategory] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const priceValueRef = useRef<{ raw: string }>({ raw: "" });
  const [productImages, setProductImages] = useState<string[]>([]);
  const [productImageNames, setProductImageNames] = useState<string[]>([]);
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [productShort, setProductShort] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [productScents, setProductScents] = useState("");
  const [productError, setProductError] = useState("");
  const [isSubmittingProduct, setIsSubmittingProduct] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Validation errors
  const [errors, setErrors] = useState({
    name: "",
    category: "",
    price: "",
    images: "",
    short: "",
    description: "",
    scents: ""
  });
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("todas");
  const [activeSection, setActiveSection] = useState<"products" | "analytics">("products");
  const [adminProducts, setAdminProducts] = useState<Product[]>([]);
  const [adminCategories, setAdminCategories] = useState<string[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    isAdminLoggedIn().then(setAuthenticated);
  }, []);

  useEffect(() => {
    if (authenticated) {
      setLoadingProducts(true);
      getAllProducts().then(products => {
        setAdminProducts(products);
        setProductCount(products.length);
        setAdminCategories(Array.from(new Set([...getAllCategories(), ...products.map((product) => product.category)])));
        setLoadingProducts(false);
      }).catch(error => {
        console.error('Erro ao carregar produtos:', error);
        setLoadingProducts(false);
      });
    }
  }, [authenticated]);

  useEffect(() => {
    let mounted = true;
    let timer: number | undefined;

    async function fetchVisitors() {
      try {
        const res = await fetch('/api/visitors');
        if (!res.ok) return;
        const data = await res.json();
        if (mounted) setVisitorsCount(typeof data.count === 'number' ? data.count : null);
      } catch (e) {
        // ignore
      } finally {
        timer = window.setTimeout(fetchVisitors, 5000);
      }
    }

    if (authenticated) fetchVisitors();

    return () => {
      mounted = false;
      if (timer) clearTimeout(timer);
    };
  }, [authenticated]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");

    const success = await validateAdminLogin(email, senha);
    if (success) {
      setAuthenticated(true);
    } else {
      setErro("Email ou senha incorretos");
    }
  };

  const handleLogout = async () => {
    await adminLogout();
    setAuthenticated(false);
    setEmail("");
    setSenha("");
    setErro("");
  };

  const handleProductImageFile = (files?: FileList | null) => {
    setProductError("");

    if (!files || files.length === 0) return;

    const compressImage = (file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement("canvas");
            const maxSize = 800;
            let width = img.width;
            let height = img.height;

            if (width > height && width > maxSize) {
              height = (height * maxSize) / width;
              width = maxSize;
            } else if (height > maxSize) {
              width = (width * maxSize) / height;
              height = maxSize;
            }

            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext("2d");
            if (!ctx) {
              reject(new Error("Failed to get canvas context"));
              return;
            }

            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL("image/jpeg", 0.8));
          };
          img.onerror = () => reject(new Error("Failed to load image"));
          img.src = e.target?.result as string;
        };
        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsDataURL(file);
      });
    };

    const processFiles = Array.from(files);
    const invalidFile = processFiles.find((file) => !file.type.startsWith("image/"));
    if (invalidFile) {
      setProductError("Escolha apenas arquivos de imagem validos.");
      return;
    }

    Promise.all(processFiles.map((file) => compressImage(file)))
      .then((base64Array) => {
        setProductImages((prev) => [...prev, ...base64Array]);
        setProductImageNames((prev) => [...prev, ...processFiles.map((file) => file.name)]);
      })
      .catch(() => {
        setProductError("Erro ao processar imagens. Tente novamente.");
      });
  };

  const resetNewProductForm = () => {
    setProductName("");
    setProductCategory(categories[0]);
    setNewCategory("");
    setProductPrice("");
    setProductImages([]);
    setProductImageNames([]);
    setProductShort("");
    setProductDescription("");
    setProductScents("");
    setProductError("");
    setErrors({
      name: "",
      category: "",
      price: "",
      images: "",
      short: "",
      description: "",
      scents: ""
    });
  };

  // Price handler - just clean the input
  const handlePriceChange = (value: string) => {
    // Only allow numbers and comma
    const cleaned = value.replace(/[^\d,]/g, '');
    setProductPrice(cleaned);
  };

  const validateForm = () => {
    const newErrors = {
      name: "",
      category: "",
      price: "",
      images: "",
      short: "",
      description: "",
      scents: ""
    };

    // Validate name
    if (!productName.trim()) {
      newErrors.name = "Nome do produto é obrigatório";
    }

    // Validate category
    const category = newCategory.trim() || productCategory;
    if (!category) {
      newErrors.category = "Categoria é obrigatória";
    }

    // Validate price
    const price = Number(productPrice.replace(",", "."));
    if (!productPrice.trim()) {
      newErrors.price = "Preço é obrigatório";
    } else if (Number.isNaN(price) || price <= 0) {
      newErrors.price = "Preço deve ser um valor válido";
    }

    // Validate images
    if (productImages.length === 0) {
      newErrors.images = "Adicione pelo menos uma imagem";
    }

    // Validate short description
    if (!productShort.trim()) {
      newErrors.short = "Resumo é obrigatório";
    }

    // Validate description
    if (!productDescription.trim()) {
      newErrors.description = "Descrição é obrigatória";
    }

    // Validate scents
    if (!productScents.trim()) {
      newErrors.scents = "Aromas são obrigatórios";
    }

    setErrors(newErrors);
    return Object.values(newErrors).every(error => error === "");
  };

  const handleNewProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProductError("");

    // Evita clique duplo/reenvio: se já está salvando, ignora novos cliques.
    if (isSubmittingProduct) return;

    if (!validateForm()) {
      setProductError("Preencha todos os campos obrigatórios corretamente.");
      return;
    }

    const category = newCategory.trim() || productCategory;
    const price = Number(productPrice.replace(",", "."));

    const scents = productScents
      .split(",")
      .map((scent) => scent.trim())
      .filter(Boolean);

    setIsSubmittingProduct(true);
    try {
      const savedProduct = await saveProduct({
        name: productName.trim(),
        category,
        price,
        images: productImages.length > 0 ? productImages : [heroImg],
        short: productShort.trim(),
        description: productDescription.trim(),
        scents: scents.length > 0 ? scents : ["Essencia especial"],
        sizes: [{ label: "Unico", price }],
      });

      const products = await getAllProducts();
      setProductCount(products.length);
      setAdminProducts(products);
      setAdminCategories(Array.from(new Set([...getAllCategories(), ...products.map((product) => product.category)])));
      resetNewProductForm();
      setSuccessMessage(`Produto "${productName.trim()}" cadastrado com sucesso!`);

      // Redirecionar para o site principal na aba de produtos com categoria selecionada
      const redirectCategory = encodeURIComponent(category);
      navigate({ to: `/produtos?categoria=${redirectCategory}` });

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      const isDuplicateSlug = error instanceof Error && error.message.includes('products_slug_key');
      setProductError(
        isDuplicateSlug
          ? "Já existe um produto com esse nome. Use um nome diferente, ou verifique se ele não foi salvo em uma tentativa anterior."
          : `Erro ao salvar produto: ${error instanceof Error ? error.message : 'Tente novamente.'}`
      );
    } finally {
      setIsSubmittingProduct(false);
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct({ ...product });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProductError("");

    if (!editingProduct) return;

    const category = editingProduct.category;
    const price = editingProduct.price;

    if (!editingProduct.name.trim() || !category || !price || price <= 0) {
      setProductError("Preencha nome, categoria e preco corretamente.");
      return;
    }

    const scents = editingProduct.scents && editingProduct.scents.length > 0
      ? editingProduct.scents
      : ["Essencia especial"];

    try {
      if (!editingProduct.id) {
        setProductError("Erro: Produto não possui ID.");
        return;
      }

      // O site exibe o preço com base no menor valor em `sizes`, então mantemos
      // o campo `price` sincronizado com o menor preço entre os tamanhos editados.
      const finalSizes = editingProduct.sizes && editingProduct.sizes.length > 0
        ? editingProduct.sizes
        : [{ label: "Unico", price }];
      const lowestSizePrice = Math.min(...finalSizes.map((s) => s.price));

      await updateProductInDb(editingProduct.id!, {
        ...editingProduct,
        scents,
        price: lowestSizePrice,
        sizes: finalSizes,
      });

      const products = await getAllProducts();
      setProductCount(products.length);
      setAdminProducts(products);
      setAdminCategories(Array.from(new Set([...getAllCategories(), ...products.map((product) => product.category)])));
      setEditingProduct(null);
      setSuccessMessage(`Produto "${editingProduct.name}" editado com sucesso!`);

      // Redirecionar para a página de produtos na categoria do item editado
      const redirectCategory = encodeURIComponent(category);
      navigate({ to: "/produtos", search: { categoria: redirectCategory } });

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      setProductError("Erro ao editar produto. Tente novamente.");
    }
  };

  const handleDeleteProduct = async () => {
    if (!deletingSlug) return;
    const productName = adminProducts.find((p: Product) => p.slug === deletingSlug)?.name || "";

    try {
      await deleteProductFromDb(deletingSlug);
      const products = await getAllProducts();
      setAdminProducts(products);
      setProductCount(products.length);
      setDeletingSlug(null);
      setSuccessMessage(`Produto "${productName}" deletado com sucesso!`);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      setProductError("Erro ao deletar produto. Tente novamente.");
    }
  };

  const startEdit = (product: Product) => {
    setEditingProduct({ ...product });
  };

  const cancelEdit = () => {
    setEditingProduct(null);
  };

  const updateEditingField = (field: keyof Product, value: string | number | string[] | SizeOption[]) => {
    if (!editingProduct) return;
    setEditingProduct({ ...editingProduct, [field]: value });
  };

  const newProductForm = (
    <div className="mt-8 rounded-2xl bg-card border border-border p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-11 w-11 rounded-full bg-rose/30 flex items-center justify-center text-caramel-deep">
          <Icons.PackagePlus className="h-5 w-5" />
        </div>
        <div>
          <h2 className="font-serif text-3xl font-bold">Inserir novo produto</h2>
          <p className="text-base font-semibold text-muted-foreground">Ao salvar, ele entra direto na categoria escolhida.</p>
        </div>
      </div>

      <form className="grid lg:grid-cols-2 gap-5" onSubmit={handleNewProductSubmit}>
        <label className="space-y-2">
          <span className="text-sm font-bold uppercase tracking-[0.18em] text-muted-foreground">Nome do produto *</span>
          <input
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            className="w-full rounded-2xl bg-background border border-border px-5 py-4 text-lg font-semibold focus:outline-none focus:border-caramel focus:ring-2 focus:ring-caramel/20 transition"
            placeholder="Ex: Creme hidratante floral"
            required
          />
          {errors.name && <p className="text-sm text-rose font-medium">{errors.name}</p>}
        </label>

        <label className="space-y-2">
          <span className="text-sm font-bold uppercase tracking-[0.18em] text-muted-foreground">Categoria *</span>
          <select
            value={productCategory}
            onChange={(e) => setProductCategory(e.target.value)}
            className="w-full rounded-2xl bg-background border border-border px-5 py-4 text-lg font-semibold focus:outline-none focus:border-caramel focus:ring-2 focus:ring-caramel/20 transition"
            required
          >
            <optgroup label="Categorias principais">
              {topLevelCategories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </optgroup>
            <optgroup label="Variações">
              {categories
                .filter((category) => !topLevelCategories.includes(category))
                .map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
            </optgroup>
          </select>
          {errors.category && <p className="text-sm text-rose font-medium">{errors.category}</p>}
        </label>

        <label className="space-y-2">
          <span className="text-sm font-bold uppercase tracking-[0.18em] text-muted-foreground">Nova categoria opcional</span>
          <input
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="w-full rounded-2xl bg-background border border-border px-5 py-4 text-lg font-semibold focus:outline-none focus:border-caramel focus:ring-2 focus:ring-caramel/20 transition"
            placeholder="Use se quiser criar outra categoria"
          />
        </label>


        <label className="space-y-2">
          <span className="text-sm font-bold uppercase tracking-[0.18em] text-muted-foreground">Preco *</span>
          <input
            value={productPrice}
            onChange={(e) => handlePriceChange(e.target.value)}
            inputMode="numeric"
            className="w-full rounded-2xl bg-background border border-border px-5 py-4 text-lg font-semibold focus:outline-none focus:border-caramel focus:ring-2 focus:ring-caramel/20 transition"
            placeholder="79,90"
            required
          />
          {errors.price && <p className="text-sm text-rose font-medium">{errors.price}</p>}
        </label>

        <div className="space-y-2 lg:col-span-2">
          <span className="text-sm font-bold uppercase tracking-[0.18em] text-muted-foreground">Imagem do produto</span>
          <input
            id="product-image-upload"
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            onChange={(e) => handleProductImageFile(e.target.files)}
          />
          <label
            htmlFor="product-image-upload"
            onDragOver={(e) => {
              e.preventDefault();
              setIsDraggingImage(true);
            }}
            onDragLeave={() => setIsDraggingImage(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDraggingImage(false);
              handleProductImageFile(e.dataTransfer.files);
            }}
            className={`flex min-h-64 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-8 text-center transition ${
              isDraggingImage ? "border-caramel bg-rose/20 shadow-bloom" : "border-border bg-background hover:border-caramel/70 hover:bg-secondary/50"
            }`}
          >
            {productImages.length > 0 ? (
              <div className="grid w-full gap-5 md:grid-cols-[180px_1fr] md:text-left">
                <div className="flex gap-2 overflow-x-auto md:flex-col md:w-44">
                  {productImages.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`Previa ${idx + 1}`}
                      className="h-20 w-20 flex-shrink-0 rounded-xl object-cover shadow-soft md:h-44 md:w-full"
                    />
                  ))}
                </div>
                <div className="flex flex-col justify-center">
                  <p className="text-xl font-bold text-foreground">{productImages.length} imagem(ns) selecionada(s)</p>
                  <p className="mt-2 text-base font-semibold text-muted-foreground">Arraste mais imagens aqui ou clique para adicionar.</p>
                </div>
              </div>
            ) : (
              <>
                <Icons.UploadCloud className="h-12 w-12 text-caramel-deep" />
                <p className="mt-4 text-xl font-bold text-foreground">Arraste as imagens aqui</p>
                <p className="mt-2 text-base font-semibold text-muted-foreground">ou clique para escolher arquivos do computador</p>
              </>
            )}
          </label>
        </div>

        <label className="space-y-2 lg:col-span-2">
          <span className="text-sm font-bold uppercase tracking-[0.18em] text-muted-foreground">Resumo *</span>
          <input
            value={productShort}
            onChange={(e) => setProductShort(e.target.value)}
            className="w-full rounded-2xl bg-background border border-border px-5 py-4 text-lg font-semibold focus:outline-none focus:border-caramel focus:ring-2 focus:ring-caramel/20 transition"
            placeholder="Frase curta que aparece no card do produto"
            required
          />
          {errors.short && <p className="text-sm text-rose font-medium">{errors.short}</p>}
        </label>

        <label className="space-y-2 lg:col-span-2">
          <span className="text-sm font-bold uppercase tracking-[0.18em] text-muted-foreground">Descricao *</span>
          <textarea
            value={productDescription}
            onChange={(e) => setProductDescription(e.target.value)}
            rows={4}
            className="w-full rounded-2xl bg-background border border-border px-5 py-4 text-lg font-semibold focus:outline-none focus:border-caramel focus:ring-2 focus:ring-caramel/20 transition resize-none"
            placeholder="Descricao completa do produto"
            required
          />
          {errors.description && <p className="text-sm text-rose font-medium">{errors.description}</p>}
        </label>

        <label className="space-y-2 lg:col-span-2">
          <span className="text-sm font-bold uppercase tracking-[0.18em] text-muted-foreground">Aromas *</span>
          <input
            value={productScents}
            onChange={(e) => setProductScents(e.target.value)}
            className="w-full rounded-2xl bg-background border border-border px-5 py-4 text-lg font-semibold focus:outline-none focus:border-caramel focus:ring-2 focus:ring-caramel/20 transition"
            placeholder="Lavanda, Baunilha, Rosa"
            required
          />
          {errors.scents && <p className="text-sm text-rose font-medium">{errors.scents}</p>}
        </label>

        {productError && <p className="lg:col-span-2 text-base font-bold text-rose">{productError}</p>}

        <div className="lg:col-span-2 flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={isSubmittingProduct}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-caramel text-primary-foreground px-8 py-4 text-base font-bold uppercase tracking-[0.12em] shadow-soft hover:shadow-bloom hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            <Icons.Plus className="h-4 w-4" />
            {isSubmittingProduct ? "Salvando..." : "Salvar produto"}
          </button>
        </div>
      </form>
    </div>
  );

  if (!authenticated) {
    return (
      <div className="min-h-screen relative flex items-center justify-center px-5 overflow-hidden">
        <img
          src={heroImg}
          alt="Fundo aromático"
          className="absolute inset-0 w-full h-full object-cover scale-110 blur-2xl opacity-60"
        />
        <div className="absolute inset-0 bg-background/80" />

        <div className="relative w-full max-w-md rounded-[2rem] bg-card/95 backdrop-blur-xl border border-border shadow-bloom p-10 animate-fade-in-up">
          <div className="flex flex-col items-center text-center mb-8">
            <h1 className="mt-7 font-serif text-3xl">Painel Administrativo acesso restrito </h1>
            <p className="mt-2 text-sm text-muted-foreground">Digite seu e-mail e senha para acessar.</p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-2 block">E-mail</label>
              <div className="relative">
                <Icons.Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@almaeessencia.com"
                  className="w-full rounded-full bg-background border border-border pl-11 pr-4 py-3.5 text-sm focus:outline-none focus:border-caramel focus:ring-2 focus:ring-caramel/20 transition"
                />
              </div>
            </div>

            <div>
              <label className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-2 block">Senha</label>
              <div className="relative">
                <Icons.Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-full bg-background border border-border pl-11 pr-12 py-3.5 text-sm focus:outline-none focus:border-caramel focus:ring-2 focus:ring-caramel/20 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((state) => !state)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-caramel-deep"
                >
                  {showPassword ? <Icons.EyeOff className="h-4 w-4" /> : <Icons.Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {erro && <p className="text-sm text-rose">{erro}</p>}

            <button
              type="submit"
              className="w-full rounded-full bg-gradient-caramel text-primary-foreground py-4 text-sm uppercase tracking-[0.2em] shadow-soft hover:shadow-bloom hover:-translate-y-0.5 active:translate-y-0 transition-all mt-2"
            >
              Entrar
            </button>

            <button
              type="button"
              onClick={() => navigate({ to: "/" })}
              className="w-full rounded-full border border-border bg-background mt-3 py-3 text-sm uppercase tracking-[0.12em] text-muted-foreground hover:bg-secondary transition"
            >
              Voltar
            </button>
          </form>

          <div className="botanical-divider mt-8"><span>✿</span></div>
        </div>

      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-green-50 border border-green-200 text-green-800 flex items-center gap-3 animate-fade-in-up">
            <Icons.CheckCircle className="h-5 w-5 flex-shrink-0" />
            <p className="font-medium">{successMessage}</p>
          </div>
        )}

        <div className="flex justify-between items-center mb-12">
          <h1 className="font-serif text-4xl">Painel Administrativo</h1>
            <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-chocolate text-cream hover:bg-chocolate/90 transition"
          >
            <Icons.LogOut className="h-4 w-4" />
            Sair
          </button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="rounded-2xl bg-card border border-border p-6">
            <h2 className="text-sm uppercase tracking-widest text-muted-foreground mb-2">Produtos</h2>
            <p className="font-serif text-3xl">{productCount}</p>
            <p className="text-xs text-muted-foreground mt-2">Produtos cadastrados</p>
          </div>

          <div className="rounded-2xl bg-card border border-border p-6">
            <h2 className="text-sm uppercase tracking-widest text-muted-foreground mb-2">Visitantes</h2>
            <p className="font-serif text-3xl">{visitorsCount ?? "-"}</p>
            <p className="text-xs text-muted-foreground mt-2">Dados em tempo real (atualiza a cada 5s)</p>
          </div>

          <div className="rounded-2xl bg-card border border-border p-6">
            <h2 className="text-sm uppercase tracking-widest text-muted-foreground mb-2">Status</h2>
            <p className="font-serif text-3xl text-green-600">Online</p>
            <p className="text-xs text-muted-foreground mt-2">Sistema operacional</p>
          </div>
        </div>

        {/* Navegação por abas */}
        <div className="mt-8 flex gap-4 border-b border-border">
          <button
            onClick={() => setActiveSection("products")}
            className={`pb-3 px-4 font-semibold text-sm uppercase tracking-wider transition-all ${
              activeSection === "products"
                ? "border-b-2 border-caramel text-caramel-deep"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icons.Package className="h-4 w-4 inline mr-2" />
            Gerenciar Produtos
          </button>
          <button
            onClick={() => setActiveSection("analytics")}
            className={`pb-3 px-4 font-semibold text-sm uppercase tracking-wider transition-all ${
              activeSection === "analytics"
                ? "border-b-2 border-caramel text-caramel-deep"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icons.BarChart3 className="h-4 w-4 inline mr-2" />
            Estatísticas
          </button>
        </div>

        <div className="mt-12 rounded-2xl bg-card border border-border p-8">
          <h2 className="font-serif text-2xl mb-6">Bem-vindo à Área Administrativa!</h2>
          <p className="text-muted-foreground leading-relaxed">
            Esta é a área de gerência da Alma e Essência. Aqui você pode gerenciar produtos, pedidos e configurações da loja.
          </p>
        </div>

        {activeSection === "products" && newProductForm}

        {activeSection === "products" && !loadingProducts && (
          <ProductManagementSection
            products={adminProducts}
            categories={adminCategories}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterCategory={filterCategory}
            setFilterCategory={setFilterCategory}
            onEdit={startEdit}
            onDelete={(slug) => setDeletingSlug(slug)}
          />
        )}

        {activeSection === "analytics" && !loadingProducts && (
          <AnalyticsTab products={adminProducts} />
        )}
      </div>

      {editingProduct && !loadingProducts && (
        <EditProductModal
          product={editingProduct}
          categories={adminCategories}
          onSave={handleEditSubmit}
          onCancel={cancelEdit}
          onChange={updateEditingField}
          error={productError}
        />
      )}

      {deletingSlug && !loadingProducts && (
        <DeleteConfirmModal
          productName={adminProducts.find(p => p.slug === deletingSlug)?.name || ""}
          onConfirm={handleDeleteProduct}
          onCancel={() => setDeletingSlug(null)}
        />
      )}
    </div>
  );
}

function ProductManagementSection({
  products,
  categories,
  searchTerm,
  setSearchTerm,
  filterCategory,
  setFilterCategory,
  onEdit,
  onDelete,
}: {
  products: Product[];
  categories: string[];
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  filterCategory: string;
  setFilterCategory: (v: string) => void;
  onEdit: (product: Product) => void;
  onDelete: (slug: string) => void;
}) {
  const filtered = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "todas" || product.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="mt-12 rounded-2xl bg-card border border-border p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-11 w-11 rounded-full bg-rose/30 flex items-center justify-center text-caramel-deep">
          <Icons.List className="h-5 w-5" />
        </div>
        <div>
          <h2 className="font-serif text-3xl font-bold">Gerenciar Produtos</h2>
          <p className="text-base font-semibold text-muted-foreground">Edite ou exclua produtos existentes.</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Buscar produto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-2xl bg-background border border-border px-5 py-3 text-base font-semibold focus:outline-none focus:border-caramel focus:ring-2 focus:ring-caramel/20 transition"
          />
        </div>
        <div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full md:w-64 rounded-2xl bg-background border border-border px-5 py-3 text-base font-semibold focus:outline-none focus:border-caramel focus:ring-2 focus:ring-caramel/20 transition"
          >
            <option value="todas">Todas categorias</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">Nenhum produto encontrado.</p>
      ) : (
        <div className="space-y-4">
          {filtered.map((product) => (
            <div
              key={product.slug}
              className="flex flex-col md:flex-row md:items-center gap-4 p-4 rounded-2xl bg-background border border-border hover:border-caramel/50 transition"
            >
              <Link
                to="/produtos/$slug"
                params={{ slug: product.slug }}
                className="flex-1 min-w-0 flex items-center gap-4 no-underline"
              >
                <img
                  src={product.images[0] || "/src/assets/imagens_inicio/hero.jpg"}
                  alt={product.name}
                  className="h-20 w-20 rounded-xl object-cover shadow-soft"
                />
                <div className="min-w-0">
                  <h3 className="font-serif text-xl font-bold truncate">{product.name}</h3>
                  <p className="text-sm text-muted-foreground">{product.category}</p>
                  <p className="text-3xl font-bold bg-gradient-caramel bg-clip-text text-transparent mt-1">
                    R$ {product.price.toFixed(2).replace(".", ",")}
                  </p>
                </div>
              </Link>
              <div className="flex flex-wrap gap-2 md:gap-3">
                <Link
                  to="/produtos/$slug"
                  params={{ slug: product.slug }}
                  className="inline-flex items-center gap-2 rounded-full bg-secondary px-5 py-2.5 text-sm font-bold uppercase tracking-wider hover:bg-rose transition"
                >
                  <Icons.Eye className="h-4 w-4" />
                  Ver detalhes
                </Link>
                <a
                  href={product.purchaseLink}
                  className="inline-flex items-center gap-2 rounded-full bg-rose text-white px-5 py-2.5 text-sm font-bold uppercase tracking-wider hover:bg-rose/90 transition"
                >
                  <Icons.ShoppingBag className="h-4 w-4" />
                  Comprar
                </a>
                <button
                  onClick={() => onEdit(product)}
                  className="inline-flex items-center gap-2 rounded-full bg-caramel/20 text-caramel-deep px-5 py-2.5 text-sm font-bold uppercase tracking-wider hover:bg-caramel/30 transition"
                >
                  <Icons.Pencil className="h-4 w-4" />
                  Editar
                </button>
                <button
                  onClick={() => onDelete(product.slug)}
                  className="inline-flex items-center gap-2 rounded-full bg-red-500 text-white px-5 py-2.5 text-sm font-bold uppercase tracking-wider hover:bg-red-600 transition"
                >
                  <Icons.Trash2 className="h-4 w-4" />
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function EditProductModal({
  product,
  categories,
  onSave,
  onCancel,
  onChange,
  error,
}: {
  product: Product;
  categories: string[];
  onSave: (e: React.FormEvent) => void;
  onCancel: () => void;
  onChange: (field: keyof Product, value: string | number | string[] | SizeOption[]) => void;
  error: string;
}) {
  const [imagePreview, setImagePreview] = useState<string[]>(product.images || []);
  const sizes = product.sizes && product.sizes.length > 0
    ? product.sizes
    : [{ label: "Unico", price: product.price }];

  const updateSizePrice = (index: number, rawValue: string) => {
    const cleaned = rawValue.replace(/[^\d,]/g, "");
    const priceNum = Number(cleaned.replace(",", "."));
    const nextSizes = sizes.map((s, i) => (i === index ? { ...s, price: isNaN(priceNum) ? s.price : priceNum } : s));
    onChange("sizes", nextSizes);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const compressImage = (file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement("canvas");
            const maxSize = 800;
            let width = img.width;
            let height = img.height;

            if (width > height && width > maxSize) {
              height = (height * maxSize) / width;
              width = maxSize;
            } else if (height > maxSize) {
              width = (width * maxSize) / height;
              height = maxSize;
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            if (!ctx) {
              reject(new Error("Failed to get canvas context"));
              return;
            }
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL("image/jpeg", 0.8));
          };
          img.onerror = () => reject(new Error("Failed to load image"));
          img.src = ev.target?.result as string;
        };
        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsDataURL(file);
      });
    };

    const processFiles = Array.from(files);
    const invalidFile = processFiles.find((file) => !file.type.startsWith("image/"));
    if (invalidFile) {
      alert("Escolha apenas arquivos de imagem validos.");
      return;
    }

    Promise.all(processFiles.map((file) => compressImage(file)))
      .then((base64Array) => {
        const newImages = [...imagePreview, ...base64Array];
        setImagePreview(newImages);
        onChange("images", newImages);
      })
      .catch(() => {
        alert("Erro ao processar imagens. Tente novamente.");
      });
  };

  const removeImage = (index: number) => {
    const newImages = imagePreview.filter((_, i) => i !== index);
    setImagePreview(newImages);
    onChange("images", newImages);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl bg-card border border-border shadow-bloom p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-serif text-3xl font-bold">Editar Produto</h2>
          <button
            onClick={onCancel}
            className="rounded-full p-2 hover:bg-secondary transition"
          >
            <Icons.X className="h-6 w-6" />
          </button>
        </div>

        <form className="space-y-5" onSubmit={onSave}>
          <label className="space-y-2">
            <span className="text-sm font-bold uppercase tracking-[0.18em] text-muted-foreground">Nome do produto</span>
            <input
              value={product.name}
              onChange={(e) => onChange("name", e.target.value)}
              className="w-full rounded-2xl bg-background border border-border px-5 py-4 text-lg font-semibold focus:outline-none focus:border-caramel focus:ring-2 focus:ring-caramel/20 transition"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-bold uppercase tracking-[0.18em] text-muted-foreground">Categoria</span>
            <select
              value={product.category}
              onChange={(e) => onChange("category", e.target.value)}
              className="w-full rounded-2xl bg-background border border-border px-5 py-4 text-lg font-semibold focus:outline-none focus:border-caramel focus:ring-2 focus:ring-caramel/20 transition"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </label>

          <div className="space-y-2">
            <span className="text-sm font-bold uppercase tracking-[0.18em] text-muted-foreground">Preço por tamanho</span>
            <div className="grid sm:grid-cols-3 gap-4">
              {sizes.map((s, index) => (
                <label key={`${s.label}-${index}`} className="space-y-1">
                  <span className="text-xs font-semibold text-muted-foreground">{s.label}</span>
                  <input
                    type="text"
                    defaultValue={s.price.toString().replace(".", ",")}
                    onChange={(e) => updateSizePrice(index, e.target.value)}
                    inputMode="numeric"
                    className="w-full rounded-2xl bg-background border border-border px-4 py-3 text-lg font-semibold focus:outline-none focus:border-caramel focus:ring-2 focus:ring-caramel/20 transition"
                    placeholder="0,00"
                  />
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-sm font-bold uppercase tracking-[0.18em] text-muted-foreground">Imagens do produto</span>
            <input
              id="edit-product-image-upload"
              type="file"
              accept="image/*"
              multiple
              className="sr-only"
              onChange={handleImageChange}
            />
            <label
              htmlFor="edit-product-image-upload"
              className="flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-background px-6 py-6 text-center hover:border-caramel/70 hover:bg-secondary/50 transition"
            >
              <Icons.UploadCloud className="h-8 w-8 text-caramel-deep" />
              <p className="mt-2 text-base font-bold text-foreground">Clique para alterar imagens</p>
            </label>
            {imagePreview.length > 0 && (
              <div className="flex flex-wrap gap-3 mt-3">
                {imagePreview.map((img, idx) => (
                  <div key={idx} className="relative">
                    <img
                      src={img}
                      alt={`Preview ${idx + 1}`}
                      className="h-20 w-20 rounded-xl object-cover shadow-soft"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute -top-2 -right-2 rounded-full bg-rose text-white p-1 hover:bg-rose/80 transition"
                    >
                      <Icons.X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <label className="space-y-2">
            <span className="text-sm font-bold uppercase tracking-[0.18em] text-muted-foreground">Resumo</span>
            <input
              value={product.short}
              onChange={(e) => onChange("short", e.target.value)}
              className="w-full rounded-2xl bg-background border border-border px-5 py-4 text-lg font-semibold focus:outline-none focus:border-caramel focus:ring-2 focus:ring-caramel/20 transition"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-bold uppercase tracking-[0.18em] text-muted-foreground">Descricao</span>
            <textarea
              value={product.description}
              onChange={(e) => onChange("description", e.target.value)}
              rows={4}
              className="w-full rounded-2xl bg-background border border-border px-5 py-4 text-lg font-semibold focus:outline-none focus:border-caramel focus:ring-2 focus:ring-caramel/20 transition resize-none"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-bold uppercase tracking-[0.18em] text-muted-foreground">Aromas (separados por virgula)</span>
            <input
              value={Array.isArray(product.scents) ? product.scents.join(", ") : ""}
              onChange={(e) => onChange("scents", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
              className="w-full rounded-2xl bg-background border border-border px-5 py-4 text-lg font-semibold focus:outline-none focus:border-caramel focus:ring-2 focus:ring-caramel/20 transition"
            />
          </label>

          {error && <p className="text-base font-bold text-rose">{error}</p>}

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-caramel text-primary-foreground px-8 py-4 text-base font-bold uppercase tracking-[0.12em] shadow-soft hover:shadow-bloom hover:-translate-y-0.5 active:translate-y-0 transition-all"
            >
              <Icons.Save className="h-4 w-4" />
              Salvar alteracoes
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-8 py-4 text-base font-bold uppercase tracking-[0.12em] text-muted-foreground hover:bg-secondary transition"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteConfirmModal({
  productName,
  onConfirm,
  onCancel,
}: {
  productName: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl bg-card border border-border shadow-bloom p-8">
        <div className="flex flex-col items-center text-center">
          <div className="h-14 w-14 rounded-full bg-rose/20 flex items-center justify-center text-rose mb-4">
            <Icons.AlertTriangle className="h-7 w-7" />
          </div>
          <h2 className="font-serif text-2xl font-bold mb-2">Confirmar exclusao</h2>
          <p className="text-muted-foreground mb-6">
            Tem certeza que deseja excluir <span className="font-bold text-foreground">"{productName}"</span>? Esta acao nao pode ser desfeita.
          </p>
          <div className="flex gap-3 w-full">
            <button
              onClick={onConfirm}
              className="flex-1 rounded-full bg-rose text-white py-3 text-sm font-bold uppercase tracking-wider hover:bg-rose/90 transition"
            >
              Sim, excluir
            </button>
            <button
              onClick={onCancel}
              className="flex-1 rounded-full border border-border bg-background py-3 text-sm font-bold uppercase tracking-wider text-muted-foreground hover:bg-secondary transition"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}