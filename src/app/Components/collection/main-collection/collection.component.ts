import { CollectionCardComponent } from './../collection-card/collection-card.component';
import { Component } from '@angular/core';
import { ProductService } from '../../../Services/collection.service';
import { RouterModule } from '@angular/router';
import { UsersService } from '../../../Services/users.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-collection',
  imports: [RouterModule, CommonModule, CollectionCardComponent],
  providers: [ProductService],
  templateUrl: './collection.component.html',
  styleUrl: './collection.component.css',
})
export class CollectionComponent {
  products: any = [];
  loading: boolean = true;
  err: any = null;

  constructor(private productService: ProductService, public userServ: UsersService) { }

  ngOnInit() {
    this.loading = true;
    this.productService.getAllProducts().subscribe({
      next: (response: any) => {
        // console.log('Raw product data:', response);

        // Access the products array from the response.products
        this.products = response.products?.slice(0, 8).map((product: any) => ({
          ...product,
          title:
            product.title.length > 50
              ? product.title.substring(0, 30) + '...'
              : product.title,
        })) || [];
        // console.log('Processed products:', this.products);
        this.loading = false;
      },
      error: (err) => {
        console.log('Error fetching products:', err);
        this.err = err;
        this.loading = false;
      },
    });
  }
}
