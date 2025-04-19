import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
  ReactiveFormsModule,
} from '@angular/forms';
import { UsersService } from '../../Services/users.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import Swal, { SweetAlertIcon } from 'sweetalert2';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css',
})
export class ResetPasswordComponent implements OnInit {
  resetEmail: string = '';
  password: string = '';
  confirmedpassword: string = '';
  showPassword = false;
  showConfirmPassword = false;
  token: string = '';
  isLoading = false;

  constructor(
    private route: ActivatedRoute, 
    private usersService: UsersService, 
    private router: Router
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.token = params['token'];
    });
  }

  passwordMatchValidator(): ValidatorFn {
    return (formGroup: AbstractControl): ValidationErrors | null => {
      const password = formGroup.get('password');
      const confirmedPassword = formGroup.get('confirmedpassword');

      if (password && confirmedPassword && password.value !== confirmedPassword.value) {
        confirmedPassword.setErrors({ isNotMatch: true });
        return { mismatch: true };
      }
      return null;
    };
  }

  resetPasswordForm = new FormGroup({
    resetEmail: new FormControl('Appo@gmality.com', {
      validators: [Validators.required, Validators.email],
      nonNullable: true
    }),
    password: new FormControl('', [
      Validators.required,
      Validators.pattern(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/
      ),
    ]),
    confirmedpassword: new FormControl('', [Validators.required]),
  }, { validators: this.passwordMatchValidator() });

  onSubmit(): void {
    if (this.resetPasswordForm.valid) {
      // Prevent multiple submissions
      if (this.isLoading) return;

      this.isLoading = true;
      const formValues = {
        password: this.resetPasswordForm.get('password')?.value || '',
        confirmedpassword: this.resetPasswordForm.get('confirmedpassword')?.value || '',
      };

      this.usersService.resetPassword(this.token, formValues.password, formValues.confirmedpassword)
        .pipe(
          finalize(() => {
            this.isLoading = false;
          })
        )
        .subscribe({
          next: (response) => {
            this.showMessage('Password Reset Successful', 'You will be redirected to the login page', "success");
            setTimeout(() => {
              this.router.navigate(['/login']);
            }, 3000);

            this.resetPasswordForm.markAsPristine();
            this.resetPasswordForm.markAsUntouched();
          },
          error: (err) => {
            console.error('Error:', err);
            this.showMessage('Reset failed', err.error?.message || 'Failed to reset password... Please try again', "error");
          }
        });

    } else {
      this.markFormGroupTouched(this.resetPasswordForm);
    }
  }

  markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  returnToLogin() {
    // Prevent navigation if loading
    if (!this.isLoading) {
      this.router.navigate(['/login'], { skipLocationChange: false, replaceUrl: true });
    }
  }

  checkMatchingPassword() {
    // Prevent multiple submissions
    if (!this.isLoading) {
      this.onSubmit();
    }
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
