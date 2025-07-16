import { Role } from './role';

export class User {
  id!: number;
  email!: string;
  password!: string;
  fullName!: string;
  role!: Role;
  token!: string;
}

/*import { Role } from './role';

export class User {
  id!: number;
  fullName!: string;
  email!: string;
  password!: string;
  createdAt!: Date;
  updatedAt!: Date;
  roles!: Role[];
  token!: string;
}*/