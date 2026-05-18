import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'fg-confirm-modal',
  standalone: true,
  imports: [FormsModule],
  template: `
    @if (open) {
      <div class="modal-backdrop" (click)="onBackdropClick($event)">
        <div class="modal" role="dialog" [attr.aria-label]="title">
          <header class="modal__header">
            <h2 class="modal__title">{{ title }}</h2>
          </header>

          <div class="modal__body">
            @if (message) {
              <p class="modal__message">{{ message }}</p>
            }

            @if (showComment) {
              <div class="form-field">
                <label class="form-label" for="modal-comment">
                  Comentário{{ commentRequired ? ' *' : '' }}
                </label>
                <textarea
                  id="modal-comment"
                  class="form-textarea"
                  [(ngModel)]="comment"
                  [placeholder]="commentRequired ? 'Obrigatório' : 'Opcional'"
                  rows="3">
                </textarea>
                @if (commentRequired && submitted && !comment.trim()) {
                  <span class="form-error">O comentário é obrigatório.</span>
                }
              </div>
            }
          </div>

          <footer class="modal__footer">
            <button class="button-ghost" type="button" (click)="onCancel()">Cancelar</button>
            <button class="button-primary" type="button" (click)="onConfirm()">{{ confirmLabel }}</button>
          </footer>
        </div>
      </div>
    }
  `
})
export class ConfirmModalComponent implements OnChanges {
  @Input({ required: true }) open = false;
  @Input({ required: true }) title = '';
  @Input() message = '';
  @Input() confirmLabel = 'Confirmar';
  @Input() showComment = false;
  @Input() commentRequired = false;

  @Output() confirmed = new EventEmitter<string | undefined>();
  @Output() cancelled = new EventEmitter<void>();

  protected comment = '';
  protected submitted = false;

  ngOnChanges(): void {
    if (!this.open) {
      this.comment = '';
      this.submitted = false;
    }
  }

  protected onConfirm(): void {
    this.submitted = true;

    if (this.commentRequired && !this.comment.trim()) {
      return;
    }

    this.confirmed.emit(this.showComment ? this.comment.trim() || undefined : undefined);
  }

  protected onCancel(): void {
    this.cancelled.emit();
  }

  protected onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.onCancel();
    }
  }
}
