import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit{
  isLoading: boolean = false;
  signupForm: FormGroup;

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
  }

  onSignup() {
    if (this.signupForm.invalid) {
      return;
    };

    this.authService.createUser(this.signupForm.value.email, this.signupForm.value.password);
    console.log('signupForm', this.signupForm.value)
  }

}
