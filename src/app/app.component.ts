import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CollectionComponent } from './CollectionComponent/collection/collection.component';
import { LoginComponent } from './Components/login/login.component';

@Component({
  selector: 'app-root',
  imports: [LoginComponent, CollectionComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'HerafyHub';
}
