import { useRouter } from "next/router";
import { FC, createContext, useContext, useEffect, useRef, useState } from "react";
import LoadingBar from "react-top-loading-bar";

type LoadingBarContextValue = {
  startProgress: () => void;
  endProgress: () => void;
};

const LoadingBarContext = createContext<LoadingBarContextValue | null>(null);

export const LoadingBarContextProvider: FC = ({ children }) => {
  const router = useRouter();

  const [progress, setProgress] = useState<number>(-1);

  useEffect(() => {
    router.events.on("routeChangeStart", startProgress);
    router.events.on("routeChangeComplete", endProgress);

    return () => {
      router.events.off("routeChangeStart", startProgress);
      router.events.off("routeChangeComplete", endProgress);
    };
  }, []);

  const startProgress = () => {
    setProgress(Math.random() * 70 + 10);
  };

  const endProgress = () => {
    setProgress(100);
  };

  return (
    <LoadingBarContext.Provider value={{ startProgress, endProgress }}>
      <LoadingBar progress={progress} color="rgb(0, 181, 204)" />
      {children}
    </LoadingBarContext.Provider>
  );
};

export const useLoadingBarContext = (): LoadingBarContextValue => {
  const LoadingBarContextValue = useContext(LoadingBarContext);

  if (!LoadingBarContextValue) {
    throw Error("useLoadingBarContext hook must be used inside LoadingBarContext provider");
  }

  return LoadingBarContextValue;
};
