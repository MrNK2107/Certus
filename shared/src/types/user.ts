import { UserRole } from './enums';

export interface User {
  userId: string;
  name: string;
  email: string;
  role: UserRole;
  team?: string;
  branch?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  createdAt: string;
}

export interface Team {
  teamId: string;
  name: string;
  branchId: string;
  members: string[];
  reviewerRouting?: string;
}

export interface Branch {
  branchId: string;
  name: string;
  code: string;
  region?: string;
  portfolioOwners?: string[];
}
