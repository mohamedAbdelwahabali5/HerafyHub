import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent implements OnInit {
  submitted = false;
  selectedFile: File | null = null;
  imagePreview: string | null = null;

  profileForm = new FormGroup({
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
    zipCode: new FormControl('', [
      Validators.required,
      Validators.pattern('^[0-9]{5,10}$'),
    ]),
    phone: new FormControl('', [
      Validators.required,
      Validators.pattern('^[0-9]{10,15}$'),
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
  });

  get f() {
    return this.profileForm.controls;
  }

  ngOnInit() {
    // You can load user data here
    this.loadUserProfile();
  }

  loadUserProfile() {
    // Simulate loading user data
    const userData = {
      firstName: 'Mostafa',
      lastName: 'Bolbol',
      street: 'Omar Ibn Al-Khatab',
      city: 'Zagazig',
      state: 'Egypt',
      zipCode: '055',
      phone: '01122334455',
      email: 'bolbol@gmail.com',
      password: 'Mo_123456',
    };
    this.profileForm.patchValue(userData);
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  onDeletePicture() {
    this.selectedFile = null;
    this.imagePreview = null;
  }

  onSubmit() {
    this.submitted = true;
    if (this.profileForm.valid) {
      console.log('Profile Updated Successfully', this.profileForm.value);
      // Add your API call here
    }
  }
}
