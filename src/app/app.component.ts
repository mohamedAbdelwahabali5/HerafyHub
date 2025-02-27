import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { HeaderComponent } from './Components/header/header.component';
import { FooterComponent } from './Components/footer/footer.component';

import { filter } from 'rxjs';
import { ResetPasswordComponent } from './Components/reset-password/reset-password.component';


@Component({
  selector: 'app-root',
  imports: [
    HeaderComponent,
    FooterComponent,
    ResetPasswordComponent,
    RouterOutlet,
],

  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'HerafyHub';
  showHeaderAndFooter = true;

  constructor(private router: Router) {
    // Subscribe to router events
    this.router.events
      .pipe(
        // Filter for NavigationEnd events
        filter((event) => event instanceof NavigationEnd)
      )
      .subscribe((event: NavigationEnd) => {
        // Check the current route
        this.showHeaderAndFooter = !this.isAuthRoute(event.url);
      });
  }

  // Helper function to check if the current route is an auth route
  private isAuthRoute(url: string): boolean {
    const authRoutes = ['/login', '/register','/reset-password','/forgot-password','/error']; 
    return authRoutes.includes(url);
  }
}
