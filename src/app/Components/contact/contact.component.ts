import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'app-contact',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css',
})
export class ContactComponent {
  submitted = false;
  // loading = false;

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
  get f() {
    return this.contactForm.controls;
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.contactForm.invalid) {
      return;
    }
    // this.loading = true;
  }
}
