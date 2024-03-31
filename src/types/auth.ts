import { Role } from "./user";

export type Login = {
  username: string;
  password: string;
};

export type Register = {
  name: string;
  username: string;
  password: string;
  role: Role;

  email?: string;
  token?: string;
};
