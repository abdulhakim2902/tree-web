import { TOKEN_KEY } from "@tree/src/constants/storage-key";
import { getCookie } from "cookies-next";

export type File = {
  _id: string;
  url: string;
  assetId: string;
  publicId: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const nodeFiles = async (id?: string) => {
  const token = getCookie(TOKEN_KEY)?.toString();
  if (!token) {
    throw new Error("Token not found");
  }

  const response = await fetch(`${API_URL}/files?nodeId=${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token.toString()}`,
    },
  });

  if (response.status !== 200) {
    return [];
  }

  const res = await response.json();
  return res as File[];
};

export const upload = async (data: FormData) => {
  const token = getCookie(TOKEN_KEY)?.toString();
  if (!token) {
    throw new Error("Token not found");
  }

  const response = await fetch(`${API_URL}/files`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token.toString()}`,
    },
    body: data,
  });

  if (response.status !== 201) {
    throw new Error(response.statusText);
  }

  const result = await response.json();
  return result as File;
};

export const removeFile = async (id: string, type: string) => {
  const token = getCookie(TOKEN_KEY)?.toString();
  if (!token) {
    throw new Error("Token not found");
  }

  const response = await fetch(`${API_URL}/files/${id}/${type}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token.toString()}`,
    },
  });

  if (response.status !== 200) {
    throw new Error(response.statusText);
  }

  const result = await response.json();
  return result;
};
