import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApplicationService } from '../../../core/services/application.service';
import { AuthService } from '../../../core/services/auth.service';
import { MerchantApplication } from '../../../core/models/application.model';
import { maskValue } from '../../../core/utils/mask.util';

@Component({
  standalone: true,
  imports: [RouterLink],
  template: `
  <a routerLink="/applications">← Back to applications</a>
  @if (app(); as a) {
    <h2 class="mt-3">{{ a.merchantName }}</h2>
    <div class="card p-3 mb-3">
      <h5>Business information</h5>
      <p><b>Registration:</b> {{ a.registrationNumber }}</p>
      <p><b>Type:</b> {{ a.businessType }}</p>
      <p><b>Address:</b> {{ a.address }}</p>
      <h5>Contact information</h5>
      <p>{{ a.contactPerson }} · {{ a.email }} · {{ a.phone }}</p>
      <h5>Bank information</h5>
      <p>{{ a.bankName }} · {{ a.accountHolder }}</p>
      <p><b>Account:</b> {{ revealed() && canReveal() ? a.accountNumber : (a.accountNumber || '') }}
        @if (canReveal()) { <button class="btn btn-outline-secondary ms-2" (click)="toggleReveal()">
  {{ revealed() ? 'Hide' : 'Show' }}
</button> }
      </p>
      <p><b>Status:</b> <span class="badge text-bg-info">{{ a.status }}</span></p>
    </div>
    @if (canReview()) {
      <div class="card p-3 mb-3">
        <h5>Risk decision</h5>
        <label class="form-label">Risk level</label>
        <select class="form-select mb-2" #risk><option>LOW</option><option>MEDIUM</option><option>HIGH</option></select>
        <label class="form-label">Risk score (0–100)</label><input class="form-control mb-2" type="number" #score value="20" min="0" max="100">
        <label class="form-label">Comments</label><textarea class="form-control mb-3" #comment></textarea>
        <div class="d-flex gap-2">
          <button class="btn btn-success" (click)="decide('APPROVED',risk.value,+score.value,comment.value)">Approve</button>
          <button class="btn btn-danger" (click)="decide('REJECTED',risk.value,+score.value,comment.value)">Reject</button>
          <button class="btn btn-warning" (click)="decide('NEEDS_INFORMATION',risk.value,+score.value,comment.value)">Request information</button>
        </div>
      </div>
    }
    @if (history().length) { <div class="card p-3"><h5>Risk / status history</h5>@for (h of history(); track h.id) { <p class="mb-1">{{ h.action }} — {{ h.performedBy }} <small class="text-secondary">{{ h.createdAt }}</small></p> } </div> }
  } @else { <p>Loading application...</p> }
  @if (error()) { <div class="alert alert-danger mt-3">{{ error() }}</div> }
  `

  
}

)
export class ApplicationDetail {

  
  private route = inject(ActivatedRoute);
  private api = inject(ApplicationService);
  private auth = inject(AuthService);
  app = signal<MerchantApplication | null>(null);
  history = signal<any[]>([]);
  error = signal('');
  revealed = signal(false);
  toggleReveal(): void {
  this.revealed.update(value => !value);
}
  canReview = computed(() => this.auth.hasRole(['REVIEWER','ADMIN']));
  canReveal = computed(() => this.auth.hasRole(['REVIEWER','ADMIN']));
  constructor() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.api.get(id).subscribe({ next: a => this.app.set(a), error: () => this.error.set('Unable to load application.') });
    this.api.history(id).subscribe({ next: h => this.history.set(h), error: () => {} });
  }
  decide(decision: string, riskLevel: string, riskScore: number, comments: string) {
    this.api.decide(this.app()!.id,{decision,riskLevel,riskScore,comments}).subscribe({
      next: () => { this.api.get(this.app()!.id).subscribe(a => this.app.set(a)); this.api.history(this.app()!.id).subscribe(h => this.history.set(h)); },
      error: () => this.error.set('Decision could not be saved. Check reviewer assignment and application status.')
    });
  }
}
