import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { MerchantApplication, PaginatedResponse } from '../models/application.model';

@Injectable({ providedIn: 'root' })
export class ApplicationService {
  private http = inject(HttpClient);

  list(page: number, limit: number, search: string, status: string) {
    let params = new HttpParams().set('page', page).set('limit', limit).set('search', search);
    if (status) params = params.set('status', status);
    return this.http.get<PaginatedResponse<MerchantApplication>>('/api/applications', { params });
  }
  get(id: string) { return this.http.get<MerchantApplication>(`/api/applications/${id}`); }
  create(data: Partial<MerchantApplication>) {
    return this.http.post<MerchantApplication>('/api/applications', data);
  }
  update(id: string, data: Partial<MerchantApplication>) {
    return this.http.patch<MerchantApplication>(`/api/applications/${id}`, data);
  }
  saveDraft(id: string, data: unknown) {
    return this.http.patch<MerchantApplication>(`/api/applications/${id}/draft`, data);
  }
  submit(id: string) { return this.http.post<MerchantApplication>(`/api/applications/${id}/submit`, {}); }
  history(id: string) { return this.http.get<any[]>(`/api/applications/${id}/history`); }
  assigned() { return this.http.get<MerchantApplication[]>('/api/reviews/assigned'); }
  decide(id: string, body: { decision: string; comments: string; riskLevel: string; riskScore: number }) {
    return this.http.post(`/api/reviews/${id}/decision`, body);
  }
  reviewers() { return this.http.get<any[]>('/api/admin/reviewers'); }
  assign(applicationId: string, reviewerId: string) {
    return this.http.post('/api/admin/assignments', { applicationId, reviewerId });
  }
}
