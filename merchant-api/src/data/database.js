export const users = [
  { id: 'USR-1', name: 'Sales User', email: 'sales@test.com', password: 'password123', role: 'SALES' },
  { id: 'USR-2', name: 'Reviewer User', email: 'reviewer@test.com', password: 'password123', role: 'REVIEWER' },
  { id: 'USR-3', name: 'Administrator', email: 'admin@test.com', password: 'password123', role: 'ADMIN' }
];

export const applications = [
  {
    id:'APP-001', merchantName:'Himalayan Traders', registrationNumber:'REG-1001', businessType:'Retail',
    address:'Kathmandu, Nepal', contactPerson:'Ram Sharma', email:'ram@example.com', phone:'9800000001',
    bankName:'Example Bank', accountHolder:'Himalayan Traders', accountNumber:'123456789012', branch:'Kathmandu',
    status:'SUBMITTED', createdBy:'USR-1', assignedReviewer:'USR-2', createdAt:new Date().toISOString(), updatedAt:new Date().toISOString()
  },
  {
    id:'APP-002', merchantName:'Sunrise Store', registrationNumber:'REG-1002', businessType:'Wholesale',
    address:'Lalitpur, Nepal', contactPerson:'Sita Rai', email:'sita@example.com', phone:'9800000002',
    bankName:'Example Bank', accountHolder:'Sunrise Store', accountNumber:'987654321012', branch:'Lalitpur',
    status:'DRAFT', createdBy:'USR-1', createdAt:new Date().toISOString(), updatedAt:new Date().toISOString()
  }
];
export const history = [
  {id:'H-1',applicationId:'APP-001',action:'Application submitted',performedBy:'Sales User',createdAt:new Date().toISOString()}
];
export const assignments = [{applicationId:'APP-001',reviewerId:'USR-2'}];
