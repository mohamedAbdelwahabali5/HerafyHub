import { Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
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
  @Output() categorySelected = new EventEmitter<string>(); // إرسال categoryId

  @ViewChild('imagecontainer') imagecontainer!: ElementRef;

  products!: any;
  categories!: any;
  category!: any;
  imagePath!: string;
  title!: string;
  description!: string;

  constructor(private productService: ProductService) {}
  ngOnInit() {
    this.productService.getAllCategories().subscribe({
      next: (data) => {
        // console.log('Data from API:', data);
        this.categories = data;
        this.imagePath = this.categories[0].image;
        this.title = 'Fashion';
        this.description =
          'Explore our stylish collection of clothing for men and women, featuring the latest trends and timeless classics.';
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  // changeCategory(event: any) {
  //   let clickedItem = event.target.closest('li');
  //   if (clickedItem) {
  //     console.log(clickedItem.textContent.trim());
  //     this.category = this.categories.find((cat: any) => {
  //       return cat.title === clickedItem.textContent.trim();
  //     });
  //     this.imagePath = this.category.image;
  //     this.title = this.category.title;
  //     this.description = this.category.description;
  //     // console.log('Unique Categories:', this.categories);
  //     // console.log('imagePath:', this.imagePath);
  //     if (this.imagecontainer) {
  //       this.imagecontainer.nativeElement.style.backgroundImage = `url(${this.imagePath})`;
  //     }

  //     console.log(this.category);
  //   }
  // }

  changeCategory(event: any) {
    let clickedItem = event.target.closest('li');
    if (clickedItem) {
      const selectedCategoryTitle = clickedItem.textContent.trim();
      const category = this.categories.find((cat: any) => cat.title === selectedCategoryTitle);
      if (category) {
        this.imagePath = category.image;
        this.title = category.title;
        this.description = category.description;

        // إرسال categoryId بدلاً من categoryTitle
        this.categorySelected.emit(category._id);
        console.log('Category ID:', category._id);
        if (this.imagecontainer) {
          this.imagecontainer.nativeElement.style.backgroundImage = `url(${this.imagePath})`;
        }
      }
    }
  }
}
