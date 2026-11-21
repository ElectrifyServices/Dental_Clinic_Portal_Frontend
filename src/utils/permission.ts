/**
 * Safely parses the backend module_permission field.
 * The backend may return this field as either a JSON-stringified array or a standard array.
 */
export function getParsedPermissions(user: any): string[] {
  if (!user) return [];
  
  const rawPerms = 
    user.module_permission ?? 
    user.module_permissions ?? 
    user.permissions ?? 
    user.role?.permissions ?? 
    user.role?.module_permissions ?? 
    user.role?.module_permission;
    
  if (!rawPerms) return [];
  
  if (Array.isArray(rawPerms)) {
    return rawPerms.map((p: any) => typeof p === 'string' ? p : (p?.name || p?.code || ''));
  }
  
  if (typeof rawPerms === 'string') {
    try {
      const parsed = JSON.parse(rawPerms);
      if (Array.isArray(parsed)) {
        return parsed.map((p: any) => typeof p === 'string' ? p : (p?.name || p?.code || ''));
      }
    } catch (e) {
      if (rawPerms.includes(',')) {
        return rawPerms.split(',').map((p: string) => p.trim());
      }
      return [rawPerms];
    }
  }
  
  return [];
}
