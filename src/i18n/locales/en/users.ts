export default {
  title: 'Users',
  desc: 'Manage system users and permissions.',
  permissions: {
    title: 'Permissions',
    configure: 'Configure Permissions',
    fullAccess: 'Full Access',
    selfProtect: 'cannot change own permissions',
    permissionCeiling: 'cannot grant permissions above your own level',
    modules: {
      models: 'Models',
      mcp: 'MCP',
      apps: 'Apps',
      users: 'Users',
      settings: 'Settings',
    },
    levels: {
      view: 'View',
      edit: 'Edit',
    },
  },
};
