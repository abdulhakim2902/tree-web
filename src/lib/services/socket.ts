import { TOKEN_KEY } from "@tree/src/constants/storage-key";
import { getCookie } from "cookies-next";

const { io } = require("socket.io-client");

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export function createSocketConnection(url?: string) {
  const token = getCookie(TOKEN_KEY)?.toString();
  const uri = url ?? API_URL;

  return io(uri, {
    extraHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export const socket = createSocketConnection(API_URL);
