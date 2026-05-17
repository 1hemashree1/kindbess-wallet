export enum KYCStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED'
}

export enum TransactionType {
  SEND = 'SEND',
  RECEIVE = 'RECEIVE',
  REQUEST = 'REQUEST',
  ADD = 'ADD'
}

export enum TransactionStatus {
  COMPLETED = 'COMPLETED',
  PENDING = 'PENDING',
  FAILED = 'FAILED'
}

export enum TaskStatus {
  OPEN = 'OPEN',
  ACCEPTED = 'ACCEPTED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export interface UserProfile {
  uid: string;
  fullName: string;
  email: string;
  kcxId: string;
  emovenNo: string;
  profilePhoto?: string;
  city?: string;
  state?: string;
  country?: string;
  kycStatus: KYCStatus;
  balance: number;
  referralCode: string;
  createdAt: any;
  updatedAt?: any;
}

export interface Transaction {
  id: string;
  fromId: string;
  toId: string;
  fromName?: string;
  toName?: string;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  note?: string;
  timestamp: any;
}

export interface Merchant {
  id: string;
  ownerId: string;
  businessName: string;
  category: string;
  address: string;
  lat?: number;
  lng?: number;
  photos?: string[];
  workingHours?: string;
  contact?: string;
  acceptsKCX: boolean;
  delivery?: boolean;
  verified: boolean;
  createdAt: any;
}

export interface KCCCTask {
  id: string;
  requesterId: string;
  workerId?: string;
  title: string;
  description: string;
  amount: number;
  status: TaskStatus;
  rating?: number;
  proofUrl?: string;
  createdAt: any;
  requesterName?: string;
}
