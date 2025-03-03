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
}
