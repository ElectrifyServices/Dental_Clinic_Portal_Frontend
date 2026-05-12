// ─── useTenantConfig — Per-screen config & feature flag helpers ───────────────
// Usage examples:
//   const cfg   = useTenantConfig();                          // full tenant config
//   const screen = useScreenConfig('billing');                // screen-level config
//   const hasGST = useFeature('billing', 'enableGST');        // boolean flag
//   const rate   = useFeatureValue('billing', 'gstRate', 18); // typed value
// ─────────────────────────────────────────────────────────────────────────────

import { useTenant } from '../contexts/TenantContext';
import { TenantConfig, ScreenConfig } from '../config/schema';

/** Returns the full tenant config object. */
export function useTenantConfig(): TenantConfig {
  const { tenant } = useTenant();
  return tenant;
}

/**
 * Returns the config for a specific screen.
 * Falls back to `{ enabled: true, label: screenId, features: {} }` if the screen
 * is not explicitly defined in the tenant config (safe default: show everything).
 */
export function useScreenConfig(screenId: string): ScreenConfig {
  const { tenant } = useTenant();
  return tenant.screens[screenId] ?? { enabled: true, label: screenId, features: {} };
}

/**
 * Returns true if a boolean feature flag is enabled for the given screen.
 * Returns `true` if the key is not present (opt-in default).
 */
export function useFeature(screenId: string, featureKey: string): boolean {
  const screen = useScreenConfig(screenId);
  const val = screen.features[featureKey];
  return val === undefined ? true : Boolean(val);
}

/**
 * Returns the typed value of a feature config field.
 * Falls back to `defaultValue` if the key is missing.
 */
export function useFeatureValue<T extends boolean | number | string>(
  screenId: string,
  featureKey: string,
  defaultValue: T,
): T {
  const screen = useScreenConfig(screenId);
  const val = screen.features[featureKey];
  return (val === undefined ? defaultValue : val) as T;
}

/**
 * Returns whether a screen is enabled for the current tenant.
 * Returns `true` if the screen is not listed (safe default).
 */
export function useScreenEnabled(screenId: string): boolean {
  const screen = useScreenConfig(screenId);
  return screen.enabled;
}
