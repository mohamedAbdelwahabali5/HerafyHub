import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CollectionComponent } from './Components/collection/collection.component';
import { LoginComponent } from './Components/login/login.component';
import { HeaderComponent } from './Components/header/header.component';
import { FooterComponent } from './Components/footer/footer.component';
import { HeroComponent } from './Components/hero/hero.component';
import { RegistrationComponent } from './Components/registration/registration.component';
import { ProfileComponent } from './Components/profile/profile.component';

@Component({
  selector: 'app-root',
  imports: [
    RegistrationComponent,
    ProfileComponent,
    HeaderComponent,
    FooterComponent,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'HerafyHub';
}
