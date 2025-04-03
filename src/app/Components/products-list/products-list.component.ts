import { Component, Input } from '@angular/core';
import { ProductService } from '../../Services/collection.service';
import { ProductCardComponent } from '../product-card/product-card.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-products-list',
  templateUrl: './products-list.component.html',
  styleUrl: './products-list.component.css',
  standalone: true,
  imports: [ProductCardComponent, CommonModule, FormsModule],
})
export class ProductsListComponent {
  @Input() categoryId: string = ''; // Changed from selectedCategoryId to categoryId
  products: any[] = [];
  pageProducts: any[] = [];
  searchedProducts: any[] = [];
  searchTerm: string = '';

  // Pagination Properties
  currentPage: number = 1;
  totalPages: number = 0;
  totalProducts: number = 0;
  pageSize: number = 12;
  loading: boolean = true;
  err: any = null;
  constructor(private productService: ProductService) {}
  ngOnInit() {
    this.loadProducts();
  }

  // Add this new method to detect category changes
  ngOnChanges(changes: any) {
    if (changes.categoryId) {
      this.currentPage = 1; // Reset to first page when category changes
      this.loadProducts();
    }
  }
  loadProducts() {
    this.loading = true;
    console.log('Category ID in ProductsListComponent:', this.categoryId);
    if (this.categoryId != 'allProducts') {
      this.productService
        .getProductsCategory(this.currentPage, this.pageSize, this.categoryId)
        .subscribe({
          next: (response: any) => {
            this.products = response.products;
            this.pageProducts = this.products;
            this.totalPages = response.totalPages;
            this.totalProducts = response.totalProducts;
            this.loading = false;
          },
          error: (err) => {
            console.error(err);
            this.err = err;
            this.loading = false;
            this.pageProducts = [];
          },
        });
    } else {
      this.productService.getAllProducts().subscribe({
        next: (response: any) => {
          this.products = response.products;
          this.totalProducts = response.totalProducts;
          // console.log('All products fetched:', this.products);
          (this.totalPages = Math.ceil(this.totalProducts / this.pageSize)),
            // console.log('Total pages:', this.totalPages);
            (this.pageProducts = this.products.slice(
              (this.currentPage - 1) * this.pageSize,
              this.pageSize * this.currentPage
            ));
          // console.log('this.pageSize:', this.pageSize);
          // console.log('this.currentPage:', this.currentPage);
          // console.log('Page products:', this.pageProducts);
          this.loading = false;
        },
        error: (err) => {
          console.error(err);
          this.err = err;
          this.loading = false;
          this.pageProducts = [];
        },
      });
    }
  }

  searchProduct() {
    const searchText = this.searchTerm.trim();

    if (searchText) {
      this.productService
        .searchByTitleInCategory(searchText, this.categoryId)
        .subscribe(
          (response: any) => {
            this.searchedProducts = response.data;
            this.pageProducts = this.searchedProducts;

            //note: remember to update the pagination when sorting or filtering results
            this.calculateSearchPagination();
          },
          (error) => {
            console.error('Error fetching products:', error);
            this.pageProducts = [];
          }
        );
    } else {
      this.searchedProducts = [];
      this.loadProducts();
    }
  }

  sort(event: any) {
    // console.log('event.target', event.target.innerText);
    // console.log('event', event);
    // console.log('Sorted prices:', this.pageProducts.map(product => product.currentprice));

    if (event.target.innerText === 'Low to High') {
      this.products.sort((a, b) => a.currentprice - b.currentprice);
    } else if (event.target.innerText === 'High to Low') {
      this.products.sort((a, b) => b.currentprice - a.currentprice);
    }

    // console.log('Sorted prices after sort:', this.pageProducts.map(product => product.currentprice));
  }

  calculateSearchPagination() {
    this.totalProducts = this.searchedProducts.length;
    this.totalPages = Math.ceil(this.totalProducts / this.pageSize);
    this.currentPage = 1;
  }

  changePage(page: number) {
    this.currentPage = page;
    this.loadProducts();
    this.updatePageProducts();
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadProducts();
      this.updatePageProducts();
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadProducts();
      this.updatePageProducts();
    }
  }

  updatePageProducts() {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;

    const sourceArray =
      this.searchedProducts.length > 0 ? this.searchedProducts : this.products;

    this.pageProducts = sourceArray.slice(start, end);
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, index) => index + 1);
  }
}
