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

@Component({
  selector: 'app-reset-password',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css',
})
export class ResetPasswordComponent  {
  resetEmail: string = '';
  password: string = '';
  confirmedpassword: string = '';
  showPassword = false;
  showConfirmPassword = false;

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




  // Toggle password visibility
  // togglePasswordVisibility(inputId: string): void {
  //   if (inputId === 'newPassword') {
  //     this.showPassword = !this.showPassword;
  //   } else if (inputId === 'confirmPassword') {
  //     this.showConfirmPassword = !this.showConfirmPassword;
  //   }
  // }

  // Submit form handler
  onSubmit(): void {
    if (this.resetPasswordForm.valid) {
      console.log('ooooooooooooooooooooookkkkkkk');

      // Get form values
      const formValues = {
        password: this.resetPasswordForm.get('password')?.value,
        confirmedpassword: this.resetPasswordForm.get('confirmedpassword')?.value
      };

      console.log('Form submitted:', formValues);

      // Reset form values
      this.resetPasswordForm.reset();
    } else {
      console.log('nooooooot okkkkkkkk');
      // Mark all fields as touched to trigger validation messages
      // this.markFormGroupTouched(this.resetPasswordForm);
    }
  }

  // Helper to mark all controls as touched
  // markFormGroupTouched(formGroup: FormGroup): void {
  //   Object.values(formGroup.controls).forEach(control => {
  //     control.markAsTouched();
  //     if (control instanceof FormGroup) {
  //       this.markFormGroupTouched(control);
  //     }
  //   });
  // }

  // checkEmail() {
  //   this.onSubmit();
  // }
}
