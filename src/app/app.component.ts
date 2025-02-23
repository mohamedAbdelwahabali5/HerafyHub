import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CollectionComponent } from './Components/collection/collection.component';
import { LoginComponent } from './Components/login/login.component';
import { HeaderComponent } from './Components/header/header.component';
import { FooterComponent } from './Components/footer/footer.component';
import { HeroComponent } from './Components/hero/hero.component';

import { SliderComponent } from './Components/slider/slider.component';
import { InspireComponent } from './Components/inspire/inspire.component';
import { AboutUsComponent } from './Components/about-us/about-us.component';
import { HomeComponent } from "./Components/home/home.component";

@Component({
  selector: 'app-root',
  imports: [
    HeaderComponent,
    FooterComponent,
    // HeroComponent,
    // CollectionComponent,
    // SliderComponent,
    // InspireComponent
    AboutUsComponent,
    HomeComponent
],

  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'HerafyHub';
}
