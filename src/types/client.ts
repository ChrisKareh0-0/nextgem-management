export interface Client {
  _id: string;
  companyName: string;
  contactName: string;
  phone: string;
  email?: string;
  subscriptionDate: string;
  subscriptionStatus: 'active' | 'ended';
  subscriptionEndDate?: string;
  paymentDueDate: {
    day: number;
    month?: number;
  };
  lastPaymentDate?: string;
  quotationFile: string | null;
  quotationAmount: number;
  createdAt?: string;
  updatedAt?: string;
} 