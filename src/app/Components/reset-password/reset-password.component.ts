import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { UsersService } from '../../Services/users.service';
import { ActivatedRoute, Router } from '@angular/router';
import Swal, { SweetAlertIcon } from 'sweetalert2';

@Component({
  selector: 'app-reset-password',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css',
})
export class ResetPasswordComponent {
  resetEmail: string = '';
  password: string = '';
  confirmedpassword: string = '';
  showPassword = false;
  showConfirmPassword = false;
  token: string = '';

  constructor(private route: ActivatedRoute, private usersService: UsersService, private router: Router) {

  }

  //get token from queryParams
  ngOnInit() {
    this.route.params.subscribe(params => {
      // console.log("Query Params:", params);
      this.token = params['token'];
      console.log("Extracted Token:", this.token);
    });
  }

  // Define your validator to match the expected signature
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

  // Submit form handler
  onSubmit(): void {
    if (this.resetPasswordForm.valid) {
      const formValues = {
        password: this.resetPasswordForm.get('password')?.value || '',
        confirmedpassword: this.resetPasswordForm.get('confirmedpassword')?.value || '',
      };

      console.log("Sending request with:", {
        token: this.token,
        password: formValues.password,
        confirmedpassword: formValues.confirmedpassword,
      });
      this.usersService.resetPassword(this.token, formValues.password, formValues.confirmedpassword)
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
            this.showMessage('Reset failed', 'Failed to reset password... Please try again', "error");
          }
        });

    } else {
      console.log('Form is invalid. Please check the fields.');
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

  returnToLogin() {
    console.log('logic of returnToLogin');
    this.router.navigate(['/login'], { skipLocationChange: false, replaceUrl: true });

  }
  checkMatchingPassword() {
    this.onSubmit();
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
