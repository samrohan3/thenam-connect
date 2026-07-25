/**
 * Role-Based Access Control (RBAC) Backend Configuration
 */

const normalizeRole = (role) => {
  if (!role) return 'Customer';
  const r = String(role).trim().toUpperCase();

  if (r === 'FOUNDER') return 'Founder';
  if (r === 'ADMIN' || r === 'ADMINISTRATOR') return 'Admin';
  if (r === 'MANAGER') return 'Manager';
  if (r === 'FINANCE') return 'Finance';
  if (r === 'EMPLOYEE' || r === 'HR' || r === 'STAFF') return 'Employee';
  if (r === 'CUSTOMER' || r === 'USER' || r === 'CLIENT') return 'Customer';

  const titleCase = role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
  const validRoles = ['Founder', 'Admin', 'Manager', 'Finance', 'Employee', 'Customer'];
  if (validRoles.includes(titleCase)) return titleCase;

  return 'Customer';
};

const PERMISSIONS = {
  Founder: {
    ventures: ['create', 'read', 'update', 'delete'],
    finance: ['create', 'read', 'update', 'delete'],
    team: ['create', 'read', 'update', 'delete'],
    projects: ['create', 'read', 'update', 'delete'],
    tasks: ['create', 'read', 'update', 'delete'],
    settings: ['create', 'read', 'update', 'delete'],
    user_management: ['create', 'read', 'update', 'delete'],
    reports: ['create', 'read', 'update', 'delete'],
    company_settings: ['create', 'read', 'update', 'delete']
  },
  Admin: {
    ventures: ['create', 'read', 'update', 'delete'],
    finance: ['create', 'read', 'update', 'delete'],
    team: ['create', 'read', 'update', 'delete'],
    projects: ['create', 'read', 'update', 'delete'],
    tasks: ['create', 'read', 'update', 'delete'],
    settings: ['read', 'update'],
    user_management: ['create', 'read', 'update', 'delete'],
    reports: ['create', 'read', 'update', 'delete'],
    company_settings: ['read', 'update']
  },
  Manager: {
    ventures: ['create', 'read', 'update'],
    finance: ['read'],
    team: ['create', 'read', 'update'],
    projects: ['create', 'read', 'update', 'delete'],
    tasks: ['create', 'read', 'update', 'delete'],
    settings: [],
    user_management: [],
    reports: ['read'],
    company_settings: []
  },
  Finance: {
    ventures: ['read'],
    finance: ['create', 'read', 'update', 'delete'],
    team: ['read'],
    projects: ['read'],
    tasks: [],
    settings: [],
    user_management: [],
    reports: ['create', 'read', 'update'],
    company_settings: []
  },
  Employee: {
    ventures: ['read'],
    finance: [],
    team: ['read', 'update'], // View/Edit own profile
    projects: ['read', 'update'],
    tasks: ['read', 'update'],
    settings: ['read', 'update'],
    user_management: [],
    reports: ['read'],
    company_settings: []
  },
  Customer: {
    ventures: [],
    finance: ['read'], // Invoice view
    team: [],
    projects: ['read'],
    tasks: [],
    settings: ['read', 'update'],
    user_management: [],
    reports: ['read'],
    company_settings: []
  }
};

const checkPermission = (roleRaw, resource, action = 'read') => {
  const role = normalizeRole(roleRaw);
  const resourcePermissions = PERMISSIONS[role]?.[resource] || [];
  return resourcePermissions.includes(action);
};

module.exports = {
  normalizeRole,
  PERMISSIONS,
  checkPermission
};
