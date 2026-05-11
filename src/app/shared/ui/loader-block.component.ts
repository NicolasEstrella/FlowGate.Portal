import { Component } from '@angular/core';

@Component({
  selector: 'fg-loader-block',
  standalone: true,
  template: `
    <div class="loader" aria-live="polite" aria-busy="true">
      <div class="loader__bar"></div>
      <div class="loader__bar loader__bar--medium"></div>
      <div class="loader__bar loader__bar--short"></div>
    </div>
  `
})
export class LoaderBlockComponent {}