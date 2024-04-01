import { TOKEN_KEY } from "@tree/src/constants/storage-key";
import { Role, User, UserInvitation } from "@tree/src/types/user";
import { getCookie } from "cookies-next";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface UserRequest {
  _id: string;
  email: string;
  currentRole: Role;
  requestedRole: Role;
}

export const me = async (token: string) => {
  return new Promise<User>((resolve, reject) => {
    fetch(`${API_URL}/users/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data?.statusCode) {
          return reject(data);
        }

        return resolve(data);
      })
      .catch((err) => reject(err));
  });
};

export const getInvitation = async (token: string) => {
  return new Promise<UserInvitation>((resolve, reject) => {
    fetch(`${API_URL}/users/invitation/${token}`, {
      method: "GET",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data?.statusCode) {
          return reject(data);
        }

        return resolve(data);
      })
      .catch((err) => reject(err));
  });
};

export const acceptInvitation = async (token: string) => {
  return new Promise((resolve, reject) => {
    fetch(`${API_URL}/users/invitation/${token}`, {
      method: "POST",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data?.statusCode) {
          return reject(data);
        }

        return resolve(data);
      })
      .catch((err) => reject(err));
  });
};

export const invites = async (data: { email: string; role: Role }[]) => {
  const token = getCookie(TOKEN_KEY)?.toString();

  return new Promise<UserRequest[]>((resolve, reject) => {
    fetch(`${API_URL}/users/invites`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      method: "POST",
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data?.statusCode) {
          return reject(data);
        }

        return resolve(data);
      })
      .catch((err) => reject(err));
  });
};

export const getRequest = async () => {
  const token = getCookie(TOKEN_KEY)?.toString();

  return new Promise<UserRequest[]>((resolve, reject) => {
    fetch(`${API_URL}/users/requests`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      method: "GET",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data?.statusCode) {
          return reject(data);
        }

        return resolve(data);
      })
      .catch((err) => reject(err));
  });
};

export const createRequest = async (data: { role: string }) => {
  const token = getCookie(TOKEN_KEY)?.toString();

  return new Promise((resolve, reject) => {
    fetch(`${API_URL}/users/requests`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      method: "POST",
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data?.statusCode) {
          return reject(data);
        }

        return resolve(data);
      })
      .catch((err) => reject(err));
  });
};

export const handleRequest = async (requestId: string, action: string) => {
  const token = getCookie(TOKEN_KEY)?.toString();

  return new Promise((resolve, reject) => {
    fetch(`${API_URL}/users/requests/${requestId}/${action}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      method: "POST",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data?.statusCode) {
          return reject(data);
        }

        return resolve(data);
      })
      .catch((err) => reject(err));
  });
};
