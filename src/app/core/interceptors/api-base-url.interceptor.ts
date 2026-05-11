import { HttpInterceptorFn } from '@angular/common/http';

import { environment } from '../../../environments/environment';

export const apiBaseUrlInterceptor: HttpInterceptorFn = (request, next) => {
  if (/^https?:\/\//.test(request.url)) {
    return next(request);
  }

  const baseUrl = environment.apiUrl.replace(/\/$/, '');
  const resourceUrl = request.url.startsWith('/') ? request.url : `/${request.url}`;

  return next(request.clone({
    url: `${baseUrl}${resourceUrl}`
  }));
};