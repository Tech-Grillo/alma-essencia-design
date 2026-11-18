// Peças visuais compartilhadas pelo painel administrativo.
import { useEffect, useState, type ReactNode } from "react";
import * as Icons from "lucide-react";

export const brl = (n: number) => Number(n).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const inputClass =
  "w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition placeholder:text-muted-foreground/70 focus:border-caramel focus:ring-2 focus:ring-caramel/20";

export function Field({
  label,
  hint,
  error,
  required,
  children,
  className = "",
}: {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-sm font-medium text-foreground">
        {label}
        {required && <span className="text-caramel-deep"> *</span>}
      </span>
      {children}
      {error ? (
        <span className="mt-1.5 block text-xs text-red-600 dark:text-red-400">{error}</span>
      ) : hint ? (
        <span className="mt-1.5 block text-xs text-muted-foreground">{hint}</span>
      ) : null}
    </label>
  );
}

/** Campo de valor em reais: o usuário digita só números e vê "R$ 59,90". */
export function MoneyInput({
  value,
  onChange,
  placeholder = "R$ 0,00",
  ariaLabel,
}: {
  value: number | null;
  onChange: (value: number | null) => void;
  placeholder?: string;
  ariaLabel?: string;
}) {
  const format = (n: number | null) => (n == null ? "" : brl(n));
  const [text, setText] = useState(format(value));

  useEffect(() => {
    setText(format(value));
  }, [value]);

  return (
    <input
      inputMode="numeric"
      aria-label={ariaLabel}
      className={inputClass}
      placeholder={placeholder}
      value={text}
      onChange={(e) => {
        const digits = e.target.value.replace(/\D/g, "").replace(/^0+/, "");
        if (!digits) {
          setText("");
          onChange(null);
          return;
        }
        const n = Number(digits) / 100;
        setText(brl(n));
        onChange(n);
      }}
    />
  );
}

export function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" | "danger" | "destructive" }) {
  const styles = {
    primary: "bg-caramel text-primary-foreground hover:bg-caramel/90",
    secondary: "border border-border bg-background text-foreground hover:bg-secondary",
    ghost: "text-muted-foreground hover:bg-secondary hover:text-foreground",
    danger: "text-red-600 hover:bg-red-600/10 dark:text-red-400",
    destructive: "bg-red-600 text-white hover:bg-red-700",
  }[variant];
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${styles} ${className}`}
    >
      {children}
    </button>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-border bg-card ${className}`}>{children}</div>;
}

export function EmptyState({ icon, title, text, action }: { icon: ReactNode; title: string; text: string; action?: ReactNode }) {
  return (
    <Card className="flex flex-col items-center px-6 py-14 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-caramel-deep">{icon}</div>
      <p className="font-medium text-foreground">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{text}</p>
      {action && <div className="mt-5">{action}</div>}
    </Card>
  );
}

export function Notice({ tone = "error", children }: { tone?: "error" | "success" | "info"; children: ReactNode }) {
  const styles = {
    error: "border-red-600/20 bg-red-600/5 text-red-700 dark:text-red-300",
    success: "border-green-600/20 bg-green-600/10 text-green-800 dark:text-green-300",
    info: "border-border bg-secondary/60 text-muted-foreground",
  }[tone];
  return <p className={`rounded-xl border px-4 py-3 text-sm ${styles}`}>{children}</p>;
}

/** Painel lateral (gaveta) que entra pela direita; ocupa a tela inteira no celular. */
export function Sheet({
  open,
  title,
  onClose,
  children,
  footer,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label={title}>
      <button className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" aria-label="Fechar" onClick={onClose} />
      <div className="relative flex h-full w-full max-w-xl flex-col bg-background shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-4 sm:px-6">
          <h2 className="font-serif text-2xl">{title}</h2>
          <button onClick={onClose} className="rounded-lg p-2 text-muted-foreground hover:bg-secondary" aria-label="Fechar">
            <Icons.X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">{children}</div>
        {footer && <div className="border-t border-border bg-background px-5 py-4 sm:px-6">{footer}</div>}
      </div>
    </div>
  );
}

export function useToast() {
  const [message, setMessage] = useState("");
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(""), 3000);
    return () => clearTimeout(t);
  }, [message]);
  const toast = message ? (
    <div className="fixed bottom-24 left-1/2 z-[60] -translate-x-1/2 rounded-xl bg-foreground px-4 py-3 text-sm font-medium text-background shadow-lg lg:bottom-8">
      <span className="inline-flex items-center gap-2">
        <Icons.Check className="h-4 w-4" /> {message}
      </span>
    </div>
  ) : null;
  return { show: setMessage, toast };
}
