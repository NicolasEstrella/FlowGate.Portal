import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { apiBaseUrlInterceptor } from './core/interceptors/api-base-url.interceptor';
import { apiErrorInterceptor } from './core/interceptors/api-error.interceptor';
import { sessionHeadersInterceptor } from './core/interceptors/session-headers.interceptor';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(withInterceptors([
      apiBaseUrlInterceptor,
      sessionHeadersInterceptor,
      apiErrorInterceptor
    ])),
    provideRouter(routes)
  ]
};
