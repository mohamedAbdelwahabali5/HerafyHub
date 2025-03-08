import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from '../models/user.model';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  // Update this URL to point to your Node.js backend auth routes
  private readonly apiUrl = 'http://localhost:5555/auth';

  constructor(private http: HttpClient) {}

  // users.service.ts
  addUser(user: User): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, user).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'Registration failed';

        if (error.status === 400) {
          // Handle Zod validation errors
          if (error.error?.errors) {
            const messages = error.error.errors.map(
              (e: any) => `${e.path.join('.')}: ${e.message}`
            );
            errorMessage = messages.join('\n');
          } else if (error.error?.message) {
            errorMessage = error.error.message;
          }
        }

        return throwError(() => new Error(errorMessage));
      })
    );
  }
  // addUser(user: User): Observable<any> {
  //   // Map the Angular user model to match the expected format in your Node backend
  //   const backendUser = {
  //     firstName: user.firstName,
  //     lastName: user.lastName,
  //     email: user.email,
  //     address: user.address,
  //     city: user.city || '',
  //     state: user.state || '',
  //     zipCode: user.zipCode || '',
  //     phone: user.phone,
  //     password: user.password,
  //     role: user.role || 'user',
  //   };

  //   console.log('Sending user to backend:', backendUser);

  //   return this.http.post<any>(`${this.apiUrl}/register`, backendUser).pipe(
  //     tap((response) => console.log('User registered successfully:', response)),
  //     catchError((error) => {
  //       console.error('Error registering user:', error);
  //       let errorMessage = 'Failed to register user';

  //       // Handle specific error messages from backend
  //       if (error.error && error.error.message) {
  //         errorMessage = error.error.message;
  //       }

  //       return throwError(() => new Error(errorMessage));
  //     })
  //   );
  // }

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
