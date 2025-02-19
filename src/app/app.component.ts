import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CollectionComponent } from './CollectionComponent/collection/collection.component';
import { LoginComponent } from './Components/login/login.component';
import { HeroComponent } from './Components/hero/hero.component';
import { SliderComponent } from './Components/slider/slider.component';

@Component({
  selector: 'app-root',
  imports: [SliderComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'HerafyHub';
}
