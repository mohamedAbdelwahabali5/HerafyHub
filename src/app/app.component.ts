import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CollectionComponent } from './Components/collection/collection.component';
import { LoginComponent } from './Components/login/login.component';
import { HeaderComponent } from './Components/header/header.component';
import { FooterComponent } from './Components/footer/footer.component';
import { HeroComponent } from './Components/hero/hero.component';
import { CategoryInfoComponent } from './Components/category-info/category-info.component';
import { ProductsListComponent } from './Components/products-list/products-list.component';
import { ProductCardComponent } from './Components/product-card/product-card.component';
import { ForgotPasswordComponent } from './Components/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './Components/reset-password/reset-password.component';
import { RegistrationComponent } from "./Components/registration/registration.component";

@Component({
  selector: 'app-root',
  imports: [
    // HeaderComponent,
    // FooterComponent,
    // ProductsListComponent,
    // CategoryInfoComponent,
    // LoginComponent,
    // ForgotPasswordComponent,
    ResetPasswordComponent,
    // RegistrationComponent
],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'HerafyHub';
}
