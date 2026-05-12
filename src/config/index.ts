// ─── Tenant Registry & Resolver ──────────────────────────────────────────────
// Add new tenants here by importing their JSON config and adding to the registry.
// ─────────────────────────────────────────────────────────────────────────────

import { TenantConfig } from './schema';
import defaultConfig from './tenants/default.json';
import basicClinicConfig from './tenants/basic-clinic.json';
import corporateClinicConfig from './tenants/corporate-clinic.json';

/** All registered tenants. Add new ones here as you onboard customers. */
export const TENANT_REGISTRY: Record<string, TenantConfig> = {
  'default': defaultConfig as TenantConfig,
  'basic-clinic': basicClinicConfig as TenantConfig,
  'corporate-clinic': corporateClinicConfig as TenantConfig,
};

/**
 * Resolve the active tenant ID using the following priority:
 *  1. URL query param   ?tenant=<id>        — useful for testing / previewing
 *  2. localStorage key  dental_tenant_id    — persisted on login / tenant switch
 *  3. Subdomain         <id>.yourdomain.com — production multi-tenant hosting
 *  4. Falls back to     "default"
 */
export function resolveTenant(): string {
  // 1. Query param (testing / preview)
  try {
    const params = new URLSearchParams(window.location.search);
    const fromQuery = params.get('tenant');
    if (fromQuery && TENANT_REGISTRY[fromQuery]) return fromQuery;
  } catch { /* SSR guard */ }

  // 2. localStorage (persisted selection)
  try {
    const fromStorage = localStorage.getItem('dental_tenant_id');
    if (fromStorage && TENANT_REGISTRY[fromStorage]) return fromStorage;
  } catch { /* private browsing guard */ }

  // 3. Subdomain (e.g. basic-clinic.dentalcarepro.com)
  try {
    const host = window.location.hostname;
    const parts = host.split('.');
    if (parts.length > 2) {
      const subdomain = parts[0];
      if (subdomain && subdomain !== 'www' && TENANT_REGISTRY[subdomain]) return subdomain;
    }
  } catch { /* guard */ }

  return 'default';
}

/** Return the config for a given tenant ID, falling back to default if unknown. */
export function getTenantConfig(tenantId: string): TenantConfig {
  return TENANT_REGISTRY[tenantId] ?? TENANT_REGISTRY['default'];
}

/** List all registered tenant IDs (useful for a superadmin switcher UI). */
export function getAvailableTenants(): { id: string; name: string }[] {
  return Object.values(TENANT_REGISTRY).map(t => ({ id: t.tenantId, name: t.branding.clinicName }));
}
