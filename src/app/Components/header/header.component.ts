declare var bootstrap: any;
import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { UsersService } from '../../Services/users.service';
import { CartService } from '../../Services/cart.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  imports: [RouterModule, CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit, OnDestroy {
  userProfileImage: string | null = null;
  cartItemCount: number = 0;
  private profileSubscription: Subscription | null = null;
  private cartSubscription: Subscription | null = null;

  constructor(
    public userServ: UsersService, 
    public router: Router,
    private cartService: CartService
  ) {}

  ngOnInit() {
    // Subscribe to profile image changes
    this.profileSubscription = this.userServ.profileImage$.subscribe(
      image => {
        this.userProfileImage = image || this.userProfileImage;
      }
    );

    // Subscribe to cart count changes
    this.cartSubscription = this.cartService.cartCount$.subscribe(
      count => {
        this.cartItemCount = count;
      }
    );

    // Initial load of profile image
    if (this.userServ.isLoggedIn()) {
      this.userServ.getUserProfile().subscribe(user => {
        this.userProfileImage = user.profileImage || null;
      });
    }
  }

  ngOnDestroy() {
    // Unsubscribe to prevent memory leaks
    if (this.profileSubscription) {
      this.profileSubscription.unsubscribe();
    }
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
  }

  closeNavbar() {
    const navbarCollapse = document.getElementById('navbarSupportedContent');
    if (navbarCollapse && navbarCollapse.classList.contains('show')) {
      const bsCollapse = bootstrap.Collapse.getInstance(navbarCollapse);
      if (bsCollapse) {
        bsCollapse.hide();
      }
    }
  }

  logout() {
    this.userServ.logout();
    // Redirect to home or login page
    this.router.navigate(['/login']);
  }
}
