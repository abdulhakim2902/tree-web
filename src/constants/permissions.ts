import { Role } from "../types/user";

export const UPDATE = [Role.EDITOR, Role.CONTRIBUTOR, Role.SUPERADMIN];
export const CREATE = [Role.EDITOR, Role.SUPERADMIN];
export const DELETE = [Role.SUPERADMIN];
export const READ = [Role.GUEST, Role.CONTRIBUTOR, Role.EDITOR, Role.SUPERADMIN];
