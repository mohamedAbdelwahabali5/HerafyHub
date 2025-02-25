import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ProductService } from '../../Services/collection.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-category-info',
  imports: [CommonModule],
  templateUrl: './category-info.component.html',
  styleUrls: ['./category-info.component.css'],
  providers: [ProductService],
})
export class CategoryInfoComponent implements OnInit {
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

  changeCategory(event: any) {
    let clickedItem = event.target.closest('li');
    if (clickedItem) {
      console.log(clickedItem.textContent.trim());
      this.category = this.categories.find((cat: any) => {
        return cat.title === clickedItem.textContent.trim();
      });
      this.imagePath = this.category.image;
      this.title = this.category.title;
      this.description = this.category.description;
      // console.log('Unique Categories:', this.categories);
      // console.log('imagePath:', this.imagePath);
      if (this.imagecontainer) {
        this.imagecontainer.nativeElement.style.backgroundImage = `url(${this.imagePath})`;
      }

      console.log(this.category);
    }
  }
}
