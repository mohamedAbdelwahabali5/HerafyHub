import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { UsersService } from '../../Services/users.service';
import Swal, { SweetAlertIcon } from 'sweetalert2';

@Component({
  selector: 'app-forgot-password',
  imports: [ReactiveFormsModule, RouterModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css',
})
export class ForgotPasswordComponent {
  resetEmail: string = '';
  constructor(private usersService: UsersService) { }
  resetPasswordForm = new FormGroup({
    resetEmail: new FormControl('', [Validators.required, Validators.email]),
  });

  checkEmail() {
    if (this.resetPasswordForm.valid) {
      const email = this.resetPasswordForm.value.resetEmail as string;
      this.usersService.forgotPassword(email).subscribe({
        next: (response) => {
          this.showMessage('Check Your Email', response.message || 'Password reset link sent to your email!', "info");

          // alert(response.message || 'Password reset link sent to your email!');
        },
        error: (err) => {
          console.error('Error:', err);
          this.showMessage('Failed Process', 'Failed to send reset email.... Please try again', "error");

          // alert('Failed to send reset email. Please try again.');
        }
      });
    } else {
      this.markFormGroupTouched(this.resetPasswordForm);
      console.log('Form is not valid');
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
      confirmButtonText: 'OK',
      confirmButtonColor: '#3D8D7A'
    });
  }
}
