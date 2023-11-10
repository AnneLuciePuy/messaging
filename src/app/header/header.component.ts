import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  public userIsAuthenticated: boolean = false;

  private authListerSubs: Subscription;

  constructor(
    private authService: AuthService
  ) { }


  ngOnInit() {
    this.userIsAuthenticated = this.authService.getIsAuth();
    this.authListerSubs = this.authService.getAuthStatusLister()
    .subscribe(isAuthenticated => {
      this.userIsAuthenticated = isAuthenticated;
    });
  }

  public onLogout() {
    this.authService.logout();
  }

  ngOnDestroy(): void {
    this.authListerSubs.unsubscribe;
  }
}
