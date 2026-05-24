import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { ApiModule, Configuration, ConfigurationParameters } from '../../build/api';
import { HTTP_INTERCEPTORS, HttpEvent, HttpHandlerFn, HttpRequest, provideHttpClient, withInterceptors } from '@angular/common/http';
// import { JwtInterceptor } from './services/jwt.interceptor';
import { AuthService } from './services/auth.service';
import { Observable } from 'rxjs';
import { jwtInterceptorFn } from './services/jwt.interceptor';

export function apiConfigFactory(): Configuration {
  const params: ConfigurationParameters = {
    basePath: 'https://aitherapy-hvdaajdtbzcshjha.germanywestcentral-01.azurewebsites.net',
    apiKeys: { bearer: '' }, // You can set a dynamic token here if needed
  };
  return new Configuration(params);
}

export const appConfig: ApplicationConfig = {
  providers: [
    importProvidersFrom(ApiModule.forRoot(apiConfigFactory)),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideAnimationsAsync(),
    provideHttpClient(withInterceptors([jwtInterceptorFn])),

  ]
};

