import { createContext, useContext, useEffect, useCallback, useState } from "react";

type Theme = "light" | "dark";
type ThemeToggleEvent = { clientX?: number; clientY?: number };

type ThemeContextValue = { theme: Theme; toggle: (event?: ThemeToggleEvent) => void };

const THEME_STORAGE_KEY = "theme";
const ThemeCtx = createContext<ThemeContextValue>({
  theme: "light",
  toggle: () => {},
});

function getPreferredTheme(): Theme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");

  const applyTheme = useCallback((nextTheme: Theme, options?: { animate?: boolean; clientX?: number; clientY?: number }) => {
    if (typeof window === "undefined") return;

    const root = document.documentElement;
    const commit = () => {
      setTheme(nextTheme);
      root.classList.toggle("dark", nextTheme === "dark");
      root.dataset.theme = nextTheme;
      root.style.colorScheme = nextTheme;
      localStorage.setItem(THEME_STORAGE_KEY, nextTheme);

      const meta = document.querySelector('meta[name="theme-color"]');
      if (meta) {
        meta.setAttribute("content", nextTheme === "light" ? "#f7f2ea" : "#060a10");
      }
    };

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const shouldAnimate = options?.animate && !reducedMotion && typeof document.startViewTransition === "function";

    if (!shouldAnimate) {
      commit();
      return;
    }

    const x = Number.isFinite(options?.clientX) ? options?.clientX : window.innerWidth / 2;
    const y = Number.isFinite(options?.clientY) ? options?.clientY : window.innerHeight / 2;
    const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));

    const transition = document.startViewTransition(() => {
      commit();
    });

    transition.ready.then(() => {
      root.animate(
        {
          clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`],
        },
        {
          duration: 700,
          easing: "ease-in-out",
          pseudoElement: "::view-transition-new(root)",
        },
      );
    });
  }, []);

  useEffect(() => {
    const storedTheme = (typeof window !== "undefined" && localStorage.getItem(THEME_STORAGE_KEY)) as Theme | null;
    const initialTheme = storedTheme ?? getPreferredTheme();
    applyTheme(initialTheme, { animate: false });
  }, [applyTheme]);

  const toggle = useCallback(
    (event?: ThemeToggleEvent) => {
      applyTheme(theme === "light" ? "dark" : "light", {
        animate: true,
        clientX: event?.clientX,
        clientY: event?.clientY,
      });
    },
    [applyTheme, theme],
  );

  return <ThemeCtx.Provider value={{ theme, toggle }}>{children}</ThemeCtx.Provider>;
}

export const useTheme = () => useContext(ThemeCtx);
