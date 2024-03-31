import { Login, Register } from "@tree/src/types/auth";
import { User } from "@tree/src/types/user";
import { me } from "./user";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const register = async (data: Omit<Register, "role">) => {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();
  if (result?.statusCode) {
    throw result;
  }

  return { user: result as User };
};

export const login = async (data: Login) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();
  if (result?.statusCode) {
    throw result;
  }

  const { token } = result;

  if (token) {
    const result = await me(token);

    return { user: result as User, token: token as string };
  }

  return;
};
