import { Routes } from '@angular/router';
import { HomeComponent } from './Components/home/home.component';
import { AboutUsComponent } from './Components/about-us/about-us.component';
import { ProductDetailsComponent } from './Components/product-details/product-details.component';
import { LoginComponent } from './Components/login/login.component';
import { ErrorComponent } from './Components/error/error.component';


export const routes: Routes = [
        {path: '', redirectTo:'home' ,pathMatch: 'full'},
        {path: 'home', component:HomeComponent},
        {path: 'login', component:LoginComponent},
        {path: 'about-us', component:AboutUsComponent},
        {path: 'product-details/:id', component:ProductDetailsComponent} ,
        {path:'**',component:ErrorComponent},
        

];

