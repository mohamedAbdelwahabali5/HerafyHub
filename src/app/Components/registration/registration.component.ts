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

@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  providers: [UsersService],
  templateUrl: './registration.component.html',
  styleUrl: './registration.component.css',
})
export class RegistrationComponent {
  constructor(private userService: UsersService) {}

  submitted = false;

  registrationForm = new FormGroup(
    {
      firstName: new FormControl('', [
        Validators.required,
        Validators.pattern('^[A-Za-z]+$'),
      ]),
      lastName: new FormControl('', [
        Validators.required,
        Validators.pattern('^[A-Za-z]+$'),
      ]),
      street: new FormControl('', [Validators.required]),
      city: new FormControl('', [Validators.required]),
      state: new FormControl('', [Validators.required]),
      phone: new FormControl('', [
        Validators.required,
        Validators.pattern('^[0-9]{10,15}$'),
      ]),
      zipCode: new FormControl('', [
        Validators.required,
        Validators.pattern('^[0-9]{2,5}$'),
      ]),
      email: new FormControl('', [
        Validators.required,
        Validators.pattern(/[a-zA-Z0-9_%+]+@[a-zA-Z0-9]+\.[a-zA-Z]{2,}/),
      ]),
      password: new FormControl('', [
        Validators.required,
        Validators.pattern(
          /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&_#])[A-Za-z\d@$!%*?&_#]{8,}$/
        ),
      ]),
      confirmPassword: new FormControl('', [Validators.required]),
    },
    { validators: this.passwordMatchValidator }
  );
  get f() {
    return this.registrationForm.controls;
  }

  passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  onSubmit() {
    this.submitted = true;

    if (this.registrationForm.invalid) {
      this.registrationForm.get('confirmPassword')?.markAsTouched();
      return;
    }
    if (this.registrationForm.valid) {
      const newUser: User = {
        name: {
          fName: this.registrationForm.value.firstName ?? '', // Corrected
          lName: this.registrationForm.value.lastName ?? '', // Corrected
        },
        email: this.registrationForm.value.email ?? '',
        phone: this.registrationForm.value.phone ?? '',
        address: {
          city: this.registrationForm.value.city ?? '',
          street: this.registrationForm.value.street ?? '',
          state: this.registrationForm.value.state ?? '',
          zipCode: this.registrationForm.value.zipCode ?? '', // Corrected
        },
        password: this.registrationForm.value.password ?? '',
      };

      this.userService.addUser(newUser).subscribe(() => {
        alert('User registered successfully!');
        this.registrationForm.reset();
      });
    }
  }
}
