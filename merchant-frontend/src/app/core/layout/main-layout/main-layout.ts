import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
  <header class="navbar navbar-dark bg-dark px-3">
    <a class="navbar-brand" routerLink="/dashboard">Merchant Portal</a>
    <div class="text-white d-flex align-items-center gap-3">
      <span>{{ auth.user()?.name }} ({{ auth.role() }})</span>
      <button class="btn btn-sm btn-outline-light" (click)="logout()">Logout</button>
    </div>
  </header>
  <div class="page-shell d-flex">
    <aside class="sidebar p-3">
      <a routerLink="/dashboard" routerLinkActive="active">Dashboard</a>
      <a routerLink="/applications" routerLinkActive="active">Applications</a>
      @if (auth.hasRole(['REVIEWER','ADMIN'])) {
        <a routerLink="/review" routerLinkActive="active">Review Queue</a>
      }
      @if (auth.hasRole(['ADMIN'])) {
        <a routerLink="/admin/assignments" routerLinkActive="active">Assignments</a>
      }
    </aside>
    <main class="content-area p-3 p-md-4"><router-outlet /></main>
  </div>`
})
export class MainLayout {
  auth = inject(AuthService);
  logout() { this.auth.logout(); location.href = '/login'; }
}
