import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'fg-unauthorized-page',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="feedback-page">
      <section class="feedback-page__panel">
        <span class="portal-shell__eyebrow">Acesso negado</span>
        <h1>Este módulo não está liberado para o papel atual.</h1>
        <p>
          O portal já aplica guards por perfil. Volte para o workspace permitido ou troque de sessão.
        </p>
        <div class="utility-row">
          <a class="button" routerLink="/workspace">Voltar ao workspace</a>
          <a class="button-ghost" routerLink="/login">Trocar perfil</a>
        </div>
      </section>
    </div>
  `
})
export class UnauthorizedPageComponent {}