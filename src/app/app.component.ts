import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { HeaderComponent } from './Components/header/header.component';
import { FooterComponent } from './Components/footer/footer.component';

import { filter } from 'rxjs';
import { UsersService } from './Services/users.service';



@Component({
  selector: 'app-root',
  imports: [
    HeaderComponent,
    FooterComponent,
    RouterOutlet,
],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'HerafyHub';
  showHeaderAndFooter = true;

  constructor(private userServ: UsersService, private router: Router) {
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
  ngOnInit() {
    if (!this.userServ.isLoggedIn()) {
      // this.router.navigate(['/login']);
    }
  }
  // Helper function to check if the current route is an auth route
  private isAuthRoute(url: string): boolean {
    const authRoutes = ['/login', '/register', '/reset-password', '/forgot-password', '/error'];
    return authRoutes.includes(url);

  }
}
