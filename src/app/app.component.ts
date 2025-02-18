import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CollectionComponent } from './CollectionComponent/collection/collection.component';
import { LoginComponent } from './Components/login/login.component';
import { HeroComponent } from './Components/hero/hero.component';
import { ProductDetailsComponent } from './Components/product-details/product-details.component';

@Component({
  selector: 'app-root',
  imports: [ProductDetailsComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'HerafyHub';
}
