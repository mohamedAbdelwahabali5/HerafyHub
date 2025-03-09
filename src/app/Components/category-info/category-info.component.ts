
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { ProductService } from '../../Services/collection.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-category-info',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './category-info.component.html',
  styleUrls: ['./category-info.component.css'],
  providers: [ProductService],
})
export class CategoryInfoComponent implements OnInit {
  @Input() selectedCategory: any;
  @Output() categorySelected = new EventEmitter<string>();

  products!: any;
  categories!: any;
  category!: any;
  imagePath: string = 'https://res.cloudinary.com/dojq1nxqw/image/upload/v1741223343/Welcome_to_our_platform_e1kxy1.jpg';
  title: string = 'Welcome to our Platform';
  description: string = 'We are proud to offer you the finest local products and handicrafts carefully crafted by skilled artisans';

  constructor(private productService: ProductService) {}

  ngOnInit() {
    this.productService.getAllCategories().subscribe({
      next: (data) => {
        this.categories = data;
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['selectedCategory'] && changes['selectedCategory'].currentValue) {
      const category = changes['selectedCategory'].currentValue;
      this.updateCategoryDisplay(category);
    }
  }

  private updateCategoryDisplay(category: any) {
    if (category) {
      this.imagePath = category.image;
      this.title = category.title;
      this.description = category.description;
    } else {
      // Reset to default values
      this.imagePath = 'https://res.cloudinary.com/dojq1nxqw/image/upload/v1741223343/Welcome_to_our_platform_e1kxy1.jpg';
      this.title = 'Welcome to our Platform';
      this.description = 'We are proud to offer you the finest local products and handicrafts carefully crafted by skilled artisans';
    }
  }

  changeCategory(event: any) {
    let clickedItem = event.target.closest('li');
    if (clickedItem) {
      const selectedCategoryTitle = clickedItem.textContent.trim();

      // Handle "All Products" case
      if (selectedCategoryTitle === 'All Products') {
        this.updateCategoryDisplay(null);
        this.categorySelected.emit('allProducts');
        return;
      }

      const category = this.categories.find((cat: any) => cat.title === selectedCategoryTitle);
      if (category) {
        this.updateCategoryDisplay(category);
        this.categorySelected.emit(category._id);
      }
    }
  }
}
