import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CollectionComponent } from './CollectionComponent/collection/collection.component';

@Component({
  selector: 'app-root',
  imports: [CollectionComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'HerafyHub';
}
