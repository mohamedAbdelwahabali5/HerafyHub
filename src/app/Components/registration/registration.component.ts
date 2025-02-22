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

@Component({
  selector: 'app-registration',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './registration.component.html',
  styleUrl: './registration.component.css',
})
export class RegistrationComponent {
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
        Validators.pattern('^[0-9]{5,10}$'),
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
    if (this.registrationForm.valid) {
      console.log('Form Submitted Successfully', this.registrationForm.value);
    }
  }
}
