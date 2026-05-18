import { Component, Input, computed, signal } from '@angular/core';

const STATUS_TONE_MAP: Record<string, string> = {
  // WorkflowInstance statuses
  Draft: 'neutral',
  Submitted: 'info',
  InApproval: 'warning',
  Approved: 'healthy',
  Rejected: 'error',
  AdjustmentsRequested: 'warning',
  Cancelled: 'neutral',
  // ApprovalStep statuses
  Pending: 'neutral',
  InProgress: 'warning',
  // shared
  Completed: 'healthy'
};

const STATUS_LABEL_MAP: Record<string, string> = {
  Draft: 'Rascunho',
  Submitted: 'Submetido',
  InApproval: 'Em aprovação',
  Approved: 'Aprovado',
  Rejected: 'Rejeitado',
  AdjustmentsRequested: 'Ajustes solicitados',
  Cancelled: 'Cancelado',
  Pending: 'Pendente',
  InProgress: 'Em andamento',
  Completed: 'Concluído'
};

@Component({
  selector: 'fg-status-badge',
  standalone: true,
  template: `<span [class]="cssClass">{{ displayLabel }}</span>`
})
export class StatusBadgeComponent {
  @Input({ required: true }) status = '';
  @Input() customLabel: string | null = null;

  get tone(): string {
    return STATUS_TONE_MAP[this.status] ?? 'neutral';
  }

  get displayLabel(): string {
    return this.customLabel ?? STATUS_LABEL_MAP[this.status] ?? this.status;
  }

  get cssClass(): string {
    return `status-chip status-chip--${this.tone}`;
  }
}
