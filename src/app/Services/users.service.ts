import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User, RegisterResponse } from '../models/user.model';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { handleError } from '../Utils/handleError';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  // Update this URL to point to your Node.js backend auth routes
  private readonly apiUrl = 'http://localhost:5555/auth';

  constructor(private http: HttpClient) {}

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
          // Store the token in localStorage for authentication
          if (response && response.token) {
            localStorage.setItem('auth_token', response.token);
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

  // Logout user
  logout(): void {
    localStorage.removeItem('auth_token');
  }

  // Check if user is logged in
  isLoggedIn(): boolean {
    return !!localStorage.getItem('auth_token');
  }

  // Get authentication token
  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }
}
