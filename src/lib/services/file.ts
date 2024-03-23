import { TOKEN_KEY } from "@tree/src/constants/storage-key";
import { getCookie } from "cookies-next";

export type File = {
  _id: string;
  url: string;
  assetId: string;
  publicId: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const upload = async (data: FormData) => {
  const token = getCookie(TOKEN_KEY)?.toString();
  if (!token) {
    throw new Error("Token not found");
  }

  const response = await fetch(`${API_URL}/files`, {
    method: "POST",
    headers: {
      // "Content-Type": "multipart/form-data",
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
