import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { AppRole, appRoleLabels } from '../core/models/app-role';
import { SessionService } from '../core/services/session.service';
import { StatusChipComponent } from '../shared/ui/status-chip.component';

interface NavigationItem {
  label: string;
  description: string;
  route: string;
  visibleFor: AppRole[];
}

@Component({
  selector: 'fg-app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, StatusChipComponent],
  template: `
    <div class="page-shell portal-shell">
      <aside class="portal-shell__sidebar">
        <div class="portal-shell__brand">
          <div class="portal-shell__brand-badge">FG</div>
          <div class="portal-shell__title">FlowGate Portal</div>
          <p class="portal-shell__subtitle">
            Operação central do FlowGate para solicitações, aprovações e visibilidade do ambiente.
          </p>
        </div>

        <nav class="portal-shell__nav">
          @for (item of navigation(); track item.route) {
            <a
              class="portal-shell__nav-item"
              routerLinkActive="portal-shell__nav-item--active"
              [routerLink]="item.route">
              <span class="portal-shell__nav-copy">
                <span class="portal-shell__nav-label">{{ item.label }}</span>
                <span class="portal-shell__nav-description">{{ item.description }}</span>
              </span>
              <span>↗</span>
            </a>
          }
        </nav>

        <section class="portal-shell__sidebar-footer">
          <fg-status-chip [label]="roleSummary()" tone="admin"></fg-status-chip>
          <div>
            <div class="portal-shell__nav-label">{{ displayName() }}</div>
            <div class="portal-shell__sidebar-meta">{{ email() }}</div>
          </div>
          <button class="button-ghost" type="button" (click)="logout()">Encerrar sessão</button>
        </section>
      </aside>

      <section class="portal-shell__main">
        <header class="portal-shell__topbar">
          <div class="portal-shell__headline">
            <span class="portal-shell__eyebrow">Portal Foundation</span>
            <h1>Base pronta para fluxos operacionais</h1>
            <p class="muted">Rotas protegidas, dashboards iniciais e integração HTTP centralizada.</p>
          </div>

          <div class="portal-shell__topbar-actions">
            <span class="badge">API local preparada</span>
            <span class="badge">Sessão simulada por ambiente</span>
          </div>
        </header>

        <main class="portal-shell__content">
          <router-outlet></router-outlet>
        </main>
      </section>
    </div>
  `
})
export class AppShellComponent {
  private readonly sessionService = inject(SessionService);

  protected readonly navigation = computed(() => {
    const items: NavigationItem[] = [
      {
        label: 'Painel Admin',
        description: 'Visão consolidada de usuários, workflows e saúde da API.',
        route: '/workspace/admin',
        visibleFor: [AppRole.Admin]
      },
      {
        label: 'Meu Espaço',
        description: 'Entrada inicial para solicitantes e perfis operacionais.',
        route: '/workspace/my-workspace',
        visibleFor: [AppRole.StandardUser, AppRole.Admin, AppRole.Approver, AppRole.Finance, AppRole.Legal]
      }
    ];

    return items.filter((item) => this.sessionService.hasAnyRole(item.visibleFor));
  });

  protected readonly displayName = computed(() => this.sessionService.session()?.displayName ?? 'Convidado');
  protected readonly email = computed(() => this.sessionService.session()?.email ?? '');
  protected readonly roleSummary = computed(() => this.sessionService.roles()
    .map((role) => appRoleLabels[role])
    .join(' • '));

  protected logout(): void {
    this.sessionService.logout();
    location.assign('/login');
  }
}