import { createFileRoute } from "@tanstack/react-router";
import { Logo } from "@/components/Logo";
import heroImg from "@/assets/hero.jpg";
import { useState } from "react";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";

export const Route = createFileRoute("/admin/login")({
  component: AdminLogin,
  head: () => ({ meta: [{ title: "Área Administrativa — Alma e Essência" }] }),
});

function AdminLogin() {
  const [show, setShow] = useState(false);
  return (
    <div className="min-h-screen relative flex items-center justify-center px-5 overflow-hidden">
      <img src={heroImg} alt="" className="absolute inset-0 w-full h-full object-cover scale-110 blur-2xl opacity-60" />
      <div className="absolute inset-0 bg-background/70" />

      <div className="relative w-full max-w-md rounded-[2rem] bg-card/90 backdrop-blur-xl border border-border shadow-bloom p-10">
        <div className="flex flex-col items-center text-center mb-8">
          <Logo />
          <h1 className="mt-7 font-serif text-3xl">Área Administrativa</h1>
          <p className="mt-2 text-sm text-muted-foreground">Acesso restrito à gerência.</p>
        </div>

        <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-2 block">E-mail</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="email"
                placeholder="voce@almaeessencia.com"
                className="w-full rounded-full bg-background border border-border pl-11 pr-4 py-3.5 text-sm focus:outline-none focus:border-caramel focus:ring-2 focus:ring-caramel/20 transition"
              />
            </div>
          </div>

          <div>
            <label className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-2 block">Senha</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type={show ? "text" : "password"}
                placeholder="••••••••"
                className="w-full rounded-full bg-background border border-border pl-11 pr-12 py-3.5 text-sm focus:outline-none focus:border-caramel focus:ring-2 focus:ring-caramel/20 transition"
              />
              <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-caramel-deep">
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded-full bg-gradient-caramel text-primary-foreground py-4 text-sm uppercase tracking-[0.2em] shadow-soft hover:shadow-bloom hover:-translate-y-0.5 active:translate-y-0 transition-all mt-2"
          >
            Entrar
          </button>
        </form>

        <div className="botanical-divider mt-8"><span>✿</span></div>
      </div>
    </div>
  );
}
