import { Component, inject, signal } from "@angular/core";
import { RouterLink } from "@angular/router";
import { ApplicationService } from "../../../core/services/application.service";
import { MerchantApplication } from "../../../core/models/application.model";

@Component({
  standalone: true,
  imports: [RouterLink],
  template: `<h5>Assigned review queue</h5>
    <div class="card p-3">
      <div class="table-responsive">
        <table class="table">
          <thead>
            <tr>
              <th>Merchant</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            @for (a of items(); track a.id) {
              <tr>
                <td>{{ a.merchantName }}</td>
                <td>{{ a.status }}</td>
                <td>
                  <a
                    class="btn btn-sm btn-primary"
                    [routerLink]="['/applications', a.id]"
                    >Review</a
                  >
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="3">No assigned applications.</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
    @if (error()) {
      <div class="alert alert-danger mt-3">{{ error() }}</div>
    }`,
})
export class ReviewPanel {
  private api = inject(ApplicationService);
  items = signal<MerchantApplication[]>([]);
  error = signal("");
  constructor() {
    this.api.assigned().subscribe({
      next: (x) => this.items.set(x),
      error: () => this.error.set("Unable to load review queue."),
    });
  }
}
