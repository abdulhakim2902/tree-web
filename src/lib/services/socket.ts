const { io } = require("socket.io-client");

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const socket = io(API_URL);
