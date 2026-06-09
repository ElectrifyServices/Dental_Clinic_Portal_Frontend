// ─── Multi-Tenant Configuration Schema ───────────────────────────────────────
// Each tenant (clinic) has its own JSON config file under src/config/tenants/.
// Screens are keyed by their page route ID (e.g. "dashboard", "appointments").
// ─────────────────────────────────────────────────────────────────────────────

export interface ScreenConfig {
  /** Whether this screen is available at all for this tenant */
  enabled: boolean;
  /** Custom display label for this screen (shown in sidebar, page title) */
  label: string;
  /** Per-screen feature flags and values */
  features: Record<string, boolean | number | string>;
}

export interface TenantBranding {
  /** Displayed clinic name throughout the UI */
  clinicName: string;
  /** Optional tagline shown on login / header */
  tagline?: string;
  /** URL to a custom logo image */
  logoUrl?: string;
  /** Tailwind color key used for primary accents: blue | emerald | violet | amber | rose */
  primaryColor: 'blue' | 'emerald' | 'violet' | 'amber' | 'rose';
  /** ISO 4217 currency code e.g. "INR", "USD" */
  currency: string;
  /** Currency symbol e.g. "₹", "$" */
  currencySymbol: string;
  /** IANA timezone e.g. "Asia/Kolkata" */
  timezone: string;
  /** Date format token: "DD/MM/YYYY" | "MM/DD/YYYY" | "YYYY-MM-DD" */
  dateFormat: string;
  /** Country name */
  country: string;
}

export interface SidebarGroup {
  /** Matches role-access group ids: main | clinical | admin | superadmin */
  id: string;
  /** Display label for this group in the sidebar */
  label: string;
  /** Ordered list of screen IDs to show in this group */
  items: string[];
}

export interface TenantConfig {
  /** Unique tenant identifier — must match the JSON filename without extension */
  tenantId: string;
  /** Config schema version for migration support */
  version: string;
  /** Branding and locale settings */
  branding: TenantBranding;
  /**
   * Screen configs keyed by page route ID.
   * Screens not listed here default to enabled with an empty feature set.
   */
  screens: Record<string, ScreenConfig>;
  /** Sidebar navigation structure for this tenant */
  sidebar: {
    groups: SidebarGroup[];
  };
  /** Support contact info shown in the UI */
  support?: {
    email?: string;
    phone?: string;
    website?: string;
  };
}
