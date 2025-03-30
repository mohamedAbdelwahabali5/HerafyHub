import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { UsersService } from '../../Services/users.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-contact',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css',
})
export class ContactComponent {
  constructor(
    private userService: UsersService,
    private toastr: ToastrService
  ) {}

  submitted = false;
  loading = false;
  success = false;
  errorMessage: string | null = null;

  contactForm = new FormGroup({
    firstName: new FormControl('', [
      Validators.required,
      Validators.pattern('^[A-Za-z]+$'),
    ]),
    lastName: new FormControl('', [
      Validators.required,
      Validators.pattern('^[A-Za-z]+$'),
    ]),
    email: new FormControl('', [
      Validators.required,
      Validators.pattern(/[a-zA-Z0-9_%+]+@[a-zA-Z0-9]+\.[a-zA-Z]{2,}/),
    ]),
    subject: new FormControl('', [Validators.required]),
    message: new FormControl('', [Validators.required]),
  });
  get formControls() {
    return this.contactForm.controls;
  }
  getErrorMessage(controlName: string): string {
    const control = this.contactForm.get(controlName);

    if (control?.errors?.['required']) {
      return `${this.getFieldLabel(controlName)} is required.`;
    }

    if (control?.errors?.['pattern']) {
      switch (controlName) {
        case 'firstName':
        case 'lastName':
          return 'Only letters allowed.';
        case 'phone':
          return 'Invalid phone number.';
        case 'zipCode':
          return 'Invalid zip code.';
        case 'email':
          return 'Invalid email format.';
        case 'password':
          return 'Must include uppercase, lowercase, number, and special character.';
      }
    }
    return '';
  }
  getFieldLabel(controlName: string): string {
    const labels: { [key: string]: string } = {
      firstName: 'First Name',
      lastName: 'Last Name',
      message: 'Message',
      subject: 'Subject',
      email: 'Email',
    };

    return labels[controlName] || controlName;
  }

  onSubmit(): void {
    this.submitted = true;
    this.errorMessage = null;

    if (this.contactForm.invalid) {
      this.toastr.warning('Please fill all required fields correctly');
      return;
    }

    this.loading = true;

    this.userService.sendContactMessage(this.contactForm.value).subscribe({
      next: () => {
        this.toastr.success('Your message has been sent successfully!');
        this.contactForm.reset();
        this.submitted = false;
      },
      error: (err) => {
        this.toastr.error(err.message || 'Failed to send message');
        this.loading = false;
      },
      complete: () => (this.loading = false),
    });
  }
}
