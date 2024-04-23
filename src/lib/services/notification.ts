import { TOKEN_KEY } from "@tree/src/constants/storage-key";
import { getCookie } from "cookies-next";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export type QueryNotificationDto = {
  read?: string;
};

export enum NotificationType {
  REQUEST = "request",
  INVITATION = "invitation",
  REGISTRATION = "registration",
  REMOVE_NODE = "remove_node",
}

export type Notification = {
  _id: string;
  read: boolean;
  type: NotificationType;
  referenceId?: string;
  additionalReferenceId?: string;
  message: string;
  to: string;
  action: boolean;
  createdAt: string;
  updatedAt: string;
};

export const getNotifications = async (query: QueryNotificationDto, signal?: AbortSignal) => {
  const token = getCookie(TOKEN_KEY)?.toString();

  return new Promise<Notification[]>((resolve, reject) => {
    fetch(`${API_URL}/notifications?${new URLSearchParams(query).toString()}`, {
      method: "GET",
      signal,
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

export const notificationCount = async (query: QueryNotificationDto, signal?: AbortSignal) => {
  const token = getCookie(TOKEN_KEY)?.toString();

  return new Promise<{ count: number }>((resolve, reject) => {
    fetch(`${API_URL}/notifications/count?${new URLSearchParams(query).toString()}`, {
      method: "GET",
      signal,
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

export const readNotification = async (id: string) => {
  const token = getCookie(TOKEN_KEY)?.toString();

  return new Promise((resolve, reject) => {
    fetch(`${API_URL}/notifications/${id}/read`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
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

export const readAllNotification = async () => {
  const token = getCookie(TOKEN_KEY)?.toString();

  return new Promise((resolve, reject) => {
    fetch(`${API_URL}/notifications/read/all`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
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
