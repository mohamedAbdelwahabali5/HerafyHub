import { Component, ElementRef, QueryList, ViewChildren } from '@angular/core';
import { ProductService } from '../../Services/collection.service';
import { ProductCardComponent } from '../product-card/product-card.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Import FormsModule

@Component({
  selector: 'app-products-list',
  imports: [ProductCardComponent, CommonModule, FormsModule],
  templateUrl: './products-list.component.html',
  styleUrl: './products-list.component.css',
})
export class ProductsListComponent {
  products!: any;
  pageProducts!: any;
  searchedProducts!: any;
  searchTerm!: string;
  categories!: any;
  ProImage!: any;
  ProCurrentprice!: number;
  ProTitle!: string;
  ProDescription!: string;
  imagePath!: string;
  currentPage = 0; // Initial page   0 1 2

  loading: boolean = true;
  err:any=null

  constructor(private productService: ProductService) {}
  ngOnInit() {
    this.loading = true;
    this.productService.getAllProducts().subscribe({
      next: (data) => {
        this.products = data;
        this.pageProducts = this.products.slice(0, 8);
        // console.log('this.products', this.products);
        this.loading = false; // Set loading to false on success
      },
      error: (err) => {
        console.log(err);
        this.err = err; // Set err to the error object or message
        this.loading = false; // Set loading to false on error
        this.pageProducts = [];
      },
    });
  }

  // Pagination
  changePage(event: any): void {
    // const paginationList = document.querySelector('.pagination');
    // const allPageLinks = paginationList?.querySelectorAll('.page-link');

    // // Remove active class from all spans
    // allPageLinks?.forEach((link) => {
    //   link.classList.remove('li-active');
    // });

    const page = event.target.textContent;
    this.currentPage = parseInt(page) - 1;
    this.updatePageProducts();
    this.updateActivePageLink(event.target);
    console.log('this.currentPage', this.currentPage);
  }

  nextPage(event: any): void {
    if (this.currentPage >= 2) {
      return;
    }
    this.currentPage++;
    this.updatePageProducts();
    const nextLink = this.getNextPageLink();
    if (nextLink) {
      this.updateActivePageLink(nextLink);
    }
    console.log('this.currentPage', this.currentPage);
  }

  prevPage(event: any): void {
    if (this.currentPage <= 0) {
      return;
    }
    this.currentPage--;
    this.updatePageProducts();
    const prevLink = this.getPreviousPageLink();
    if (prevLink) {
      this.updateActivePageLink(prevLink);
    }
    console.log('this.currentPage', this.currentPage);
  }
  //
// searchProduct(event: any): void {
  //   const searchText = this.searchTerm.toLowerCase();
  //   // this.searchedProducts = this.pageProducts.filter(
  //   //   (product: { title: string }) =>
  //   //     product.title.toLowerCase().includes(searchText)
  //   // );
  //   this.searchedProducts =this.productService.SearchByTitle(searchText).subscribe();
  //   console.log("this.searchedProducts = ",this.searchedProducts);

  //   if (searchText) {
  //     this.pageProducts =
  //       this.searchedProducts.slice(0, 8) || this.searchedProducts;
  //   } else {
  //     this.updatePageProducts();
  //   }
  // }

  searchProduct(event: any): void {
    const searchText = this.searchTerm.trim(); // Remove extra whitespace

    if (searchText) {
      this.productService.SearchByTitle(searchText).subscribe(
        (data: any) => {
          this.searchedProducts = data;
          console.log(`Found ${this.searchedProducts.length} products matching "${searchText}"`);


          // Make sure we're getting a subset if needed
          this.pageProducts = this.searchedProducts.slice(0, 8);
        },
        (error) => {
          console.error("Error fetching products:", error);
        }
      );
    } else {
      // If search is empty, reset to showing all products
      this.updatePageProducts();
    }
  }
  // Update the products for the current page
  updatePageProducts(): void {
    const start = this.currentPage * 8;
    const end = start + 8;
    this.pageProducts = this.products.slice(start, end);
  }

  // Get the next page link element
  getNextPageLink(): HTMLElement | null {
    const paginationList = document.querySelector('.pagination');
    const activeSpanElement = paginationList?.querySelector(
      '.page-link.li-active'
    );
    const activeLiElement = activeSpanElement?.parentElement;
    return (
      activeLiElement?.nextElementSibling?.querySelector('.page-link') || null
    );
  }
  // Get the previous page link element
  getPreviousPageLink(): HTMLElement | null {
    const paginationList = document.querySelector('.pagination');
    const activeSpanElement = paginationList?.querySelector(
      '.page-link.li-active'
    );
    const activeLiElement = activeSpanElement?.parentElement;
    return (
      activeLiElement?.previousElementSibling?.querySelector('.page-link') ||
      null
    );
  }
  // Update the active page link in the pagination UI
  updateActivePageLink(activeLink: HTMLElement | null): void {
    if (activeLink) {
      const paginationList = document.querySelector('.pagination');
      const allPageLinks = paginationList?.querySelectorAll('.page-link');

      // Remove active class from all spans
      allPageLinks?.forEach((link) => {
        link.classList.remove('li-active');
      });

      // Add active class to the clicked page link
      activeLink.classList.add('li-active');
    }
  }
}
