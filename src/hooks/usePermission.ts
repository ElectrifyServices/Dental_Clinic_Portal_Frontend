import { useCallback } from "react";

interface UsePermissionOptions {
  permissions: string[];
  onChange: (permissions: string[]) => void;
}

export function usePermission({ permissions, onChange }: UsePermissionOptions) {
  const hasPermission = useCallback(
    (permission: string) => permissions.includes(permission),
    [permissions]
  );

  const togglePermission = useCallback(
    (permission: string) => {
      const next = permissions.includes(permission)
        ? permissions.filter((p) => p !== permission)
        : [...permissions, permission];
      onChange(next);
    },
    [permissions, onChange]
  );

  const grantPermissions = useCallback(
    (newPermissions: string[]) => {
      const unique = Array.from(new Set([...permissions, ...newPermissions]));
      onChange(unique);
    },
    [permissions, onChange]
  );

  const revokePermissions = useCallback(
    (toRevoke: string[]) => {
      const next = permissions.filter((p) => !toRevoke.includes(p));
      onChange(next);
    },
    [permissions, onChange]
  );

  const setPermissions = useCallback(
    (newPermissions: string[]) => {
      onChange(newPermissions);
    },
    [onChange]
  );

  return {
    permissions,
    hasPermission,
    togglePermission,
    grantPermissions,
    revokePermissions,
    setPermissions,
  };
}
