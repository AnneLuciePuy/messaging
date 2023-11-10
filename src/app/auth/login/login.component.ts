import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';

import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
  public isLoading: boolean = false;
  public loginForm: FormGroup;

  private authStatusSub: Subscription;

  constructor(
    public authService: AuthService
  ) { }

  ngOnInit() {
    this.loginForm = new FormGroup({
      email: new FormControl(null, { 
        validators: [Validators.required, Validators.email] 
      }),
      password: new FormControl(null, { 
        validators: [Validators.required]
      })
    });

    this.authStatusSub = this.authService.getAuthStatusLister().subscribe({
      next: (authStatus) => {
        this.isLoading = false;
      }
    });
  }

  public onLogin() {
    if (this.loginForm.invalid) {
      return;
    };

    this.isLoading = true;
    this.authService.login(this.loginForm.value.email, this.loginForm.value.password);
    this.loginForm.reset();
  }

  ngOnDestroy() {
    this.authStatusSub.unsubscribe();
  }

}
