import { Component, Input } from '@angular/core';

@Component({
  selector: 'fg-empty-state',
  standalone: true,
  template: `
    <section class="empty-state">
      <div class="empty-state__icon">{{ icon }}</div>
      <h3>{{ title }}</h3>
      <p class="muted">{{ description }}</p>
      <ng-content></ng-content>
    </section>
  `
})
export class EmptyStateComponent {
  @Input() icon = '◌';
  @Input({ required: true }) title = '';
  @Input({ required: true }) description = '';
}