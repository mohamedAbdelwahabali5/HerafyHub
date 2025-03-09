import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { UsersService } from '../../Services/users.service';

@Component({
  selector: 'app-header',
  imports: [RouterModule, CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {

  constructor(public userServ: UsersService, public router: Router) {

  }

  logout() {
    this.userServ.logout();
    // Redirect to home or login page
    this.router.navigate(['/login']);
  }
}
