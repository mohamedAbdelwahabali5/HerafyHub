import { Routes } from '@angular/router';
import { HomeComponent } from './Components/home/home.component';
import { AboutUsComponent } from './Components/about-us/about-us.component';
import { ProductDetailsComponent } from './Components/product-details/product-details.component';
import { LoginComponent } from './Components/login/login.component';
import { ErrorComponent } from './Components/error/error.component';
import { ContactComponent } from './Components/contact/contact.component';
import { RegistrationComponent } from './Components/registration/registration.component';
import { CartComponent } from './Components/cart/cart.component';
import { ProductsListComponent } from './Components/products-list/products-list.component';
//import { FavoritesComponent } from './Components/favorites/favorites.component';
import { ProductsComponent } from './Components/products/products.component';
import { ResetPasswordComponent } from './Components/reset-password/reset-password.component';
import { ForgotPasswordComponent } from './Components/forgot-password/forgot-password.component';
import { ProfileComponent } from './Components/profile/profile.component';
import { AuthGuardService } from './Services/auth.guard.service';
import { FavoriteItemComponent } from './Components/favorites-item/favorites-item.component';
import { FavoriteComponent } from './Components/favorites/favorites.component';


export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegistrationComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'about-us', component: AboutUsComponent },
  { path: 'contact-us', component: ContactComponent },
  { path: 'product-details/:id', component: ProductDetailsComponent, canActivate: [AuthGuardService] },
  { path: 'products', component: ProductsComponent, canActivate: [AuthGuardService] },
  { path: 'cart', component: CartComponent },
  { path: 'favorite', component: FavoriteComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password/:token', component: ResetPasswordComponent },

  // error page
  { path: 'error', component: ErrorComponent },
  { path: '**', redirectTo: 'error' }
];

