import { FC, createContext, useContext, useEffect, useState } from "react";
import { useAuthContext } from "./auth";
import { socket } from "../lib/services/socket";

type SocketContextValue = {
  isConnected: boolean;
};

const SocketContext = createContext<SocketContextValue | null>(null);

export const SocketContextProvider: FC = ({ children }) => {
  const { isLoggedIn } = useAuthContext();

  const [isConnected, setIsConnected] = useState<boolean>(socket.connected);

  useEffect(() => {
    if (isLoggedIn) {
      socket.connect();
    } else {
      socket.disconnect();
    }

    return () => {
      socket.disconnect();
    };
  }, [isLoggedIn]);

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Socket is connected");
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      console.log("Socket is disconnected");
      setIsConnected(false);
    });

    return () => {
      socket.off("connect", () => {
        console.log("Close connect event");
        setIsConnected(true);
      });
      socket.off("disconnect", () => {
        console.log("Close disconnect event");
        setIsConnected(false);
      });
    };
  }, []);

  return <SocketContext.Provider value={{ isConnected }}>{children}</SocketContext.Provider>;
};

export const useSocketContext = (): SocketContextValue => {
  const SocketContextValue = useContext(SocketContext);

  if (!SocketContextValue) {
    throw Error("useSocketContext hook must be used inside SocketContext provider");
  }

  return SocketContextValue;
};
