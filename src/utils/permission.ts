/**
 * Safely parses the backend module_permission field.
 * The backend may return this field as either a JSON-stringified array or a standard array.
 */
export function getParsedPermissions(user: any): string[] {
  if (!user) return [];
  const rawPerms = user.module_permission;
  if (!rawPerms) return [];
  
  if (Array.isArray(rawPerms)) {
    return rawPerms;
  }
  
  if (typeof rawPerms === 'string') {
    try {
      const parsed = JSON.parse(rawPerms);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch (e) {
      console.error("Failed to parse module_permission string", e);
    }
  }
  
  return [];
}
