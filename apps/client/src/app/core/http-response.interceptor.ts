import {
  KEY_STAY_SIGNED_IN,
  SettingsStorageService
} from '@ghostfolio/client/services/settings-storage.service';
import { TokenStorageService } from '@ghostfolio/client/services/token-storage.service';
import { UserService } from '@ghostfolio/client/services/user/user.service';
import { WebAuthnService } from '@ghostfolio/client/services/web-authn.service';
import { HEADER_KEY_TOKEN } from '@ghostfolio/common/config';
import { InfoItem } from '@ghostfolio/common/interfaces';
import { internalRoutes, publicRoutes } from '@ghostfolio/common/routes/routes';
import { DataService } from '@ghostfolio/ui/services';

import {
  HTTP_INTERCEPTORS,
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  MatSnackBar,
  MatSnackBarRef,
  TextOnlySnackBar
} from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { StatusCodes } from 'http-status-codes';
import ms from 'ms';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import {
  catchError,
  filter,
  finalize,
  switchMap,
  take,
  tap
} from 'rxjs/operators';

@Injectable()
export class HttpResponseInterceptor implements HttpInterceptor {
  private accessTokenRefreshSubject = new BehaviorSubject<string | null>(null);
  private isRefreshingAccessToken = false;
  public info: InfoItem;
  public snackBarRef: MatSnackBarRef<TextOnlySnackBar>;

  public constructor(
    private dataService: DataService,
    private router: Router,
    private settingsStorageService: SettingsStorageService,
    private snackBar: MatSnackBar,
    private tokenStorageService: TokenStorageService,
    private userService: UserService,
    private webAuthnService: WebAuthnService
  ) {
    this.info = this.dataService.fetchInfo();
  }

  public intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      tap((event: HttpEvent<any>) => {
        return event;
      }),
      catchError((error: HttpErrorResponse) => {
        if (error.status === StatusCodes.FORBIDDEN) {
          if (!this.snackBarRef) {
            if (this.info.isReadOnlyMode) {
              this.snackBarRef = this.snackBar.open(
                $localize`This feature is currently unavailable.` +
                  ' ' +
                  $localize`Please try again later.`,
                undefined,
                {
                  duration: ms('6 seconds')
                }
              );
            } else if (
              !error.url.includes(internalRoutes.auth.routerLink.join(''))
            ) {
              this.snackBarRef = this.snackBar.open(
                $localize`This action is not allowed.`,
                undefined,
                {
                  duration: ms('6 seconds')
                }
              );
            }

            this.snackBarRef.afterDismissed().subscribe(() => {
              this.snackBarRef = undefined;
            });

            this.snackBarRef.onAction().subscribe(() => {
              this.router.navigate(publicRoutes.pricing.routerLink);
            });
          }
        } else if (error.status === StatusCodes.INTERNAL_SERVER_ERROR) {
          if (!this.snackBarRef) {
            this.snackBarRef = this.snackBar.open(
              $localize`Oops! Something went wrong.` +
                ' ' +
                $localize`Please try again later.`,
              $localize`Okay`,
              {
                duration: ms('6 seconds')
              }
            );

            this.snackBarRef.afterDismissed().subscribe(() => {
              this.snackBarRef = undefined;
            });

            this.snackBarRef.onAction().subscribe(() => {
              window.location.reload();
            });
          }
        } else if (error.status === StatusCodes.TOO_MANY_REQUESTS) {
          if (!this.snackBarRef) {
            this.snackBarRef = this.snackBar.open(
              $localize`Oops! It looks like you’re making too many requests. Please slow down a bit.`
            );

            this.snackBarRef.afterDismissed().subscribe(() => {
              this.snackBarRef = undefined;
            });
          }
        } else if (error.status === StatusCodes.UNAUTHORIZED) {
          if (!error.url.includes('/data-providers/ghostfolio/status')) {
            return this.handleUnauthorizedError(error, next, request);
          }
        }

        return throwError(error);
      })
    );
  }

  private getShouldStaySignedIn() {
    return (
      this.settingsStorageService.getSetting(KEY_STAY_SIGNED_IN) !== 'false'
    );
  }

  private handleUnauthorizedError(
    error: HttpErrorResponse,
    next: HttpHandler,
    request: HttpRequest<any>
  ) {
    const accessToken = this.tokenStorageService.getAccessToken();
    const isAnonymousAuthRequest = error.url?.includes(
      '/api/v1/auth/anonymous'
    );

    if (accessToken && !isAnonymousAuthRequest) {
      return this.refreshAccessTokenAndRetry({
        accessToken,
        next,
        request
      });
    }

    if (this.webAuthnService.isEnabled()) {
      this.router.navigate(internalRoutes.webauthn.routerLink);
    } else {
      this.userService.signOut();
    }

    return throwError(error);
  }

  private refreshAccessTokenAndRetry({
    accessToken,
    next,
    request
  }: {
    accessToken: string;
    next: HttpHandler;
    request: HttpRequest<any>;
  }) {
    if (this.isRefreshingAccessToken) {
      return this.accessTokenRefreshSubject.pipe(
        filter((token): token is string => !!token),
        take(1),
        switchMap((token) => {
          return next.handle(this.withAuthToken({ request, token }));
        })
      );
    }

    this.isRefreshingAccessToken = true;
    this.accessTokenRefreshSubject.next(null);

    return this.dataService.loginAnonymous(accessToken).pipe(
      switchMap(({ authToken }) => {
        const staySignedIn = this.getShouldStaySignedIn();

        this.tokenStorageService.saveAccessToken(accessToken, staySignedIn);
        this.tokenStorageService.saveToken(authToken, staySignedIn);
        this.accessTokenRefreshSubject.next(authToken);

        return next.handle(this.withAuthToken({ request, token: authToken }));
      }),
      catchError((refreshError: HttpErrorResponse) => {
        if (this.webAuthnService.isEnabled()) {
          this.router.navigate(internalRoutes.webauthn.routerLink);
        } else {
          this.userService.signOut();
        }

        return throwError(refreshError);
      }),
      finalize(() => {
        this.isRefreshingAccessToken = false;
      })
    );
  }

  private withAuthToken({
    request,
    token
  }: {
    request: HttpRequest<any>;
    token: string;
  }) {
    return request.clone({
      headers: request.headers.set(HEADER_KEY_TOKEN, `Bearer ${token}`)
    });
  }
}

export const httpResponseInterceptorProviders = [
  { provide: HTTP_INTERCEPTORS, useClass: HttpResponseInterceptor, multi: true }
];
