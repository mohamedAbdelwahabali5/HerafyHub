import { Component } from '@angular/core';
import { CategoryInfoComponent } from "../category-info/category-info.component";
import { ProductsListComponent } from "../products-list/products-list.component";

@Component({
  selector: 'app-products',
  imports: [CategoryInfoComponent, ProductsListComponent],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css'
})
export class ProductsComponent {

}
