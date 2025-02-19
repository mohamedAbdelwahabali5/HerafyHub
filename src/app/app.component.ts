import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CollectionComponent } from './CollectionComponent/collection/collection.component';
import { LoginComponent } from './Components/login/login.component';
import { HeroComponent } from './Components/hero/hero.component';

@Component({
  selector: 'app-root',
  imports: [HeroComponent, CollectionComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'HerafyHub';
}
