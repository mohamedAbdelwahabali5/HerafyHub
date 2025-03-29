import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User, RegisterResponse } from '../Models/user.model';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { handleError } from '../Utils/handleError';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment.prod';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  // Update this URL to point to your Node.js backend auth routes
  // private readonly apiUrl = 'https://herafy-hub-api.vercel.app/auth'; // old url doesn't work
  // private readonly apiUrl = 'https://herafy-hub-api-wjex.vercel.app/auth';
  private readonly apiUrl = environment.apiUrl;
  private readonly apiUrlAuth = `${this.apiUrl}/auth`;
  // private readonly apiUrl = 'http://localhost:5555/auth/';
  private storageType: Storage | null = null;
  constructor(private http: HttpClient, private router: Router) {
    if (typeof window !== 'undefined') {
      this.storageType = sessionStorage;
    }
  }

  // users.service.ts
  addUser(user: User): Observable<RegisterResponse> {
    return this.http
      .post<RegisterResponse>(`${this.apiUrlAuth}/register`, user)
      .pipe(catchError(handleError));
  }

  // Login user
  loginUser(email: string, password: string): Observable<any> {
    return this.http
      .post<any>(`${this.apiUrlAuth}/login`, { email, password })
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
  // reset password
  forgotPassword(email: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrlAuth}/forgot-password`, { email });
  }

  // Verify email token for password reset
  resetPassword(
    token: string,
    password: string,
    confirmPassword: string
  ): Observable<any> {
    return this.http.post<any>(`${this.apiUrlAuth}/reset-password/${token}`, {
      password,
      confirmPassword,
    });
  }

  // Get authenticated user profile (requires token)
  getUserProfile(): Observable<User> {
    return this.http.get<User>(`${this.apiUrlAuth}/profile`).pipe(
      catchError((error) => {
        console.error('Error fetching user profile:', error);
        return throwError(() => new Error('Failed to fetch user profile'));
      })
    );
  }
  // Update user profile (requires token)
  updateUserProfile(user: User): Observable<User> {
    return this.http.put<User>(`${this.apiUrlAuth}/profile`, user).pipe(
      catchError((error) => {
        console.error('Error updating user profile:', error);
        return throwError(() => new Error('Failed to update user profile'));
      })
    );
  }
  // Delete user (requires token)
  deleteUser(): Observable<any> {
    return this.http.delete<any>(`${this.apiUrlAuth}/profile`).pipe(
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
    if (typeof window !== 'undefined' && localStorage) {
      return (
        localStorage.getItem('authToken') || sessionStorage.getItem('authToken')
      );
    }
    return null;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logout() {
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('authToken');
    this.router.navigate(['/login']);
  }

  getCategories(): Observable<any[]> {
    return this.http
      .get<any[]>(`${this.apiUrl}/category`)
      .pipe(catchError(handleError));
  }

  getProducts(): Observable<any[]> {
    return this.http
      .get<any[]>(`${this.apiUrl}/product`)
      .pipe(catchError(handleError));
  }
}
