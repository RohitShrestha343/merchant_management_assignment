import { inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { Observable, catchError, finalize, shareReplay, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

let refreshRequest$: Observable<{ accessToken: string; refreshToken?: string }> | null = null;

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const http = inject(HttpClient);
  const isAuthEndpoint = req.url.includes('/api/auth/login') || req.url.includes('/api/auth/refresh');

  const attach = (request: HttpRequest<unknown>, token: string) =>
    request.clone({ setHeaders: { Authorization: `Bearer ${token}` } });

  const token = auth.getAccessToken();
  const outgoing = token && !isAuthEndpoint ? attach(req, token) : req;

  return next(outgoing).pipe(catchError((error: HttpErrorResponse) => {
    if (error.status !== 401 || isAuthEndpoint) return throwError(() => error);

    const refreshToken = auth.getRefreshToken();
    if (!refreshToken) {
      auth.logout();
      return throwError(() => error);
    }

    if (!refreshRequest$) {
      refreshRequest$ = http.post<{ accessToken: string; refreshToken?: string }>(
        '/api/auth/refresh', { refreshToken }
      ).pipe(
        shareReplay({ bufferSize: 1, refCount: false }),
        finalize(() => { refreshRequest$ = null; })
      );
    }

    // Handle refresh failure separately. A later failure from the retried API
    // request is returned to its caller and does not automatically log out.
    return refreshRequest$.pipe(
      catchError(refreshError => {
        auth.logout();
        return throwError(() => refreshError);
      }),
      switchMap(result => {
        auth.updateTokens(result.accessToken, result.refreshToken);
        return next(attach(req, result.accessToken));
      })
    );
  }));
};
