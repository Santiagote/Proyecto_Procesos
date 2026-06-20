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
          const val = error.error[firstKey];
          if (Array.isArray(val)) {
            message = `${firstKey}: ${val.join(', ')}`;
          } else if (typeof val === 'string') {
            message = `${firstKey}: ${val}`;
          } else if (typeof val === 'object' && val !== null) {
            message = JSON.stringify(val);
          } else {
            message = `Error de validación`;
          }
        } else if (error.error) {
          message = typeof error.error === 'string' ? error.error : `Error ${error.status}`;
        }

<<<<<<< HEAD
        if (error.status === 403) {
          message = 'No tienes permisos para realizar esta acción';
        } else if (error.status === 404) {
          message = 'Recurso no encontrado';
        } else if (error.status === 500) {
          message = 'Error interno del servidor';
        } else if (error.status === 0) {
          message = 'No se puede conectar con el servidor. Verifica tu conexión.';
        } else if (error.status === 423) {
          message = error.error?.detail || 'Cuenta bloqueada temporalmente';
        }

=======
>>>>>>> 928668af292e6801ff09771a7a94d74221d87885
        console.error(`[ErrorInterceptor] ${error.status} - ${message}`, error);

        const err = new Error(message);
        (err as any).status = error.status;
        return throwError(() => err);
      })
    );
  }
}
