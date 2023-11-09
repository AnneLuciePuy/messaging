import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  isLoading: boolean = false;
  loginForm: FormGroup;

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
  }

  onLogin() {
    if (this.loginForm.invalid) {
      return;
    };

    this.isLoading = true;
    this.authService.login(this.loginForm.value.email, this.loginForm.value.password);
  }

}
