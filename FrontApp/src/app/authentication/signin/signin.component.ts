import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthService, Role, User } from '@core';
import { UnsubscribeOnDestroyAdapter } from '@shared';
import { finalize } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
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
    MatFormFieldModule,
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
      this.redirectBasedOnRole(this.authService.currentUserValue.role);
    }
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
    if (!user?.role) {
      console.error('User role is undefined'); // Debug log
      this.error = 'Invalid user role';
      return;
    }
    this.redirectBasedOnRole(user.role);
  }

private redirectBasedOnRole(role: Role) {
  const roleRoutes = {
    [Role.RECRUTEUR]: '/recruteur', // Changé pour correspondre à la structure des routes
    [Role.EVALUATEUR]: '/evaluateur',
    [Role.MANAGER]: '/manager'
  };

  const targetRoute = roleRoutes[role] || '/recruteur/dashboard/main';
  this.router.navigateByUrl(targetRoute)
    .then(success => {
      if (!success) {
        console.error(`Failed to navigate to ${targetRoute}`);
        this.router.navigate(['/recruteur/dashboard/main']);
      }
    });
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