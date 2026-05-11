import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { SessionService } from '../services/session.service';

function toAsciiHeaderValue(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\x20-\x7E]/g, '');
}

export const sessionHeadersInterceptor: HttpInterceptorFn = (request, next) => {
  const sessionService = inject(SessionService);
  const session = sessionService.session();

  if (!session) {
    return next(request);
  }

  return next(request.clone({
    setHeaders: {
      'X-FlowGate-UserId': session.id,
      'X-FlowGate-UserName': toAsciiHeaderValue(session.displayName),
      'X-FlowGate-UserEmail': session.email,
      'X-FlowGate-Roles': session.roles.join(',')
    }
  }));
};