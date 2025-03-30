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
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
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
  isPasswordResetLoading = false;

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

  });


  constructor(
    private usersService: UsersService, 
    private router: Router,
    private toastr: ToastrService
  ) {}

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
  
    if (!this.profileForm.valid) {
      return;
    }
  
    if (!this.userData) {
      this.errorMessage = 'No user data available';
      return;
    }
  
    const formValue = this.profileForm.getRawValue();
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
    };
  
    this.isLoading = true;
    
    this.usersService.updateUserProfile(updatedUser, this.selectedFile || undefined).subscribe({
      next: (response) => {
        this.toastr.success('Profile updated successfully');
        this.userData = response.user;
        
        // If a new profile image was uploaded
        if (response.user.profileImage) {
          this.imagePreview = response.user.profileImage;
        }
        
        this.patchFormWithUserData(response.user);
        this.isLoading = false;
      },
      error: (err: HttpErrorResponse) => {
        console.error('Update failed:', err);
        this.isLoading = false;
        
        if (err.status === 401) {
          this.errorMessage = 'Session expired. Please login again.';
          this.toastr.error(this.errorMessage || 'An error occurred', 'Error');
          this.usersService.logout();
        } else if (err.status === 400) {
          this.errorMessage = err.error?.message || 'Invalid data provided';
          this.toastr.error(this.errorMessage || 'An error occurred', 'Error');
        } else {
          this.errorMessage = err.error?.message || 'Error updating profile';
          this.toastr.error(this.errorMessage || 'An error occurred', 'Error');
        }
      }
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        this.toastr.error('File size should not exceed 10MB', 'Error');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.toastr.error('Please upload only image files', 'Error');
        return;
      }

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

  sendPasswordResetLink() {
    if (!this.userData?.email) {
      this.toastr.error('No email found', 'Error');
      return;
    }

    this.isPasswordResetLoading = true;
    this.usersService.sendPasswordResetLink(this.userData.email)
      .subscribe({
        next: (response) => {
          this.isPasswordResetLoading = false;
          this.toastr.success(
            'Password reset link sent to your email', 
            'Success'
          );
        },
        error: (error) => {
          this.isPasswordResetLoading = false;
          this.toastr.error(
            error.message || 'Failed to send reset link', 
            'Error'
          );
        }
      });
  }
}