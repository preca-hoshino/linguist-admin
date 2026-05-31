export default {
  title: '用户',
  desc: '管理系统用户与权限。',
  permissions: {
    title: '权限',
    configure: '配置权限',
    fullAccess: '全部权限',
    selfProtect: '不能修改自己的权限',
    permissionCeiling: '不能授予超过自身权限的级别',
    modules: {
      models: '模型',
      mcp: 'MCP',
      apps: '应用',
      users: '用户',
      settings: '设置',
    },
    levels: {
      view: '查看',
      edit: '编辑',
    },
  },
};
