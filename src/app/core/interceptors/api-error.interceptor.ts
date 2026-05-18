import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { ToastService } from '../services/toast.service';

export const apiErrorInterceptor: HttpInterceptorFn = (request, next) => {
  const toastService = inject(ToastService);

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      const correlationId = error.headers.get('X-Correlation-Id');
      const message = error.error?.detail
        ?? error.error?.title
        ?? (correlationId
          ? `Falha ao carregar dados da API. Correlação: ${correlationId}.`
          : 'Falha ao carregar dados da API FlowGate.');

      toastService.error(message);
      return throwError(() => new Error(message));
    })
  );
};