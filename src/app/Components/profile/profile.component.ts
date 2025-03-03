import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { User } from '../../models/user.model';
import { UsersService } from '../../Services/users.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  providers: [UsersService],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent implements OnInit {
  submitted = false;
  isEditMode = false;
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  userData: User | null = null;

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
      Validators.pattern('^[0-9]{2,5}$'),
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

  get formControls() {
    return this.profileForm.controls;
  }
  getErrorMessage(controlName: string): string {
    const control = this.profileForm.get(controlName);

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
      street: 'Street',
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

  constructor(private usersService: UsersService) {}

  ngOnInit() {
    this.loadUserProfile();
    this.disableForm();
  }

  // loadUserProfile() {
  //   // Simulate loading user data
  //   const userData = {
  //     firstName: 'Mostafa',
  //     lastName: 'Bolbol',
  //     street: 'Omar Ibn Al-Khatab',
  //     city: 'Zagazig',
  //     state: 'Egypt',
  //     zipCode: '055',
  //     phone: '01122334455',
  //     email: 'bolbol@gmail.com',
  //     password: 'Mo_123456',
  //   };
  //   this.profileForm.patchValue(userData);
  // }
  loadUserProfile() {
    // Simulate loading user data
    this.usersService.getUserById(1).subscribe((user) => {
      this.userData = user;
      this.profileForm.patchValue(user);
    });
  }
  disableForm() {
    this.profileForm.disable();
  }

  enableForm() {
    this.profileForm.enable();
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
  toggleEditMode() {
    this.isEditMode = !this.isEditMode;
    if (this.isEditMode) {
      this.enableForm();
    } else {
      this.disableForm();
    }
  }
  onSubmit() {
    this.submitted = true;

    if (this.profileForm.valid && this.userData) {
      const updatedUser: User = {
        ...this.userData, // Spread existing user data
        name: {
          fName: this.profileForm.value.firstName!, // Use form value for first name
          lName: this.profileForm.value.lastName!, // Use form value for last name
        },
        address: {
          street: this.profileForm.value.street!,
          city: this.profileForm.value.city!,
          state: this.profileForm.value.state!,
          zipCode: this.profileForm.value.zipCode!,
        },
        phone: this.profileForm.value.phone!,
        email: this.profileForm.value.email!,
        password: this.profileForm.value.password!,
      };

      this.usersService.updateUser(1, updatedUser).subscribe({
        next: () => {
          alert('Profile updated successfully!');
          this.isEditMode = false;
          this.disableForm();
        },
        error: (err) => {
          alert('Error updating profile: ' + err.message);
        },
      });
    }
  }
}
