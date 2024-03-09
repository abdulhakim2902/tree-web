import { FC, createContext, useContext } from "react";
import { parseJSON } from "../helper/parse-json";

type CacheContextValue = {
  get: <T>(key: string) => T | undefined;
  set: <T>(key: string, value: T, ttl?: number) => void;
  del: (key: string) => void;
  clear: () => void;
};

type CacheData = {
  data: any;
  expiry: string;
};

const CacheContext = createContext<CacheContextValue | null>(null);

export const CacheContextProvider: FC = ({ children }) => {
  const get = <T,>(key: string) => {
    const cacheStr = localStorage.getItem(key);
    if (!cacheStr) return;
    const cacheData = parseJSON<CacheData>(cacheStr);
    if (!cacheData) return;
    if (new Date().getTime() > new Date(cacheData.expiry).getTime()) {
      return del(key);
    }

    return cacheData.data;
  };

  const set = (key: string, data: any, ttl = 10) => {
    const t = new Date();
    t.setSeconds(t.getSeconds() + ttl);
    localStorage.setItem(key, JSON.stringify({ expiry: t, data }));
  };

  const clear = () => localStorage.clear();

  const del = (key: string) => localStorage.removeItem(key);

  return (
    <CacheContext.Provider
      value={{
        get,
        set,
        del,
        clear,
      }}
    >
      {children}
    </CacheContext.Provider>
  );
};

export const useCacheContext = (): CacheContextValue => {
  const CacheContextValue = useContext(CacheContext);

  if (!CacheContextValue) {
    throw Error("useCacheContext hook must be used inside CacheContext provider");
  }

  return CacheContextValue;
};
