import { Injectable, computed, inject, signal } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { tap } from "rxjs";
import { User } from "../models/user.model";

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

@Injectable({ providedIn: "root" })
export class AuthService {
  private http = inject(HttpClient);
  private currentUser = signal<User | null>(this.readUser());
  readonly user = this.currentUser.asReadonly();
  readonly role = computed(() => this.currentUser()?.role ?? null);

  private readUser(): User | null {
    try {
      return JSON.parse(
        sessionStorage.getItem("user") || "null",
      ) as User | null;
    } catch {
      return null;
    }
  }

  login(email: string, password: string) {
    return this.http
      .post<LoginResponse>("/api/auth/login", { email, password })
      .pipe(
        tap((res) => {
          sessionStorage.setItem("accessToken", res.accessToken);
          sessionStorage.setItem("refreshToken", res.refreshToken);
          sessionStorage.setItem("user", JSON.stringify(res.user));
          this.currentUser.set(res.user);
        }),
      );
  }

  getAccessToken() {
    return sessionStorage.getItem("accessToken");
  }
  getRefreshToken() {
    return sessionStorage.getItem("refreshToken");
  }
  updateTokens(accessToken: string, refreshToken?: string) {
    sessionStorage.setItem("accessToken", accessToken);
    if (refreshToken) sessionStorage.setItem("refreshToken", refreshToken);
  }
  hasRole(roles: string[]) {
    return roles.includes(this.role() ?? "");
  }
  logout() {
    sessionStorage.clear();
    this.currentUser.set(null);
  }
}
