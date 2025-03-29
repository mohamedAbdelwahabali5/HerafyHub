import { Component, OnInit } from '@angular/core';
import { UsersService } from '../../Services/users.service';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  imports: [RouterModule, CommonModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css'],
})
export class FooterComponent implements OnInit {
  categories: any[] = [];
  products: any[] = [];
  isLoggedIn: boolean = false;

  constructor(private userService: UsersService) {}

  ngOnInit() {
    this.loadCategories();
    this.loadProducts();
    this.isLoggedIn = this.userService.isLoggedIn();
  }

  loadCategories() {
    this.userService.getCategories().subscribe({
      next: (data: any) => {
        this.categories = data || [];
      },
      error: (error) => console.error('Error fetching categories:', error),
    });
  }

  loadProducts() {
    this.userService.getProducts().subscribe({
      next: (data: any) => {
        // Adjust based on your API response structure
        this.products = data.products || []; // If response has products array
      },
      error: (error) => console.error('Error fetching products:', error),
    });
  }
}
