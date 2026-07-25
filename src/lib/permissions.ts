export type Role = 'Founder' | 'Admin' | 'Manager' | 'Finance' | 'Employee' | 'Customer';

export type Resource =
  | 'dashboard'
  | 'ventures'
  | 'finance'
  | 'team'
  | 'teams'
  | 'projects'
  | 'tasks'
  | 'settings'
  | 'user_management'
  | 'reports'
  | 'company_settings'
  | 'rewards';

export type Action = 'create' | 'read' | 'update' | 'delete' | 'manage';

/**
 * Normalize role string to handle legacy database roles and case variations.
 */
export function normalizeRole(role?: string | null): Role {
  if (!role) return 'Customer';
  const r = role.trim().toUpperCase();

  if (r === 'FOUNDER') return 'Founder';
  if (r === 'ADMIN' || r === 'ADMINISTRATOR') return 'Admin';
  if (r === 'MANAGER') return 'Manager';
  if (r === 'FINANCE') return 'Finance';
  if (r === 'EMPLOYEE' || r === 'HR' || r === 'STAFF') return 'Employee';
  if (r === 'CUSTOMER' || r === 'USER' || r === 'CLIENT') return 'Customer';

  const titleCase = (role.charAt(0).toUpperCase() + role.slice(1).toLowerCase()) as Role;
  const validRoles: Role[] = ['Founder', 'Admin', 'Manager', 'Finance', 'Employee', 'Customer'];
  if (validRoles.includes(titleCase)) return titleCase;

  return 'Customer';
}

export interface PermissionRule {
  create: boolean;
  read: boolean;
  update: boolean;
  delete: boolean;
  scope?: 'all' | 'assigned' | 'own' | 'limited' | 'profile_only' | 'invoice_only' | 'none';
}

export const ROLE_PERMISSIONS: Record<Role, Record<Resource, PermissionRule>> = {
  Founder: {
    dashboard: { create: true, read: true, update: true, delete: true, scope: 'all' },
    ventures: { create: true, read: true, update: true, delete: true, scope: 'all' },
    finance: { create: true, read: true, update: true, delete: true, scope: 'all' },
    team: { create: true, read: true, update: true, delete: true, scope: 'all' },
    teams: { create: true, read: true, update: true, delete: true, scope: 'all' },
    projects: { create: true, read: true, update: true, delete: true, scope: 'all' },
    tasks: { create: true, read: true, update: true, delete: true, scope: 'all' },
    settings: { create: true, read: true, update: true, delete: true, scope: 'all' },
    user_management: { create: true, read: true, update: true, delete: true, scope: 'all' },
    reports: { create: true, read: true, update: true, delete: true, scope: 'all' },
    company_settings: { create: true, read: true, update: true, delete: true, scope: 'all' },
    rewards: { create: true, read: true, update: true, delete: true, scope: 'all' }
  },
  Admin: {
    dashboard: { create: true, read: true, update: true, delete: true, scope: 'all' },
    ventures: { create: true, read: true, update: true, delete: true, scope: 'all' },
    finance: { create: true, read: true, update: true, delete: true, scope: 'all' },
    team: { create: true, read: true, update: true, delete: true, scope: 'all' },
    teams: { create: true, read: true, update: true, delete: true, scope: 'all' },
    projects: { create: true, read: true, update: true, delete: true, scope: 'all' },
    tasks: { create: true, read: true, update: true, delete: true, scope: 'all' },
    settings: { create: false, read: true, update: true, delete: false, scope: 'limited' },
    user_management: { create: true, read: true, update: true, delete: true, scope: 'all' },
    reports: { create: true, read: true, update: true, delete: true, scope: 'all' },
    company_settings: { create: false, read: true, update: true, delete: false, scope: 'limited' },
    rewards: { create: true, read: true, update: true, delete: true, scope: 'all' }
  },
  Manager: {
    dashboard: { create: true, read: true, update: true, delete: false, scope: 'all' },
    ventures: { create: true, read: true, update: true, delete: false, scope: 'assigned' },
    finance: { create: false, read: true, update: false, delete: false, scope: 'all' },
    team: { create: true, read: true, update: true, delete: false, scope: 'assigned' },
    teams: { create: true, read: true, update: true, delete: false, scope: 'assigned' },
    projects: { create: true, read: true, update: true, delete: true, scope: 'all' },
    tasks: { create: true, read: true, update: true, delete: true, scope: 'all' },
    settings: { create: false, read: false, update: false, delete: false, scope: 'none' },
    user_management: { create: false, read: false, update: false, delete: false, scope: 'none' },
    reports: { create: false, read: true, update: false, delete: false, scope: 'assigned' },
    company_settings: { create: false, read: false, update: false, delete: false, scope: 'none' },
    rewards: { create: true, read: true, update: true, delete: false, scope: 'all' }
  },
  Finance: {
    dashboard: { create: true, read: true, update: true, delete: false, scope: 'all' },
    ventures: { create: false, read: true, update: false, delete: false, scope: 'all' },
    finance: { create: true, read: true, update: true, delete: true, scope: 'all' },
    team: { create: false, read: true, update: false, delete: false, scope: 'all' },
    teams: { create: false, read: true, update: false, delete: false, scope: 'all' },
    projects: { create: false, read: true, update: false, delete: false, scope: 'all' },
    tasks: { create: false, read: false, update: false, delete: false, scope: 'none' },
    settings: { create: false, read: false, update: false, delete: false, scope: 'none' },
    user_management: { create: false, read: false, update: false, delete: false, scope: 'none' },
    reports: { create: true, read: true, update: true, delete: false, scope: 'all' },
    company_settings: { create: false, read: false, update: false, delete: false, scope: 'none' },
    rewards: { create: false, read: true, update: false, delete: false, scope: 'all' }
  },
  Employee: {
    dashboard: { create: false, read: true, update: false, delete: false, scope: 'own' },
    ventures: { create: false, read: true, update: false, delete: false, scope: 'assigned' },
    finance: { create: false, read: false, update: false, delete: false, scope: 'none' },
    team: { create: false, read: true, update: true, delete: false, scope: 'profile_only' },
    teams: { create: false, read: true, update: false, delete: false, scope: 'assigned' },
    projects: { create: false, read: true, update: true, delete: false, scope: 'assigned' },
    tasks: { create: false, read: true, update: true, delete: false, scope: 'assigned' },
    settings: { create: false, read: true, update: true, delete: false, scope: 'profile_only' },
    user_management: { create: false, read: false, update: false, delete: false, scope: 'none' },
    reports: { create: false, read: true, update: false, delete: false, scope: 'own' },
    company_settings: { create: false, read: false, update: false, delete: false, scope: 'none' },
    rewards: { create: false, read: true, update: false, delete: false, scope: 'own' }
  },
  Customer: {
    dashboard: { create: false, read: true, update: false, delete: false, scope: 'limited' },
    ventures: { create: false, read: false, update: false, delete: false, scope: 'none' },
    finance: { create: false, read: true, update: false, delete: false, scope: 'invoice_only' },
    team: { create: false, read: false, update: false, delete: false, scope: 'none' },
    teams: { create: false, read: false, update: false, delete: false, scope: 'none' },
    projects: { create: false, read: true, update: false, delete: false, scope: 'own' },
    tasks: { create: false, read: false, update: false, delete: false, scope: 'none' },
    settings: { create: false, read: true, update: true, delete: false, scope: 'profile_only' },
    user_management: { create: false, read: false, update: false, delete: false, scope: 'none' },
    reports: { create: false, read: true, update: false, delete: false, scope: 'own' },
    company_settings: { create: false, read: false, update: false, delete: false, scope: 'none' },
    rewards: { create: false, read: false, update: false, delete: false, scope: 'none' }
  }
};

