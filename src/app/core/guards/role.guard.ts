import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AppRole } from '../models/app-role';
import { SessionService } from '../services/session.service';

export function roleGuard(requiredRoles: AppRole[]): CanActivateFn {
  return () => {
    const sessionService = inject(SessionService);
    const router = inject(Router);

    if (sessionService.hasAnyRole(requiredRoles)) {
      return true;
    }

    return router.createUrlTree(['/unauthorized']);
  };
}