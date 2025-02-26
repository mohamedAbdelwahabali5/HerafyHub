import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from '../models/user.model';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private readonly usersUrl = 'http://localhost:3000/users';

  constructor(private http: HttpClient) {}

  // Get all users
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.usersUrl);
  }

  // Get a single user by ID
  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.usersUrl}/${id}`);
  }

  // Add a new user
  addUser(user: User): Observable<User> {
    return this.getAllUsers().pipe(
      switchMap((users) => {
        // Find the maximum id in the existing users
        const maxId = users.reduce((max, user) => {
          const userId = Number(user.id);
          return userId > max ? userId : max;
        }, 0);

        // Assign the new id (maxId + 1)
        user.id = maxId + 1; // Assign as a number

        // Check if the user already exists
        if (users.find((u) => u.email === user.email)) {
          alert('User already exists');
          return throwError(() => new Error('User already exists'));
        }

        // Add the new user
        return this.http.post<User>(this.usersUrl, user);
      }),
      catchError((error) => {
        console.error('Error adding user:', error);
        alert('Error adding user: ' + error.message);
        return throwError(() => error);
      })
    );
  }

  // Update an existing user
  updateUser(id: number, user: User): Observable<User> {
    return this.http.put<User>(`${this.usersUrl}/${id}`, user);
  }

  // Delete a user
  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.usersUrl}/${id}`);
  }
}
