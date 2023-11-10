import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';

import { AuthService } from '../auth.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit, OnDestroy {
  public isLoading: boolean = false;
  public signupForm: FormGroup;

  private authStatusSub: Subscription;

  constructor(
    public authService: AuthService
  ) { }

  ngOnInit() {
    this.signupForm = new FormGroup({
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

  public onSignup() {
    if (this.signupForm.invalid) {
      return;
    };

    this.isLoading = true;
    this.authService.createUser(this.signupForm.value.email, this.signupForm.value.password);
    this.signupForm.reset();
  }

  ngOnDestroy() {
    this.authStatusSub.unsubscribe();
  }

}
