import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit{
  isLoading: boolean = false;
  signupForm: FormGroup;

  constructor() { }

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
    console.log('signupForm', this.signupForm.value)
  }

}
