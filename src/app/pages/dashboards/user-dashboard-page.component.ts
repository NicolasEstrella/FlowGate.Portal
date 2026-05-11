import { DestroyRef, Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { HealthStatus, WorkflowInstanceSummary, WorkflowSummary } from '../../core/models/portal-api.models';
import { AppRole } from '../../core/models/app-role';
import { PortalApiService } from '../../core/services/portal-api.service';
import { SessionService } from '../../core/services/session.service';
import { DataTableColumn, DataTableComponent } from '../../shared/ui/data-table.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state.component';
import { LoaderBlockComponent } from '../../shared/ui/loader-block.component';
import { StatusChipComponent } from '../../shared/ui/status-chip.component';
import { UiCardComponent } from '../../shared/ui/ui-card.component';

interface UserDashboardState {
  loading: boolean;
  error: string | null;
  health: HealthStatus | null;
  workflows: WorkflowSummary[];
  workflowInstances: WorkflowInstanceSummary[];
}

@Component({
  selector: 'fg-user-dashboard-page',
  standalone: true,
  imports: [UiCardComponent, StatusChipComponent, LoaderBlockComponent, EmptyStateComponent, DataTableComponent],
  template: `
    <section class="page">
      <header class="page-header">
        <span class="portal-shell__eyebrow">Meu Espaço</span>
        <h1>{{ greeting() }}, {{ profileName() }}</h1>
        <p>
          A fundação do portal já entrega uma entrada inicial para acompanhamento de solicitações, catálogo e estados vazios reutilizáveis.
        </p>
      </header>

      @if (state().loading) {
        <fg-loader-block></fg-loader-block>
      } @else if (state().error) {
        <fg-empty-state icon="!" title="Não foi possível carregar seu espaço" [description]="state().error ?? ''"></fg-empty-state>
      } @else {
        <section class="summary-grid">
          <fg-ui-card title="Saúde da integração" eyebrow="Conectividade">
            <div class="metric">
              <div class="utility-row">
                <div class="metric__value">{{ state().health?.status ?? '—' }}</div>
                <fg-status-chip [label]="state().health?.databaseReady ? 'Pronto para consumir' : 'Aguardando API'" [tone]="state().health?.databaseReady ? 'healthy' : 'warning'"></fg-status-chip>
              </div>
              <div class="metric__caption">Base URL única e interceptores ativos.</div>
            </div>
          </fg-ui-card>

          <fg-ui-card title="Catálogo disponível" eyebrow="Solicitações">
            <div class="metric">
              <div class="metric__value">{{ state().workflows.length }}</div>
              <div class="metric__caption">Workflows já descobertos para as próximas telas operacionais.</div>
            </div>
          </fg-ui-card>

          <fg-ui-card title="Pendências atuais" eyebrow="Inbox">
            <div class="metric">
              <div class="metric__value">{{ state().workflowInstances.length }}</div>
              <div class="metric__caption">Instâncias retornadas para o perfil atual.</div>
            </div>
          </fg-ui-card>
        </section>

        <section class="card-grid">
          <fg-ui-card title="Workflows prontos para consumo" eyebrow="Catálogo">
            @if (workflowRows().length) {
              <fg-data-table [columns]="workflowColumns" [rows]="workflowRows()"></fg-data-table>
            } @else {
              <fg-empty-state icon="◌" title="Nenhum catálogo retornado" description="A base suporta estados vazios coerentes antes das telas finais de operação."></fg-empty-state>
            }
          </fg-ui-card>

          <fg-ui-card title="Minha fila inicial" eyebrow="Timeline futura">
            @if (instanceRows().length) {
              <fg-data-table [columns]="instanceColumns" [rows]="instanceRows()"></fg-data-table>
            } @else {
              <fg-empty-state icon="→" title="Sem solicitações em andamento" description="Quando a engine entrar, esta área recebe timeline, inbox e ações do usuário."></fg-empty-state>
            }
          </fg-ui-card>
        </section>
      }
    </section>
  `
})
export class UserDashboardPageComponent {
  private readonly api = inject(PortalApiService);
  private readonly sessionService = inject(SessionService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly state = signal<UserDashboardState>({
    loading: true,
    error: null,
    health: null,
    workflows: [],
    workflowInstances: []
  });

  protected readonly profileName = computed(() => this.sessionService.session()?.displayName ?? 'Operador');
  protected readonly greeting = computed(() => this.sessionService.hasAnyRole([AppRole.Admin]) ? 'Bem-vindo de volta' : 'Olá');

  protected readonly workflowColumns: DataTableColumn[] = [
    { key: 'name', label: 'Workflow' },
    { key: 'key', label: 'Chave' }
  ];

  protected readonly instanceColumns: DataTableColumn[] = [
    { key: 'title', label: 'Solicitação' },
    { key: 'status', label: 'Status' },
    { key: 'workflowName', label: 'Workflow' }
  ];

  protected readonly workflowRows = computed(() => this.state().workflows.map((workflow) => ({
    name: workflow.name,
    key: workflow.key
  })));

  protected readonly instanceRows = computed(() => this.state().workflowInstances.map((instance) => ({
    title: instance.title,
    status: instance.currentStatus,
    workflowName: instance.workflowName
  })));

  constructor() {
    forkJoin({
      health: this.api.getHealth(),
      workflows: this.api.getWorkflows(),
      workflowInstances: this.api.getWorkflowInstances()
    })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError((error: Error) => {
          this.state.set({
            loading: false,
            error: error.message,
            health: null,
            workflows: [],
            workflowInstances: []
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
          workflows: result.workflows,
          workflowInstances: result.workflowInstances
        });
      });
  }
}