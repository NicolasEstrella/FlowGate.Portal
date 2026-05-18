import { Component, inject } from '@angular/core';

import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'fg-toast-host',
  standalone: true,
  template: `
    <div class="toast-host" aria-live="polite">
      @for (toast of toastService.toasts(); track toast.id) {
        <div class="toast toast--{{ toast.type }}">
          <span class="toast__message">{{ toast.message }}</span>
          <button class="toast__close" type="button" (click)="toastService.dismiss(toast.id)" aria-label="Fechar">✕</button>
        </div>
      }
    </div>
  `
})
export class ToastHostComponent {
  protected readonly toastService = inject(ToastService);
}
