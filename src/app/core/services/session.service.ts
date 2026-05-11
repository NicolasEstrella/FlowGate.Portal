import { computed, Injectable, signal } from '@angular/core';

import { environment } from '../../../environments/environment';
import { AppRole } from '../models/app-role';
import { PortalSession } from '../models/portal-session';

@Injectable({ providedIn: 'root' })
export class SessionService {
  private readonly storageKey = 'flowgate.portal.session';
  private readonly sessionState = signal<PortalSession | null>(this.readStoredSession());

  readonly session = computed(() => this.sessionState());
  readonly roles = computed(() => this.sessionState()?.roles ?? []);
  readonly isAuthenticated = computed(() => this.sessionState() !== null);
  readonly availableProfiles = environment.mockProfiles.map((profile) => ({
    ...profile,
    roles: profile.roles as AppRole[]
  })) satisfies PortalSession[];

  login(profile: PortalSession): void {
    this.sessionState.set(profile);
    localStorage.setItem(this.storageKey, JSON.stringify(profile));
  }

  logout(): void {
    this.sessionState.set(null);
    localStorage.removeItem(this.storageKey);
  }

  hasAnyRole(requiredRoles: AppRole[]): boolean {
    const currentRoles = this.roles();
    return requiredRoles.some((role) => currentRoles.includes(role));
  }

  getLandingRoute(): string {
    return this.hasAnyRole([AppRole.Admin]) ? '/workspace/admin' : '/workspace/my-workspace';
  }

  private readStoredSession(): PortalSession | null {
    const serialized = localStorage.getItem(this.storageKey);

    if (!serialized) {
      return null;
    }

    try {
      return JSON.parse(serialized) as PortalSession;
    } catch {
      localStorage.removeItem(this.storageKey);
      return null;
    }
  }
}