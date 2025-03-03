import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CollectionComponent } from './Components/collection/collection.component';
import { LoginComponent } from './Components/login/login.component';
import { HeaderComponent } from './Components/header/header.component';
import { FooterComponent } from './Components/footer/footer.component';
import { HeroComponent } from './Components/hero/hero.component';
import { CartComponent } from './Components/cart/cart.component';
import { CartItemComponent } from './Components/cart-item/cart-item.component';
import { ProductsListComponent } from './Components/products-list/products-list.component';
import { ResetPasswordComponent } from './Components/reset-password/reset-password.component';

import { RegistrationComponent } from './Components/registration/registration.component';

import { SliderComponent } from './Components/slider/slider.component';
import { InspireComponent } from './Components/inspire/inspire.component';
import { AboutUsComponent } from './Components/about-us/about-us.component';
import { HomeComponent } from "./Components/home/home.component";
import { ProductDetailsComponent } from "./Components/product-details/product-details.component";


@Component({
  selector: 'app-root',
  imports: [
    // ResetPasswordComponent
    // HeroComponent,
    // CollectionComponent,
    // HeaderComponent,
    // FooterComponent,
    // LoginComponent,
    // CartComponent,
    // CartItemComponent,
    // ProductsListComponent,
    HeaderComponent,
    FooterComponent,
    RouterOutlet,
    // ProductsListComponent,
    // CategoryInfoComponent,
    // LoginComponent,
    // ForgotPasswordComponent,
    // ResetPasswordComponent,
    // ProductDetailsComponent
],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'HerafyHub';
}
