import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User, RegisterResponse } from '../Models/user.model';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { handleError } from '../Utils/handleError';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  // Update this URL to point to your Node.js backend auth routes
  private readonly apiUrl = 'https://herafy-hub-api.vercel.app/auth';
  private storageType: Storage | null = null;
  constructor(private http: HttpClient, private router: Router) {
    if (typeof window !== 'undefined') {
      this.storageType = sessionStorage;
    }

  }

  // users.service.ts
  addUser(user: User): Observable<RegisterResponse> {

    return this.http.post<RegisterResponse>(`${this.apiUrl}/register`, user).pipe(
      catchError(handleError)
    );
  }


  // Login user
  loginUser(email: string, password: string): Observable<any> {
    return this.http
      .post<any>(`${this.apiUrl}/login`, { email, password })
      .pipe(
        tap((response) => {
          // Store the token in sessionStorage for authentication
          if (response && response.token) {
            this.setToken(response.token, false);
          }
        }),

        catchError((error) => {
          console.error('Login error:', error);
          let errorMessage = 'Login failed';

          if (error.error && error.error.message) {
            errorMessage = error.error.message;
          }

          return throwError(() => new Error(errorMessage));
        })
      );
  }

  // Get authenticated user profile (requires token)
  getUserProfile(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/profile`).pipe(
      catchError((error) => {
        console.error('Error fetching user profile:', error);
        return throwError(() => new Error('Failed to fetch user profile'));
      })
    );
  }
  // Update user profile (requires token)
  updateUserProfile(user: User): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/profile`, user).pipe(
      catchError((error) => {
        console.error('Error updating user profile:', error);
        return throwError(() => new Error('Failed to update user profile'));
      })
    );
  }
  // Delete user (requires token)
  deleteUser(): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/profile`).pipe(
      catchError((error) => {
        console.error('Error deleting user:', error);
        return throwError(() => new Error('Failed to delete user'));
      })
    );
  }

  setToken(token: string, rememberMe: boolean = false) {
    if (rememberMe) {
      localStorage.setItem('authToken', token);
      this.storageType = localStorage;
    } else {
      sessionStorage.setItem('authToken', token);
      this.storageType = sessionStorage;
    }
  }
  getToken(): string | null {
    return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logout() {
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('authToken');
    this.router.navigate(['/login']);
  }
}

