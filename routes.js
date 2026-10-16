// Every VenDians web screen to audit, taken from the module specs in
// Desktop\Vendians\main\documents\input\SPEC-*.md (observed on dev build 8.0.13).
// `id` names the report files; `auth: false` pages are audited signed out.

export const routes = [
  // Login
  { id: 'login', module: 'Login', page: 'Sign In', path: '/login', auth: false, priority: 'High' },

  // Home
  { id: 'home', module: 'Home', page: 'Home dashboard', path: '/', priority: 'High' },

  // Leaves
  { id: 'leaves-my', module: 'Leaves', page: 'My Leaves', path: '/leaves', priority: 'High' },
  { id: 'leaves-team-requests', module: 'Leaves', page: 'Team - Leave Requests', path: '/leaves?tab=requests', priority: 'High' },
  { id: 'leaves-team-calendar', module: 'Leaves', page: 'Team - Leave Calendar', path: '/leaves?tab=calendar', priority: 'High' },
  { id: 'leaves-team-quota', module: 'Leaves', page: 'Team - Quota', path: '/leaves?tab=quota', priority: 'High' },
  { id: 'leaves-company-quotas', module: 'Leaves', page: 'Company - Leave Quotas', path: '/leaves?view=company&tab=leave-quotas', priority: 'Medium' },
  { id: 'leaves-company-all', module: 'Leaves', page: 'Company - All Leaves', path: '/leaves?view=company&tab=all-leaves', priority: 'Medium' },
  { id: 'leaves-company-adjustments', module: 'Leaves', page: 'Company - Leave Adjustments', path: '/leaves?view=company&tab=adjustments', priority: 'Medium' },

  // Claims
  { id: 'claims-my', module: 'Claims', page: 'My Claims', path: '/claims?tab=my', priority: 'High' },
  { id: 'claims-team', module: 'Claims', page: 'Team Claims', path: '/claims?tab=team', priority: 'High' },
  { id: 'claims-faqs', module: 'Claims', page: 'FAQs', path: '/claims?tab=faqs', priority: 'High' },

  // Performance
  { id: 'perf-my-goals', module: 'Performance', page: 'My Goals', path: '/my-performance/goals', priority: 'High' },
  { id: 'perf-my-reviews', module: 'Performance', page: 'My Performance Review', path: '/my-performance/reviews', priority: 'High' },
  { id: 'perf-team', module: 'Performance', page: 'Team Performance', path: '/lm-dashboard/performance-management', priority: 'High' },

  // Monthly Performance
  { id: 'mp-cycles', module: 'Monthly Performance', page: 'View Cycles', path: '/pc/performance-cycles', priority: 'Medium' },
  { id: 'mp-crmc-panel', module: 'Monthly Performance', page: 'CRMC Panel', path: '/pc/performance-cycles-crmc', priority: 'Medium' },
  { id: 'mp-project-reporting', module: 'Monthly Performance', page: 'Project Reporting', path: '/pc/project-reviews', priority: 'Medium' },
  { id: 'mp-individual-reporting', module: 'Monthly Performance', page: 'Individual Reporting', path: '/employee-ratings', priority: 'Medium' },

  // Directory
  { id: 'dir-employees', module: 'Directory', page: 'Employee Directory', path: '/employee-directory', priority: 'High' },
  { id: 'dir-org-chart', module: 'Directory', page: 'Organization Chart', path: '/employee-organization-tree', priority: 'Medium' },

  // Profile
  { id: 'profile', module: 'Profile', page: 'My Profile', path: '/profile', priority: 'High' },

  // Employees
  { id: 'emp-all', module: 'Employees', page: 'All Employees', path: '/employees/all', priority: 'Medium' },
  { id: 'emp-current', module: 'Employees', page: 'Current Employees', path: '/crmc/employees/current', priority: 'Medium' },
  { id: 'emp-inactive', module: 'Employees', page: 'Inactive Employees', path: '/crmc/employees/inactive', priority: 'Medium' },
  { id: 'emp-billable', module: 'Employees', page: 'Billable Resources', path: '/crmc/employees/billable', priority: 'Medium' },
  { id: 'emp-non-billable', module: 'Employees', page: 'Non-Billable Resources', path: '/crmc/employees/non-billable', priority: 'Medium' },

  // Projects
  { id: 'proj-current', module: 'Projects', page: 'Current Projects', path: '/crmc/projects/current', priority: 'Medium' },
  { id: 'proj-completed', module: 'Projects', page: 'Completed Projects', path: '/crmc/projects/completed', priority: 'Medium' },

  // Resource Planner
  { id: 'rp-transient', module: 'Resource Planner', page: 'Transient Resources', path: '/resourcePlanner/transientResource', priority: 'Medium' },
  { id: 'rp-deals', module: 'Resource Planner', page: 'Deals Summary', path: '/deals', priority: 'Medium' },
  { id: 'rp-deficit', module: 'Resource Planner', page: 'Resource Deficit', path: '/resourcePlanner/reports/resource-deficit', priority: 'Medium' },
  { id: 'rp-bench', module: 'Resource Planner', page: 'Bench Summary', path: '/resourcePlanner/reports/bench-summary', priority: 'Medium' },

  // Reports
  { id: 'rep-utilization', module: 'Reports', page: 'Resource Utilization', path: '/billing', priority: 'Medium' },
  { id: 'rep-certificates', module: 'Reports', page: 'Employee Certificates', path: '/employees/certificates', priority: 'Medium' },

  // VSOP
  { id: 'vsop-market-values', module: 'VSOP', page: 'Market Values', path: '/market-values', priority: 'Low' },
  { id: 'vsop-grants', module: 'VSOP', page: 'Employee Grants', path: '/employee-grants', priority: 'Low' },
  { id: 'vsop-cycles', module: 'VSOP', page: 'Quarterly Cycles', path: '/grant-cycles', priority: 'Low' },
  { id: 'vsop-transactions', module: 'VSOP', page: 'Exercise & Buyback', path: '/vsop-transactions', priority: 'Low' },

  // Admin Panel
  { id: 'admin-goals', module: 'Admin Panel', page: 'All Goals', path: '/goals', priority: 'Low' },
  { id: 'admin-predefined-goals', module: 'Admin Panel', page: 'Predefined Goals', path: '/predefined-goals', priority: 'Low' },
  { id: 'admin-goal-categories', module: 'Admin Panel', page: 'Goal Categories', path: '/goals-categories', priority: 'Low' },
  { id: 'admin-monthly-competencies', module: 'Admin Panel', page: 'Monthly Competencies', path: '/monthly-competencies', priority: 'Low' },
  { id: 'admin-biannual-competencies', module: 'Admin Panel', page: 'Bi-Annual Competencies', path: '/bi-annual-competencies', priority: 'Low' },
  { id: 'admin-performance-mgmt', module: 'Admin Panel', page: 'Performance Management', path: '/performance-management', priority: 'Low' },
  { id: 'admin-pm-dashboard', module: 'Admin Panel', page: 'PM Dashboard', path: '/pm-admin-dashboard', priority: 'Low' },

  // Configuration
  { id: 'cfg-roles', module: 'Configuration', page: 'Roles', path: '/roles', priority: 'Low' },
  { id: 'cfg-skills', module: 'Configuration', page: 'Skills', path: '/skills', priority: 'Low' },
  { id: 'cfg-employment-types', module: 'Configuration', page: 'Employment Types', path: '/employment-types', priority: 'Low' },
  { id: 'cfg-departments', module: 'Configuration', page: 'Departments', path: '/departments', priority: 'Low' },
  { id: 'cfg-currencies', module: 'Configuration', page: 'Currencies', path: '/currencies', priority: 'Low' },
  { id: 'cfg-overhead-costs', module: 'Configuration', page: 'Overhead Costs', path: '/overhead-costs', priority: 'Low' },
  { id: 'cfg-companies', module: 'Configuration', page: 'Companies', path: '/companies', priority: 'Low' },
  { id: 'cfg-industries', module: 'Configuration', page: 'Industries', path: '/industries', priority: 'Low' },
  { id: 'cfg-customers', module: 'Configuration', page: 'Customers', path: '/customers', priority: 'Low' },
  { id: 'cfg-designations', module: 'Configuration', page: 'Designations', path: '/designations', priority: 'Low' },
  { id: 'cfg-locations', module: 'Configuration', page: 'Locations', path: '/locations', priority: 'Low' },
  { id: 'cfg-competencies', module: 'Configuration', page: 'Competencies', path: '/competencies', priority: 'Low' },
  { id: 'cfg-business-units', module: 'Configuration', page: 'Business Units', path: '/business-unit', priority: 'Low' },
  { id: 'cfg-divisions', module: 'Configuration', page: 'Divisions', path: '/division', priority: 'Low' },
  { id: 'cfg-project-roles', module: 'Configuration', page: 'Project Roles', path: '/project-roles', priority: 'Low' },
  { id: 'cfg-leave-models', module: 'Configuration', page: 'Leave Models', path: '/leave-models', priority: 'Low' },
];
