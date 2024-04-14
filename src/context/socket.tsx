import { FC, createContext, useContext, useEffect, useState } from "react";
import { useAuthContext } from "./auth";
import { createSocketConnection } from "../lib/services/socket";

type SocketContextValue = {
  socket: any;
  isConnected: boolean;
};

const SocketContext = createContext<SocketContextValue | null>(null);

export const SocketContextProvider: FC = ({ children }) => {
  const { isLoggedIn } = useAuthContext();

  const [socket, setSocket] = useState<any>();
  const [isConnected, setIsConnected] = useState<boolean>(false);

  useEffect(() => {
    if (isLoggedIn) {
      const socket = createSocketConnection();
      setSocket(socket);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (socket) {
      if (isLoggedIn) {
        socket.connect();
      } else {
        socket.disconnect();
      }
    }

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [isLoggedIn, socket]);

  useEffect(() => {
    if (socket) {
      socket.on("connect", () => {
        console.log("Socket is connected");
        setIsConnected(true);
      });

      socket.on("disconnect", () => {
        console.log("Socket is disconnected");
        setIsConnected(false);
      });
    }

    return () => {
      if (socket) {
        socket.off("connect", () => {
          console.log("Close connect event");
          setIsConnected(true);
        });
        socket.off("disconnect", () => {
          console.log("Close disconnect event");
          setIsConnected(false);
        });
      }
    };
  }, [socket]);

  return <SocketContext.Provider value={{ isConnected, socket }}>{children}</SocketContext.Provider>;
};

export const useSocketContext = (): SocketContextValue => {
  const SocketContextValue = useContext(SocketContext);

  if (!SocketContextValue) {
    throw Error("useSocketContext hook must be used inside SocketContext provider");
  }

  return SocketContextValue;
};
