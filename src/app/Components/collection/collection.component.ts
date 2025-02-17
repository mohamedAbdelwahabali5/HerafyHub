import { Component } from '@angular/core';
import { CollectionService } from '../../Services/collection.service';

@Component({
  selector: 'app-collection',
  imports: [],
  providers: [CollectionService],
  templateUrl: './collection.component.html',
  styleUrl: './collection.component.css',
})
export class CollectionComponent {
  products: any;
  constructor(private collectionService: CollectionService) {}

  ngOnInit() {
    this.collectionService.getAll().subscribe({
      next: (data) => {
        console.log(data);
        this.products = (data as any[]).slice(0, 9).map((product) => ({
          ...product,
          title:
            product.title.length > 50
              ? product.title.substring(0, 30) + '...'
              : product.title,
        }));
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
}
