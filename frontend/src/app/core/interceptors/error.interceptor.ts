import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        let message = 'Error del servidor';

        if (error.status === 500) {
          message = 'Error interno del servidor';
        } else if (error.status === 403) {
          message = 'No tienes permisos para realizar esta acción';
        } else if (error.status === 404) {
          message = 'Recurso no encontrado';
        } else if (error.error?.detail) {
          message = error.error.detail;
        } else if (error.error instanceof Object) {
          const firstKey = Object.keys(error.error)[0];
          if (firstKey) message = `${firstKey}: ${error.error[firstKey]}`;
        } else if (error.error) {
          message = error.error;
        }

        console.error(`[ErrorInterceptor] ${error.status} - ${message}`, error);

        const err = new Error(message);
        (err as any).status = error.status;
        return throwError(() => err);
      })
    );
  }
}
