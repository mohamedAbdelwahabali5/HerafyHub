import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {  ProductService } from '../../Services/collection.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-product-details',
  imports: [CommonModule],
  providers: [ProductService],
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.css'
})
export class ProductDetailsComponent implements OnInit {
  product: any;
  stars: number[] = [1, 2, 3, 4, 5]; // Array to iterate over stars

  constructor(
    private route: ActivatedRoute,
    private  productService: ProductService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = params['id']; // Convert string to number using +
      this.productService.getProductById(id).subscribe({
        next: (data: any) => {
          this.product = data;
        },
        error: (error) => {
          console.error('Error fetching product:', error);
        }
      });
    });
  }

  // Method to generate star array based on rating
  getRating(): number {
    return this.product?.rating?.rate || 0; // Access the correct rating property and provide a fallback
  }

  getStarType(index: number): string {
    const rating = this.getRating();
    if (index + 1 <= rating) {
      return 'bi-star-fill';
    } else if (index + 0.5 <= rating) {
      return 'bi-star-half';
    } else {
      return 'bi-star';
    }
  }
}
