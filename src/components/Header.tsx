import { Link } from "@tanstack/react-router";
import * as Icons from "lucide-react";
import { useState } from "react";
import { useTheme } from "@/lib/theme";
import { useCart } from "@/lib/cart";
import { categories } from "@/lib/products";
import logo from "@/assets/imagens_inicio/logo_transparente.png";



const nav = [
  { to: "/", label: "Início" },
  { to: "/quem-somos", label: "Quem Somos", },
  { to: "/produtos", label: "Produtos" },
  { to: "/contato", label: "Contato" },
];






export function Header() {
  const [open, setOpen] = useState(false);
  const { theme, toggle } = useTheme();
  const { getCount } = useCart();

  return (
    <>
      <header className="sticky top-0 z-40 backdrop-blur-md bg-background/80 border-b border-border/60">
        <div className="mx-auto max-w-7xl px-5 lg:px-10 h-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setOpen(true)}
              aria-label="Abrir menu"
              className="rounded-full p-2 hover:bg-secondary transition-colors"
            >
              <Icons.Menu className="h-5 w-5" />
            </button>
            <Link id="logo1" to="/" aria-label="Voltar para o início" className="flex items-center justify-center">
              <img src={logo} alt="Alma e Essência" className="h-10 w-10 rounded-full shadow-sm object-cover" />
            </Link>
           
          </div>

          <nav className="hidden md:flex items-center gap-6">
            {nav.map((n) => (
              <Link
                id="inicio"
                key={n.to}
                to={n.to}
                activeOptions={{ exact: n.to === "/" }}
                activeProps={{ className: "text-lg font-semibold text-chocolate dark:text-white bg-chocolate/10 dark:bg-chocolate/30 rounded-full px-4 py-2" }}
                className="text-lg font-semibold tracking-wide uppercase text-chocolate dark:text-white px-4 py-2 rounded-full transition-all hover:text-chocolate-deep dark:hover:text-white hover:bg-chocolate/10 dark:hover:bg-chocolate/30 hover:shadow-soft"
              >
                {n.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={toggle}
              aria-label="Alternar tema"
              className="rounded-full p-2.5 hover:bg-secondary transition-colors"
            >
              {theme === "light" ? <Icons.Moon className="h-4 w-4" /> : <Icons.Sun className="h-4 w-4" />}
            </button>
            <Link to="/carrinho" aria-label="Carrinho" className="relative rounded-full p-2.5 hover:bg-secondary transition-colors">
              <Icons.ShoppingCart className="h-4 w-4" />
              {getCount() > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-4 w-4 text-[10px] rounded-full bg-rose text-foreground flex items-center justify-center font-medium">
                  {getCount()}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* Side drawer */}
      <div
        className={`fixed inset-0 z-50 transition-opacity ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
      >
        <div className="absolute inset-0 bg-chocolate/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
        <aside
          className={`absolute left-0 top-0 h-full w-[88%] max-w-sm bg-background shadow-bloom p-8 transition-transform duration-500 ${open ? "translate-x-0" : "-translate-x-full"}`}
        >
          <div className="flex items-center justify-between mb-10">
            <Link to="/" className="font-serif text-xl uppercase tracking-[0.12em] text-foreground/90">
              Alma Essência
            </Link>
            <button onClick={() => setOpen(false)} className="rounded-full p-2 hover:bg-secondary">
              <Icons.X className="h-5 w-5" />
            </button>
          </div>

          <p className="font-serif text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">
            Navegação
          </p>
          <ul className="space-y-3 mb-10">
            {nav.map((n) => (
              <li key={n.to}>
                <Link
                  id="inicio"
                  to={n.to}
                  onClick={() => setOpen(false)}
                  className="font-serif text-2xl font-semibold text-chocolate dark:text-white px-4 py-3 rounded-full block transition-all hover:text-chocolate-deep dark:hover:text-white hover:bg-chocolate/10 dark:hover:bg-chocolate/30 hover:shadow-soft"
                >
                  {n.label}
                </Link>
              </li>
            ))}
            <li>
             
            </li>
          </ul>

          <p className="font-serif text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">
            Categorias
          </p>
          <ul className="grid grid-cols-2 gap-2">
            {categories.map((c) => (
              <li key={c}>
                <button className="w-full text-left rounded-full px-4 py-2 bg-secondary/60 hover:bg-rose/60 text-sm transition-colors">
                  {c}
                </button>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </>
  );
}
