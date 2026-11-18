import { createFileRoute, Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import * as Icons from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { adminLogout, isAdminLoggedIn } from "@/lib/admin-credentials";
import { supabase } from "@/lib/supabase";
import { site } from "@/config/site";
import { OverviewTab } from "@/components/admin/OverviewTab";
import { OrdersTab } from "@/components/admin/OrdersTab";
import { ProductsTab } from "@/components/admin/ProductsTab";
import { ReviewsTab } from "@/components/admin/ReviewsTab";

type AdminTab = "resumo" | "pedidos" | "produtos" | "avaliacoes";
const TABS: AdminTab[] = ["resumo", "pedidos", "produtos", "avaliacoes"];

export const Route = createFileRoute("/admin")({
  validateSearch: (search: Record<string, unknown>): { tab?: AdminTab } =>
    TABS.includes(search.tab as AdminTab) ? { tab: search.tab as AdminTab } : {},
  head: () => ({ meta: [{ title: `Painel — ${site.name}` }, { name: "robots", content: "noindex" }] }),
  component: AdminRoute,
});

const NAV: { id: AdminTab; label: string; icon: ReactNode; description: string }[] = [
  { id: "resumo", label: "Resumo", icon: <Icons.LayoutDashboard className="h-5 w-5" />, description: "Como estão as vendas da loja." },
  { id: "pedidos", label: "Pedidos", icon: <Icons.ShoppingBag className="h-5 w-5" />, description: "Pedidos feitos e pagos pelo site." },
  { id: "produtos", label: "Produtos", icon: <Icons.Package className="h-5 w-5" />, description: "Cadastre e edite o que aparece na loja." },
  { id: "avaliacoes", label: "Avaliações", icon: <Icons.Star className="h-5 w-5" />, description: "O que os clientes disseram. Oculte o que não deve aparecer." },
];

function AdminRoute() {
  const { pathname } = useLocation();
  // /admin/login tem tela própria, sem o menu do painel.
  if (pathname.startsWith("/admin/login")) return <Outlet />;
  return <AdminPanel />;
}

function AdminPanel() {
  const navigate = useNavigate();
  const { tab = "resumo" } = Route.useSearch();
  const [status, setStatus] = useState<"checking" | "ok">("checking");
  const [email, setEmail] = useState("");

  useEffect(() => {
    isAdminLoggedIn().then(async (ok) => {
      if (!ok) {
        navigate({ to: "/admin/login" });
        return;
      }
      setStatus("ok");
      // Só para exibir no menu; não pode travar o painel se falhar.
      try {
        const { data } = await supabase.auth.getSession();
        setEmail(data.session?.user.email ?? "");
      } catch {
        /* sem e-mail no menu */
      }
    });
  }, [navigate]);

  const goTo = (id: AdminTab) => navigate({ to: "/admin", search: id === "resumo" ? {} : { tab: id } });

  const logout = async () => {
    await adminLogout();
    navigate({ to: "/admin/login" });
  };

  if (status === "checking") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
        <Icons.Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verificando acesso...
      </div>
    );
  }

  const current = NAV.find((n) => n.id === tab) ?? NAV[0];

  return (
    <div className="min-h-screen bg-background lg:flex">
      {/* Menu lateral (computador) */}
      <aside className="sticky top-0 hidden h-screen w-64 flex-shrink-0 flex-col border-r border-border bg-card/60 lg:flex">
        <Brand />
        <nav className="flex-1 space-y-1 px-3">
          {NAV.map((item) => (
            <button
              key={item.id}
              onClick={() => goTo(item.id)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                item.id === tab ? "bg-caramel/15 text-caramel-deep dark:text-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>
        <div className="space-y-1 border-t border-border p-3">
          <Link to="/" target="_blank" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground">
            <Icons.ExternalLink className="h-4 w-4" /> Ver site
          </Link>
          <button onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground">
            <Icons.LogOut className="h-4 w-4" /> Sair
          </button>
          {email && <p className="truncate px-3 pt-2 text-xs text-muted-foreground/80">{email}</p>}
        </div>
      </aside>

      {/* Barra do topo (celular) */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-background/95 px-4 py-3 backdrop-blur lg:hidden">
        <span className="flex items-center gap-2 font-serif text-lg">
          <Icons.Flower2 className="h-5 w-5 text-caramel-deep" /> Painel
        </span>
        <div className="flex items-center gap-1">
          <Link to="/" target="_blank" className="rounded-lg p-2 text-muted-foreground hover:bg-secondary" aria-label="Ver site">
            <Icons.ExternalLink className="h-5 w-5" />
          </Link>
          <button onClick={logout} className="rounded-lg p-2 text-muted-foreground hover:bg-secondary" aria-label="Sair">
            <Icons.LogOut className="h-5 w-5" />
          </button>
        </div>
      </header>

      <main className="min-w-0 flex-1 px-4 pb-28 pt-6 sm:px-6 lg:px-10 lg:pb-12 lg:pt-10">
        <div className="mx-auto max-w-5xl">
          <div className="mb-6 lg:mb-8">
            <h1 className="font-serif text-3xl sm:text-4xl">{current.label}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{current.description}</p>
          </div>
          {tab === "resumo" && <OverviewTab onNavigate={goTo} />}
          {tab === "pedidos" && <OrdersTab />}
          {tab === "produtos" && <ProductsTab />}
          {tab === "avaliacoes" && <ReviewsTab />}
        </div>
      </main>

      {/* Abas fixas embaixo (celular) */}
      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
        {NAV.map((item) => (
          <button
            key={item.id}
            onClick={() => goTo(item.id)}
            className={`flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium ${
              item.id === tab ? "text-caramel-deep dark:text-foreground" : "text-muted-foreground"
            }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-3 px-6 py-6">
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-caramel/15 text-caramel-deep">
        <Icons.Flower2 className="h-5 w-5" />
      </span>
      <div className="leading-tight">
        <p className="font-serif text-lg">{site.name}</p>
        <p className="text-xs text-muted-foreground">Painel administrativo</p>
      </div>
    </div>
  );
}
