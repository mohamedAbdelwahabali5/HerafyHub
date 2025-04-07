import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { UsersService } from '../../Services/users.service';

@Component({
  selector: 'app-hero',
  imports: [CommonModule, RouterModule],
  templateUrl: './hero.component.html',
  styleUrls: ['./hero.component.css'],
})
export class HeroComponent {

  constructor(public userServ: UsersService) {

  }
}
