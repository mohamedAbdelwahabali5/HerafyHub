import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CategoryIdSerService {

  private categoryIdSource = new BehaviorSubject<string>('allProducts'); // default value
  currentCategoryId$ = this.categoryIdSource.asObservable();

  setCategoryId(id: string) {
    this.categoryIdSource.next(id);
  }
}
