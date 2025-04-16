import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { UsersService } from '../../Services/users.service';
import Swal, { SweetAlertIcon } from 'sweetalert2';
import { finalize } from 'rxjs/operators';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule, CommonModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css',
})
export class ForgotPasswordComponent {
  resetEmail: string = '';
  isLoading: boolean = false;

  constructor(private usersService: UsersService) { }

  resetPasswordForm = new FormGroup({
    resetEmail: new FormControl('', [Validators.required, Validators.email]),
  });

  checkEmail() {
    if (this.resetPasswordForm.valid) {
      this.isLoading = true;
      const email = this.resetPasswordForm.value.resetEmail as string;
      
      this.usersService.forgotPassword(email)
        .pipe(
          finalize(() => {
            this.isLoading = false;
          })
        )
        .subscribe({
          next: (response) => {
            this.showMessage('Check Your Email', response.message || 'Password reset link sent to your email!', "info");
          },
          error: (err) => {
            console.error('Error:', err);
            this.showMessage('Failed Process', 'Failed to send reset email.... Please try again', "error");
          }
        });
    } else {
      this.markFormGroupTouched(this.resetPasswordForm);
    }
  }

  // Helper to mark all controls as touched
  markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  private showMessage(title: string, message: string, icon: SweetAlertIcon): void {
    Swal.fire({
      title: title,
      text: message,
      icon: icon,
      showConfirmButton: false,
      timer: 3000
    });
  }
}
