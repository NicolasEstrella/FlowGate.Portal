import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export const apiErrorInterceptor: HttpInterceptorFn = (request, next) => {
  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      const correlationId = error.headers.get('X-Correlation-Id');
      const message = error.error?.detail
        ?? error.error?.title
        ?? (correlationId
          ? `Falha ao carregar dados da API. Correlação: ${correlationId}.`
          : 'Falha ao carregar dados da API FlowGate.');

      return throwError(() => new Error(message));
    })
  );
};