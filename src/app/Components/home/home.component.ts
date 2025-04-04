import { Component } from '@angular/core';
import { HeroComponent } from '../hero/hero.component';
import { CollectionComponent } from '../collection/main-collection/collection.component';
import { SliderComponent } from '../slider/slider.component';
import { InspireComponent } from '../inspire/inspire.component';

@Component({
  selector: 'app-home',
  imports: [HeroComponent,CollectionComponent,SliderComponent,InspireComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

}