/**
 * Check if a role has specific permission for a resource and action.
 */
export function hasPermission(
  roleRaw?: string | null,
  resource?: Resource,
  action: Action = 'read'
): boolean {
  if (!resource) return false;
  const role = normalizeRole(roleRaw);
  const rule = ROLE_PERMISSIONS[role]?.[resource];

  if (!rule) return false;
  if (rule.scope === 'none') return false;

  if (action === 'manage') return rule.create && rule.update && rule.delete;
  return rule[action] ?? false;
}

/**
 * Map frontend URL path to resource and check if role can access the page route.
 */
export function canAccessRoute(roleRaw?: string | null, pathname: string = '/'): boolean {
  const role = normalizeRole(roleRaw);
  const path = pathname.split('?')[0].split('#')[0];

  if (path === '/' || path === '') return true; // Dashboard is accessible to all roles
  if (path === '/login') return true;

  if (path.startsWith('/ventures')) return hasPermission(role, 'ventures', 'read');
  if (path.startsWith('/finance')) return hasPermission(role, 'finance', 'read');
  if (path.startsWith('/teams')) return hasPermission(role, 'teams', 'read');
  if (path.startsWith('/team') || path.startsWith('/employees')) return hasPermission(role, 'team', 'read');
  if (path.startsWith('/projects')) return hasPermission(role, 'projects', 'read');
  if (path.startsWith('/tasks')) return hasPermission(role, 'tasks', 'read');
  if (path.startsWith('/rewards')) return hasPermission(role, 'rewards', 'read');
  if (path.startsWith('/settings')) return hasPermission(role, 'settings', 'read');
  if (path.startsWith('/reports')) return hasPermission(role, 'reports', 'read');
  if (path.startsWith('/users')) return hasPermission(role, 'user_management', 'read');

  return true;
}
