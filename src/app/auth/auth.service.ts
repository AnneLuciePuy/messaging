import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { Subject } from "rxjs";
import { environment } from "src/environments/environment";

import { AuthData } from "./auth-data.model";

const BACKEND_URL = environment.apiUrl + "/user/";

@Injectable({ 
    providedIn: 'root' 
})
export class AuthService {
    private token: string;
    private userId: string;
    private isAuthenticated: boolean = false;
    private tokenTimer: ReturnType<typeof setTimeout>;;
    private authStatusLister = new Subject<boolean>();

    constructor(
        private http: HttpClient,
        private router: Router
    ) {}

    public getToken() {
        return this.token;
    }

    public getIsAuth() {
        return this.isAuthenticated;
    }

    public getUserId() {
        return this.userId;
    }

    public getAuthStatusLister() {
        return this.authStatusLister.asObservable();
    }

    public createUser(email: string, password: string) {
        const authData: AuthData = {email: email, password: password};
        this.http.post(BACKEND_URL + 'signup', authData)
        .subscribe({
            next: (response) => {
              this.router.navigate(['/']);
            },
            error: (error) => {
              this.authStatusLister.next(false);
            }
        });
    }

    public login(email: string, password: string) {
        const authData: AuthData = {email: email, password: password};
        this.http
            .post<{ message: string, token: string, expiresIn: number, userId: string }>(BACKEND_URL + 'login', authData)
            .subscribe({
                next: (response) => {
                    const token = response.token;
                    this.token = token;

                    if (token) {
                        const expiresInDuration = response.expiresIn;
                        this.setAuthTimer(expiresInDuration);
                        this.isAuthenticated = true;
                        this.userId = response.userId;
                        this.authStatusLister.next(true);

                        const now = new Date();
                        const expirationDate = new Date(now.getTime() + expiresInDuration * 1000);
                        this.saveAuthData(token, expirationDate, this.userId);

                        this.router.navigate(['/']);
                    };
                },
                error: (error) => {
                    this.authStatusLister.next(false);
                }
            });
    }

    public autoAuthUser() {
       const authInformation = this.getAuthData();
       if (!authInformation) {
            return;
       };

        const now = new Date();
        const expiresIn = authInformation.expirationDate.getTime() - now.getTime();
        
        if (expiresIn > 0) {
            this.token = authInformation.token;
            this.isAuthenticated = true;
            this.userId = authInformation.userId;
            this.setAuthTimer(expiresIn / 1000);
            this.authStatusLister.next(true);
        };
    }

    public logout() {
        this.token = null;
        this.isAuthenticated = false;
        this.authStatusLister.next(false);
        this.userId = null;
        clearTimeout(this.tokenTimer);
        this.clearAuthData();
        this.router.navigate(['/']);
    }

    private setAuthTimer(duration: number) {
        this.tokenTimer = setTimeout(() => {
            this.logout();
        }, duration * 1000);
    }

    private saveAuthData(token: string, expirationDate: Date, userId: string) {
        localStorage.setItem('token', token);
        localStorage.setItem('expiration', expirationDate.toISOString());
        localStorage.setItem('userId', userId);
    }

    private clearAuthData() {
        localStorage.removeItem('token');
        localStorage.removeItem('expiration');
        localStorage.removeItem('userId');
    }

    private getAuthData() {
        const token = localStorage.getItem('token');
        const expirationDate = localStorage.getItem('expiration');
        const userId = localStorage.getItem('userId');

        if (!token || !expirationDate) {
            return;
        };

        return {
            token: token,
            expirationDate: new Date(expirationDate),
            userId: userId
        };
    }
}