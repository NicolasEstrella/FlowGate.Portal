import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { appRoleLabels, AppRole } from '../../core/models/app-role';
import { PortalSession } from '../../core/models/portal-session';
import { SessionService } from '../../core/services/session.service';
import { StatusChipComponent } from '../../shared/ui/status-chip.component';

@Component({
  selector: 'fg-login-page',
  standalone: true,
  imports: [StatusChipComponent],
  template: `
    <div class="login-page">
      <section class="login-page__layout">
        <article class="hero-card">
          <div class="hero-card__body login-page__hero">
            <span class="portal-shell__eyebrow">FlowGate Portal</span>
            <h1>Portal corporativo com base pronta para aprovações e operação.</h1>
            <p>
              Esta fundação entrega shell autenticado, dashboards iniciais, guards e integração centralizada com a API.
            </p>

            <div class="summary-grid">
              <div class="ui-card metric">
                <span class="ui-card__eyebrow">Shell</span>
                <div class="metric__value">2</div>
                <div class="metric__caption">Entradas iniciais por papel</div>
              </div>
              <div class="ui-card metric">
                <span class="ui-card__eyebrow">HTTP</span>
                <div class="metric__value">/api</div>
                <div class="metric__caption">Base única via proxy local</div>
              </div>
              <div class="ui-card metric">
                <span class="ui-card__eyebrow">RBAC</span>
                <div class="metric__value">5</div>
                <div class="metric__caption">Papéis compatíveis com o backend</div>
              </div>
            </div>
          </div>

          <div class="hero-card__visual"></div>
        </article>

        <aside class="login-page__panel">
          <div>
            <span class="portal-shell__eyebrow">Sessão simulada</span>
            <h2>Escolha um perfil para entrar</h2>
            <p class="muted">O contrato de sessão fica isolado para ser substituído por autenticação real depois.</p>
          </div>

          <div class="login-page__profiles">
            @for (profile of profiles(); track profile.id) {
              <section class="profile-option">
                <div>
                  <h3>{{ profile.displayName }}</h3>
                  <p class="muted">{{ profile.email }}</p>
                </div>

                <div class="profile-option__roles">
                  @for (role of profile.roles; track role) {
                    <fg-status-chip [label]="roleLabel(role)" [tone]="toneForRole(role)"></fg-status-chip>
                  }
                </div>

                <button class="button" type="button" (click)="login(profile)">Entrar com este perfil</button>
              </section>
            }
          </div>
        </aside>
      </section>
    </div>
  `
})
export class LoginPageComponent {
  private readonly sessionService = inject(SessionService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly profiles = computed(() => this.sessionService.availableProfiles);

  protected login(profile: PortalSession): void {
    this.sessionService.login(profile);
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || this.sessionService.getLandingRoute();
    void this.router.navigateByUrl(returnUrl);
  }

  protected roleLabel(role: PortalSession['roles'][number]): string {
    return appRoleLabels[role];
  }

  protected toneForRole(role: PortalSession['roles'][number]): string {
    return role === AppRole.StandardUser ? 'standard-user' : role.toLowerCase();
  }
}