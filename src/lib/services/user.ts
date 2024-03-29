import { User } from "@tree/src/types/user";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const me = async (token: string) => {
  return new Promise<User>((resolve, reject) => {
    fetch(`${API_URL}/users/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((user) => resolve(user))
      .catch((err) => reject(err));
  });
};
