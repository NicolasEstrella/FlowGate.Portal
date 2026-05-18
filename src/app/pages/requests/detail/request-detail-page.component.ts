import { DestroyRef, Component, computed, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { ApprovalStepDetail, WorkflowInstanceDetail } from '../../../core/models/portal-api.models';
import { AppRole } from '../../../core/models/app-role';
import { SessionService } from '../../../core/services/session.service';
import { WorkflowInstancesService } from '../../../core/services/workflow-instances.service';
import { ToastService } from '../../../core/services/toast.service';
import { EmptyStateComponent } from '../../../shared/ui/empty-state.component';
import { LoaderBlockComponent } from '../../../shared/ui/loader-block.component';
import { StatusBadgeComponent } from '../../../shared/status-badge/status-badge.component';
import { ConfirmModalComponent } from '../../../shared/confirm-modal/confirm-modal.component';
import { ElapsedTimePipe } from '../../../shared/elapsed-time/elapsed-time.pipe';

type DecisionType = 'Approve' | 'Reject' | 'RequestAdjustment';

interface ModalConfig {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  showComment: boolean;
  commentRequired: boolean;
  decision: DecisionType | 'cancel' | null;
  stepId: string | null;
}

const APPROVER_ROLES: string[] = [AppRole.Approver, AppRole.Finance, AppRole.Legal];

@Component({
  selector: 'fg-request-detail-page',
  standalone: true,
  imports: [RouterLink, EmptyStateComponent, LoaderBlockComponent, StatusBadgeComponent, ConfirmModalComponent, ElapsedTimePipe],
  template: `
    <section class="page">
      @if (loading()) {
        <fg-loader-block></fg-loader-block>
      } @else if (notFound()) {
        <fg-empty-state icon="404" title="Solicitação não encontrada" description="A solicitação que você procura não existe ou foi removida.">
          <a class="button-ghost" routerLink="/workspace/requests">← Voltar</a>
        </fg-empty-state>
      } @else if (instance()) {
        <header class="page-header">
          <div class="utility-row">
            <a class="button-ghost" routerLink="/workspace/requests">← Voltar</a>
          </div>
          <span class="portal-shell__eyebrow">{{ instance()!.workflowName }}</span>
          <div class="utility-row">
            <h1>{{ instance()!.title }}</h1>
            <fg-status-badge [status]="instance()!.currentStatus"></fg-status-badge>
          </div>
          <p class="muted">
            Solicitante: <strong>{{ instance()!.requesterName }}</strong>
            &nbsp;·&nbsp;
            Aberta {{ instance()!.createdAtUtc | elapsedTime }}
          </p>
        </header>

        <!-- Action buttons -->
        <div class="action-strip">
          @if (canSubmit()) {
            <button class="button-primary" type="button" (click)="onSubmit()" [disabled]="acting()">
              Enviar para Aprovação
            </button>
          }

          @if (activeStep()) {
            @if (canApprove()) {
              <button class="button-primary" type="button" (click)="openModal('Approve')">Aprovar</button>
            }
            @if (canDecide()) {
              <button class="button-warning" type="button" (click)="openModal('RequestAdjustment')">Solicitar Ajustes</button>
              <button class="button-danger" type="button" (click)="openModal('Reject')">Rejeitar</button>
            }
          }

          @if (canCancel()) {
            <button class="button-ghost" type="button" (click)="openCancelModal()">Cancelar Solicitação</button>
          }
        </div>

        <!-- Step timeline -->
        <section class="detail-section">
          <h2 class="section-title">Etapas de aprovação</h2>
          <div class="step-timeline">
            @for (group of stepGroups(); track $index) {
              <div class="step-group" [class.step-group--parallel]="group.length > 1">
                @for (step of group; track step.id) {
                  <div class="step-card" [class.step-card--active]="step.status === 'InProgress'">
                    <div class="step-card__header">
                      <span class="step-card__name">{{ step.name }}</span>
                      <fg-status-badge [status]="step.status"></fg-status-badge>
                    </div>
                    <div class="step-card__meta">
                      <span class="muted">Papel: {{ step.requiredRole }}</span>
                      @if (step.assignedUserName) {
                        <span class="muted">· {{ step.assignedUserName }}</span>
                      }
                    </div>
                    @if (step.comment) {
                      <div class="step-card__comment">"{{ step.comment }}"</div>
                    }
                    @if (step.decidedAtUtc) {
                      <div class="muted step-card__date">{{ step.decidedAtUtc | elapsedTime }}</div>
                    }
                  </div>
                }
              </div>
            }
          </div>
        </section>

        <!-- Form data -->
        @if (formDataEntries().length > 0) {
          <section class="detail-section">
            <h2 class="section-title">Dados da solicitação</h2>
            <dl class="form-data-list">
              @for (entry of formDataEntries(); track entry.key) {
                <div class="form-data-item">
                  <dt class="form-data-key">{{ entry.key }}</dt>
                  <dd class="form-data-value">{{ entry.value }}</dd>
                </div>
              }
            </dl>
          </section>
        }

        <!-- Audit log -->
        @if (instance()!.auditLog.length > 0) {
          <section class="detail-section">
            <h2 class="section-title">Histórico</h2>
            <ul class="audit-log">
              @for (entry of instance()!.auditLog; track entry.id) {
                <li class="audit-entry">
                  <span class="audit-entry__action">{{ entry.action }}</span>
                  <span class="muted">por {{ entry.performedByName }}</span>
                  <span class="muted">· {{ entry.performedAtUtc | elapsedTime }}</span>
                  @if (entry.comment) {
                    <span class="audit-entry__comment">"{{ entry.comment }}"</span>
                  }
                </li>
              }
            </ul>
          </section>
        }
      }
    </section>

    <fg-confirm-modal
      [open]="modal().open"
      [title]="modal().title"
      [message]="modal().message"
      [confirmLabel]="modal().confirmLabel"
      [showComment]="modal().showComment"
      [commentRequired]="modal().commentRequired"
      (confirmed)="onModalConfirm($event)"
      (cancelled)="closeModal()">
    </fg-confirm-modal>
  `
})
export class RequestDetailPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly instancesService = inject(WorkflowInstancesService);
  private readonly sessionService = inject(SessionService);
  private readonly toastService = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly loading = signal(true);
  protected readonly notFound = signal(false);
  protected readonly acting = signal(false);
  protected readonly instance = signal<WorkflowInstanceDetail | null>(null);

  protected readonly modal = signal<ModalConfig>({
    open: false,
    title: '',
    message: '',
    confirmLabel: 'Confirmar',
    showComment: false,
    commentRequired: false,
    decision: null,
    stepId: null
  });

  protected readonly stepGroups = computed(() => {
    const inst = this.instance();
    if (!inst) return [];

    const sorted = [...inst.steps].sort((a, b) => a.stepIndex - b.stepIndex);
    const groups: ApprovalStepDetail[][] = [];
    const seen = new Set<number>();

    sorted.forEach((step) => {
      if (seen.has(step.stepIndex)) return;
      seen.add(step.stepIndex);

      const group = sorted.filter((s) => s.stepIndex === step.stepIndex);
      groups.push(group);
    });

    return groups;
  });

  protected readonly activeStep = computed(() => {
    return this.instance()?.steps.find((s) => s.status === 'InProgress') ?? null;
  });

  protected readonly formDataEntries = computed(() => {
    const fd = this.instance()?.formData ?? {};
    return Object.entries(fd).map(([key, value]) => ({ key, value }));
  });

  protected readonly isRequester = computed(() => {
    const session = this.sessionService.session();
    const inst = this.instance();
    if (!session || !inst) return false;
    return inst.requesterId === session.id || inst.requesterName === session.displayName;
  });

  protected readonly canSubmit = computed(() => {
    const inst = this.instance();
    if (!inst) return false;
    return this.isRequester() && (inst.currentStatus === 'Draft' || inst.currentStatus === 'AdjustmentsRequested');
  });

  protected readonly canCancel = computed(() => {
    const inst = this.instance();
    if (!inst) return false;
    const cancelableStatuses = ['Draft', 'Submitted', 'AdjustmentsRequested'];
    return this.isRequester() && cancelableStatuses.includes(inst.currentStatus);
  });

  protected readonly canDecide = computed(() => {
    const step = this.activeStep();
    if (!step) return false;
    return this.sessionService.hasAnyRole(APPROVER_ROLES as AppRole[]) &&
      this.sessionService.roles().includes(step.requiredRole as AppRole);
  });

  protected readonly canApprove = computed(() => this.canDecide());

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    this.loadInstance(id);
  }

  protected onSubmit(): void {
    const id = this.instance()?.id;
    if (!id) return;

    this.acting.set(true);
    this.instancesService
      .submit(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.acting.set(false);
          this.toastService.success('Solicitação enviada para aprovação.');
          this.loadInstance(id);
        },
        error: () => this.acting.set(false)
      });
  }

  protected openModal(decision: DecisionType): void {
    const step = this.activeStep();
    if (!step) return;

    const configs: Record<DecisionType, Partial<ModalConfig>> = {
      Approve: {
        title: 'Aprovar solicitação',
        message: 'Confirme a aprovação desta etapa.',
        confirmLabel: 'Aprovar',
        showComment: true,
        commentRequired: false
      },
      Reject: {
        title: 'Rejeitar solicitação',
        message: 'Um comentário explicando a rejeição é obrigatório.',
        confirmLabel: 'Rejeitar',
        showComment: true,
        commentRequired: true
      },
      RequestAdjustment: {
        title: 'Solicitar ajustes',
        message: 'Descreva quais ajustes são necessários.',
        confirmLabel: 'Solicitar Ajustes',
        showComment: true,
        commentRequired: true
      }
    };

    this.modal.set({
      open: true,
      decision,
      stepId: step.id,
      ...configs[decision]
    } as ModalConfig);
  }

  protected openCancelModal(): void {
    this.modal.set({
      open: true,
      title: 'Cancelar solicitação',
      message: 'Tem certeza que deseja cancelar esta solicitação? Esta ação não pode ser desfeita.',
      confirmLabel: 'Cancelar Solicitação',
      showComment: false,
      commentRequired: false,
      decision: 'cancel',
      stepId: null
    });
  }

  protected closeModal(): void {
    this.modal.update((m) => ({ ...m, open: false }));
  }

  protected onModalConfirm(comment: string | undefined): void {
    const { decision, stepId } = this.modal();
    const id = this.instance()?.id;
    if (!id) return;

    this.closeModal();
    this.acting.set(true);

    if (decision === 'cancel') {
      this.instancesService
        .cancel(id)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.acting.set(false);
            this.toastService.success('Solicitação cancelada.');
            this.loadInstance(id);
          },
          error: () => this.acting.set(false)
        });
    } else if (decision && stepId) {
      this.instancesService
        .decide(id, { stepId, decision, comment })
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.acting.set(false);
            this.toastService.success('Decisão registrada com sucesso.');
            this.loadInstance(id);
          },
          error: () => this.acting.set(false)
        });
    }
  }

  private loadInstance(id: string): void {
    this.loading.set(true);
    this.instancesService
      .getById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (inst) => {
          this.instance.set(inst);
          this.loading.set(false);
        },
        error: (err) => {
          if (err.status === 404) {
            this.notFound.set(true);
          }
          this.loading.set(false);
        }
      });
  }
}
