import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'fg-not-found-page',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="feedback-page">
      <section class="feedback-page__panel">
        <span class="portal-shell__eyebrow">Navegação</span>
        <h1>A rota solicitada não existe no portal.</h1>
        <p>Esta base já preserva um fallback de navegação para futuras áreas operacionais.</p>
        <a class="button" routerLink="/workspace">Ir para o portal</a>
      </section>
    </div>
  `
})
export class NotFoundPageComponent {}