import { Component, Input } from '@angular/core';

@Component({
  selector: 'fg-status-chip',
  standalone: true,
  template: `<span [class]="cssClass">{{ label }}</span>`
})
export class StatusChipComponent {
  @Input({ required: true }) label = '';
  @Input() tone = '';

  get cssClass(): string {
    return `status-chip status-chip--${this.tone || 'neutral'}`;
  }
}