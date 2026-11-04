import { Component, inject, signal } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { AuthService } from "../../../core/services/auth.service";

@Component({
  standalone: true,
  imports: [ReactiveFormsModule],
  template: ` <div
    class="container min-vh-100 d-flex align-items-center justify-content-center"
  >
    <div class="card p-4 w-100" style="max-width:430px">
      <h5 class="mb-1">Merchant Portal</h5>
      <p class="text-secondary">Sign in to continue</p>
      @if (error()) {
        <div class="alert alert-danger">{{ error() }}</div>
      }
      <form [formGroup]="form" (ngSubmit)="login()">
        <label class="form-label">Email</label>
        <input class="form-control mb-3" formControlName="email" type="email" />
        <label class="form-label">Password</label>
        <input
          class="form-control mb-3"
          formControlName="password"
          type="password"
        />
        <button
          class="btn btn-primary w-100"
          [disabled]="form.invalid || loading()"
        >
          {{ loading() ? "Signing in..." : "Sign in" }}
        </button>
      </form>
      <hr />
      <small class="text-secondary"
        >Demo: sales@test.com / reviewer@test.com / admin@test.com<br />Password:
        password123</small
      >
    </div>
  </div>`,
})
export class Login {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  form = this.fb.group({
    email: ["sales@test.com", [Validators.required, Validators.email]],
    password: ["password123", Validators.required],
  });
  loading = signal(false);
  error = signal("");
  login() {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set("");
    this.auth
      .login(this.form.value.email!, this.form.value.password!)
      .subscribe({
        next: () => this.router.navigateByUrl("/dashboard"),
        error: (e) => {
          this.error.set(e.error?.message || "Login failed");
          this.loading.set(false);
        },
      });
  }
}
