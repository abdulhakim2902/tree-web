import { Login, Register } from "@tree/src/types/auth";
import { UserProfile } from "@tree/src/types/user";
import { deleteCookie, getCookie, setCookie } from "cookies-next";
import { FC, createContext, useCallback, useContext, useState } from "react";
import { login as loginAPI, register as registerAPI, logout as logoutAPI } from "@tree/src/lib/services/auth";
import { useSnackbar } from "notistack";
import { parseJSON } from "@tree/src/helper/parse-json";
import { TOKEN_KEY, TREE_KEY, USER_KEY } from "@tree/src/constants/storage-key";
import { DAY } from "../helper/date";
import { omit } from "lodash";

type AuthContextValue = {
  isLoggedIn: boolean;
  loading: boolean;
  registering: boolean;
  user: UserProfile | null;
  token: string;

  setUser: (data: UserProfile) => void;
  register: (data: Register, cb?: (success: boolean, user?: UserProfile, statusCode?: number) => void) => void;
  login: (data: Login, cb?: (success: boolean) => void) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthContextProvider: FC = ({ children }) => {
  const { enqueueSnackbar } = useSnackbar();

  const userStr = getCookie(USER_KEY)?.toString();
  const tokenStr = getCookie(TOKEN_KEY)?.toString() ?? "";
  const userProfile = parseJSON<UserProfile>(userStr);
  const isValid = Boolean(userStr) && Boolean(tokenStr);

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(isValid);
  const [loading, setLoading] = useState<boolean>(false);
  const [registering, setRegistering] = useState<boolean>(false);
  const [token, setToken] = useState<string>(tokenStr);
  const [user, setUser] = useState<UserProfile | null>(userProfile);

  const login = useCallback(
    async (data: Login, cb?: (success: boolean) => void) => {
      let success = false;

      try {
        setLoading(true);

        const result = await loginAPI(data);
        success = Boolean(result);
        if (result) {
          setUser(result.user);
          setToken(result.token);
          setCookie(USER_KEY, result.user, { maxAge: DAY });
          setCookie(TOKEN_KEY, result.token, { maxAge: DAY });
          setIsLoggedIn(true);
        }
      } catch (err: any) {
        const message = err.message ? err.message : "Invalid user";
        enqueueSnackbar({
          variant: err.statusCode === 422 ? "success" : "error",
          message,
          anchorOrigin: {
            vertical: err.statusCode === 422 ? "top" : "bottom",
            horizontal: err.statusCode === 422 ? "center" : "left",
          },
        });
      } finally {
        setLoading(false);
        cb && cb(success);
      }
    },
    [enqueueSnackbar],
  );

  const register = useCallback(
    async (data: Register, cb?: (success: boolean, user?: UserProfile, statusCode?: number) => void) => {
      let success = false;
      let user: UserProfile | undefined = undefined;
      let statusCode: number | undefined = undefined;

      try {
        setRegistering(true);
        ({ user } = await registerAPI(omit(data, "role")));
        success = true;
      } catch (err: any) {
        statusCode = err.statusCode;
        enqueueSnackbar({
          variant: err.statusCode === 422 ? "success" : "error",
          message: err.message,
          anchorOrigin: {
            vertical: err.statusCode === 422 ? "top" : "bottom",
            horizontal: err.statusCode === 422 ? "center" : "left",
          },
        });
      } finally {
        setRegistering(false);
      }

      cb && cb(success, user, statusCode);
    },
    [enqueueSnackbar],
  );

  const logout = () => {
    logoutAPI().catch(console.log);
    deleteCookie(TOKEN_KEY);
    deleteCookie(USER_KEY);
    deleteCookie(TREE_KEY);
    setIsLoggedIn(false);
    setToken("");
  };

  return (
    <AuthContext.Provider value={{ loading, isLoggedIn, user, token, login, logout, register, registering, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = (): AuthContextValue => {
  const AuthContextValue = useContext(AuthContext);

  if (!AuthContextValue) {
    throw Error("useAuthContext hook must be used inside AuthContext provider");
  }

  return AuthContextValue;
};
