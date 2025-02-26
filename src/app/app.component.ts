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

@Component({
  selector: 'app-root',
  imports: [
    ResetPasswordComponent
    // HeroComponent,
    // CollectionComponent,
    // HeaderComponent,
    // FooterComponent,
    // LoginComponent,
    // CartComponent,
    // CartItemComponent,
    // ProductsListComponent
    ,
    HeaderComponent,
    FooterComponent,
    RouterOutlet
],

  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'HerafyHub';
}
