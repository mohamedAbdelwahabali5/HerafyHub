import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {

  private readonly favorite_URL = 'http://localhost:5000/favorites';
   constructor(private http:HttpClient) {}
 
     addProductToCart(newCart: any): Observable<any> {
       return this.http.post<any>(this.favorite_URL, newCart);
     }
 
     getAllProducts() {
       return this.http.get(this.favorite_URL);
     }
     
}
