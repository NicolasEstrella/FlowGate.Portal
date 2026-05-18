import { DestroyRef, Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { WorkflowInstancesService } from '../../../core/services/workflow-instances.service';

@Component({
  selector: 'fg-request-new-page',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <section class="page">
      <header class="page-header">
        <span class="portal-shell__eyebrow">Nova Solicitação</span>
        <h1>Criar Solicitação</h1>
        <p class="muted">Preencha os campos abaixo para iniciar um novo fluxo de aprovação.</p>
      </header>

      <form class="form-block" [formGroup]="form" (ngSubmit)="onSubmit()">
        <div class="form-field">
          <label class="form-label" for="workflowKey">Tipo de fluxo *</label>
          <input
            id="workflowKey"
            type="text"
            class="form-input"
            formControlName="workflowKey"
            placeholder="Ex: purchase-request" />
          @if (isInvalid('workflowKey')) {
            <span class="form-error">O tipo de fluxo é obrigatório.</span>
          }
        </div>

        <div class="form-field">
          <label class="form-label" for="title">Título *</label>
          <input
            id="title"
            type="text"
            class="form-input"
            formControlName="title"
            placeholder="Descreva brevemente a solicitação" />
          @if (isInvalid('title')) {
            <span class="form-error">O título é obrigatório.</span>
          }
        </div>

        <div class="form-field">
          <div class="utility-row">
            <label class="form-label">Dados adicionais</label>
            <button class="button-ghost" type="button" (click)="addField()">+ Campo</button>
          </div>

          @for (field of fields.controls; track $index) {
            <div class="form-field-pair" [formGroup]="asGroup(field)">
              <input type="text" class="form-input" formControlName="key" placeholder="Chave" />
              <input type="text" class="form-input" formControlName="value" placeholder="Valor" />
              <button class="button-ghost" type="button" (click)="removeField($index)">✕</button>
            </div>
          }
        </div>

        <div class="form-actions">
          <button class="button-ghost" type="button" (click)="cancel()">Cancelar</button>
          <button class="button-primary" type="submit" [disabled]="submitting()">
            {{ submitting() ? 'Criando...' : 'Criar Solicitação' }}
          </button>
        </div>
      </form>
    </section>
  `
})
export class RequestNewPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly instancesService = inject(WorkflowInstancesService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly submitting = signal(false);
  protected readonly submitted = signal(false);

  protected readonly form = this.fb.group({
    workflowKey: ['', [Validators.required, Validators.minLength(1)]],
    title: ['', [Validators.required, Validators.minLength(1)]],
    fields: this.fb.array([])
  });

  protected get fields(): FormArray {
    return this.form.get('fields') as FormArray;
  }

  protected asGroup(control: AbstractControl): FormGroup {
    return control as FormGroup;
  }

  protected addField(): void {
    this.fields.push(this.fb.group({ key: [''], value: [''] }));
  }

  protected removeField(index: number): void {
    this.fields.removeAt(index);
  }

  protected isInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!(control && control.invalid && (control.touched || this.submitted()));
  }

  protected onSubmit(): void {
    this.submitted.set(true);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const formData: Record<string, string> = {};
    this.fields.controls.forEach((ctrl) => {
      const group = ctrl as FormGroup;
      const key = (group.get('key')?.value ?? '').trim();
      const value = (group.get('value')?.value ?? '').trim();
      if (key) {
        formData[key] = value;
      }
    });

    this.submitting.set(true);
    this.instancesService
      .createRequest({
        workflowKey: this.form.get('workflowKey')!.value!,
        title: this.form.get('title')!.value!,
        formData
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (instance) => {
          this.router.navigate(['/workspace/requests', instance.id]);
        },
        error: () => {
          // toast is shown by the interceptor
          this.submitting.set(false);
        }
      });
  }

  protected cancel(): void {
    this.router.navigate(['/workspace/requests']);
  }
}
