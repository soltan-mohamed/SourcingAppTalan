import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthService, Role, User } from '@core';
import { UnsubscribeOnDestroyAdapter } from '@shared';
import { finalize } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field'; // This includes error messages
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule, // This is all you need for error messages
    MatInputModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatCheckboxModule
  ]
})
export class SigninComponent extends UnsubscribeOnDestroyAdapter implements OnInit {
  authForm: FormGroup;
  loading = false;
  error = '';
  hide = true;
  rememberMe = false;
  selectedRole: Role | null = null; // Add this line


  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    super();
    this.authForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  ngOnInit() {
    // Check for remembered user
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      this.authForm.patchValue({ email: rememberedEmail });
      this.rememberMe = true;
    }

    // Redirect if already logged in
    if (this.authService.currentUserValue) {
      this.redirectBasedOnRoles(this.authService.currentUserValue.roles);
    }
  }

  navigateToForgotPassword() {
  this.router.navigate(['/authentication/forgot-password']);
}

onSubmit() {
  if (this.authForm.invalid) {
    this.markFormAsTouched();
    return;
  }

  this.loading = true;
  this.error = '';

  const { email, password } = this.authForm.value;

  // Handle remember me functionality
  if (this.rememberMe) {
    localStorage.setItem('rememberedEmail', email);
  } else {
    localStorage.removeItem('rememberedEmail');
  }

  this.subs.sink = this.authService.login(email, password)
    .pipe(finalize(() => this.loading = false))
    .subscribe({
      error: (error) => {
        console.error('Login error:', error);
        this.handleLoginError(error);
      }
      // Removed the next handler since AuthService now handles navigation
    });
}

  private markFormAsTouched() {
    Object.values(this.authForm.controls).forEach(control => {
      control.markAsTouched();
    });
  }

  private handleSuccessfulLogin(user: User) {
    if (!user?.roles?.length) {
      console.error('User has no roles');
      this.error = 'Invalid user roles';
      return;
    }
    this.redirectBasedOnRoles(user.roles);
  }

  private redirectBasedOnRoles(roles: Role[]): void {
    if (roles.includes(Role.MANAGER)) {
      this.router.navigate(['/manager/dashboard']);
    } else if (roles.includes(Role.EVALUATEUR)) {
      this.router.navigate(['/evaluateur/dashboard']);
    } else if (roles.includes(Role.RECRUTEUR)) {
      this.router.navigate(['/home']);
    } else {
      this.router.navigate(['/authentication/signin']);
    }
  }

  private handleLoginError(error: any) {
    this.error = this.getErrorMessage(error);
  }

  private getErrorMessage(error: any): string {
    if (error.error?.message) {
      return error.error.message;
    }
    if (error.status === 401) {
      return 'Invalid email or password';
    }
    if (error.status === 0) {
      return 'Network error. Please check your connection.';
    }
    return 'An unexpected error occurred. Please try again later.';
    
  }

}