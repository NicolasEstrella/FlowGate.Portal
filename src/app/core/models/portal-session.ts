import { AppRole } from './app-role';

export interface PortalSession {
  id: string;
  displayName: string;
  email: string;
  roles: AppRole[];
}