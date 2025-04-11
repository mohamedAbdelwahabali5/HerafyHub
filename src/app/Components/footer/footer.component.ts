// footer.component.ts
import { Component, OnInit } from '@angular/core';
import { UsersService } from '../../Services/users.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment.prod';

import { FooterService } from '../../Services/footer.service';
import {
  Router,
  NavigationEnd,
  ActivatedRoute,
  RouterModule,
} from '@angular/router';
import { filter } from 'rxjs/operators';
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
  currentCategoryId: string | null = null;
  errorMessage: string = '';

  constructor(
    private http: HttpClient,
    private userService: UsersService,
    private footerService: FooterService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit() {
    this.loadCategories();
    this.loadTopProducts();
    this.setupRouteListener();
    this.checkAuthStatus();
  }

  private checkAuthStatus() {
    this.isLoggedIn = this.userService.isLoggedIn();
  }

  private setupRouteListener() {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.handleRouteChange();
        this.checkAuthStatus();
      });
  }

  private handleRouteChange() {
    let route = this.activatedRoute;
    while (route.firstChild) route = route.firstChild;

    route.params.subscribe((params) => {
      const newCategoryId = params['categoryId'];
      if (newCategoryId && newCategoryId !== this.currentCategoryId) {
        this.currentCategoryId = newCategoryId;
      } else if (!newCategoryId && this.currentCategoryId) {
        this.currentCategoryId = null;
      }
    });
    this.loadTopProducts();
  }

  loadCategories() {
    this.footerService.getCategories().subscribe({
      next: (data: any) => (this.categories = data || []),
      error: (error) => console.error('Categories error:', error),
    });
  }

  loadTopProducts() {
    const token = this.userService.getToken();
    const headers = token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : {};

    this.http
      .get(`${environment.apiUrl}/product?page=1&limit=5&sort=rating:1`, {
        headers,
      })
      .subscribe(
        (data: any) => {
          if (data && data.products) {
            this.products = data.products;
          }
        },
        (error) => {
          if (error.status === 401) {
            this.errorMessage = 'Unauthorized. Please log in to view products.';
          } else if (error.status === 500) {
            this.errorMessage = 'Server error. Please try again later.';
          } else {
            this.errorMessage = 'Failed to load products.';
          }
          console.error('Error fetching products:', error);
        }
      );
  }
}

// loadProducts() {
//   this.footerService.getProducts().subscribe({
//     next: (data: any) => {
//       // Adjust based on your API response structure
//       this.products = data.products || []; // If response has products array
//     },
//     error: (error) => console.error('Error fetching products:', error),
//   });
// }

// loadCategoryProducts(categoryId: string) {
//   this.footerService.getProductsByCategory(categoryId).subscribe({
//     next: (data: any) => (this.products = data.products?.slice(0, 5) || []),
//     error: (error) => console.error('Category products error:', error),
//   });
// }
// checkLogin(event: Event) {
//   if (!this.isLoggedIn) {
//     event.preventDefault();
//     this.router.navigate(['/login']);
//   }
// }
