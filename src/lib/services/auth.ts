import { Login, Register } from "@tree/src/types/auth";
import { UserProfile } from "@tree/src/types/user";
import { me } from "./user";
import { getCookie } from "cookies-next";
import { TOKEN_KEY } from "@tree/src/constants/storage-key";

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

  return { user: result as UserProfile };
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

  const { token, verified } = result;

  if (!verified) {
    throw {
      statusCode: 422,
      message: "Please check your email to verified your email",
    };
  }

  if (token) {
    const result = await me(token);

    return { user: result as UserProfile, token: token as string };
  }

  return;
};

export const logout = async () => {
  const token = getCookie(TOKEN_KEY)?.toString();
  const response = await fetch(`${API_URL}/auth/logout`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await response.json();
  if (result?.statusCode) {
    throw result;
  }

  return result as { message: string };
};
