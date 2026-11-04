export type ApplicationStatus = 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'NEEDS_INFORMATION';
export interface MerchantApplication {
  id: string;
  merchantName: string;
  registrationNumber: string;
  businessType: string;
  address: string;
  contactPerson: string;
  email: string;
  phone: string;
  bankName: string;
  accountHolder: string;
  accountNumber: string;
  branch: string;
  status: ApplicationStatus;
  createdBy: string;
  assignedReviewer?: string;
  createdAt: string;
  updatedAt: string;
  riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH';
  riskScore?: number;
  reviewComment?: string;
}
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}
