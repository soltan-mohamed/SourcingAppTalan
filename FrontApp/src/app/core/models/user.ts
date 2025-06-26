import { Role } from './role';

export class User {
  id!: number;
  fullName!: string;
  email!: string;
  password!: string;
  createdAt!: Date;
  updatedAt!: Date;
  role!: Role;
  token!: string;
}
