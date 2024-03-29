import { Login } from "@tree/src/types/auth";
import { User } from "@tree/src/types/user";
import { deleteCookie, getCookie, setCookie } from "cookies-next";
import { FC, createContext, useCallback, useContext, useEffect, useState } from "react";
import { login as loginAPI } from "@tree/src/lib/services/auth";
import { useSnackbar } from "notistack";
import { parseJSON } from "@tree/src/helper/parse-json";
import { TOKEN_KEY, TREE_KEY, USER_KEY } from "@tree/src/constants/storage-key";
import { DAY } from "../helper/date";

type AuthContextValue = {
  isLoggedIn: boolean;
  loading: boolean;
  user: User | null;
  token: string;

  login: (data: Login, cb?: (success: boolean) => void) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthContextProvider: FC = ({ children }) => {
  const { enqueueSnackbar } = useSnackbar();

  const userStr = getCookie(USER_KEY)?.toString();
  const tokenStr = getCookie(TOKEN_KEY)?.toString() ?? "";

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(Boolean(userStr) && Boolean(tokenStr));
  const [loading, setLoading] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string>(tokenStr);

  useEffect(() => {
    const user = parseJSON<User>(userStr);
    setUser(user);
  }, [userStr]);

  const login = useCallback(
    async (data: Login, cb?: (success: boolean) => void) => {
      let success = false;

      try {
        setLoading(true);

        await loginAPI(data, (user, token) => {
          success = Boolean(user) && Boolean(token);
          if (success) {
            setCookie(USER_KEY, user, { maxAge: DAY });
            setCookie(TOKEN_KEY, token, { maxAge: DAY });
            setIsLoggedIn(true);
          }
        });
      } catch (err: any) {
        const message = err.message ? err.message : "Invalid user";
        enqueueSnackbar({
          variant: "error",
          message,
        });
      } finally {
        setLoading(false);
      }

      cb && cb(success);
    },
    [enqueueSnackbar],
  );

  const logout = () => {
    deleteCookie(TOKEN_KEY);
    deleteCookie(USER_KEY);
    deleteCookie(TREE_KEY);
    setIsLoggedIn(false);
    setToken("");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ loading, isLoggedIn, user, token, login, logout }}>{children}</AuthContext.Provider>
  );
};

export const useAuthContext = (): AuthContextValue => {
  const AuthContextValue = useContext(AuthContext);

  if (!AuthContextValue) {
    throw Error("useAuthContext hook must be used inside AuthContext provider");
  }

  return AuthContextValue;
};
