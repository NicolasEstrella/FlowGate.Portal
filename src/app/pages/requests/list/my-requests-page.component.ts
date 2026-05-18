import { DestroyRef, Component, computed, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';

import { WorkflowInstanceSummary } from '../../../core/models/portal-api.models';
import { SessionService } from '../../../core/services/session.service';
import { WorkflowInstancesService } from '../../../core/services/workflow-instances.service';
import { EmptyStateComponent } from '../../../shared/ui/empty-state.component';
import { LoaderBlockComponent } from '../../../shared/ui/loader-block.component';
import { StatusBadgeComponent } from '../../../shared/status-badge/status-badge.component';

const STATUS_OPTIONS = ['Todos', 'Draft', 'Submitted', 'InApproval', 'Approved', 'Rejected', 'AdjustmentsRequested', 'Cancelled'];

@Component({
  selector: 'fg-my-requests-page',
  standalone: true,
  imports: [RouterLink, EmptyStateComponent, LoaderBlockComponent, StatusBadgeComponent],
  template: `
    <section class="page">
      <header class="page-header">
        <span class="portal-shell__eyebrow">Minhas Solicitações</span>
        <h1>Minhas Solicitações</h1>
        <p class="muted">Acompanhe o status de todas as suas solicitações de aprovação.</p>
      </header>

      <div class="page-actions">
        <a class="button-primary" routerLink="/workspace/requests/new">+ Nova Solicitação</a>
      </div>

      @if (loading()) {
        <fg-loader-block></fg-loader-block>
      } @else if (error()) {
        <fg-empty-state icon="!" [title]="error()!" description="Não foi possível carregar suas solicitações."></fg-empty-state>
      } @else {
        <div class="filter-strip">
          @for (status of statusOptions; track status) {
            <button
              class="filter-chip"
              [class.filter-chip--active]="selectedStatus() === status"
              type="button"
              (click)="selectStatus(status)">
              {{ status === 'Todos' ? 'Todos' : status }}
            </button>
          }
        </div>

        @if (filteredInstances().length === 0) {
          <fg-empty-state
            icon="◌"
            title="Nenhuma solicitação encontrada"
            description="Você ainda não tem solicitações com o status selecionado.">
            <a class="button-primary" routerLink="/workspace/requests/new">Criar Solicitação</a>
          </fg-empty-state>
        } @else {
          <div class="table-wrap">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Título</th>
                  <th>Fluxo</th>
                  <th>Status</th>
                  <th>Criado em</th>
                </tr>
              </thead>
              <tbody>
                @for (instance of filteredInstances(); track instance.id) {
                  <tr class="table-row--clickable" (click)="openDetail(instance.id)">
                    <td>{{ instance.title }}</td>
                    <td>{{ instance.workflowName }}</td>
                    <td><fg-status-badge [status]="instance.currentStatus"></fg-status-badge></td>
                    <td>{{ formatDate(instance.createdAtUtc) }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      }
    </section>
  `
})
export class MyRequestsPageComponent implements OnInit {
  private readonly instancesService = inject(WorkflowInstancesService);
  private readonly sessionService = inject(SessionService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly statusOptions = STATUS_OPTIONS;
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly allInstances = signal<WorkflowInstanceSummary[]>([]);
  protected readonly selectedStatus = signal<string>('Todos');

  protected readonly filteredInstances = computed(() => {
    const session = this.sessionService.session();
    const all = this.allInstances();
    const status = this.selectedStatus();

    const myInstances = session
      ? all.filter((i) => i.requesterId === session.id)
      : all;

    return status === 'Todos' ? myInstances : myInstances.filter((i) => i.currentStatus === status);
  });

  ngOnInit(): void {
    this.load();
  }

  protected selectStatus(status: string): void {
    this.selectedStatus.set(status);
  }

  protected openDetail(id: string): void {
    this.router.navigate(['/workspace/requests', id]);
  }

  protected formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('pt-BR');
  }

  private load(): void {
    this.loading.set(true);
    this.error.set(null);

    this.instancesService
      .getAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (instances) => {
          this.allInstances.set(instances);
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set(err.message ?? 'Erro desconhecido');
          this.loading.set(false);
        }
      });
  }
}
