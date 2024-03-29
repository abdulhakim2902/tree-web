import { Login } from "@tree/src/types/auth";
import { User } from "@tree/src/types/user";
import { me } from "./user";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const login = async (data: Login, cb?: (user?: User, token?: string) => void) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (response.status !== 201) {
    throw new Error(response.statusText);
  }

  const { token } = await response.json();

  if (token) {
    const result = await me(token);

    cb && cb(result, token);
  }
};
