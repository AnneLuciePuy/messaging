import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { Subject } from "rxjs";

import { AuthData } from "./auth-data.model";

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

    getToken() {
        return this.token;
    }

    getIsAuth() {
        return this.isAuthenticated;
    }

    getUserId() {
        return this.userId;
    }

    getAuthStatusLister() {
        return this.authStatusLister.asObservable();
    }

    createUser(email: string, password: string) {
        const authData: AuthData = {email: email, password: password};
        this.http.post('http://localhost:3000/api/user/signup', authData)
        .subscribe((response) => {
            this.router.navigate(['/']);
        });
    }

    login(email: string, password: string) {
        const authData: AuthData = {email: email, password: password};
        this.http
            .post<{ message: string, token: string, expiresIn: number, userId: string }>('http://localhost:3000/api/user/login', authData)
            .subscribe((response) => {
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
            });
    }

    autoAuthUser() {
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

    logout() {
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