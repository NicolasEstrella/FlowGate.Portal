import { Component, Input } from '@angular/core';

@Component({
  selector: 'fg-ui-card',
  standalone: true,
  template: `
    <section class="ui-card">
      <header class="ui-card__header">
        <div>
          @if (eyebrow) {
            <div class="ui-card__eyebrow">{{ eyebrow }}</div>
          }
          <div class="ui-card__title">{{ title }}</div>
        </div>

        <ng-content select="[card-action]"></ng-content>
      </header>

      <div class="ui-card__body">
        <ng-content></ng-content>
      </div>
    </section>
  `
})
export class UiCardComponent {
  @Input({ required: true }) title = '';
  @Input() eyebrow = '';
}