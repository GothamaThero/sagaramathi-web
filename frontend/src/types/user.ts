export interface IUser {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ICreateUserInput {
  name: string;
  email: string;
  password?: string;
  role: string;
}

export interface IUpdateUserInput {
  name?: string;
  email?: string;
  password?: string;
  role?: string;
}
