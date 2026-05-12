import { createContext, useContext, useState, ReactNode } from "react";
import { TenantConfig } from "../config/schema";
import { resolveTenant, getTenantConfig, getAvailableTenants } from "../config";

interface TenantContextValue {
  /** Full config object for the active tenant */
  tenant: TenantConfig;
  /** Active tenant ID */
  tenantId: string;
  /** Switch to a different tenant (persists to localStorage) */
  switchTenant: (id: string) => void;
  /** List of all registered tenants */
  availableTenants: { id: string; name: string }[];
}

const TenantContext = createContext<TenantContextValue | null>(null);

export function TenantProvider({ children }: { children: ReactNode }) {
  const [tenantId, setTenantId] = useState<string>(() => resolveTenant());
  const [tenant, setTenant] = useState<TenantConfig>(() =>
    getTenantConfig(resolveTenant()),
  );

  const switchTenant = (id: string) => {
    try {
      localStorage.setItem("dental_tenant_id", id);
    } catch {
      /* private browsing */
    }
    const config = getTenantConfig(id);
    setTenantId(id);
    setTenant(config);
  };

  return (
    <TenantContext.Provider
      value={{
        tenant,
        tenantId,
        switchTenant,
        availableTenants: getAvailableTenants(),
      }}
    >
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const ctx = useContext(TenantContext);
  if (!ctx) throw new Error("useTenant must be used within TenantProvider");
  return ctx;
}
