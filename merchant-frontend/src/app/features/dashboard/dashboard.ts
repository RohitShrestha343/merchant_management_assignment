import { Component, DestroyRef, effect, inject, signal } from "@angular/core";
import { RouterLink } from "@angular/router";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { debounceTime, distinctUntilChanged } from "rxjs";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ApplicationService } from "../../core/services/application.service";
import { MerchantApplication } from "../../core/models/application.model";

@Component({
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule],
  template: ` <div class="">
    <div class="container-fluid py-4">
      <div class="row g-4">
        <!-- Total Applications -->
        <div class="col-xl-3 col-md-6 col-12">
          <div class="card border-0 shadow-sm rounded-4 p-3">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <p class="text-secondary mb-2">Total Merchant</p>
                <h2 class="fw-bold mb-2">7</h2>
                <small class="text-success">
                  <i class="bi bi-arrow-up"></i> 12.5% this month
                </small>
              </div>
              <div class="bg-primary-subtle text-primary rounded-3 p-3 fs-3">
                <i class="bi bi-file-earmark-text"></i>
              </div>
            </div>
          </div>
        </div>

        <!-- Pending Review -->
        <div class="col-xl-3 col-md-6 col-12">
          <div class="card border-0 shadow-sm rounded-4 p-3">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <p class="text-secondary mb-2">Reviewed</p>
                <h2 class="fw-bold mb-2">2</h2>
                <small class="text-warning">
                  <i class="bi bi-clock"></i>Reviewed
                </small>
              </div>
              <div class="bg-warning-subtle text-warning rounded-3 p-3 fs-3">
                <i class="bi bi-hourglass-split"></i>
              </div>
            </div>
          </div>
        </div>

        <!-- Approved -->
        <div class="col-xl-3 col-md-6 col-12">
          <div class="card border-0 shadow-sm rounded-4 p-3">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <p class="text-secondary mb-2">Approved</p>
                <h2 class="fw-bold mb-2">3</h2>
                <small class="text-success">
                  <i class="bi bi-check-circle"></i> Successfully approved
                </small>
              </div>
              <div class="bg-success-subtle text-success rounded-3 p-3 fs-3">
                <i class="bi bi-check-circle"></i>
              </div>
            </div>
          </div>
        </div>

        <!-- Rejected -->
        <div class="col-xl-3 col-md-6 col-12">
          <div class="card border-0 shadow-sm rounded-4 p-3">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <p class="text-secondary mb-2">Send for Information</p>
                <h2 class="fw-bold mb-2">5</h2>
                <small class="text-danger">
                  <i class="bi bi-x-circle"></i> Request information
                </small>
              </div>
              <div class="bg-danger-subtle text-danger rounded-3 p-3 fs-3">
                <i class="bi bi-x-circle"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="card p-3">
      <div class="row g-2 mb-3">
        <div class="col-md-8">
          <input
            class="form-control"
            [formControl]="search"
            placeholder="Search merchant or registration number"
          />
        </div>
        <div class="col-md-4">
          <select class="form-select" [formControl]="status">
            <option value="">All statuses</option>
            @for (s of statuses; track s) {
              <option [value]="s">{{ s }}</option>
            }
          </select>
        </div>
      </div>
      @if (loading()) {
        <div class="text-center p-4">
          <div class="spinner-border"></div>
          <p>Loading...</p>
        </div>
      }
      @if (error()) {
        <div class="alert alert-danger">
          {{ error() }}
          <button class="btn btn-sm btn-outline-danger" (click)="load()">
            Retry
          </button>
        </div>
      }
      @if (!loading() && !error()) {
        <div class="table-responsive">
          <table class="table table-hover align-middle">
            <thead>
              <tr>
                <th>Merchant</th>
                <th>Registration</th>
                <th>Business</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              @for (item of items(); track item.id) {
                <tr>
                  <td>{{ item.merchantName }}</td>
                  <td>{{ item.registrationNumber }}</td>
                  <td>{{ item.businessType }}</td>
                  <td>
                    <span class="badge text-bg-secondary">{{
                      item.status
                    }}</span>
                  </td>
                  <td>
                    <a
                      class="btn btn-sm btn-outline-primary"
                      [routerLink]="['/applications', item.id]"
                      >View</a
                    >
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="5" class="text-center text-secondary">
                    No applications found.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
        <div class="d-flex justify-content-between align-items-center">
          <small>Page {{ page() }} · {{ total() }} records</small>
          <div class="btn-group">
            <button
              class="btn btn-outline-primary"
              [disabled]="page() * limit >= total()"
              (click)="nextPage()"
            >
              Next
            </button>
            <button
              class="btn btn-outline-primary"
              [disabled]="page() <= 1"
              (click)="previousPage()"
            >
              Previous
            </button>
          </div>
        </div>
      }
    </div>
  </div>`,
})
export class Dashboard {
  private api = inject(ApplicationService);
  private destroyRef = inject(DestroyRef);
  items = signal<MerchantApplication[]>([]);
  total = signal(0);
  page = signal(1);
  limit = 10;

  nextPage(): void {
    if (this.page() * this.limit < this.total()) {
      this.page.update((value) => value + 1);
      this.load();
    }
  }

  previousPage(): void {
    if (this.page() > 1) {
      this.page.update((value) => value - 1);
      this.load();
    }
  }
  loading = signal(false);
  error = signal("");
  search = new FormControl("", { nonNullable: true });
  status = new FormControl("", { nonNullable: true });
  statuses = [
    "DRAFT",
    "SUBMITTED",
    "UNDER_REVIEW",
    "APPROVED",
    "REJECTED",
    "NEEDS_INFORMATION",
  ];

  constructor() {
    this.search.valueChanges
      .pipe(
        debounceTime(350),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        this.page.set(1);
        this.load();
      });
    this.status.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.page.set(1);
        this.load();
      });
    this.load();
  }
  load() {
    this.loading.set(true);
    this.error.set("");
    this.api
      .list(this.page(), this.limit, this.search.value, this.status.value)
      .subscribe({
        next: (r) => {
          this.items.set(r.items);
          this.total.set(r.total);
          this.loading.set(false);
        },
        error: () => {
          this.error.set("Unable to load applications.");
          this.loading.set(false);
        },
      });
  }
}
