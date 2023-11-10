import { HttpErrorResponse, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { catchError, throwError } from "rxjs";

import { ErrorComponent } from "./error/error.component";

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

    constructor(
        private dialog: MatDialog
    ) {}
      
    intercept(req: HttpRequest<any>, next: HttpHandler) {
        return next.handle(req).pipe(
            catchError((error: HttpErrorResponse) => {
                let errorMessage = 'Une erreur inconnue est survenue !';
                
                if (error.error.message) {
                    errorMessage = error.error.message;
                }
                this.dialog.open(
                    ErrorComponent, 
                    { data: 
                        { message: errorMessage},
                        panelClass: 'error-dialog'
                    }
                );

                return throwError(error);
                /* return throwError(() => new Error('Custom error message')); */
            })
        );
    }

}