export enum Role {
  GUEST = "guest",
  CONTRIBUTOR = "contributor",
  EDITOR = "editor",
}

export type User = {
  id: string;
  name: string;
  email: string;
  username: string;
  role?: Role;
};
