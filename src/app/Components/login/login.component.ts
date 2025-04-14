import { Component } from '@angular/core';
import { ProductService } from '../../Services/collection.service';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { UsersService } from '../../Services/users.service';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule, CommonModule],
  providers: [ProductService],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  name: string = '';
  email: string = '';
  isLoading = false;

  constructor(private userServ: UsersService, private router: Router) { }

  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(8),
      Validators.pattern(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/
      ),
    ]),
    rememberMe: new FormControl(false)
  });

  formCheck() {
    if (this.loginForm.valid) {
      // Prevent multiple submissions
      if (this.isLoading) return;

      this.isLoading = true;
      const email = this.loginForm.controls['email'].value || '';
      const password = this.loginForm.controls['password'].value || '';
      const rememberMe = this.loginForm.controls['rememberMe'].value || false;

      this.userServ.loginUser(email, password)
        .pipe(
          finalize(() => {
            this.isLoading = false;
          })
        )
        .subscribe({
          next: (response) => {
            if (response.success) {
              this.userServ.setToken(response.token, rememberMe);
              this.router.navigate(['/home']);
            } else {
              this.showLoginError('Login failed', 'Invalid credentials... Please try again');
            }
          },
          error: (error: any) => {
            this.showLoginError('Login Error', error.error?.message || 'Unable to connect to the server... Please try again later');
          }
        });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }

  private showLoginError(title: string, message: string): void {
    Swal.fire({
      title: title,
      text: message,
      icon: 'error',
      showConfirmButton: false,
      timer: 3000
    });
  }
}
