export const environment = {
  production: false,
  appName: 'FlowGate Portal',
  apiUrl: '/api',
  mockProfiles: [
    {
      id: '00000000-0000-0000-0000-000000000001',
      displayName: 'Local Admin',
      email: 'admin@flowgate.local',
      roles: ['Admin', 'Approver']
    },
    {
      id: '00000000-0000-0000-0000-000000000099',
      displayName: 'Usuário Solicitante',
      email: 'user@flowgate.local',
      roles: ['StandardUser']
    }
  ]
};
