import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User, RegisterResponse } from '../Models/user.model';
import { Observable, throwError } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { handleError } from '../Utils/handleError';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment.prod';


interface UpdateProfileResponse {
  success: boolean;
  message: string;
  user: User;
}

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
    return this.http.post<RegisterResponse>(`${this.apiUrlAuth}/register`, user).pipe(
      catchError(handleError)
    );
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

        if (error.status === 401) {
          errorMessage = 'Unauthorized. Please login again.';
          this.logout();
        } else if (error.error?.message) {
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
  resetPassword(token: string, password: string, confirmPassword: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrlAuth}/reset-password/${token}`, { password, confirmPassword });
  }


  // Update user profile (requires token)
  updateUserProfile(user: User): Observable<UpdateProfileResponse> {
    const token = this.getToken();
    if (!token) {
      this.logout();
      return throwError(() => new Error('No authentication token found'));
    }
  
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  
    // Prepare the payload according to backend expectations
    const payload = {
      firstName: user.firstName,
      lastName: user.lastName,
      address: user.address,
      city: user.city,
      state: user.state,
      zipCode: user.zipCode,
      phone: user.phone,
      email: user.email 
      // Note: Not including email since it shouldn't be changed
    };
  
    console.log('Sending update payload:', payload);
  
    return this.http.put<UpdateProfileResponse>(
      `${this.apiUrlAuth}/update-profile`, 
      payload,
      { headers }
    ).pipe(
      tap(response => {
        console.log('Update response:', response);
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Update error details:', error);
        let errorMessage = 'Failed to update profile';
  
        if (error.status === 400) {
          // Bad request - show validation errors
          errorMessage = error.error?.message || 'Invalid data provided';
        } else if (error.status === 401) {
          errorMessage = 'Unauthorized. Please login again.';
          this.logout();
        } else if (error.status === 404) {
          errorMessage = 'User not found';
        } else if (error.error?.message) {
          errorMessage = error.error.message;
        }
  
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  // Get authenticated user profile (requires token)
  // Add this method to decode JWT token
  private getPayload(token: string): any {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }
  
  // Update getUserProfile method
  // Add this constant at the top of the class
  private readonly defaultProfileImage = 'images/img-preview.png';
  
  // Update getUserProfile method to include default image
  getUserProfile(): Observable<User> {
    const token = this.getToken();
    if (!token) {
      return throwError(() => new Error('No token found'));
    }
  
    const PayloadToken = this.getPayload(token);
    if (!PayloadToken?.id) {
      return throwError(() => new Error('Invalid token'));
    }
  
    const headers = {
      'Authorization': `Bearer ${token}`
    };
  
    return this.http.get<{ success: boolean; user: User }>(
      `${this.apiUrlAuth}/users/${PayloadToken.id}`, 
      { headers }
    ).pipe(
      map(response => ({
        ...response.user,
        profileImage: response.user.profileImage || this.defaultProfileImage
      })),
      tap(user => {
        console.log('User profile loaded:', user);
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Error fetching profile:', error);
        let errorMessage = 'Failed to fetch user profile';
  
        if (error.status === 401) {
          errorMessage = 'Unauthorized. Please login again.';
          this.logout();
        } else if (error.status === 404) {
          errorMessage = 'User not found';
        } else if (error.error?.message) {
          errorMessage = error.error.message;
        }
  
        return throwError(() => new Error(errorMessage));
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
      return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
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
}

