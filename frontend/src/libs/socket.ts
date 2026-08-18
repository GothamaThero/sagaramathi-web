import { io, Socket } from "socket.io-client";
import { SERVER_URL } from "./api";

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(SERVER_URL, {
      autoConnect: true,
      transports: ["websocket", "polling"]
    });
  }
  return socket;
};
