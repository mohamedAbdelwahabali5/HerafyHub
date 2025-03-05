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
  imports: [
    ProductCardComponent,
    CommonModule,
    FormsModule
  ]
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

  loadProducts() {
    this.loading = true;
    this.productService.getAllProducts(this.currentPage, this.pageSize, this.categoryId).subscribe({
      next: (response:any) => {
        this.products = response.products;
        console.log('Products fetched:', this.products);
        this.pageProducts = this.products;
        console.log('Page products:', this.pageProducts);
        this.totalPages = response.totalPages;
        // console.log('Total pages:', this.totalPages);
        this.totalProducts = response.totalProducts;
        // console.log('Total products:', this.totalProducts);
        this.loading = false;
        console.log("categoryId in product list",this.categoryId);
      },
      error: (err) => {
        console.error(err);
        this.err = err;
        this.loading = false;
        this.pageProducts = [];
      }
    });
  }

  // Other methods remain the same, just ensure no references to selectedCategoryId
  // loadProducts() {
  //   this.loading = true;
  //   this.productService.getAllProducts(this.currentPage, this.pageSize, this.categoryId).subscribe({
  //     next: (response: {
  //       products: any[],
  //       totalProducts: number,
  //       totalPages: number,
  //       currentPage: number
  //     }) => {
  //       // this.products = response.products;
  //       // this.pageProducts = this.products;
  //       // this.totalPages = response.totalPages;
  //       // this.totalProducts = response.totalProducts;
  //       // this.currentPage = response.currentPage;
  //       // this.loading = false;
  //       this.products = response.products;
  //       console.log("response.products",response.products);
  //       this.pageProducts = this.products;
  //       console.log("this.pageProducts",this.pageProducts);
  //       this.totalPages = response.totalPages;
  //       console.log("this.totalPages",this.totalPages);
  //       this.totalProducts = response.totalProducts;
  //       console.log("this.totalProducts",this.totalProducts);
  //       this.loading = false;
  //     },
  //     error: (err) => {
  //       console.error(err);
  //       this.err = err;
  //       this.loading = false;
  //       this.pageProducts = [];
  //     }
  //   });
  // }
  searchProduct() {
    const searchText = this.searchTerm.trim();

    if (searchText) {
      this.productService.SearchByTitle(searchText).subscribe(
        (response: any) => {
          this.searchedProducts = response.data;
          this.pageProducts = this.searchedProducts;
          this.calculateSearchPagination();
        },
        (error) => {
          console.error("Error fetching products:", error);
          this.pageProducts = [];
        }
      );
    } else {
      this.searchedProducts = [];
      this.loadProducts();
    }
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

    const sourceArray = this.searchedProducts.length > 0
      ? this.searchedProducts
      : this.products;

    this.pageProducts = sourceArray.slice(start, end);
  }

  get pageNumbers(): number[] {
    return Array.from(
      { length: this.totalPages },
      (_, index) => index + 1
    );
  }
}
