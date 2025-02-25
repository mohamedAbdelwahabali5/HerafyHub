import { Component } from '@angular/core';
import { CollectionService } from '../../Services/collection.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule,RouterModule],
  providers: [CollectionService],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  name: string = '';
  email: string = '';
  constructor() {}
  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(8),
      Validators.pattern(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/
      ),
    ]),
  });

  formCheack() {
    if (this.loginForm.valid) {
      console.log('ooooooooooooooooooooookkkkkkk');
    } else {
      console.log('nooooooot okkkkkkkk');
    }


  }
}
