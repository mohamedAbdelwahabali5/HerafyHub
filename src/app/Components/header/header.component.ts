import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { UsersService } from '../../Services/users.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  imports: [RouterModule, CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit, OnDestroy {
  userProfileImage: string | null = null;
  private profileSubscription: Subscription | null = null;

  constructor(public userServ: UsersService, public router: Router) {}

  ngOnInit() {
    // Subscribe to profile image changes
    this.profileSubscription = this.userServ.profileImage$.subscribe(
      image => {
        this.userProfileImage = image || this.userProfileImage;
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
  }

  logout() {
    this.userServ.logout();
    // Redirect to home or login page
    this.router.navigate(['/login']);
  }
}
