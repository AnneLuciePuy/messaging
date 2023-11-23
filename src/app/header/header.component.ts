import { Component, OnDestroy, OnInit } from '@angular/core';
import { map, Subscription } from 'rxjs';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  public userIsAuthenticated: boolean = false;

  private authListerSubs: Subscription;

  public isSmallScreen = this.breakpointObserver.observe([Breakpoints.Small, Breakpoints.XSmall])
  .pipe(map(result => result.matches));

  constructor(
    private authService: AuthService,
    private breakpointObserver: BreakpointObserver
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
