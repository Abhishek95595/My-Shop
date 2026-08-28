export type EnquiryStatus = 'new' | 'contacted' | 'closed';

export interface CustomerEnquiry {
  id: string;
  name: string;
  mobile: string;
  categoryOrProduct: string;
  message?: string;
  status: EnquiryStatus;
  createdAt: string;
}

export interface CreateEnquiryInput {
  name: string;
  mobile: string;
  categoryOrProduct: string;
  message?: string;
}
