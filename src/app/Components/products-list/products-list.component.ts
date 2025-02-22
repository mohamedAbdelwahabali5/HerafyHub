import { Component } from '@angular/core';
import { CollectionService } from '../../Services/collection.service';
import { ProductCardComponent } from '../product-card/product-card.component';

@Component({
  selector: 'app-products-list',
  imports: [ProductCardComponent],
  templateUrl: './products-list.component.html',
  styleUrl: './products-list.component.css',
})
export class ProductsListComponent {
  products!: any;
  categories!: any;
  ProImage!: any;
  ProCurrentprice!: number;
  ProTitle!: string;
  ProDescription!: string;
  imagePath!: string;

  constructor(private collectionService: CollectionService) {}
  ngOnInit() {
    this.collectionService.getAllProducts().subscribe({
      next: (data) => {
        // console.log('Data from API:', data);
        this.products = data;

        // console.log('Unique Categories:', this.categories);
        // console.log('imagePath:', this.imagePath);
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
}
