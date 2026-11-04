import { Component, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ApplicationService } from "../../../core/services/application.service";

@Component({
  standalone: true,
  imports: [FormsModule],
  template: `<h5>Reviewer assignments</h5>
    <div class="card p-3">
      <label class="form-label">Application ID</label
      ><input
        class="form-control mb-2"
        [(ngModel)]="applicationId"
        placeholder="APP-001"
      />
      <label class="form-label">Reviewer</label
      ><select class="form-select mb-3" [(ngModel)]="reviewerId">
        <option value="">Select reviewer</option>
        @for (r of reviewers(); track r.id) {
          <option [value]="r.id">{{ r.name }} ({{ r.email }})</option>
        }
      </select>
      <button
        class="btn btn-primary align-self-start"
        (click)="assign()"
        [disabled]="!applicationId || !reviewerId"
      >
        Assign reviewer
      </button>
      @if (message()) {
        <p class="mt-3 mb-0">{{ message() }}</p>
      }
    </div>`,
})
export class AssignmentManagement {
  private api = inject(ApplicationService);
  reviewers = signal<any[]>([]);
  applicationId = "";
  reviewerId = "";
  message = signal("");
  constructor() {
    this.api.reviewers().subscribe((x) => this.reviewers.set(x));
  }
  assign() {
    this.api.assign(this.applicationId, this.reviewerId).subscribe({
      next: () => this.message.set("Reviewer assigned."),
      error: () => this.message.set("Assignment failed."),
    });
  }
}
