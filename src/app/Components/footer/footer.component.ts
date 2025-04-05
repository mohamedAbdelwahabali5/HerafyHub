// footer.component.ts
import { Component, OnInit } from '@angular/core';
import { UsersService } from '../../Services/users.service';
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

  constructor(
    private userService: UsersService,
    private footerService: FooterService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) { }

  ngOnInit() {
    this.loadCategories();
    this.checkAuthStatus();
    this.setupRouteListener();
  }

  private checkAuthStatus() {
    this.isLoggedIn = this.userService.isLoggedIn();
  }

  private setupRouteListener() {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.handleRouteChange();
      });
  }

  private handleRouteChange() {
    let route = this.activatedRoute;
    while (route.firstChild) route = route.firstChild;

    route.params.subscribe((params) => {
      const newCategoryId = params['categoryId'];
      if (newCategoryId && newCategoryId !== this.currentCategoryId) {
        this.currentCategoryId = newCategoryId;
        this.loadCategoryProducts(newCategoryId);
      } else if (!newCategoryId && this.currentCategoryId) {
        this.currentCategoryId = null;
        this.loadProducts();
      }
    });
  }

  loadCategories() {
    this.footerService.getCategories().subscribe({
      next: (data: any) => (this.categories = data || []),
      error: (error) => console.error('Categories error:', error),
    });
  }

  loadProducts() {
    this.footerService.getProducts().subscribe({
      next: (data: any) => (this.products = data.products?.slice(0, 5) || []),
      error: (error) => console.error('Products error:', error),
    });
  }

  loadCategoryProducts(categoryId: string) {
    this.footerService.getProductsByCategory(categoryId).subscribe({
      next: (data: any) => (this.products = data.products?.slice(0, 5) || []),
      error: (error) => console.error('Category products error:', error),
    });
  }
}
