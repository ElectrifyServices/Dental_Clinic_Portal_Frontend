import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ApiTheme {
  primary_color?: string | null;
  secondary_color?: string | null;
  font_family?: string | null;
  favicon_url?: string | null;
  logo_url?: string | null;
  tagline?: string | null;
  config?: {
    isDarkMode?: boolean;
    borderRadius?: number;
  } | null;
}

export interface ApiBranding {
  clinic_name?: string | null;
  doctor_name?: string | null;
  doctor_title?: string | null;
  brand_color?: string | null;
  ink_color?: string | null;
  ink_muted_color?: string | null;
  line_color?: string | null;
  panel_color?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  hours?: string | null;
  instagram?: string | null;
}

export interface ThemeData {
  theme: ApiTheme;
  branding: ApiBranding;
}

interface ThemeContextValue {
  themeData: ThemeData | null;
  applyTheme: (data: ThemeData) => void;
  clearTheme: () => void;
}

// ---------------------------------------------------------------------------
// Storage key
// ---------------------------------------------------------------------------

const STORAGE_KEY = "dental_theme";

// ---------------------------------------------------------------------------
// Hex → "R G B" helper (CSS custom property format used by Tailwind)
// ---------------------------------------------------------------------------

function hexToRgbTriplet(hex: string): string | null {
  const cleaned = hex.replace(/^#/, "");
  if (cleaned.length !== 6) return null;
  const r = parseInt(cleaned.slice(0, 2), 16);
  const g = parseInt(cleaned.slice(2, 4), 16);
  const b = parseInt(cleaned.slice(4, 6), 16);
  if (isNaN(r) || isNaN(g) || isNaN(b)) return null;
  return `${r} ${g} ${b}`;
}

// ---------------------------------------------------------------------------
// Apply CSS variables to :root from ThemeData
// ---------------------------------------------------------------------------

function applyThemeToDom(data: ThemeData): void {
  console.log("Applying dynamic theme to DOM:", data);
  const root = document.documentElement;
  const { theme, branding } = data;

  // ── Primary color ────────────────────────────────────────────────────────
  const primaryHex = theme.primary_color ?? branding.brand_color;
  if (primaryHex) {
    const triplet = hexToRgbTriplet(primaryHex);
    if (triplet) {
      root.style.setProperty("--primary", triplet);
      // Also update brand token shades (approximated from the single color)
      root.style.setProperty("--brand-500", triplet);
      root.style.setProperty("--ring", triplet);
    }
  }

  // ── Secondary color ──────────────────────────────────────────────────────
  const secondaryHex = theme.secondary_color;
  if (secondaryHex) {
    const triplet = hexToRgbTriplet(secondaryHex);
    if (triplet) {
      root.style.setProperty("--secondary-foreground", triplet);
    }
  }

  // ── Border radius ────────────────────────────────────────────────────────
  const borderRadius = theme.config?.borderRadius;
  if (typeof borderRadius === "number") {
    const rem = (borderRadius / 16).toFixed(4);
    root.style.setProperty("--radius", `${rem}rem`);
    root.style.setProperty("--radius-md", `${rem}rem`);
    // Slightly larger for cards/modals
    const lgRem = ((borderRadius + 4) / 16).toFixed(4);
    const modalRem = ((borderRadius + 8) / 16).toFixed(4);
    root.style.setProperty("--radius-lg", `${lgRem}rem`);
    root.style.setProperty("--radius-modal", `${modalRem}rem`);
  }

  // ── Dark mode ────────────────────────────────────────────────────────────
  if (typeof theme.config?.isDarkMode === "boolean") {
    if (theme.config.isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }

  // ── Font family ──────────────────────────────────────────────────────────
  if (theme.font_family) {
    document.documentElement.style.fontFamily = `'${theme.font_family} Variable', '${theme.font_family}', system-ui, -apple-system, sans-serif`;
  }

  // ── Favicon ──────────────────────────────────────────────────────────────
  if (theme.favicon_url) {
    try {
      let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
      if (!link) {
        link = document.createElement("link");
        link.rel = "icon";
        document.head.appendChild(link);
      }
      link.href = theme.favicon_url;
    } catch {
      /* DOM not available */
    }
  }

  // ── Browser Tab Title (Tagline) ──────────────────────────────────────────
  if (theme.tagline) {
    try {
      document.title = theme.tagline;
    } catch {
      /* DOM not available */
    }
  }
}

// ---------------------------------------------------------------------------
// Remove inline CSS variable overrides (revert to stylesheet defaults)
// ---------------------------------------------------------------------------

function clearThemeFromDom(): void {
  const root = document.documentElement;
  root.style.removeProperty("--primary");
  root.style.removeProperty("--brand-500");
  root.style.removeProperty("--ring");
  root.style.removeProperty("--secondary-foreground");
  root.style.removeProperty("--radius");
  root.style.removeProperty("--radius-md");
  root.style.removeProperty("--radius-lg");
  root.style.removeProperty("--radius-modal");
  root.style.fontFamily = "";
  document.documentElement.classList.remove("dark");
  try {
    document.title = "Opal Smiles Dental Studio";
    let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
    if (link) {
      link.href = "/favicon.png";
    }
  } catch {
    /* DOM not available */
  }
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeData, setThemeData] = useState<ThemeData | null>(() => {
    // Rehydrate from localStorage on first render
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw) as ThemeData;
    } catch {
      /* corrupt data — ignore */
    }
    return null;
  });

  // Apply stored theme on mount (prevents flash)
  useEffect(() => {
    if (themeData) {
      applyThemeToDom(themeData);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const applyTheme = useCallback((data: ThemeData) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      /* private browsing */
    }
    setThemeData(data);
    applyThemeToDom(data);
  }, []);

  const clearTheme = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* private browsing */
    }
    setThemeData(null);
    clearThemeFromDom();
  }, []);

  return (
    <ThemeContext.Provider value={{ themeData, applyTheme, clearTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
