import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { User } from '../../Models/user.model';
import { UsersService } from '../../Services/users.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  
  submitted = false;
  isEditMode = false;
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  userData: User | null = null;
  isLoading = false;
  errorMessage: string | null = null;

  profileForm = new FormGroup({
    firstName: new FormControl('', [
      Validators.required,
      Validators.pattern('^[A-Za-z]+$'),
    ]),
    lastName: new FormControl('', [
      Validators.required,
      Validators.pattern('^[A-Za-z]+$'),
    ]),
    address: new FormControl('', [Validators.required]), // Changed from street to address
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
      Validators.email,
    ]),
    // Removed password field
  });

  constructor(private usersService: UsersService, private router:Router) {}

  ngOnInit() {
    if (!this.usersService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    this.loadUserProfile();
    this.disableForm();
  }

  loadUserProfile() {
    this.isLoading = true;
    this.errorMessage = null;
    
    if (!this.usersService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    this.usersService.getUserProfile().subscribe({
      next: (user) => {
        this.userData = user;
        this.patchFormWithUserData(user);
        this.isLoading = false;
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error loading profile:', err);
        this.errorMessage = err.error?.message || 'Failed to load profile';
        this.isLoading = false;
        
        if (err.status === 401) {
          this.router.navigate(['/login']);
        }
      }
    });
  }

  private patchFormWithUserData(user: User) {
    this.profileForm.patchValue({
      firstName: user.firstName,
      lastName: user.lastName,
      address: user.address,
      city: user.city,
      state: user.state,
      zipCode: user.zipCode,
      phone: user.phone,
      email: user.email
    });
    
    // Set the image preview from user data
    this.imagePreview = user.profileImage || 'images/img-preview.png';
  }

  toggleEditMode() {
    this.isEditMode = !this.isEditMode;
    if (this.isEditMode) {
      this.enableForm();
    } else {
      if (this.userData) {
        this.patchFormWithUserData(this.userData);
      }
      this.disableForm();
    }
  }

  disableForm() {
    this.profileForm.disable();
  }

  enableForm() {
    this.profileForm.enable();
    // this.profileForm.get('email')?.disable();
  }

  onSubmit() {
    this.submitted = true;
    this.errorMessage = null;
  
    // Log form validity and errors
    console.log('Form valid:', this.profileForm.valid);
    if (!this.profileForm.valid) {
      console.log('Form errors:', this.profileForm.errors);
      Object.keys(this.profileForm.controls).forEach(key => {
        const control = this.profileForm.get(key);
        if (control?.invalid) {
          console.log(`Field ${key} has errors:`, control.errors);
        }
      });
      return;
    }
  
    if (!this.userData) {
      console.error('No user data available');
      this.errorMessage = 'No user data available';
      return;
    }
  
    const formValue = this.profileForm.getRawValue();
    console.log('Form raw value:', formValue);
  
    const updatedUser: User = {
      ...this.userData,
      firstName: formValue.firstName!,
      lastName: formValue.lastName!,
      address: formValue.address!,
      city: formValue.city!,
      state: formValue.state!,
      zipCode: formValue.zipCode!,
      phone: formValue.phone!,
      email: formValue.email!

      // email: this.userData.email, // Using original email since field is disabled
    };
  
    console.log('Prepared update payload:', updatedUser);
    
    this.isLoading = true;
    
    this.usersService.updateUserProfile(updatedUser).subscribe({
      next: (response) => {
        console.log('Update successful:', response);
        this.isLoading = false;
        if (response.success) {
          this.userData = response.user;
          this.isEditMode = false;
          this.disableForm();
          alert('Profile updated successfully!');
        } else {
          this.errorMessage = response.message || 'Failed to update profile';
        }
      },
      error: (err: HttpErrorResponse) => {
        console.error('Update failed:', err);
        this.isLoading = false;
        
        if (err.status === 401) {
          this.errorMessage = 'Session expired. Please login again.';
          this.usersService.logout();
        } else if (err.status === 400) {
          // Bad request - show validation errors from server
          this.errorMessage = err.error?.message || 'Invalid data provided';
          if (err.error?.errors) {
            // Handle field-specific errors if available
            console.log('Field errors:', err.error.errors);
          }
        } else {
          this.errorMessage = err.error?.message || 'Error updating profile';
        }
      }
    });
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
      }
    }
    return '';
  }

  getFieldLabel(controlName: string): string {
    const labels: { [key: string]: string } = {
      firstName: 'First Name',
      lastName: 'Last Name',
      address: 'Address', // Updated label
      city: 'City',
      state: 'State',
      zipCode: 'Zip Code',
      phone: 'Phone',
      email: 'Email',
    };

    return labels[controlName] || controlName;
  }
  
  // Add this new method
  cancelEdit() {
    this.isEditMode = false;
    this.errorMessage = null;
    
    // Reset the form to original values
    if (this.userData) {
      this.patchFormWithUserData(this.userData);
    }
    
    // Reset any image changes
    this.selectedFile = null;
    this.imagePreview = this.userData?.profileImage || null;
    
    this.disableForm();
  }
}