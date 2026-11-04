import { Component, DestroyRef, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { JsonPipe } from '@angular/common';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, map, switchMap, catchError, of, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ApplicationService } from '../../../core/services/application.service';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, JsonPipe],
  template: `
  <h2>New Merchant Application</h2>
  <div class="card p-3 p-md-4">
    <div class="d-flex justify-content-between mb-3"><strong>Step {{ step()+1 }} of 4</strong><span class="text-secondary">{{ saveState() }}</span></div>
    <div class="progress mb-4"><div class="progress-bar" [style.width.%]="(step()+1)*25"></div></div>
    <form [formGroup]="form">
      @if (step()===0) {
        <div formGroupName="business">
          <h5>Business information</h5>
          <label class="form-label">Merchant name</label><input class="form-control mb-2" formControlName="merchantName">
          @if (invalid('business.merchantName')) { <small class="text-danger">Merchant name is required.</small> }<br/>
          <label class="form-label">Registration number</label><input class="form-control mb-2" formControlName="registrationNumber">
          <label class="form-label">Business type</label><select class="form-select mb-2" formControlName="businessType"><option value="">Choose</option><option>Retail</option><option>Wholesale</option><option>Services</option><option>Manufacturing</option></select>
          <label class="form-label">Address</label><textarea class="form-control" formControlName="address"></textarea>
        </div>
      }
      @if (step()===1) {
        <div formGroupName="contact"><h5>Contact information</h5>
          <label class="form-label">Contact person</label><input class="form-control mb-2" formControlName="contactPerson">
          <label class="form-label">Email</label><input class="form-control mb-2" formControlName="email">
          <label class="form-label">Phone</label><input class="form-control" formControlName="phone">
        </div>
      }
      @if (step()===2) {
        <div formGroupName="bank"><h5>Bank information</h5>
          <label class="form-label">Bank name</label><input class="form-control mb-2" formControlName="bankName">
          <label class="form-label">Account holder</label><input class="form-control mb-2" formControlName="accountHolder">
          <label class="form-label">Account number</label><input class="form-control mb-2" formControlName="accountNumber">
          <label class="form-label">Branch</label><input class="form-control" formControlName="branch">
        </div>
      }
      @if (step()===3) {
        <h5>Review and submit</h5>
        <pre class="bg-light p-3 rounded text-wrap">{{ form.getRawValue() | json }}</pre>
        <p class="text-secondary">Please verify the information before submitting.</p>
      }
    </form>
    @if (message()) { <div class="alert alert-warning mt-3">{{ message() }}</div> }
    <div class="d-flex justify-content-between mt-4">
      <button class="btn btn-outline-secondary" (click)="previous()" [disabled]="step()===0">Previous</button>
      <div class="d-flex gap-2">
        <button class="btn btn-outline-primary" (click)="saveDraft()">Save draft</button>
        @if (step()<3) { <button class="btn btn-primary" (click)="next()">Next</button> }
        @else { <button class="btn btn-success" (click)="submit()">Submit</button> }
      </div>
    </div>
  </div>`
})
export class ApplicationWizard {
  private fb = inject(FormBuilder);
  private api = inject(ApplicationService);
  private destroyRef = inject(DestroyRef);
  private router = inject(Router);
  step = signal(0); draftId: string | null = null;
  saveState = signal('Not saved'); message = signal('');
  form = this.fb.group({
    business: this.fb.group({
      merchantName: ['', Validators.required], registrationNumber: ['', Validators.required],
      businessType: ['', Validators.required], address: ['', Validators.required]
    }),
    contact: this.fb.group({
      contactPerson: ['', Validators.required], email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^\+?[0-9]{7,15}$/)]]
    }),
    bank: this.fb.group({
      bankName: ['', Validators.required], accountHolder: ['', Validators.required],
      accountNumber: ['', Validators.required], branch: ['', Validators.required]
    })
  });

  constructor() {
    this.form.valueChanges.pipe(
      debounceTime(1000),
      map(() => this.form.getRawValue()),
      distinctUntilChanged((a,b) => JSON.stringify(a) === JSON.stringify(b)),
      tap(() => this.saveState.set('Saving...')),
      switchMap(value => this.ensureDraft().pipe(
        switchMap(app => this.api.saveDraft(app.id, value)),
        map(() => 'Saved'),
        catchError(() => of('Save failed — form data is retained'))
      )),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(state => this.saveState.set(state));
  }

  private ensureDraft() {
    if (this.draftId) return of({ id: this.draftId });
    return this.api.create({ status: 'DRAFT' }).pipe(
      tap(app => this.draftId = app.id)
    );
  }
  invalid(path: string) { const c = this.form.get(path); return !!c && c.invalid && c.touched; }
  private groupNames = ['business','contact','bank'];
  next() {
    const group = this.form.get(this.groupNames[this.step()]);
    group?.markAllAsTouched();
    if (group?.invalid) return;
    this.step.update(v => Math.min(3, v+1));
  }
  previous() { this.step.update(v => Math.max(0,v-1)); }
  saveDraft() {
    this.ensureDraft().pipe(switchMap(app => this.api.saveDraft(app.id,this.form.getRawValue()))).subscribe({
      next: () => this.saveState.set('Saved'),
      error: () => this.message.set('Draft could not be saved. Your entered values remain on this page.')
    });
  }
  submit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) { this.message.set('Please complete all required fields.'); return; }
    this.ensureDraft().pipe(
      switchMap(app => this.api.saveDraft(app.id,this.form.getRawValue())),
      switchMap(app => this.api.submit(app.id))
    ).subscribe({
      next: () => this.router.navigateByUrl('/applications'),
      error: () => this.message.set('Submission failed. Please try again.')
    });
  }
}
