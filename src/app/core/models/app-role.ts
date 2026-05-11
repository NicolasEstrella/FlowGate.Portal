export enum AppRole {
  Admin = 'Admin',
  Approver = 'Approver',
  Finance = 'Finance',
  Legal = 'Legal',
  StandardUser = 'StandardUser'
}

export const appRoleLabels: Record<AppRole, string> = {
  [AppRole.Admin]: 'Administrador',
  [AppRole.Approver]: 'Aprovador',
  [AppRole.Finance]: 'Financeiro',
  [AppRole.Legal]: 'Jurídico',
  [AppRole.StandardUser]: 'Solicitante'
};