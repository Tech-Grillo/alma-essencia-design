import * as Icons from "lucide-react";
import { useState } from "react";
import {
  getTopClickedProducts,
  getTopSellingProducts,
  getTotalRevenue,
  getTotalSales,
  getSalesByProduct,
  registerSale,
  getSales,
  clearAnalytics,
} from "@/lib/analytics";
import type { Product } from "@/lib/products";

interface AnalyticsTabProps {
  products: Product[];
}

export function AnalyticsTab({ products }: AnalyticsTabProps) {
  const [activeTab, setActiveTab] = useState<"clicks" | "sales">("clicks");
  const [showSaleForm, setShowSaleForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [saleQuantity, setSaleQuantity] = useState("");
  const [salePrice, setSalePrice] = useState("");

  const topClicked = getTopClickedProducts(10);
  const topSelling = getTopSellingProducts(10);
  const totalRevenue = getTotalRevenue();
  const totalSales = getTotalSales();
  const salesByProduct = getSalesByProduct();

  const handleRegisterSale = (e: React.FormEvent) => {
    e.preventDefault();

    const product = products.find((p) => p.slug === selectedProduct);
    if (!product || !saleQuantity || !salePrice) return;

    const quantity = parseInt(saleQuantity);
    const price = parseFloat(salePrice);

    if (quantity <= 0 || price <= 0) return;

    registerSale({
      productSlug: product.slug,
      productName: product.name,
      price,
      quantity,
    });

    setSelectedProduct("");
    setSaleQuantity("");
    setSalePrice("");
    setShowSaleForm(false);
    alert("Venda registrada com sucesso!");
  };

  const handleClearData = () => {
    if (confirm("Tem certeza que deseja limpar todos os dados de analytics? Esta ação não pode ser desfeita.")) {
      clearAnalytics();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6">
      {/* Cards de resumo */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="rounded-2xl bg-card border border-border p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-full bg-rose/30 flex items-center justify-center text-caramel-deep">
              <Icons.MousePointer className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-sm uppercase tracking-widest text-muted-foreground">Total de Cliques</h3>
              <p className="font-serif text-3xl">{topClicked.reduce((acc, item) => acc + item.clicks, 0)}</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Cliques em produtos</p>
        </div>

        <div className="rounded-2xl bg-card border border-border p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-full bg-rose/30 flex items-center justify-center text-caramel-deep">
              <Icons.ShoppingBag className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-sm uppercase tracking-widest text-muted-foreground">Vendas</h3>
              <p className="font-serif text-3xl">{totalSales}</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Total de vendas registradas</p>
        </div>

        <div className="rounded-2xl bg-card border border-border p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-full bg-rose/30 flex items-center justify-center text-caramel-deep">
              <Icons.Receipt className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-sm uppercase tracking-widest text-muted-foreground">Receita Total</h3>
              <p className="font-serif text-3xl font-bold bg-gradient-caramel bg-clip-text text-transparent">R$ {totalRevenue.toFixed(2).replace(".", ",")}</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Faturamento total</p>
        </div>

        <div className="rounded-2xl bg-card border border-border p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-full bg-rose/30 flex items-center justify-center text-caramel-deep">
              <Icons.TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-sm uppercase tracking-widest text-muted-foreground">Ticket Médio</h3>
              <p className="font-serif text-3xl font-bold bg-gradient-caramel bg-clip-text text-transparent">
                R$ {totalSales > 0 ? (totalRevenue / totalSales).toFixed(2).replace(".", ",") : "0,00"}
              </p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Valor médio por venda</p>
        </div>
      </div>

      {/* Botões de ação */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => setShowSaleForm(!showSaleForm)}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-caramel text-primary-foreground px-6 py-3 text-sm font-bold uppercase tracking-wider shadow-soft hover:shadow-bloom hover:-translate-y-0.5 transition-all"
        >
          <Icons.Plus className="h-4 w-4" />
          Registrar Venda
        </button>
        <button
          onClick={handleClearData}
          className="inline-flex items-center gap-2 rounded-full bg-rose/20 text-rose px-6 py-3 text-sm font-bold uppercase tracking-wider hover:bg-rose/30 transition"
        >
          <Icons.Trash2 className="h-4 w-4" />
          Limpar Dados
        </button>
      </div>

      {/* Formulário de registro de venda */}
      {showSaleForm && (
        <div className="rounded-2xl bg-card border border-border p-8">
          <h3 className="font-serif text-2xl font-bold mb-6">Registrar Nova Venda</h3>
          <form onSubmit={handleRegisterSale} className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-2 block">
                Produto
              </label>
              <select
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                className="w-full rounded-2xl bg-background border border-border px-5 py-3 text-base font-semibold focus:outline-none focus:border-caramel focus:ring-2 focus:ring-caramel/20 transition"
                required
              >
                <option value="">Selecione um produto</option>
                {products.map((product) => (
                  <option key={product.slug} value={product.slug}>
                    {product.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-2 block">
                Quantidade
              </label>
              <input
                type="number"
                min="1"
                value={saleQuantity}
                onChange={(e) => setSaleQuantity(e.target.value)}
                className="w-full rounded-2xl bg-background border border-border px-5 py-3 text-base font-semibold focus:outline-none focus:border-caramel focus:ring-2 focus:ring-caramel/20 transition"
                placeholder="1"
                required
              />
            </div>

            <div>
              <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-2 block">
                Preço Unitário (R$)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={salePrice}
                onChange={(e) => setSalePrice(e.target.value)}
                className="w-full rounded-2xl bg-background border border-border px-5 py-3 text-base font-semibold focus:outline-none focus:border-caramel focus:ring-2 focus:ring-caramel/20 transition"
                placeholder="79,90"
                required
              />
            </div>

            <div className="md:col-span-3">
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-caramel text-primary-foreground px-8 py-3 text-sm font-bold uppercase tracking-wider shadow-soft hover:shadow-bloom hover:-translate-y-0.5 transition-all"
              >
                <Icons.Save className="h-4 w-4" />
                Salvar Venda
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Abas de estatísticas */}
      <div className="rounded-2xl bg-card border border-border p-8">
        <div className="flex gap-4 mb-6 border-b border-border">
          <button
            onClick={() => setActiveTab("clicks")}
            className={`pb-3 px-4 font-semibold text-sm uppercase tracking-wider transition-all ${
              activeTab === "clicks"
                ? "border-b-2 border-caramel text-caramel-deep"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icons.MousePointer className="h-4 w-4 inline mr-2" />
            Produtos Mais Clicados
          </button>
          <button
            onClick={() => setActiveTab("sales")}
            className={`pb-3 px-4 font-semibold text-sm uppercase tracking-wider transition-all ${
              activeTab === "sales"
                ? "border-b-2 border-caramel text-caramel-deep"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icons.ShoppingBag className="h-4 w-4 inline mr-2" />
            Produtos Mais Vendidos
          </button>
        </div>

        {activeTab === "clicks" && (
          <div className="space-y-3">
            {topClicked.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Nenhum clique registrado ainda.</p>
            ) : (
              topClicked.map((item, index) => {
                const maxClicks = topClicked[0]?.clicks || 1;
                const percentage = (item.clicks / maxClicks) * 100;

                return (
                  <div key={item.slug} className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-caramel/20 flex items-center justify-center font-bold text-caramel-deep">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold">{item.productName}</span>
                        <span className="text-sm text-muted-foreground">{item.clicks} cliques</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-caramel rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {activeTab === "sales" && (
          <div className="space-y-3">
            {topSelling.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Nenhuma venda registrada ainda.</p>
            ) : (
              topSelling.map((item, index) => {
                const maxQuantity = topSelling[0]?.quantity || 1;
                const percentage = (item.quantity / maxQuantity) * 100;
                const revenue = salesByProduct.get(item.slug)?.revenue || 0;

                return (
                  <div key={item.slug} className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-caramel/20 flex items-center justify-center font-bold text-caramel-deep">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold">{item.productName}</span>
                        <div className="text-right">
                          <span className="text-sm text-muted-foreground">{item.quantity} vendas</span>
                          <span className="text-sm text-caramel-deep ml-3">R$ {revenue.toFixed(2).replace(".", ",")}</span>
                        </div>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-caramel rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Histórico de vendas */}
      <div className="rounded-2xl bg-card border border-border p-8">
        <h3 className="font-serif text-2xl font-bold mb-6">Histórico de Vendas</h3>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {getSales().length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Nenhuma venda registrada.</p>
          ) : (
            getSales()
              .sort((a, b) => b.timestamp - a.timestamp)
              .map((sale) => (
                <div
                  key={sale.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-background border border-border hover:border-caramel/50 transition"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-rose/30 flex items-center justify-center">
                      <Icons.ShoppingBag className="h-5 w-5 text-caramel-deep" />
                    </div>
                    <div>
                      <p className="font-semibold">{sale.productName}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(sale.timestamp).toLocaleDateString("pt-BR")} às{" "}
                        {new Date(sale.timestamp).toLocaleTimeString("pt-BR")}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-serif text-xl font-bold bg-gradient-caramel bg-clip-text text-transparent">
                      R$ {(sale.price * sale.quantity).toFixed(2).replace(".", ",")}
                    </p>
                    <p className="text-xs text-muted-foreground">Qtd: {sale.quantity}</p>
                  </div>
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  );
}