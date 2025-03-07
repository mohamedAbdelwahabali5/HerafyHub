import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  AbstractControl,
  ValidationErrors,
  ReactiveFormsModule,
} from '@angular/forms';
import { UsersService } from '../../Services/users.service';
import { User } from '../../Models/user.model';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  providers: [UsersService],
  templateUrl: './registration.component.html',
  styleUrl: './registration.component.css',
})
export class RegistrationComponent {
  constructor(private userService: UsersService, private router: Router) {}

  submitted = false;
  registrationError = '';
  loading = false;

  registrationForm = new FormGroup(
    {
      firstName: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(20),
        Validators.pattern('^[A-Za-z]+$'),
      ]),
      lastName: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(20),
        Validators.pattern('^[A-Za-z]+$'),
      ]),
      address: new FormControl('', [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(50),
      ]),
      city: new FormControl('', [
        Validators.minLength(3),
        Validators.maxLength(20),
      ]),
      state: new FormControl('', [
        Validators.minLength(3),
        Validators.maxLength(20),
      ]),
      phone: new FormControl('', [
        Validators.required,
        Validators.pattern(/^[0-9]{10,15}$/),
      ]),
      zipCode: new FormControl('', [Validators.pattern('^[0-9]{2,5}$')]),
      email: new FormControl('', [
        Validators.required,
        Validators.pattern(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/),
      ]),
      password: new FormControl('', [
        Validators.required,
        Validators.pattern(
          /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&#_])[A-Za-z\d@$!%*?&#_]{8,}$/
        ),
      ]),
      confirmPassword: new FormControl('', [Validators.required]),
    },
    { validators: this.passwordMatchValidator }
  );

  get formControls() {
    return this.registrationForm.controls;
  }

  passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  onSubmit() {
    this.submitted = true;
    this.registrationError = '';

    // Mark all fields as touched to trigger validation
    Object.keys(this.registrationForm.controls).forEach((key) => {
      const control = this.registrationForm.get(key);
      control?.markAsTouched();
    });

    if (this.registrationForm.invalid) {
      console.log('Form is invalid', this.registrationForm.errors);
      return;
    }

    this.loading = true;
    const formValues = this.registrationForm.value;

    const newUser: User = {
      firstName: formValues.firstName || '',
      lastName: formValues.lastName || '',
      email: formValues.email || '',
      phone: formValues.phone || '',
      address: formValues.address || '', // Map street to address for backend
      city: formValues.city || '',
      state: formValues.state || '',
      zipCode: formValues.zipCode || '',
      password: formValues.password || '',
    };

    console.log('Submitting user:', newUser);

    this.userService.addUser(newUser).subscribe({
      next: (response) => {
        this.loading = false;
        alert('Registration successful!');
        this.router.navigate(['/login']);
      },
      error: (error) => {
        this.loading = false;
        this.registrationError = error.message || 'Registration failed';
        alert(this.registrationError);
      },
    });
  }

  getErrorMessage(controlName: string): string {
    const control = this.registrationForm.get(controlName);

    if (control?.errors?.['required']) {
      return `${this.getFieldLabel(controlName)} is required.`;
    }

    if (control?.errors?.['minlength']) {
      const minLength = control.errors?.['minlength'].requiredLength;
      return `${this.getFieldLabel(
        controlName
      )} must be at least ${minLength} characters.`;
    }

    if (control?.errors?.['maxlength']) {
      const maxLength = control.errors?.['maxlength'].requiredLength;
      return `${this.getFieldLabel(
        controlName
      )} must be less than ${maxLength} characters.`;
    }

    if (control?.errors?.['pattern']) {
      switch (controlName) {
        case 'firstName':
        case 'lastName':
          return 'Only letters allowed.';
        case 'address':
          return 'Address must be at least 10 characters long and max 50 characters';
        case 'phone':
          return 'Invalid phone number format (10-15 digits only).';
        case 'zipCode':
          return 'Invalid zip code format (3-5 digits only).';
        case 'email':
          return 'Invalid email format.';
        case 'password':
          return 'Password must be at least 8 characters and include uppercase, lowercase, number, and special character.';
      }
    }

    if (
      controlName === 'confirmPassword' &&
      this.registrationForm.errors?.['passwordMismatch']
    ) {
      return 'Passwords do not match.';
    }

    return '';
  }

  getFieldLabel(controlName: string): string {
    const labels: { [key: string]: string } = {
      firstName: 'First Name',
      lastName: 'Last Name',
      address: 'Street Address',
      city: 'City',
      state: 'State',
      zipCode: 'Zip Code',
      phone: 'Phone',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm Password',
    };

    return labels[controlName] || controlName;
  }
}
