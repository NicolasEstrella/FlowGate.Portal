import { DestroyRef, Component, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';

import { PendingApproval } from '../../../core/models/portal-api.models';
import { WorkflowInstancesService } from '../../../core/services/workflow-instances.service';
import { EmptyStateComponent } from '../../../shared/ui/empty-state.component';
import { LoaderBlockComponent } from '../../../shared/ui/loader-block.component';

@Component({
  selector: 'fg-approver-inbox-page',
  standalone: true,
  imports: [RouterLink, EmptyStateComponent, LoaderBlockComponent],
  template: `
    <section class="page">
      <header class="page-header">
        <span class="portal-shell__eyebrow">Aprovações</span>
        <h1>Inbox de Aprovações</h1>
        <p class="muted">Solicitações aguardando sua decisão.</p>
      </header>

      <div class="page-actions">
        <button class="button-ghost" type="button" (click)="refresh()" [disabled]="loading()">
          ↺ Atualizar
        </button>
      </div>

      @if (loading()) {
        <fg-loader-block></fg-loader-block>
      } @else if (error()) {
        <fg-empty-state icon="!" [title]="error()!" description="Não foi possível carregar as aprovações pendentes."></fg-empty-state>
      } @else if (pendingApprovals().length === 0) {
        <fg-empty-state
          icon="✓"
          title="Nenhuma aprovação pendente"
          description="Você não tem itens aguardando sua decisão no momento.">
        </fg-empty-state>
      } @else {
        <div class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>Título</th>
                <th>Fluxo</th>
                <th>Solicitante</th>
                <th>Etapa</th>
                <th>Criado em</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              @for (item of pendingApprovals(); track item.instanceId) {
                <tr>
                  <td>{{ item.instanceTitle }}</td>
                  <td>{{ item.workflowName }}</td>
                  <td>{{ item.requesterName }}</td>
                  <td>{{ item.stepName }}</td>
                  <td>{{ formatDate(item.createdAtUtc) }}</td>
                  <td>
                    <a class="button-ghost" [routerLink]="['/workspace/requests', item.instanceId]">Revisar →</a>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </section>
  `
})
export class ApproverInboxPageComponent implements OnInit {
  private readonly instancesService = inject(WorkflowInstancesService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly pendingApprovals = signal<PendingApproval[]>([]);

  ngOnInit(): void {
    this.load();
  }

  protected refresh(): void {
    this.load();
  }

  protected formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('pt-BR');
  }

  private load(): void {
    this.loading.set(true);
    this.error.set(null);

    this.instancesService
      .getPending()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (items) => {
          this.pendingApprovals.set(items);
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set(err.message ?? 'Erro desconhecido');
          this.loading.set(false);
        }
      });
  }
}
