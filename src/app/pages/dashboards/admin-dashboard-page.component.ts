import { DestroyRef, Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { HealthStatus, PortalUser, WorkflowSummary } from '../../core/models/portal-api.models';
import { PortalApiService } from '../../core/services/portal-api.service';
import { DataTableColumn, DataTableComponent } from '../../shared/ui/data-table.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state.component';
import { LoaderBlockComponent } from '../../shared/ui/loader-block.component';
import { StatusChipComponent } from '../../shared/ui/status-chip.component';
import { UiCardComponent } from '../../shared/ui/ui-card.component';

interface AdminDashboardState {
  loading: boolean;
  error: string | null;
  health: HealthStatus | null;
  users: PortalUser[];
  workflows: WorkflowSummary[];
}

@Component({
  selector: 'fg-admin-dashboard-page',
  standalone: true,
  imports: [UiCardComponent, StatusChipComponent, LoaderBlockComponent, EmptyStateComponent, DataTableComponent],
  template: `
    <section class="page">
      <header class="page-header">
        <span class="portal-shell__eyebrow">Painel Admin</span>
        <h1>Visão consolidada da fundação</h1>
        <p>
          Este dashboard confirma que a casca do portal já fala com a API base, respeita RBAC e mostra componentes reutilizáveis.
        </p>
      </header>

      @if (state().loading) {
        <fg-loader-block></fg-loader-block>
      } @else if (state().error) {
        <fg-empty-state icon="!" title="Não foi possível carregar a visão administrativa" [description]="state().error ?? ''"></fg-empty-state>
      } @else {
        <section class="summary-grid">
          <fg-ui-card title="Saúde da API" eyebrow="Observabilidade inicial">
            <div class="metric">
              <div class="utility-row">
                <div class="metric__value">{{ state().health?.status ?? '—' }}</div>
                <fg-status-chip [label]="state().health?.databaseReady ? 'Banco pronto' : 'Banco indisponível'" [tone]="state().health?.databaseReady ? 'healthy' : 'danger'"></fg-status-chip>
              </div>
              <div class="metric__caption">Ambiente: {{ state().health?.environment ?? 'desconhecido' }}</div>
            </div>
          </fg-ui-card>

          <fg-ui-card title="Usuários visíveis" eyebrow="RBAC seedado">
            <div class="metric">
              <div class="metric__value">{{ state().users.length }}</div>
              <div class="metric__caption">Registros retornados pelo endpoint protegido de usuários.</div>
            </div>
          </fg-ui-card>

          <fg-ui-card title="Workflows disponíveis" eyebrow="Catálogo inicial">
            <div class="metric">
              <div class="metric__value">{{ state().workflows.length }}</div>
              <div class="metric__caption">Modelos prontos para as próximas fases operacionais.</div>
            </div>
          </fg-ui-card>
        </section>

        <section class="card-grid">
          <fg-ui-card title="Usuários e papéis" eyebrow="Acesso">
            @if (userRows().length) {
              <fg-data-table [columns]="userColumns" [rows]="userRows()"></fg-data-table>
            } @else {
              <fg-empty-state icon="◌" title="Nenhum usuário retornado" description="A fundação já prevê a tabela compartilhada para estados sem dados."></fg-empty-state>
            }
          </fg-ui-card>

          <fg-ui-card title="Catálogo de workflows" eyebrow="Operação">
            @if (workflowRows().length) {
              <fg-data-table [columns]="workflowColumns" [rows]="workflowRows()"></fg-data-table>
            } @else {
              <fg-empty-state icon="◌" title="Nenhum workflow retornado" description="Os componentes base já suportam listas vazias sem customização local."></fg-empty-state>
            }
          </fg-ui-card>
        </section>
      }
    </section>
  `
})
export class AdminDashboardPageComponent {
  private readonly api = inject(PortalApiService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly state = signal<AdminDashboardState>({
    loading: true,
    error: null,
    health: null,
    users: [],
    workflows: []
  });

  protected readonly userColumns: DataTableColumn[] = [
    { key: 'displayName', label: 'Usuário' },
    { key: 'email', label: 'Email' },
    { key: 'roles', label: 'Papéis' }
  ];

  protected readonly workflowColumns: DataTableColumn[] = [
    { key: 'name', label: 'Workflow' },
    { key: 'key', label: 'Chave' },
    { key: 'version', label: 'Versão', align: 'right' }
  ];

  protected readonly userRows = computed(() => this.state().users.map((user) => ({
    displayName: user.displayName,
    email: user.email,
    roles: user.roles.join(', ')
  })));

  protected readonly workflowRows = computed(() => this.state().workflows.map((workflow) => ({
    name: workflow.name,
    key: workflow.key,
    version: workflow.version
  })));

  constructor() {
    forkJoin({
      health: this.api.getHealth(),
      users: this.api.getUsers(),
      workflows: this.api.getWorkflows()
    })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError((error: Error) => {
          this.state.set({
            loading: false,
            error: error.message,
            health: null,
            users: [],
            workflows: []
          });

          return of(null);
        })
      )
      .subscribe((result) => {
        if (!result) {
          return;
        }

        this.state.set({
          loading: false,
          error: null,
          health: result.health,
          users: result.users,
          workflows: result.workflows
        });
      });
  }
}