import { Component } from '@angular/core';
import { ProductService } from '../../Services/collection.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-collection',
  imports: [RouterModule],
  providers: [ProductService],
  templateUrl: './collection.component.html',
  styleUrl: './collection.component.css',
})
export class CollectionComponent {
  products: any = [];
  loading: boolean = true;
  err: any = null;

  constructor(private productService: ProductService) {}

  ngOnInit() {
    this.loading = true;
    this.productService.getAllProducts().subscribe({
      next: (data) => {
        console.log(data);
        this.products = (data as any[]).slice(0, 9).map((product) => ({
          ...product,
          title:
            product.title.length > 50
              ? product.title.substring(0, 30) + '...'
              : product.title,
        }));
        this.loading = false; // Set loading to false on success
      },
      error: (err) => {
        console.log(err);
        this.err = err; 
        this.loading = false; // Set loading to false on error
      },
    });
  }
}