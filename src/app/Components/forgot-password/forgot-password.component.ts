import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  imports: [ReactiveFormsModule,RouterModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css',
})
export class ForgotPasswordComponent {
  resetEmail: string = '';
  constructor() {}
  resetPasswordForm = new FormGroup({
    resetEmail: new FormControl('', [Validators.required, Validators.email]),
  });

  checkEmail() {
    if (this.resetPasswordForm.valid) {
      console.log('ooooooooooooooooooooookkkkkkk');
    } else {
      console.log('nooooooot okkkkkkkk');
    }
  }
}
