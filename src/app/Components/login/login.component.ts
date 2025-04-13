import { Component } from '@angular/core';
import { ProductService } from '../../Services/collection.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { UsersService } from '../../Services/users.service';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterModule, CommonModule, FormsModule],
  providers: [ProductService],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  name: string = '';
  email: string = '';

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
      const email = this.loginForm.controls['email'].value || '';
      const password = this.loginForm.controls['password'].value || '';
      const rememberMe = this.loginForm.controls['rememberMe'].value || false;

      this.userServ.loginUser(email, password).subscribe({
        next: (response) => {
          // console.log('Login successful', response);
          // console.log(response.success);
          if (response.success) {
            this.userServ.setToken(response.token, rememberMe);
            // console.log("rememberMe", rememberMe);

            this.router.navigate(['/home']);
          } else {
            this.showLoginError('Login failed', 'Invalid credentials... Please try again');
          }
        },
        error: (error: any) => {
          // console.log('Login failed', error.message);
          this.showLoginError('Login Error', error.message || 'Unable to connect to the server... Please try again later');
        }
      });
    } else {
      // console.log('Form validation failed');
      this.loginForm.markAllAsTouched(); // Mark all fields as touched to trigger validation errors
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
