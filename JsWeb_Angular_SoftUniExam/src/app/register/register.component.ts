import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { AuthService } from '../core/services/auth.service'; // Import your AuthService
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';  // Import Router to handle navigation

// Custom validator for password matching
function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');

  if (password && confirmPassword && password.value !== confirmPassword.value) {
    return { passwordsDontMatch: true };
  }

  return null;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule], // Add CommonModule to imports
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  registerForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    confirmPassword: new FormControl('', [Validators.required]),
  }, { validators: passwordMatchValidator }); // Add custom validator

  constructor(private authService: AuthService,
    private router: Router
  ) { }

  onRegister() {
    if (this.registerForm.valid) {
      const { email, password } = this.registerForm.value;

      // Ensure email and password are not null or undefined
      if (email && password) {
        this.authService.register(email, password).subscribe({
          next: (response) => {
            console.log('Registration successful:', response);
            // Redirect or show success message after registration.
            this.router.navigate(['/movies/catalog']);
          },
          error: (err) => {
            console.error('Registration error:', err);
          }
        });
      } else {
        console.error('Email or password is missing');
      }
    } else {
      console.log('Form is invalid');
    }
  }

}
