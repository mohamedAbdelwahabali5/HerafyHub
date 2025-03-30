import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UsersService } from './users.service';
import { environment } from '../../environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class FavoriteService {

  // private readonly favorite_URL = 'http://localhost:5555/favorite/';
  // private readonly addToFavorite_URL = 'http://localhost:5555/favorite/add';
  private readonly apiUrl = environment.apiUrl;
  private readonly favorite_URL = `${this.apiUrl}/favorite/`;
  private readonly addToFavorite_URL = `${this.apiUrl}/favorite/add`;
  constructor(private http: HttpClient, private userService: UsersService) { }

//   private readonly favorite_URL = 'https://herafy-hub-api-wjex.vercel.app/favorite/';
//   private readonly addToFavorite_URL = 'https://herafy-hub-api-wjex.vercel.app/favorite/add';


  // Add product to favorites
  addProductToFavorite(productId: string): Observable<any> {
    const token = this.userService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    const body = { productId };
    return this.http.post<any>(this.addToFavorite_URL, body, { headers });
  }

  // Get all favorite products
  getAllFavorites(): Observable<any> {
    const token = this.userService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<any>(this.favorite_URL, { headers });
  }

  // Remove product from favorites
  removeFromFavorite(productId: string): Observable<any> {
    const token = this.userService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    const removeUrl = `${this.favorite_URL}remove/${productId}`;
    return this.http.delete<any>(removeUrl, { headers });
  }
  clearFavorites(): Observable<any> {
    const token = this.userService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    const clearUrl = `${this.favorite_URL}clear`;
    return this.http.delete<any>(clearUrl, { headers });
  }

}

