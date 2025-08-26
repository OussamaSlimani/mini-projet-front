export interface Agent {
  userId?: string;
  username: string;
  fullName: string;
  gender: string;
  email: string;
  emailPec: string;
  dateOfBirth: string;
  lastLogin?: string | null;
  createdAt?: string;
  active: boolean;
  roles: Role[];
  userInfo: UserInfo;
  userAddress: UserAddress;
}

export interface Role {
  id?: number;
  name: string;
}

export interface UserInfo {
  id?: number;
  status: string;
  deleteDate?: string | null;
  adminUser: boolean;
  emailPecVerified: boolean;
  temporalPassword: boolean;
}

export interface UserAddress {
  id?: number;
  country: string;
  state: string;
  addressLine: string;
  zipCode: number;
}
