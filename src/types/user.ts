export enum Role {
  GUEST = "guest",
  CONTRIBUTOR = "contributor",
  EDITOR = "editor",
  SUPERADMIN = "superadmin",
}

export enum UserStatus {
  REGISTRATION = "registration",
  NEW_USER = "new_user",
  ROLE_UPDATE = "role_update",
  ROLE_REQUEST = "role_request",
}

export type User = {
  id: string;
  name: string;
  email: string;
  username: string;
  role: Role;
};

export type UserInvitation = {
  email: string;
  role: Role;
  status: UserStatus;
  name?: string;
  password?: string;
  username?: string;
};
