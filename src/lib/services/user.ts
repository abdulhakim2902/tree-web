import { TOKEN_KEY } from "@tree/src/constants/storage-key";
import { Role, UserProfile, UserInvitation } from "@tree/src/types/user";
import { getCookie } from "cookies-next";
import { Notification } from "./notification";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const me = async (token?: string) => {
  if (!token) token = getCookie(TOKEN_KEY)?.toString();
  return new Promise<UserProfile>((resolve, reject) => {
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

export const update = async (data: {
  name?: string;
  email?: string;
  password?: { current: string; new: string };
  profileImage?: string;
}) => {
  const token = getCookie(TOKEN_KEY)?.toString();
  return new Promise<UserProfile>((resolve, reject) => {
    fetch(`${API_URL}/users/me`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
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

export const updateEmail = async (token: string) => {
  const accessToken = getCookie(TOKEN_KEY)?.toString();
  return new Promise<UserProfile>((resolve, reject) => {
    fetch(`${API_URL}/users/update-email/${token}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
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

export const getTokens = async (token: string) => {
  return new Promise<Record<string, any>>((resolve, reject) => {
    fetch(`${API_URL}/users/tokens/${token}`, {
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

export const handleUserRegistration = async (referenceId: string, action: string) => {
  const token = getCookie(TOKEN_KEY)?.toString();
  return new Promise<{ message: string }>((resolve, reject) => {
    fetch(`${API_URL}/users/user-registrations/${referenceId}/${action}`, {
      method: "POST",
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

// Role Invitation Endpoint
export const createRoleInvitation = async (data: { email: string; role: Role }[]) => {
  const token = getCookie(TOKEN_KEY)?.toString();

  return new Promise((resolve, reject) => {
    fetch(`${API_URL}/users/role-invitations`, {
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

export const handleRoleInvitation = async (token: string, action: string) => {
  return new Promise<Notification>((resolve, reject) => {
    fetch(`${API_URL}/users/role-invitations/${token}/${action}`, {
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

// Role Request Endpoint
export const createRoleRequest = async (data: { role: string }) => {
  const token = getCookie(TOKEN_KEY)?.toString();

  return new Promise((resolve, reject) => {
    fetch(`${API_URL}/users/role-requests`, {
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

export const handleRoleRequest = async (referenceId: string, action: string) => {
  const token = getCookie(TOKEN_KEY)?.toString();

  return new Promise((resolve, reject) => {
    fetch(`${API_URL}/users/role-requests/${referenceId}/${action}`, {
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
