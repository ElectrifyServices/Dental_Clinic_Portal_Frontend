/**
 * Safely parses the backend module_permission field.
 * The backend may return this field as either a JSON-stringified array or a standard array.
 */

/** A permission entry can be a plain string or an object carrying a name/code. */
type PermissionEntry = string | { name?: string; code?: string } | null | undefined;

/** Shape of the (loosely typed) user object we read permissions from. */
interface PermissionSource {
  module_permission?: unknown;
  module_permissions?: unknown;
  permissions?: unknown;
  /** Backend sometimes sends role as a plain string, sometimes as an object. */
  role?: unknown;
}

function getRoleObject(role: unknown): Record<string, unknown> | null {
  return typeof role === 'object' && role !== null
    ? (role as Record<string, unknown>)
    : null;
}

function toPermissionName(p: PermissionEntry): string {
  if (typeof p === 'string') return p;
  return p?.name || p?.code || '';
}

export function getParsedPermissions(user: PermissionSource | null | undefined): string[] {
  if (!user) return [];

  const role = getRoleObject(user.role);

  const rawPerms =
    user.module_permission ??
    user.module_permissions ??
    user.permissions ??
    role?.permissions ??
    role?.module_permissions ??
    role?.module_permission;

  if (!rawPerms) return [];

  if (Array.isArray(rawPerms)) {
    return (rawPerms as PermissionEntry[]).map(toPermissionName);
  }

  if (typeof rawPerms === 'string') {
    try {
      const parsed = JSON.parse(rawPerms);
      if (Array.isArray(parsed)) {
        return (parsed as PermissionEntry[]).map(toPermissionName);
      }
    } catch {
      if (rawPerms.includes(',')) {
        return rawPerms.split(',').map((p: string) => p.trim());
      }
      return [rawPerms];
    }
  }

  return [];
}
