import { Login } from "@/types/login";
import { UserWithFullname } from "@/types/user";
import { deleteCookie, getCookie, setCookie } from "cookies-next";
import { FC, createContext, useCallback, useContext, useEffect, useState } from "react";
import { login as loginAPI } from "@/services/auth";
import { useSnackbar } from "notistack";
import { parseJSON } from "@/helper/parse-json";
import { TOKEN_KEY, USER_KEY } from "@/constants/storage-key";

type AuthContextValue = {
  isLoggedIn: boolean;
  loading: boolean;
  user: UserWithFullname | null;
  token: string;

  setUser: (id: string, fullname: string) => void;
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
  const [user, setUser] = useState<UserWithFullname | null>(null);
  const [token, setToken] = useState<string>(tokenStr);

  useEffect(() => {
    const user = parseJSON<UserWithFullname>(userStr);
    setUser(user);
  }, [userStr]);

  const login = useCallback(
    async (data: Login, cb?: (success: boolean) => void) => {
      try {
        setLoading(true);

        await loginAPI(data, (user, token) => {
          const success = Boolean(user) && Boolean(token);
          if (success) {
            setCookie(USER_KEY, user, { maxAge: 24 * 60 * 60 });
            setCookie(TOKEN_KEY, token, { maxAge: 24 * 60 * 60 });
            setIsLoggedIn(true);
          }

          cb && cb(success);
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
    },
    [enqueueSnackbar],
  );

  const logout = () => {
    deleteCookie(TOKEN_KEY);
    deleteCookie(USER_KEY);
    setIsLoggedIn(false);
    setToken("");
    setUser(null);
  };

  const onUpdateUser = useCallback((id: string, fullname: string) => {
    setUser((user) => {
      if (user?.nodeId === id) {
        const newUser = {
          ...user,
          fullname,
        };

        setCookie(USER_KEY, newUser);
        return newUser;
      }

      return user;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ loading, isLoggedIn, user, token, setUser: onUpdateUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = (): AuthContextValue => {
  const AuthContextValue = useContext(AuthContext);

  if (!AuthContextValue) {
    throw Error("useAuthContext hook must be used inside TreeNodeDataContext provider");
  }

  return AuthContextValue;
};
