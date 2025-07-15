import { Role } from './role';

export class User {
  id!: number;
  email!: string;
  password!: string;
  fullName!: string;
  role!: Role;
  token!: string;
}
