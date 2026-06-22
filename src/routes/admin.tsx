import { createFileRoute, useNavigate } from "@tanstack/react-router";
import * as Icons from "lucide-react";
import { useEffect, useState } from "react";
import { validateAdminLogin } from "@/lib/admin-credentials";
import { categories, getAllProducts, saveCustomProduct } from "@/lib/products";
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
  const [productImage, setProductImage] = useState("");
  const [productImageName, setProductImageName] = useState("");
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [productShort, setProductShort] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [productScents, setProductScents] = useState("");
  const [productError, setProductError] = useState("");

  useEffect(() => {
    if (localStorage.getItem("adminAuth") === "true") {
      setAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (authenticated) {
      setProductCount(getAllProducts().length);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");

    if (validateAdminLogin(email, senha)) {
      localStorage.setItem("adminAuth", "true");
      setAuthenticated(true);
    } else {
      setErro("Email ou senha incorretos");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminAuth");
    setAuthenticated(false);
    setEmail("");
    setSenha("");
    setErro("");
  };

  const handleProductImageFile = (file?: File) => {
    setProductError("");

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setProductError("Escolha um arquivo de imagem valido.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setProductImage(reader.result);
        setProductImageName(file.name);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleNewProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setProductError("");

    const category = newCategory.trim() || productCategory;
    const price = Number(productPrice.replace(",", "."));

    if (!productName.trim() || !category || Number.isNaN(price) || price <= 0) {
      setProductError("Preencha nome, categoria e preco corretamente.");
      return;
    }

    const scents = productScents
      .split(",")
      .map((scent) => scent.trim())
      .filter(Boolean);

    const savedProduct = saveCustomProduct({
      name: productName.trim(),
      category,
      price,
      image: productImage.trim() || heroImg,
      short: productShort.trim() || "Produto artesanal Alma e Essencia.",
      description: productDescription.trim() || productShort.trim() || "Produto artesanal cadastrado pela area administrativa.",
      scents: scents.length > 0 ? scents : ["Essencia especial"],
      sizes: [{ label: "Unico", price }],
    });

    setProductCount(getAllProducts().length);
    window.location.assign(`/produtos?categoria=${encodeURIComponent(savedProduct.category)}`);
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
          <span className="text-sm font-bold uppercase tracking-[0.18em] text-muted-foreground">Nome do produto</span>
          <input
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            className="w-full rounded-2xl bg-background border border-border px-5 py-4 text-lg font-semibold focus:outline-none focus:border-caramel focus:ring-2 focus:ring-caramel/20 transition"
            placeholder="Ex: Creme hidratante floral"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-bold uppercase tracking-[0.18em] text-muted-foreground">Categoria</span>
          <select
            value={productCategory}
            onChange={(e) => setProductCategory(e.target.value)}
            className="w-full rounded-2xl bg-background border border-border px-5 py-4 text-lg font-semibold focus:outline-none focus:border-caramel focus:ring-2 focus:ring-caramel/20 transition"
          >
            {categories.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
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
          <span className="text-sm font-bold uppercase tracking-[0.18em] text-muted-foreground">Preco</span>
          <input
            value={productPrice}
            onChange={(e) => setProductPrice(e.target.value)}
            inputMode="decimal"
            className="w-full rounded-2xl bg-background border border-border px-5 py-4 text-lg font-semibold focus:outline-none focus:border-caramel focus:ring-2 focus:ring-caramel/20 transition"
            placeholder="79,90"
          />
        </label>

        <div className="space-y-2 lg:col-span-2">
          <span className="text-sm font-bold uppercase tracking-[0.18em] text-muted-foreground">Imagem do produto</span>
          <input
            id="product-image-upload"
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => handleProductImageFile(e.target.files?.[0])}
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
              handleProductImageFile(e.dataTransfer.files?.[0]);
            }}
            className={`flex min-h-64 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-8 text-center transition ${
              isDraggingImage ? "border-caramel bg-rose/20 shadow-bloom" : "border-border bg-background hover:border-caramel/70 hover:bg-secondary/50"
            }`}
          >
            {productImage ? (
              <div className="grid w-full gap-5 md:grid-cols-[180px_1fr] md:text-left">
                <img
                  src={productImage}
                  alt="Previa do produto"
                  className="h-44 w-full rounded-2xl object-cover shadow-soft md:w-44"
                />
                <div className="flex flex-col justify-center">
                  <p className="text-xl font-bold text-foreground">{productImageName || "Imagem selecionada"}</p>
                  <p className="mt-2 text-base font-semibold text-muted-foreground">Arraste outra imagem aqui ou clique para trocar.</p>
                </div>
              </div>
            ) : (
              <>
                <Icons.UploadCloud className="h-12 w-12 text-caramel-deep" />
                <p className="mt-4 text-xl font-bold text-foreground">Arraste a imagem aqui</p>
                <p className="mt-2 text-base font-semibold text-muted-foreground">ou clique para escolher um arquivo do computador</p>
              </>
            )}
          </label>
        </div>

        <label className="space-y-2 lg:col-span-2">
          <span className="text-sm font-bold uppercase tracking-[0.18em] text-muted-foreground">Resumo</span>
          <input
            value={productShort}
            onChange={(e) => setProductShort(e.target.value)}
            className="w-full rounded-2xl bg-background border border-border px-5 py-4 text-lg font-semibold focus:outline-none focus:border-caramel focus:ring-2 focus:ring-caramel/20 transition"
            placeholder="Frase curta que aparece no card do produto"
          />
        </label>

        <label className="space-y-2 lg:col-span-2">
          <span className="text-sm font-bold uppercase tracking-[0.18em] text-muted-foreground">Descricao</span>
          <textarea
            value={productDescription}
            onChange={(e) => setProductDescription(e.target.value)}
            rows={4}
            className="w-full rounded-2xl bg-background border border-border px-5 py-4 text-lg font-semibold focus:outline-none focus:border-caramel focus:ring-2 focus:ring-caramel/20 transition resize-none"
            placeholder="Descricao completa do produto"
          />
        </label>

        <label className="space-y-2 lg:col-span-2">
          <span className="text-sm font-bold uppercase tracking-[0.18em] text-muted-foreground">Aromas</span>
          <input
            value={productScents}
            onChange={(e) => setProductScents(e.target.value)}
            className="w-full rounded-2xl bg-background border border-border px-5 py-4 text-lg font-semibold focus:outline-none focus:border-caramel focus:ring-2 focus:ring-caramel/20 transition"
            placeholder="Lavanda, Baunilha, Rosa"
          />
        </label>

        {productError && <p className="lg:col-span-2 text-base font-bold text-rose">{productError}</p>}

        <div className="lg:col-span-2 flex flex-wrap gap-3">
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-caramel text-primary-foreground px-8 py-4 text-base font-bold uppercase tracking-[0.12em] shadow-soft hover:shadow-bloom hover:-translate-y-0.5 active:translate-y-0 transition-all"
          >
            <Icons.Plus className="h-4 w-4" />
            Salvar produto
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
        <div className="flex justify-between items-center mb-12">
          <h1 className="font-serif text-4xl">Painel Administrativo</h1>
            <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-rose/20 text-rose hover:bg-rose/30 transition"
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

        <div className="mt-12 rounded-2xl bg-card border border-border p-8">
          <h2 className="font-serif text-2xl mb-6">Bem-vindo à Área Administrativa!</h2>
          <p className="text-muted-foreground leading-relaxed">
            Esta é a área de gerência da Alma e Essência. Aqui você pode gerenciar produtos, pedidos e configurações da loja.
          </p>
        </div>

        {newProductForm}
      </div>
    </div>
  );
}
